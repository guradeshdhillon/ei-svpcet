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

// Extended file list from Google Drive folder - these are working IDs
const driveFiles = [
  '1Rva5X11M8EWTVvxSd1jd1BQ1FC_WV5r9', '1ZvYsfoGoEgEicRqc376dC6LqBCuw3N1j',
  '1O6MRmP4AIJR7xLonRF7Mc2Vl3e3MeNNt', '1ShZQrAL9GMVhZDRBM75UX7sv_iqdkkFW',
  '1ZH7b4GG5pcAbf-gkju3P5U3ryWaz7wc_', '1Ak8m-BG9fJn21FqnJ2y1QtCgOAFRIUbb',
  '10uS1OA2ZtjcAsqjaYTmDNuMkqSTkayCk', '1QBFmnG2BYvzZEIScd_l2U3AWUHwMChOW',
  '12mL6tt23keP9dAw7fQjqnOtAq7u-y0TM', '1Xd5y9M6x7tsAFbKA7B3bM2N-G0Nt8ok6',
  '1NFIsqnT2JoRMC4s4xJAjxQ0jvB_AVBl6', '1mOfrMgE6y9P27q5ruPoZ1VMOxDRBqTyE',
  '1rGMspTgK37dEwiYGAEU2PlWK2K16lhiJ', '1XtGz_vK4LhF0qPBV6BuMNmsVh8Z0GOck',
  '1iIQ1c_OGS1a94SBVPQ9LmYks-scBz-oa', '1ruwdviDSbitnXCaEJnr6AFMUwRNe8spo',
  '1qUUXlHBXONuUkKtzI-eKNcFM-QSxgtU1', '1tLDwlGbYdsX8XuARJXnaeqAfKCinRTzn',
  '1xUlPHE2LV4Pc-PHzWN257uFDkiMRDcUx', '1donQeZFGKcFfEdXRS9ayGl4EcogCKxEp',
  '1omw1n60Bb8HZO4017u47gs9HVS2WAPdr', '1oI4bSmV7xMPBWeWVAq6cJrAKpvask7gT',
  '11dTYziUGslHrh42PdKFx9LKXB1NRQ6hZ', '1oZdh6iT6mUZ-ubtO8G8jZCl8whq5emEq',
  '1NyoFDrzT7w3mejCyn8IcTby8qzIss0CL', '14qq3DedHRuNU_2X3aR-38xkA-XJ3woC3',
  '1zMcxf1vlcMJna3_ySv2o75ROn1vBXn0a', '1jOh4-BOOqQ580NIUQ8X4SmNuIja2M5HS',
  '1ItiB9_CYWYIBRA1KXheoh2bX3fr1I38A', '1hQlW_Oh_3DMKsKhJLOx7n2U6BnrrRAua',
  '1wn0NyFuOq0goumfyapmjpBVek9GT3Hd6', '1Xx2jDi7HqV_eFyE50ADUiCIOs6IgXrzV',
  '1SoGeNxhiYXvGSYlJJIhsGuZ8uvR34LJW', '1NjQgiIxVo3Sh1DJDfafSYRSPFz1LedIx',
  '1WeunTzSGY2cPfi_xQ5lhM2AR83c4u60e', '1w5EFfvdF0IerBTcBDS3CAi0gG8_-vqeU',
  '1boo1jutlboEEjbADemAXBL2LxR9trK9Y', '1wcCC0gY83UBwCfJTLlas3-tn95ey_weY',
  '1M7_FwQvR6akRkLUqJrtfVivoOHd7TaiB', '1rWrulZRcmaZHOmKQa2UEdovuCVdGSS47'
];

function getGalleryData() {
  return driveFiles.map((fileId, index) => ({
    id: index + 1,
    title: `Gallery Image ${index + 1}`,
    date: new Date().toISOString().split('T')[0],
    type: 'image',
    url: `https://lh3.googleusercontent.com/d/${fileId}=w1024`,
    thumbnailUrl: `https://lh3.googleusercontent.com/d/${fileId}=w400`
  }));
}

// API endpoint to get gallery data
app.get('/api/gallery', (req, res) => {
  try {
    const now = Date.now();
    
    // Check cache
    if (cache.data.length > 0 && (now - cache.lastFetch) < CACHE_TTL) {
      return res.json(cache.data);
    }
    
    // Generate fresh data
    const galleryData = getGalleryData();
    
    // Update cache
    cache = { data: galleryData, lastFetch: now };
    
    res.json(galleryData);
  } catch (error) {
    console.error('Gallery API error:', error);
    res.status(500).json({ error: 'Failed to fetch gallery data' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Gallery server running on port ${PORT}`);
});