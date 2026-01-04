// Google Drive folder: https://drive.google.com/drive/folders/1naEpUA2MEiKsLnkyolh3Iw_KKIeFD06o?usp=sharing
// Extract file IDs from the folder and add them here
const DRIVE_FILES = [
  '1Rva5X11M8EWTVvxSd1jd1BQ1FC_WV5r9',
  '1ZvYsfoGoEgEicRqc376dC6LqBCuw3N1j', 
  '1O6MRmP4AIJR7xLonRF7Mc2Vl3e3MeNNt',
  '1ShZQrAL9GMVhZDRBM75UX7sv_iqdkkFW',
  '1ZH7b4GG5pcAbf-gkju3P5U3ryWaz7wc_',
  '1Ak8m-BG9fJn21FqnJ2y1QtCgOAFRIUbb',
  '10uS1OA2ZtjcAsqjaYTmDNuMkqSTkayCk',
  '1QBFmnG2BYvzZEIScd_l2U3AWUHwMChOW',
  '12mL6tt23keP9dAw7fQjqnOtAq7u-y0TM',
  '1Xd5y9M6x7tsAFbKA7B3bM2N-G0Nt8ok6'
];

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=300');
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const items = DRIVE_FILES.map((fileId, index) => ({
    id: fileId,
    name: `Event Photo ${index + 1}`,
    type: 'image',
    thumbnailUrl: `https://lh3.googleusercontent.com/d/${fileId}=w400`,
    previewReady: true
  }));

  res.status(200).json({ 
    items, 
    total: items.length,
    folderUrl: 'https://drive.google.com/drive/folders/1naEpUA2MEiKsLnkyolh3Iw_KKIeFD06o?usp=sharing'
  });
}