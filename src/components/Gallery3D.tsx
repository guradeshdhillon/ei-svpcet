import React, { useState, useEffect } from 'react';

const Gallery3D = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetch('/api/gallery')
      .then(res => res.json())
      .then(data => {
        console.log('Gallery data:', data);
        setItems(data.items || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-8">Event Gallery</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse" />
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
          <h2 className="text-4xl font-bold text-center mb-8">
            Event <span className="text-blue-600">Gallery</span>
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Photos from our events and activities
          </p>
          
          {items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No images found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => setSelectedItem(item)}
                >
                  <img
                    src={item.thumbnailUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400">📷</div>';
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {selectedItem && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 text-white text-2xl bg-black bg-opacity-50 rounded-full w-8 h-8 flex items-center justify-center"
            >
              ×
            </button>
            <img
              src={selectedItem.thumbnailUrl.replace('=w400', '=w800')}
              alt={selectedItem.name}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 text-white p-3 rounded">
              <h3 className="font-semibold">{selectedItem.name}</h3>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Gallery3D;