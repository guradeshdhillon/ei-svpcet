const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Cache for Google Drive data
let cache = { data: [], lastFetch: 0 };
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes

// Get files from Google Drive folder (public access)
async function getGoogleDriveFiles() {
  const folderId = '1naEpUA2MEiKsLnkyolh3Iw_KKIeFD06o';
  
  try {
    // Fallback to hardcoded working URLs from the folder
    const files = [
      { id: '1Rva5X11M8EWTVvxSd1jd1BQ1FC_WV5r9', name: 'Gallery Image 1' },
      { id: '1ZvYsfoGoEgEicRqc376dC6LqBCuw3N1j', name: 'Gallery Image 2' },
      { id: '1O6MRmP4AIJR7xLonRF7Mc2Vl3e3MeNNt', name: 'Gallery Image 3' },
      { id: '1ShZQrAL9GMVhZDRBM75UX7sv_iqdkkFW', name: 'Gallery Image 4' },
      { id: '1ZH7b4GG5pcAbf-gkju3P5U3ryWaz7wc_', name: 'Gallery Image 5' },
      { id: '1Ak8m-BG9fJn21FqnJ2y1QtCgOAFRIUbb', name: 'Gallery Image 6' },
      { id: '10uS1OA2ZtjcAsqjaYTmDNuMkqSTkayCk', name: 'Gallery Image 7' },
      { id: '1QBFmnG2BYvzZEIScd_l2U3AWUHwMChOW', name: 'Gallery Image 8' },
      { id: '12mL6tt23keP9dAw7fQjqnOtAq7u-y0TM', name: 'Gallery Image 9' },
      { id: '1Xd5y9M6x7tsAFbKA7B3bM2N-G0Nt8ok6', name: 'Gallery Image 10' },
      { id: '1NFIsqnT2JoRMC4s4xJAjxQ0jvB_AVBl6', name: 'Gallery Image 11' },
      { id: '1mOfrMgE6y9P27q5ruPoZ1VMOxDRBqTyE', name: 'Gallery Image 12' }
    ];
    
    return files.map(file => ({
      id: file.id,
      name: file.name,
      thumbnailUrl: `https://lh3.googleusercontent.com/d/${file.id}=w400`,
      fullUrl: `https://lh3.googleusercontent.com/d/${file.id}=w1024`,
      type: 'image'
    }));
  } catch (error) {
    console.error('Error fetching Google Drive files:', error);
    return [];
  }
}

// API endpoint to get gallery data
app.get('/api/gallery', async (req, res) => {
  try {
    const now = Date.now();
    
    // Check cache
    if (cache.data.length > 0 && (now - cache.lastFetch) < CACHE_TTL) {
      return res.json(cache.data);
    }
    
    // Fetch fresh data
    const files = await getGoogleDriveFiles();
    
    // Transform to gallery format
    const galleryData = files.map((file, index) => ({
      id: index + 1,
      title: file.name,
      date: new Date().toISOString().split('T')[0],
      type: 'image',
      url: file.fullUrl,
      thumbnailUrl: file.thumbnailUrl
    }));
    
    // Update cache
    cache = { data: galleryData, lastFetch: now };
    
    res.json(galleryData);
  } catch (error) {
    console.error('Gallery API error:', error);
    res.status(500).json({ error: 'Failed to fetch gallery data' });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});