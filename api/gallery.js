const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const FOLDER_ID = process.env.GDRIVE_FOLDER_ID || '1naEpUA2MEiKsLnkyolh3Iw_KKIeFD06o';

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

function getMediaType(mimeType) {
  if (!mimeType) return 'unknown';
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  return 'unknown';
}

function generateThumbnail(fileId, mimeType) {
  const type = getMediaType(mimeType);
  if (type === 'video') {
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`;
  }
  return `https://lh3.googleusercontent.com/d/${fileId}=w400`;
}

async function fetchDriveFolder() {
  const cacheKey = `folder:${FOLDER_ID}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  try {
    // Fallback to hardcoded file IDs for reliable deployment
    const FILES = [
      { id: '1Rva5X11M8EWTVvxSd1jd1BQ1FC_WV5r9', name: 'Workshop Session', mimeType: 'image/jpeg' },
      { id: '1ZvYsfoGoEgEicRqc376dC6LqBCuw3N1j', name: 'Technical Seminar', mimeType: 'image/jpeg' },
      { id: '1O6MRmP4AIJR7xLonRF7Mc2Vl3e3MeNNt', name: 'Innovation Lab', mimeType: 'image/jpeg' },
      { id: '1ShZQrAL9GMVhZDRBM75UX7sv_iqdkkFW', name: 'Project Demo', mimeType: 'image/jpeg' },
      { id: '1ZH7b4GG5pcAbf-gkju3P5U3ryWaz7wc_', name: 'Coding Competition', mimeType: 'image/jpeg' },
      { id: '1Ak8m-BG9fJn21FqnJ2y1QtCgOAFRIUbb', name: 'Tech Talk', mimeType: 'image/jpeg' },
      { id: '10uS1OA2ZtjcAsqjaYTmDNuMkqSTkayCk', name: 'Robotics Workshop', mimeType: 'image/jpeg' },
      { id: '1QBFmnG2BYvzZEIScd_l2U3AWUHwMChOW', name: 'AI Session', mimeType: 'image/jpeg' },
      { id: '12mL6tt23keP9dAw7fQjqnOtAq7u-y0TM', name: 'Hackathon Prep', mimeType: 'image/jpeg' },
      { id: '1Xd5y9M6x7tsAFbKA7B3bM2N-G0Nt8ok6', name: 'Industry Visit', mimeType: 'image/jpeg' },
      { id: '1NFIsqnT2JoRMC4s4xJAjxQ0jvB_AVBl6', name: 'Research Presentation', mimeType: 'image/jpeg' },
      { id: '1mOfrMgE6y9P27q5ruPoZ1VMOxDRBqTyE', name: 'Team Building', mimeType: 'image/jpeg' },
      { id: '1rGMspTgK37dEwiYGAEU2PlWK2K16lhiJ', name: 'Guest Lecture', mimeType: 'image/jpeg' },
      { id: '1XtGz_vK4LhF0qPBV6BuMNmsVh8Z0GOck', name: 'Project Exhibition', mimeType: 'image/jpeg' },
      { id: '1iIQ1c_OGS1a94SBVPQ9LmYks-scBz-oa', name: 'Technical Quiz', mimeType: 'image/jpeg' },
      { id: '1ruwdviDSbitnXCaEJnr6AFMUwRNe8spo', name: 'Innovation Fair', mimeType: 'image/jpeg' },
      { id: '1qUUXlHBXONuUkKtzI-eKNcFM-QSxgtU1', name: 'Club Meeting', mimeType: 'image/jpeg' },
      { id: '1tLDwlGbYdsX8XuARJXnaeqAfKCinRTzn', name: 'Awards Ceremony', mimeType: 'image/jpeg' },
      { id: '1xUlPHE2LV4Pc-PHzWN257uFDkiMRDcUx', name: 'Group Photo', mimeType: 'image/jpeg' },
      { id: '1donQeZFGKcFfEdXRS9ayGl4EcogCKxEp', name: 'Event Highlights', mimeType: 'image/jpeg' }
    ];

    const items = FILES.map(file => ({
      id: file.id,
      name: file.name,
      type: getMediaType(file.mimeType),
      thumbnailUrl: generateThumbnail(file.id, file.mimeType),
      previewReady: true
    }));

    setCache(cacheKey, items);
    return items;
  } catch (error) {
    console.error('Drive fetch error:', error);
    return [];
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 'public, max-age=300');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const items = await fetchDriveFolder();
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
    res.status(500).json({ error: 'Failed to fetch gallery' });
  }
}