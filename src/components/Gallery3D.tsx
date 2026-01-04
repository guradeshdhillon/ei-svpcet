import React, { useState, useEffect } from 'react';

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  thumbnail: string;
  full: string;
  title: string;
}

const Gallery3D = () => {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(12);
  const [selectedImage, setSelectedImage] = useState<MediaItem | null>(null);

  useEffect(() => {
    const loadGalleryItems = async () => {
      try {
        // Try API first (works in production)
        const response = await fetch('/api/gallery');
        if (response.ok) {
          const data = await response.json();
          setItems(data);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.log('API not available, using local assets');
      }

      // Fallback to local assets for development
      const localAssets = [
        { src: '/src/assets/event1.jpg', title: 'Engineering Workshop' },
        { src: '/src/assets/event2.jpg', title: 'Technical Seminar' },
        { src: '/src/assets/event3.jpg', title: 'Innovation Lab' },
        { src: '/src/assets/event4.jpg', title: 'Project Exhibition' },
        { src: '/src/assets/event5.jpg', title: 'Coding Competition' },
        { src: '/src/assets/event6.jpg', title: 'Tech Talk' },
        { src: '/src/assets/event7.jpg', title: 'Robotics Workshop' },
        { src: '/src/assets/event8.jpg', title: 'AI/ML Session' },
        { src: '/src/assets/event9.jpg', title: 'Hackathon Prep' },
        { src: '/src/assets/event10.jpg', title: 'Industry Visit' },
        { src: '/src/assets/event11.jpg', title: 'Research Presentation' },
        { src: '/src/assets/event12.jpg', title: 'Team Building' },
        { src: '/src/assets/hackathon.jpg', title: 'Annual Hackathon' },
        { src: '/src/assets/techfest.jpg', title: 'Tech Festival' },
        { src: '/src/assets/workshop.jpg', title: 'Hands-on Workshop' },
        { src: '/src/assets/EI1.jpeg', title: 'Engineering India Club' }
      ];

      const galleryItems: MediaItem[] = localAssets.map((asset, index) => ({
        id: `local-${index}`,
        type: 'image',
        thumbnail: asset.src,
        full: asset.src,
        title: asset.title
      }));

      setItems(galleryItems);
      setLoading(false);
    };

    loadGalleryItems();
  }, []);

  const handleImageClick = (item: MediaItem) => {
    setSelectedImage(item);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-8">Event Gallery</h2>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
              Showcasing photos from club activities, workshops, and events.
            </p>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-500">Gallery • {items.length} items</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.slice(0, visibleCount).map((item, index) => (
              <div
                key={item.id}
                onClick={() => handleImageClick(item)}
                className="aspect-square rounded-lg overflow-hidden bg-gray-100 hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105"
              >
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  loading={index < 8 ? 'eager' : 'lazy'}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />
              </div>
            ))}
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
        </div>
      </section>

      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300 z-10"
            >
              ×
            </button>
            <img
              src={selectedImage.full}
              alt={selectedImage.title}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Gallery3D;