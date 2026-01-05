import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { AlertCircle, Loader2 } from 'lucide-react';

interface GalleryItem {
  id: string;
  name?: string;
  caption?: string; // Backend uses caption sometimes
  title?: string; // api/gallery.js uses title
  type?: 'image' | 'video';
  mediaType?: 'photo' | 'video'; // Backend uses mediaType
  thumbnailUrl?: string;
  thumbnail?: string; // Backend uses thumbnail
  url?: string;
  src?: string; // Backend uses src
  full?: string; // api/gallery.js uses full
}

const Gallery3D = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  useEffect(() => {
    console.log("Fetching gallery data...");
    fetch('/api/gallery')
      .then(async (res) => {
        if (!res.ok) {
           const text = await res.text();
           throw new Error(`API Error ${res.status}: ${text}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("Gallery API Response:", data);
        
        let galleryItems: GalleryItem[] = [];

        // Handle various response structures
        if (Array.isArray(data.items)) {
            // Structure: { items: [...] } (like api/gallery.js)
            galleryItems = data.items;
        } else if (data.sections) {
            // Structure: { sections: [...] } (server/index.js complex)
            data.sections.forEach((section: any) => {
                section.sources?.forEach((source: any) => {
                    if (source.items) galleryItems.push(...source.items);
                });
            });
        } else if (Array.isArray(data)) {
            // Structure: [...]
            galleryItems = data;
        }

        if (galleryItems.length === 0) {
            console.warn("API returned no items");
        }

        setItems(galleryItems);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Gallery Fetch Error:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Helper to get image source
  const getThumbnail = (item: GalleryItem) => item.thumbnail || item.thumbnailUrl || item.src || item.url || item.full;
  const getFullImage = (item: GalleryItem) => item.src || item.full || item.url || item.thumbnail || item.thumbnailUrl;
  const getName = (item: GalleryItem) => item.name || item.caption || item.title || "Untitled";

  if (loading) {
    return (
      <section className="py-20 bg-slate-50 min-h-[50vh] flex items-center justify-center">
        <div className="text-center text-slate-500">
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-blue-600" />
          <p>Loading gallery...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-slate-50 min-h-[50vh] flex items-center justify-center">
        <div className="text-center text-red-500 bg-red-50 p-8 rounded-lg border border-red-200">
          <AlertCircle className="w-10 h-10 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Could not load gallery</h3>
          <p className="text-sm">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="gallery" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            Event <span className="text-blue-600">Gallery</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Highlights from our workshops, seminars, and events.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-dashed border-gray-300">
            <p className="text-gray-500">No images found in the gallery.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((item) => (
              <div 
                key={item.id} 
                className="group relative aspect-square bg-gray-200 rounded-xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                onClick={() => setSelectedItem(item)}
              >
                <img 
                  src={item.thumbnailUrl || item.url} 
                  alt={item.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.classList.add('flex', 'items-center', 'justify-center');
                    e.currentTarget.parentElement!.innerHTML = `<span class="text-gray-400 text-sm">Image not available</span>`;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <p className="text-white font-medium truncate w-full">{item.name}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full View Modal */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-5xl w-full p-0 bg-black/95 border-gray-800 text-white overflow-hidden">
          <div className="relative w-full h-[80vh] flex items-center justify-center">
            {selectedItem && (
              <>
                <img 
                  src={selectedItem.thumbnailUrl?.replace('=w400', '=w1200') || selectedItem.url} 
                  alt={selectedItem.name} 
                  className="max-w-full max-h-full object-contain"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-4 text-center">
                  <h3 className="text-xl font-semibold">{selectedItem.name}</h3>
                </div>
              </>
            )}
            <button 
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-white/20 rounded-full text-white transition-colors"
            >
              <span className="sr-only">Close</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Gallery3D;
