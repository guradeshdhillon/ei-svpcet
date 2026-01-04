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
  const [visibleCount, setVisibleCount] = useState(12);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [imageStates, setImageStates] = useState<Record<string, 'loading' | 'loaded' | 'error'>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGallery();
  }, []);

  const loadGallery = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching gallery data...');
      const response = await fetch('/api/gallery?limit=50');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Gallery data received:', data);
      
      if (data.items && Array.isArray(data.items)) {
        setItems(data.items);
        
        // Initialize image loading states
        const states: Record<string, 'loading'> = {};
        data.items.forEach((item: GalleryItem) => {
          states[item.id] = 'loading';
        });
        setImageStates(states);
        
        console.log(`Loaded ${data.items.length} gallery items`);
      } else {
        console.warn('No items in response:', data);
        setItems([]);
      }
    } catch (err) {
      console.error('Gallery load failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to load gallery');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageLoad = (id: string) => {
    setImageStates(prev => ({ ...prev, [id]: 'loaded' }));
  };

  const handleImageError = (id: string) => {
    console.warn(`Image failed to load: ${id}`);
    setImageStates(prev => ({ ...prev, [id]: 'error' }));
  };

  const openModal = (item: GalleryItem) => {
    setSelectedItem(item);
  };

  const closeModal = () => {
    setSelectedItem(null);
  };

  const retryLoad = () => {
    loadGallery();
  };

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Event <span className="text-blue-600">Gallery</span>
            </h2>
            <p className="text-gray-600">Loading gallery from Google Drive...</p>
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

  if (error) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Event <span className="text-blue-600">Gallery</span>
            </h2>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <div className="text-red-600 text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Gallery Load Failed</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={retryLoad}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
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
              Showcasing photos and videos from club activities, workshops, and events.
            </p>
          </div>

          <div className="mb-6 flex justify-between items-center">
            <p className="text-sm text-gray-500">Gallery • {items.length} items</p>
            <button
              onClick={retryLoad}
              className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
            >
              🔄 Refresh
            </button>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📁</div>
              <p className="text-gray-500 mb-4">No gallery items found</p>
              <p className="text-sm text-gray-400">Check if the Google Drive folder is accessible</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.slice(0, visibleCount).map((item, index) => {
                  const imageState = imageStates[item.id] || 'loading';
                  
                  return (
                    <div
                      key={item.id}
                      onClick={() => openModal(item)}
                      className="aspect-square rounded-lg overflow-hidden bg-gray-100 hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 relative group"
                    >
                      {imageState === 'loading' && (
                        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                      )}
                      
                      {imageState === 'error' ? (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                          <div className="text-center p-2">
                            <div className="text-2xl mb-2">🖼️</div>
                            <div className="text-xs">{item.name}</div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <img
                            src={item.thumbnailUrl}
                            alt={item.name}
                            className={`w-full h-full object-cover transition-opacity duration-300 ${
                              imageState === 'loaded' ? 'opacity-100' : 'opacity-0'
                            }`}
                            loading={index < 8 ? 'eager' : 'lazy'}
                            onLoad={() => handleImageLoad(item.id)}
                            onError={() => handleImageError(item.id)}
                          />
                          
                          {/* Overlay with title */}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-end">
                            <div className="p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <p className="text-sm font-medium truncate">{item.name}</p>
                            </div>
                          </div>
                          
                          {/* Video indicator */}
                          {item.type === 'video' && (
                            <div className="absolute top-2 right-2 bg-black bg-opacity-70 rounded-full p-2">
                              <div className="w-4 h-4 text-white text-xs flex items-center justify-center">▶</div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {items.length > visibleCount && (
                <div className="text-center mt-8">
                  <button
                    onClick={() => setVisibleCount(prev => Math.min(prev + 12, items.length))}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Load More ({items.length - visibleCount} remaining)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Modal */}
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
              src={selectedItem.thumbnailUrl.replace('=w400', '=w1200')}
              alt={selectedItem.name}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            
            <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-70 text-white p-4 rounded">
              <h3 className="font-semibold text-lg">{selectedItem.name}</h3>
              <p className="text-sm text-gray-300 mt-1">
                {selectedItem.type === 'video' ? '🎥 Video' : '📷 Photo'}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Gallery3D;