export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const FILES = [
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

  const galleryData = FILES.map((fileId, index) => ({
    id: fileId,
    title: `Event Photo ${index + 1}`,
    type: 'image',
    thumbnail: `https://lh3.googleusercontent.com/d/${fileId}=w400`,
    full: `https://lh3.googleusercontent.com/d/${fileId}=w800`
  }));

  res.setHeader('Cache-Control', 'public, max-age=300');
  res.status(200).json(galleryData);
}