import React, { useState, useEffect, useCallback } from 'react';

interface GalleryItem {
  id: string;
  name: string;
  type: 'image' | 'video' | 'unknown';
  thumbnailUrl: string | null;
  previewReady: boolean;
  error?: string;
}

interface GalleryResponse {
  items: GalleryItem[];
  total: number;
  page: number;
  hasMore: boolean;
}

const Gallery3D = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [imageLoadStates, setImageLoadStates] = useState<Record<string, 'loading' | 'loaded' | 'error'>>({});

  const loadGallery = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/gallery?page=${pageNum}&limit=12`);
      if (!response.ok) throw new Error('API failed');
      
      const data: GalleryResponse = await response.json();
      
      setItems(prev => append ? [...prev, ...data.items] : data.items);
      setHasMore(data.hasMore);
      setPage(pageNum);
      
      // Initialize loading states for new items
      const newStates: Record<string, 'loading'> = {};
      data.items.forEach(item => {
        if (item.previewReady && item.thumbnailUrl) {
          newStates[item.id] = 'loading';
        }
      });
      setImageLoadStates(prev => ({ ...prev, ...newStates }));
      
    } catch (error) {
      console.error('Gallery load failed:', error);
      // Fallback to empty state - no crash
      if (!append) {
        setItems([]);
        setHasMore(false);
      }
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [loading]);

  useEffect(() => {
    loadGallery(1, false);
  }, []);

  const loadMore = () => {
    if (hasMore && !loading) {
      loadGallery(page + 1, true);
    }
  };

  const handleImageLoad = (itemId: string) => {
    setImageLoadStates(prev => ({ ...prev, [itemId]: 'loaded' }));
  };

  const handleImageError = (itemId: string) => {
    setImageLoadStates(prev => ({ ...prev, [itemId]: 'error' }));
  };

  const openModal = (item: GalleryItem) => {
    setSelectedItem(item);
  };

  const closeModal = () => {
    setSelectedItem(null);
  };

  const renderSkeleton = () => (
    <div className="aspect-square rounded-lg bg-gray-200 animate-pulse" />
  );

  const renderItem = (item: GalleryItem, index: number) => {
    const loadState = imageLoadStates[item.id] || 'loading';
    const showSkeleton = loadState === 'loading';
    const hasError = loadState === 'error' || !item.previewReady || !item.thumbnailUrl;

    return (
      <div
        key={item.id}
        onClick={() => openModal(item)}
        className="aspect-square rounded-lg overflow-hidden bg-gray-100 hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 relative"
      >
        {showSkeleton && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
        
        {hasError ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
            <div className="text-center">
              <div className="text-2xl mb-2">📷</div>
              <div className="text-xs">{item.name}</div>
            </div>
          </div>
        ) : (
          <img
            src={item.thumbnailUrl!}
            alt={item.name}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              loadState === 'loaded' ? 'opacity-100' : 'opacity-0'
            }`}
            loading={index < 8 ? 'eager' : 'lazy'}
            onLoad={() => handleImageLoad(item.id)}
            onError={() => handleImageError(item.id)}
          />
        )}
        
        {item.type === 'video' && (
          <div className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1">
            <div className="w-4 h-4 text-white text-xs flex items-center justify-center">▶</div>
          </div>
        )}
      </div>
    );
  };

  if (initialLoad && loading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Event <span className="text-blue-600">Gallery</span>
            </h2>
            <p className="text-gray-600">Loading gallery...</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i}>{renderSkeleton()}</div>
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
              Showcasing photos and videos from club activities, workshops, and events.
            </p>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-500">Gallery • {items.length} items loaded</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item, index) => renderItem(item, index))}
          </div>

          {hasMore && (
            <div className="text-center mt-8">
              <button
                onClick={loadMore}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
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
              className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full w-8 h-8 flex items-center justify-center"
            >
              ×
            </button>
            
            {selectedItem.type === 'video' ? (
              <div className="bg-gray-900 rounded-lg p-8 text-white text-center">
                <div className="text-4xl mb-4">🎥</div>
                <h3 className="text-xl mb-2">{selectedItem.name}</h3>
                <p className="text-gray-300">Video preview not available</p>
              </div>
            ) : selectedItem.thumbnailUrl ? (
              <img
                src={selectedItem.thumbnailUrl.replace('=w400', '=w800')}
                alt={selectedItem.name}
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <div className="bg-gray-900 rounded-lg p-8 text-white text-center">
                <div className="text-4xl mb-4">📷</div>
                <h3 className="text-xl">{selectedItem.name}</h3>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Gallery3D;