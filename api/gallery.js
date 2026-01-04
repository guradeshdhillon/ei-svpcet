const FOLDER_ID = '1naEpUA2MEiKsLnkyolh3Iw_KKIeFD06o';
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

function getCache(key) {
  const item = cache.get(key);
  if (!item || Date.now() > item.expires) {
    cache.delete(key);
    return null;
  }
  return item.data;
}

function setCache(key, data) {
  cache.set(key, { data, expires: Date.now() + CACHE_TTL });
}

async function fetchGoogleDriveFolder() {
  const cached = getCache('drive-folder');
  if (cached) return cached;

  try {
    const url = `https://drive.google.com/drive/folders/${FOLDER_ID}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) throw new Error('Failed to fetch folder');
    
    const html = await response.text();
    const files = [];
    const fileIds = new Set();
    
    // Extract file IDs and names from the HTML
    const patterns = [
      /\["([a-zA-Z0-9_-]{25,})","([^"]+)","([^"]*image[^"]*)"/g,
      /\["([a-zA-Z0-9_-]{25,})","([^"]+)","([^"]*video[^"]*)"/g,
      /data-id="([a-zA-Z0-9_-]{25,})"/g
    ];
    
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        const fileId = match[1];
        if (fileId && fileId !== FOLDER_ID && !fileIds.has(fileId)) {
          fileIds.add(fileId);
          const fileName = match[2] || `Media ${files.length + 1}`;
          const mimeType = match[3] || 'image/jpeg';
          
          files.push({
            id: fileId,
            name: fileName.length > 50 ? fileName.substring(0, 50) + '...' : fileName,
            type: mimeType.includes('video') ? 'video' : 'image',
            thumbnailUrl: `https://lh3.googleusercontent.com/d/${fileId}=w400`,
            previewReady: true
          });
        }
      }
    });
    
    // Fallback with known working file IDs if scraping fails
    if (files.length === 0) {
      const fallbackFiles = [
        '1Rva5X11M8EWTVvxSd1jd1BQ1FC_WV5r9',
        '1ZvYsfoGoEgEicRqc376dC6LqBCuw3N1j',
        '1O6MRmP4AIJR7xLonRF7Mc2Vl3e3MeNNt',
        '1ShZQrAL9GMVhZDRBM75UX7sv_iqdkkFW',
        '1ZH7b4GG5pcAbf-gkju3P5U3ryWaz7wc_',
        '1Ak8m-BG9fJn21FqnJ2y1QtCgOAFRIUbb',
        '10uS1OA2ZtjcAsqjaYTmDNuMkqSTkayCk',
        '1QBFmnG2BYvzZEIScd_l2U3AWUHwMChOW',
        '12mL6tt23keP9dAw7fQjqnOtAq7u-y0TM',
        '1Xd5y9M6x7tsAFbKA7B3bM2N-G0Nt8ok6',
        '1NFIsqnT2JoRMC4s4xJAjxQ0jvB_AVBl6',
        '1mOfrMgE6y9P27q5ruPoZ1VMOxDRBqTyE',
        '1rGMspTgK37dEwiYGAEU2PlWK2K16lhiJ',
        '1XtGz_vK4LhF0qPBV6BuMNmsVh8Z0GOck',
        '1iIQ1c_OGS1a94SBVPQ9LmYks-scBz-oa',
        '1ruwdviDSbitnXCaEJnr6AFMUwRNe8spo',
        '1qUUXlHBXONuUkKtzI-eKNcFM-QSxgtU1',
        '1tLDwlGbYdsX8XuARJXnaeqAfKCinRTzn',
        '1xUlPHE2LV4Pc-PHzWN257uFDkiMRDcUx',
        '1donQeZFGKcFfEdXRS9ayGl4EcogCKxEp'
      ];
      
      fallbackFiles.forEach((fileId, index) => {
        files.push({
          id: fileId,
          name: `Event Photo ${index + 1}`,
          type: 'image',
          thumbnailUrl: `https://lh3.googleusercontent.com/d/${fileId}=w400`,
          previewReady: true
        });
      });
    }
    
    setCache('drive-folder', files);
    return files;
  } catch (error) {
    console.error('Drive fetch error:', error);
    // Return fallback data
    return [
      {
        id: '1Rva5X11M8EWTVvxSd1jd1BQ1FC_WV5r9',
        name: 'Sample Event Photo',
        type: 'image',
        thumbnailUrl: 'https://lh3.googleusercontent.com/d/1Rva5X11M8EWTVvxSd1jd1BQ1FC_WV5r9=w400',
        previewReady: true
      }
    ];
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 'public, max-age=300');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const items = await fetchGoogleDriveFolder();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const start = (page - 1) * limit;
    const end = start + limit;
    
    res.status(200).json({
      items: items.slice(start, end),
      total: items.length,
      page,
      hasMore: end < items.length
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Failed to fetch gallery' });
  }
}