export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 'public, max-age=300');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const files = [
    { id: '1Rva5X11M8EWTVvxSd1jd1BQ1FC_WV5r9', name: 'Workshop Session' },
    { id: '1ZvYsfoGoEgEicRqc376dC6LqBCuw3N1j', name: 'Technical Seminar' },
    { id: '1O6MRmP4AIJR7xLonRF7Mc2Vl3e3MeNNt', name: 'Innovation Lab' },
    { id: '1ShZQrAL9GMVhZDRBM75UX7sv_iqdkkFW', name: 'Project Demo' },
    { id: '1ZH7b4GG5pcAbf-gkju3P5U3ryWaz7wc_', name: 'Coding Competition' },
    { id: '1Ak8m-BG9fJn21FqnJ2y1QtCgOAFRIUbb', name: 'Tech Talk' },
    { id: '10uS1OA2ZtjcAsqjaYTmDNuMkqSTkayCk', name: 'Robotics Workshop' },
    { id: '1QBFmnG2BYvzZEIScd_l2U3AWUHwMChOW', name: 'AI Session' },
    { id: '12mL6tt23keP9dAw7fQjqnOtAq7u-y0TM', name: 'Hackathon Prep' },
    { id: '1Xd5y9M6x7tsAFbKA7B3bM2N-G0Nt8ok6', name: 'Industry Visit' },
    { id: '1NFIsqnT2JoRMC4s4xJAjxQ0jvB_AVBl6', name: 'Research Presentation' },
    { id: '1mOfrMgE6y9P27q5ruPoZ1VMOxDRBqTyE', name: 'Team Building' },
    { id: '1rGMspTgK37dEwiYGAEU2PlWK2K16lhiJ', name: 'Guest Lecture' },
    { id: '1XtGz_vK4LhF0qPBV6BuMNmsVh8Z0GOck', name: 'Project Exhibition' },
    { id: '1iIQ1c_OGS1a94SBVPQ9LmYks-scBz-oa', name: 'Technical Quiz' },
    { id: '1ruwdviDSbitnXCaEJnr6AFMUwRNe8spo', name: 'Innovation Fair' },
    { id: '1qUUXlHBXONuUkKtzI-eKNcFM-QSxgtU1', name: 'Club Meeting' },
    { id: '1tLDwlGbYdsX8XuARJXnaeqAfKCinRTzn', name: 'Awards Ceremony' },
    { id: '1xUlPHE2LV4Pc-PHzWN257uFDkiMRDcUx', name: 'Group Photo' },
    { id: '1donQeZFGKcFfEdXRS9ayGl4EcogCKxEp', name: 'Event Highlights' }
  ];

  const items = files.map(file => ({
    id: file.id,
    name: file.name,
    type: 'image',
    thumbnailUrl: `https://lh3.googleusercontent.com/d/${file.id}=w400`,
    previewReady: true
  }));

  console.log('API Response:', { items, total: items.length });
  res.status(200).json({ items, total: items.length });
}