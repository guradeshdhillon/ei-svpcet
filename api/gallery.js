const FOLDER_URL = 'https://drive.google.com/drive/folders/1naEpUA2MEiKsLnkyolh3Iw_KKIeFD06o?usp=sharing';
const FOLDER_ID = '1naEpUA2MEiKsLnkyolh3Iw_KKIeFD06o';

async function fetchFolderFiles() {
  try {
    const response = await fetch(`https://drive.google.com/drive/folders/${FOLDER_ID}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) throw new Error('Failed to fetch folder');
    
    const html = await response.text();
    const files = [];
    
    // Extract file data from the page
    const filePattern = /\["([a-zA-Z0-9_-]{25,})","([^"]*)","([^"]*)"/g;
    let match;
    
    while ((match = filePattern.exec(html)) !== null) {
      const [, id, name, mimeType] = match;
      
      if (id && id !== FOLDER_ID && name && name.length > 0 && name.length < 100) {
        const isVideo = mimeType && mimeType.includes('video');
        const isImage = mimeType && mimeType.includes('image');
        
        if (isImage || isVideo) {
          files.push({
            id,
            name: name.replace(/\.(jpg|jpeg|png|gif|mp4|mov|avi)$/i, ''),
            type: isVideo ? 'video' : 'image',
            thumbnailUrl: `https://lh3.googleusercontent.com/d/${id}=w400`,
            previewReady: true
          });
        }
      }
    }
    
    return files.slice(0, 50); // Limit to 50 files
  } catch (error) {
    console.error('Folder fetch error:', error);
    return [];
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 'public, max-age=300');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const items = await fetchFolderFiles();
  
  console.log(`Fetched ${items.length} files from folder ${FOLDER_ID}`);
  res.status(200).json({ items, total: items.length, folderUrl: FOLDER_URL });
}