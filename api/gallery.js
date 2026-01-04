export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const items = [
    {
      id: '1Rva5X11M8EWTVvxSd1jd1BQ1FC_WV5r9',
      name: 'Workshop Session',
      type: 'image',
      thumbnailUrl: 'https://lh3.googleusercontent.com/d/1Rva5X11M8EWTVvxSd1jd1BQ1FC_WV5r9=w400'
    },
    {
      id: '1ZvYsfoGoEgEicRqc376dC6LqBCuw3N1j',
      name: 'Technical Seminar',
      type: 'image',
      thumbnailUrl: 'https://lh3.googleusercontent.com/d/1ZvYsfoGoEgEicRqc376dC6LqBCuw3N1j=w400'
    },
    {
      id: '1O6MRmP4AIJR7xLonRF7Mc2Vl3e3MeNNt',
      name: 'Innovation Lab',
      type: 'image',
      thumbnailUrl: 'https://lh3.googleusercontent.com/d/1O6MRmP4AIJR7xLonRF7Mc2Vl3e3MeNNt=w400'
    },
    {
      id: '1ShZQrAL9GMVhZDRBM75UX7sv_iqdkkFW',
      name: 'Project Demo',
      type: 'image',
      thumbnailUrl: 'https://lh3.googleusercontent.com/d/1ShZQrAL9GMVhZDRBM75UX7sv_iqdkkFW=w400'
    },
    {
      id: '1ZH7b4GG5pcAbf-gkju3P5U3ryWaz7wc_',
      name: 'Coding Competition',
      type: 'image',
      thumbnailUrl: 'https://lh3.googleusercontent.com/d/1ZH7b4GG5pcAbf-gkju3P5U3ryWaz7wc_=w400'
    },
    {
      id: '1Ak8m-BG9fJn21FqnJ2y1QtCgOAFRIUbb',
      name: 'Tech Talk',
      type: 'image',
      thumbnailUrl: 'https://lh3.googleusercontent.com/d/1Ak8m-BG9fJn21FqnJ2y1QtCgOAFRIUbb=w400'
    }
  ];

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.status(200).json({ items });
}