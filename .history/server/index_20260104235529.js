import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import process from 'process';
import crypto from 'crypto';
import { google } from 'googleapis';
import https from 'https';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import morgan from 'morgan';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5174;

app.use(cors());
app.use(helmet({
    contentSecurityPolicy: false, // Allow images from external sources
    crossOriginResourcePolicy: false,
}));
app.use(compression());
app.use(morgan('tiny'));

// --- Cache Implementation ---
const cache = new Map();
function setCache(key, value, ttl = 300000) {
    cache.set(key, { value, exp: Date.now() + ttl });
}
function getCache(key) {
    const v = cache.get(key);
    if (!v) return null;
    if (Date.now() > v.exp) {
        cache.delete(key);
        return null;
    }
    return v.value;
}

// --- Helpers ---
function parseFolderId(url) {
    if (!url) return null;
    // Handle full URLs and raw IDs
    const m = url.match(/(?:\/folders\/|id=|root\/|drive\/)([a-zA-Z0-9_-]{25,})/);
    if (m) return m[1];
    // If it looks like an ID already (alphanumeric, long enough)
    if (/^[a-zA-Z0-9_-]{25,}$/.test(url)) return url;
    return null;
}

// Retry wrapper for API calls
async function withRetry(fn, retries = 3, delay = 1000) {
    try {
        return await fn();
    } catch (err) {
        if (retries > 0 && (err.code === 429 || err.status === 429 || (err.code >= 500 && err.code < 600))) {
            console.warn(`⚠️ API error ${err.code}, retrying in ${delay}ms... (${retries} left)`);
            await new Promise(res => setTimeout(res, delay));
            return withRetry(fn, retries - 1, delay * 2);
        }
        throw err;
    }
}

// --- Auth ---
async function getAuthClient() {
    try {
        // 1. Try Service Account Key (Environment Variable)
        if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
            const keyJson = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
            const auth = new google.auth.GoogleAuth({
                credentials: keyJson,
                scopes: ['https://www.googleapis.com/auth/drive.readonly'],
            });
            return await auth.getClient();
        }

        // 2. Try Application Credentials File
        if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            const auth = new google.auth.GoogleAuth({
                keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
                scopes: ['https://www.googleapis.com/auth/drive.readonly'],
            });
            return await auth.getClient();
        }

        // 3. Try API Key (Fallback for public data only, though constrained)
        if (process.env.GOOGLE_API_KEY) {
            console.log("ℹ️ Using GOOGLE_API_KEY for public access");
            return google.drive({ version: 'v3', auth: process.env.GOOGLE_API_KEY });
        }

    } catch (error) {
        console.error("❌ Auth error:", error.message);
    }
    return null;
}

let cachedAuthClient = null;
async function getDriveClient() {
    // If we already have a client (and it's not an API key simple obj), return it
    if (cachedAuthClient) return cachedAuthClient;

    const auth = await getAuthClient();
    if (auth) {
        // If it's an authenticated client or valid drive instance
        cachedAuthClient = google.drive({ version: 'v3', auth });
        return cachedAuthClient;
    }

    console.warn('🌍 No strong auth found. Some Drive features may be limited.');
    return null;
}


// --- Drive Operations ---

// Fallback: Scrape public folder HTML (Fragile, but keeps it working without creds for public folders)
async function httpGetText(url) {
    try {
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
            }
        });
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return await res.text();
    } catch (err) {
        throw err;
    }
}

async function fetchPublicFolderFiles(folderId) {
    try {
        const url = `https://drive.google.com/drive/folders/${folderId}`;
        const html = await httpGetText(url);
        const ids = new Set();
        const files = [];

        // Regex 1: Matches standard file entries in the big JS blob
        // Pattern: ["ID","Name","MimeType"] - allows for escaped quotes just in case
        const jsonLikePattern = /\["([a-zA-Z0-9_-]{25,})"\s*,\s*"([^"]+?)"\s*,\s*"([^"]+?)"/g;

        let m;
        // Optimization: Use a larger window for regex matching or try multiple patterns
        
        while ((m = jsonLikePattern.exec(html))) {
            const id = m[1];
            const name = m[2];
            const mimeType = m[3];

            if (id === folderId) continue;
            if (ids.has(id)) continue;

            // Filter unlikely garbage (names that are too long or mimetypes that are not mime-like)
            if (name.length > 150 || !mimeType.includes('/')) continue;

            ids.add(id);
            files.push({
                id,
                name,
                mimeType,
                thumbnailLink: null
            });
        }

        // Regex 2: Also look for "ds:20" format which sometimes uses different spacing or layout
        // New Pattern: Found in modern drive layouts
        // [ "ID", "Name", null, "MimeType" ] or similar variations
        const modernPattern = /\["([a-zA-Z0-9_-]{25,})"\s*,\s*"([^"]+?)"\s*,[^,]*,\s*"([^"]+?)"/g;
        while ((m = modernPattern.exec(html))) {
            const id = m[1];
            const name = m[2];
            const mimeType = m[3];

            if (id === folderId || ids.has(id)) continue;
            if (!mimeType.includes('/')) continue;
            
            ids.add(id);
            files.push({ id, name, mimeType, thumbnailLink: null });
        }

        if (files.length < 5) {
            // Fallback or complementary scan
            const laxPattern = /\\?"([a-zA-Z0-9_-]{25,})\\?",\\?"([^"]+?)\\?",\\?"(video\/|image\/|application\/)/g;
            while ((m = laxPattern.exec(html))) {
                const id = m[1];
                const name = m[2];
                const mimeType = m[3] + 'octet-stream'; // Partial mime match restoration

                if (id === folderId || ids.has(id)) continue;
                ids.add(id);
                files.push({ id, name, mimeType, thumbnailLink: null });
            }
        }

        // Strategy 2: Fallback to old data attributes (yields "Untitled")
        if (files.length === 0) {
            const dataIdPattern = /data-id=\\?"([a-zA-Z0-9_-]{25,})\\?"/g;
            while ((m = dataIdPattern.exec(html))) {
                const id = m[1];
                if (id === folderId || ids.has(id)) continue;
                ids.add(id);
                files.push({
                    id,
                    name: 'Untitled Media',
                    mimeType: 'application/octet-stream',
                    thumbnailLink: null
                });
            }
        }

        console.log(`[Scraper] Found ${files.length} items for folder ${folderId}`);
        return files;
    } catch (err) {
        console.warn(`fetchPublicFolderFiles failed for ${folderId}:`, err.message);
        throw new Error(`Access failed (${err.message}). Folder might be private.`);
    }
}

async function listDriveFiles(folderId) {
    const cacheKey = `folder:${folderId}`;
    const cached = getCache(cacheKey);
    if (cached) return cached;

    const drive = await getDriveClient();

    if (drive) {
        const results = [];
        let pageToken = null;
        let pageCount = 0;

        try {
            do {
                if (pageCount > 5) break; // Safety break

                const params = {
                    q: `'${folderId}' in parents and trashed=false`,
                    fields: 'nextPageToken, files(id, name, mimeType, thumbnailLink, webViewLink, createdTime, size)',
                    pageSize: 100, // Reasonable batch size
                    pageToken,
                };

                const res = await withRetry(() => drive.files.list(params));

                const files = res.data.files || [];
                results.push(...files);
                pageToken = res.data.nextPageToken;
                pageCount++;
            } while (pageToken);

            // Cache for only 2 minutes to allow dynamic updates
            setCache(cacheKey, results, 2 * 60 * 1000);
            return results;
        } catch (err) {
            console.error(`Google Drive API Error for folder ${folderId}:`, err.message);
            // Fallthrough to public scraping if API fails (e.g. permission error on specific folder)
        }
    }

    // Fallback
    console.log(`Using fallback scraper for ${folderId}`);
    try {
        const results = await fetchPublicFolderFiles(folderId);
        // Shorter cache for scraped results to catch updates faster
        setCache(cacheKey, results, 2 * 60 * 1000);
        return results;
    } catch (e) {
        throw e; // Propagate error so frontend shows "Error" state, not "Empty"
    }
}

function transformFileToMedia(file) {
    if (!file || !file.id) return null;

    let mediaType = 'photo'; // default

    // Robust Mime Handling
    if (file.mimeType) {
        if (file.mimeType.startsWith('video/')) {
            mediaType = 'video';
        } else if (file.mimeType.startsWith('image/')) {
            mediaType = 'photo';
        } else if (file.mimeType === 'application/octet-stream') {
            // Fallback for scraped files where we don't know the type.
            // We assume photo for now to ensure they show up.
            mediaType = 'photo';

            // Try to infer from name if possible (though name might be generic)
            if (file.name && /\.(mp4|mov|avi|webm)$/i.test(file.name)) {
                mediaType = 'video';
            }
        } else {
            // Strict skip for explicit non-media (e.g. application/pdf, text/plain)
            // But only if we are sure it's not a generic binary
            return null;
        }
    }

    return {
        id: file.id,
        mediaType,
        src: `/api/media/${file.id}`,
        thumbnail: `/api/thumbnail/${file.id}`,
        caption: file.name || 'Untitled',
        date: file.createdTime || null,
    };
}

// --- Routes ---

const FALLBACK_ITEMS = [
    {
      id: '1Rva5X11M8EWTVvxSd1jd1BQ1FC_WV5r9',
      name: 'Workshop Session',
      mediaType: 'photo',
      thumbnail: '/api/thumbnail/1Rva5X11M8EWTVvxSd1jd1BQ1FC_WV5r9',
      src: '/api/media/1Rva5X11M8EWTVvxSd1jd1BQ1FC_WV5r9'
    },
    {
      id: '1ZvYsfoGoEgEicRqc376dC6LqBCuw3N1j',
      name: 'Technical Seminar',
      mediaType: 'photo',
      thumbnail: '/api/thumbnail/1ZvYsfoGoEgEicRqc376dC6LqBCuw3N1j',
      src: '/api/media/1ZvYsfoGoEgEicRqc376dC6LqBCuw3N1j'
    },
    {
      id: '1O6MRmP4AIJR7xLonRF7Mc2Vl3e3MeNNt',
      name: 'Innovation Lab',
      mediaType: 'photo',
      thumbnail: '/api/thumbnail/1O6MRmP4AIJR7xLonRF7Mc2Vl3e3MeNNt',
      src: '/api/media/1O6MRmP4AIJR7xLonRF7Mc2Vl3e3MeNNt'
    },
    {
      id: '1ShZQrAL9GMVhZDRBM75UX7sv_iqdkkFW',
      name: 'Project Demo',
      mediaType: 'photo',
      thumbnail: '/api/thumbnail/1ShZQrAL9GMVhZDRBM75UX7sv_iqdkkFW',
      src: '/api/media/1ShZQrAL9GMVhZDRBM75UX7sv_iqdkkFW'
    },
    {
      id: '1ZH7b4GG5pcAbf-gkju3P5U3ryWaz7wc_',
      name: 'Coding Competition',
      mediaType: 'photo',
      thumbnail: '/api/thumbnail/1ZH7b4GG5pcAbf-gkju3P5U3ryWaz7wc_',
      src: '/api/media/1ZH7b4GG5pcAbf-gkju3P5U3ryWaz7wc_'
    },
    {
      id: '1Ak8m-BG9fJn21FqnJ2y1QtCgOAFRIUbb',
      name: 'Tech Talk',
      mediaType: 'photo',
      thumbnail: '/api/thumbnail/1Ak8m-BG9fJn21FqnJ2y1QtCgOAFRIUbb',
      src: '/api/media/1Ak8m-BG9fJn21FqnJ2y1QtCgOAFRIUbb'
    },
    // Duplicates to fill the grid
    {
      id: '1Rva5X11M8EWTVvxSd1jd1BQ1FC_WV5r9_2',
      name: 'Workshop Session II',
      mediaType: 'photo',
      thumbnail: '/api/thumbnail/1Rva5X11M8EWTVvxSd1jd1BQ1FC_WV5r9',
      src: '/api/media/1Rva5X11M8EWTVvxSd1jd1BQ1FC_WV5r9'
    },
    {
      id: '1ZvYsfoGoEgEicRqc376dC6LqBCuw3N1j_2',
      name: 'Technical Seminar II',
      mediaType: 'photo',
      thumbnail: '/api/thumbnail/1ZvYsfoGoEgEicRqc376dC6LqBCuw3N1j',
      src: '/api/media/1ZvYsfoGoEgEicRqc376dC6LqBCuw3N1j'
    },
    {
      id: '1O6MRmP4AIJR7xLonRF7Mc2Vl3e3MeNNt_2',
      name: 'Innovation Lab II',
      mediaType: 'photo',
      thumbnail: '/api/thumbnail/1O6MRmP4AIJR7xLonRF7Mc2Vl3e3MeNNt',
      src: '/api/media/1O6MRmP4AIJR7xLonRF7Mc2Vl3e3MeNNt'
    },
    {
      id: '1ShZQrAL9GMVhZDRBM75UX7sv_iqdkkFW_2',
      name: 'Project Demo II',
      mediaType: 'photo',
      thumbnail: '/api/thumbnail/1ShZQrAL9GMVhZDRBM75UX7sv_iqdkkFW',
      src: '/api/media/1ShZQrAL9GMVhZDRBM75UX7sv_iqdkkFW'
    },
    {
      id: '1ZH7b4GG5pcAbf-gkju3P5U3ryWaz7wc__2',
      name: 'Coding Competition II',
      mediaType: 'photo',
      thumbnail: '/api/thumbnail/1ZH7b4GG5pcAbf-gkju3P5U3ryWaz7wc_',
      src: '/api/media/1ZH7b4GG5pcAbf-gkju3P5U3ryWaz7wc_'
    },
    {
      id: '1Ak8m-BG9fJn21FqnJ2y1QtCgOAFRIUbb_2',
      name: 'Tech Talk II',
      mediaType: 'photo',
      thumbnail: '/api/thumbnail/1Ak8m-BG9fJn21FqnJ2y1QtCgOAFRIUbb',
      src: '/api/media/1Ak8m-BG9fJn21FqnJ2y1QtCgOAFRIUbb'
    },
     {
      id: '1Rva5X11M8EWTVvxSd1jd1BQ1FC_WV5r9_3',
      name: 'Workshop Session III',
      mediaType: 'photo',
      thumbnail: '/api/thumbnail/1Rva5X11M8EWTVvxSd1jd1BQ1FC_WV5r9',
      src: '/api/media/1Rva5X11M8EWTVvxSd1jd1BQ1FC_WV5r9'
    },
    {
      id: '1ZvYsfoGoEgEicRqc376dC6LqBCuw3N1j_3',
      name: 'Technical Seminar III',
      mediaType: 'photo',
      thumbnail: '/api/thumbnail/1ZvYsfoGoEgEicRqc376dC6LqBCuw3N1j',
      src: '/api/media/1ZvYsfoGoEgEicRqc376dC6LqBCuw3N1j'
    },
    {
      id: '1O6MRmP4AIJR7xLonRF7Mc2Vl3e3MeNNt_3',
      name: 'Innovation Lab III',
      mediaType: 'photo',
      thumbnail: '/api/thumbnail/1O6MRmP4AIJR7xLonRF7Mc2Vl3e3MeNNt',
      src: '/api/media/1O6MRmP4AIJR7xLonRF7Mc2Vl3e3MeNNt'
    }
];

app.get('/api/gallery', async (req, res) => {
    try {
        const publicConfigPath = path.join(__dirname, '..', 'public', 'data', 'gallery.json');
        let conf;
        try {
            const confRaw = await fs.readFile(publicConfigPath, 'utf8');
            conf = JSON.parse(confRaw);
        } catch (e) {
            console.error("Failed to read gallery.json", e);
            // Fallback immediately if config fails
            return res.json({ items: FALLBACK_ITEMS });
        }

        // Config hash for caching
        const confHash = crypto.createHash('sha1').update(JSON.stringify(conf)).digest('hex');
        const fullCacheKey = `gallery_v2:${confHash}`;
        const fullCached = getCache(fullCacheKey);
        if (fullCached) return res.json(fullCached);

        // Process parallel
        const outSections = await Promise.all(
            (conf.sections || []).map(async (section) => {
                const sources = await Promise.all(
                    (section.sources || []).map(async (src) => {
                        if (src.type !== 'gdrive-folder') {
                            return { label: src.label, error: 'unsupported-source-type', items: [] };
                        }

                        const folderId = parseFolderId(src.folderUrl);
                        if (!folderId) {
                            return { label: src.label, error: 'invalid-folder-url', items: [] };
                        }

                        try {
                            const files = await listDriveFiles(folderId);
                            const items = files.map(transformFileToMedia).filter(Boolean);
                            return { label: src.label, folderId, items, error: null };
                        } catch (err) {
                            return { label: src.label, error: String(err.message), items: [] };
                        }
                    })
                );
                return { ...section, sources };
            })
        );

        // Check if we actually got any items
        const hasItems = outSections.some(s => s.sources.some(src => src.items && src.items.length > 0));
        
        if (!hasItems) {
            console.warn("⚠️ No items found in configured folders. Serving fallback data.");
            // Serve fallback structure if scraping failed
            return res.json({ 
                sections: [{
                    title: "Gallery",
                    sources: [{
                        label: "Featured Events (Fallback)",
                        items: FALLBACK_ITEMS
                    }]
                }] 
            });
        }

        const payload = { sections: outSections, fetchedAt: new Date().toISOString() };
        setCache(fullCacheKey, payload, 60 * 1000);
        res.json(payload);
    } catch (err) {
        console.error('Error /api/gallery', err);
        // Final safety net
        res.json({ items: FALLBACK_ITEMS });
    }
});

// Proxy Image/Video Stream
async function streamFromDrive(fileId, req, res) {
    const drive = await getDriveClient();

    if (drive) {
        try {
            // Get metadata first
            const meta = await withRetry(() => drive.files.get({ fileId, fields: 'size, mimeType, name' }));
            const mime = meta.data.mimeType || 'application/octet-stream';
            const size = meta.data.size;
            const name = meta.data.name;

            if (name) {
                res.setHeader('Content-Disposition', `inline; filename="${name.replace(/"/g, '')}"`);
            }

            const range = req.headers.range;
            if (range && size) {
                const parts = range.replace(/bytes=/, "").split("-");
                const start = parseInt(parts[0], 10);
                const end = parts[1] ? parseInt(parts[1], 10) : size - 1;
                const chunksize = (end - start) + 1;

                res.writeHead(206, {
                    'Content-Range': `bytes ${start}-${end}/${size}`,
                    'Accept-Ranges': 'bytes',
                    'Content-Length': chunksize,
                    'Content-Type': mime,
                });

                const r = await drive.files.get(
                    { fileId, alt: 'media' },
                    { responseType: 'stream', headers: { Range: `bytes=${start}-${end}` } }
                );
                r.data.pipe(res);
            } else {
                res.writeHead(200, {
                    'Content-Length': size,
                    'Content-Type': mime,
                });
                const r = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' });
                r.data.pipe(res);
            }
            return;
        } catch (err) {
            console.warn(`Drive stream failed for ${fileId}:`, err.message);
        }
    }

    // Public Fallback
    const ucUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    const lh3Url = `https://lh3.googleusercontent.com/d/${fileId}=w1000`; // Increased size for quality

    // Strategy: Try lh3 first (better for images), then uc (better for downloads/videos)
    
    // 1. Try lh3 (Direct image server)
    https.get(lh3Url, (lh3Res) => {
        if (lh3Res.statusCode >= 200 && lh3Res.statusCode < 400) {
            // It's a valid image!
            pipeResponse(lh3Res, res);
        } else {
            // 2. Fallback to UC (Download/Proxy)
            tryUcFallback();
        }
    }).on('error', () => tryUcFallback());

    function tryUcFallback() {
        https.get(ucUrl, (proxyRes) => {
            if (proxyRes.statusCode === 302 || proxyRes.statusCode === 303) {
                const newUrl = proxyRes.headers.location;
                https.get(newUrl, (finalRes) => {
                    pipeResponse(finalRes, res);
                }).on('error', (e) => fail(res, e));
                return;
            }

            if (proxyRes.statusCode >= 200 && proxyRes.statusCode < 400) {
                // Check content type to avoid serving HTML (virus scan warnings) as image
                const contentType = proxyRes.headers['content-type'];
                if (contentType && contentType.includes('text/html')) {
                    console.warn(`[Proxy] Got HTML instead of media for ${fileId} (Virus scan page?)`);
                    // If we got HTML, it might be the virus scan page. 
                    // We can't easily bypass it without cookies, but sometimes following the confirm link works.
                    // For now, we fail or return 404 to avoid broken image icons.
                     res.status(404).end();
                } else {
                    pipeResponse(proxyRes, res);
                }
            } else {
                 res.status(404).end();
            }
        }).on('error', (e) => fail(res, e));
    }

    function pipeResponse(from, to) {
        if (from.headers['content-type']) to.setHeader('Content-Type', from.headers['content-type']);
        if (from.headers['content-length']) to.setHeader('Content-Length', from.headers['content-length']);
        from.pipe(to);
    }

    function fail(res, err) {
        console.error("Public stream error:", err);
        if (!res.headersSent) res.status(502).end();
    }
}

// Media Routes
app.get('/api/media/:id', (req, res) => streamFromDrive(req.params.id, req, res));

app.get('/api/thumbnail/:id', async (req, res) => {
    const fileId = req.params.id;
    const drive = await getDriveClient();

    // Try to redirect to Google's generated thumbnail if possible (faster)
    if (drive) {
        try {
            const meta = await withRetry(() => drive.files.get({ fileId, fields: 'thumbnailLink, mimeType' }));
            if (meta.data.thumbnailLink) {
                // Use smaller thumbnail for faster loading (s400 instead of s800)
                const fastThumb = meta.data.thumbnailLink.replace(/=s\d+$/, '=s400');
                // Set cache headers for browser caching
                res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour
                return res.redirect(fastThumb);
            }

            // For videos without thumbnails, try to get a frame
            if (meta.data.mimeType && meta.data.mimeType.startsWith('video/')) {
                // Use Google's video thumbnail service
                const videoThumb = `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`;
                res.setHeader('Cache-Control', 'public, max-age=3600');
                return res.redirect(videoThumb);
            }
        } catch (e) {
            console.warn(`Thumbnail fetch failed for ${fileId}:`, e.message);
        }
    }

    // Fallback to full stream (slower)
    streamFromDrive(fileId, req, res);
});

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// --- Static Frontend Serving (Production) ---
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// Handle client-side routing by returning index.html for all non-API routes
app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(distPath, 'index.html'));
});

const mode = process.env.GOOGLE_SERVICE_ACCOUNT_KEY || process.env.GOOGLE_APPLICATION_CREDENTIALS ? 'authenticated' : 'public-fallback';
console.log(`\n✅ Gallery API server starting on http://localhost:${PORT}`);
console.log(`📁 Mode: ${mode}`);
console.log(`🔗 Endpoints: /api/gallery, /api/media/:id, /api/thumbnail/:id, /api/health\n`);

app.listen(PORT, () => {
    console.log(`Ready to serve gallery content!`);
});
