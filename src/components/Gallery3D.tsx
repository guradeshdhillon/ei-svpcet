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
  const [visibleCount, setVisibleCount] = useState(20);
  const [selectedImage, setSelectedImage] = useState<MediaItem | null>(null);

  useEffect(() => {
    const loadGalleryItems = () => {
      try {
        // Real Google Drive file IDs from your folder
        const driveFileIds = [
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

        const galleryItems: MediaItem[] = driveFileIds.map((id, index) => ({
          id,
          type: 'image',
          thumbnail: `https://lh3.googleusercontent.com/d/${id}=w400`,
          full: `https://lh3.googleusercontent.com/d/${id}=w1024`,
          title: `Event Photo ${index + 1}`
        }));

        setItems(galleryItems);
        setLoading(false);
      } catch (error) {
        console.error('Error loading gallery:', error);
        setLoading(false);
      }
    };

    // Simulate loading delay
    setTimeout(loadGalleryItems, 500);
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
              Showcasing photos and videos from club activities, workshops, and events.
            </p>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-500">Gallery • {items.length} items</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {items.slice(0, visibleCount).map((item, index) => (
              <div
                key={item.id}
                onClick={() => handleImageClick(item)}
                className="aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105"
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
                onClick={() => setVisibleCount(prev => Math.min(prev + 20, items.length))}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Load More ({items.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Modal */}
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