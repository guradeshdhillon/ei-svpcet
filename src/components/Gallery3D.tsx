import React, { useState, useEffect } from 'react';

interface GalleryItem {
  id: string;
  name: string;
  type: string;
  thumbnailUrl: string;
  previewReady: boolean;
}

const Gallery3D = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [folderUrl, setFolderUrl] = useState('');

  useEffect(() => {
    loadGallery();
  }, []);

  const loadGallery = async () => {
    setLoading(true);
    try {
      console.log('Fetching from Google Drive folder...');
      const response = await fetch('/api/gallery');
      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Gallery data:', data);
      
      if (data && data.items && Array.isArray(data.items)) {
        console.log(`Loaded ${data.items.length} files from folder`);
        setItems(data.items);
        setFolderUrl(data.folderUrl || '');
      } else {
        console.error('No items found in folder');
        setItems([]);
      }
    } catch (error) {
      console.error('Gallery load failed:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (item: GalleryItem) => {
    setSelectedItem(item);
  };

  const closeModal = () => {
    setSelectedItem(null);
  };

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Event <span className="text-blue-600">Gallery</span>
            </h2>
            <p className="text-gray-600">Loading from Google Drive...</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-lg bg-gray-200 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section id="gallery" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Event <span className="text-blue-600">Gallery</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Live photos and videos from our Google Drive folder.
            </p>
            {folderUrl && (
              <p className="text-xs text-gray-400 mt-2">
                Source: <a href={folderUrl} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">Google Drive Folder</a>
              </p>
            )}
          </div>

          <div className="mb-6 flex justify-between items-center">
            <p className="text-sm text-gray-500">Gallery • {items.length} items from Drive</p>
            <button 
              onClick={loadGallery}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              🔄 Refresh
            </button>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📁</div>
              <p className="text-gray-500 mb-4">No files found in Google Drive folder</p>
              <button 
                onClick={loadGallery}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => openModal(item)}
                  className="aspect-square rounded-lg overflow-hidden bg-gray-100 hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 relative"
                >
                  <img
                    src={item.thumbnailUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      console.error('Image failed to load:', item.id);
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `
                          <div class="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                            <div class="text-center p-2">
                              <div class="text-2xl mb-2">${item.type === 'video' ? '🎥' : '🖼️'}</div>
                              <div class="text-xs">${item.name}</div>
                            </div>
                          </div>
                        `;
                      }
                    }}
                  />
                  {item.type === 'video' && (
                    <div className="absolute top-2 right-2 bg-black bg-opacity-70 rounded-full p-1">
                      <div className="w-4 h-4 text-white text-xs flex items-center justify-center">▶</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {selectedItem && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center"
            >
              ×
            </button>
            
            <img
              src={selectedItem.thumbnailUrl.replace('=w400', '=w800')}
              alt={selectedItem.name}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            
            <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-70 text-white p-3 rounded">
              <h3 className="font-semibold">{selectedItem.name}</h3>
              <p className="text-sm text-gray-300">
                {selectedItem.type === 'video' ? '🎥 Video' : '📷 Photo'} from Google Drive
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Gallery3D;