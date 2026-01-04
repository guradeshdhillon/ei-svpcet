import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { Loader2, AlertCircle } from "lucide-react";

interface GalleryItem {
  id: number;
  title: string;
  date: string;
  type: string;
  url: string;
  thumbnailUrl?: string;
}

export default function Gallery3D() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [selected, setSelected] = useState<GalleryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleItems, setVisibleItems] = useState(20);

  useEffect(() => {
    const loadGallery = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let response;
        try {
          response = await fetch('/api/gallery');
        } catch {
          response = await fetch('/data/gallery.json');
        }
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        if (Array.isArray(data)) {
          setItems(data);
        }
      } catch (err) {
        console.error('Failed to load gallery:', err);
        setError('Failed to load gallery');
      } finally {
        setLoading(false);
      }
    };
    
    loadGallery();
  }, []);

  const displayedItems = items.slice(0, visibleItems);

  if (loading) {
    return (
      <section id="gallery" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Event <span className="text-blue-600">Gallery</span></h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Showcasing photos and videos from club activities, workshops, and events.</p>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="w-12 h-12 mx-auto text-blue-600 mb-4 animate-spin" />
              <p className="text-gray-600">Loading gallery...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="gallery" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Event <span className="text-blue-600">Gallery</span></h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Showcasing photos and videos from club activities, workshops, and events.</p>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
              <p className="text-gray-600">{error}</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="gallery" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Event <span className="text-blue-600">Gallery</span></h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Showcasing photos and videos from club activities, workshops, and events.</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Events & Activities</h3>
            <span className="text-sm text-gray-500">{items.length} items</span>
          </div>
          <p className="text-gray-600 text-sm mb-6">Highlights from our recent events.</p>
          
          <div className="mb-4">
            <span className="text-sm font-medium text-gray-700">Gallery</span>
            <span className="text-xs text-gray-500 ml-2">{items.length} items</span>
          </div>
        </div>

        {displayedItems.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No images found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
              {displayedItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelected(item)}
                  className="group relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <img
                    src={item.thumbnailUrl || item.url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    loading={item.id <= 10 ? "eager" : "lazy"}
                    onError={(e) => {
                      const img = e.currentTarget as HTMLImageElement;
                      img.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='240'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' fill='%236b7280' font-size='14' dominant-baseline='middle' text-anchor='middle'%3EImage unavailable%3C/text%3E%3C/svg%3E";
                    }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                </button>
              ))}
            </div>

            {items.length > visibleItems && (
              <div className="text-center">
                <button
                  onClick={() => setVisibleItems(prev => prev + 20)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Load More ({items.length - visibleItems} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogTitle className="sr-only">{selected?.title}</DialogTitle>
          <div className="relative">
            {selected && (
              <img 
                src={selected.url}
                alt={selected.title}
                className="w-full max-h-[80vh] object-contain rounded"
                loading="lazy"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}