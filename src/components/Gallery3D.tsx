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
  const [displayedItems, setDisplayedItems] = useState<GalleryItem[]>([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;

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
            galleryItems = data.items;
        } else if (data.sections) {
            data.sections.forEach((section: any) => {
                section.sources?.forEach((source: any) => {
                    if (source.items) galleryItems.push(...source.items);
                });
            });
        } else if (Array.isArray(data)) {
            galleryItems = data;
        }

        if (galleryItems.length === 0) {
            console.warn("API returned no items");
        }

        // Sort items: Put those with 'thumbnail' or 'thumbnailUrl' first (preview ready)
        // And ensure videos are mixed in but prioritized if they have thumbs
        galleryItems.sort((a, b) => {
             const hasThumbA = a.thumbnail || a.thumbnailUrl ? 1 : 0;
             const hasThumbB = b.thumbnail || b.thumbnailUrl ? 1 : 0;
             return hasThumbB - hasThumbA;
        });

        setItems(galleryItems);
        setDisplayedItems(galleryItems.slice(0, itemsPerPage));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Gallery Fetch Error:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const loadMore = () => {
      const nextItems = items.slice(0, displayedItems.length + itemsPerPage);
      setDisplayedItems(nextItems);
  };

  // Helper to get image source
  const getThumbnail = (item: GalleryItem) => item.thumbnail || item.thumbnailUrl || item.src || item.url || item.full;
  const getFullImage = (item: GalleryItem) => item.src || item.full || item.url || item.thumbnail || item.thumbnailUrl;
  const getName = (item: GalleryItem) => item.name || item.caption || item.title || "Untitled";

  // Gallery Image Component with Loading State
  const GalleryImage = ({ item, onClick }: { item: GalleryItem; onClick: () => void }) => {
    const [loaded, setLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    if (hasError) return null; // Hide broken images completely from masonry to avoid gaps

    return (
      <div 
        className="break-inside-avoid mb-4 group relative rounded-lg overflow-hidden cursor-pointer shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gray-100"
        onClick={onClick}
      >
        <div className={`relative w-full ${!loaded ? 'min-h-[200px] animate-pulse' : ''}`}>
          {!loaded && (
             <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                <Loader2 className="w-6 h-6 animate-spin" />
             </div>
          )}
          <img 
            src={getThumbnail(item)} 
            alt={getName(item)} 
            loading="lazy"
            onLoad={() => setLoaded(true)}
            onError={() => setHasError(true)}
            className={`w-full h-auto object-cover transition-all duration-700 ${
              loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
          />
          
          {/* Video Indicator */}
          {(item.type === 'video' || item.mediaType === 'video') && (
            <div className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full backdrop-blur-sm">
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="currentColor" strokeWidth="0" className="text-white"><path d="M8 5v14l11-7z"/></svg>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
            <p className="text-white text-sm font-medium line-clamp-2">{getName(item)}</p>
          </div>
        </div>
      </div>
    );
  };

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
    <section style={{backgroundColor:"#fff2e6"}} id="gallery" className="py-20 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            Event <span className="text-blue-600">Gallery</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Highlights from our workshops, seminars, and events.
          </p>
        </div>

        {displayedItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-dashed border-gray-300">
            <p className="text-gray-500">No images found in the gallery.</p>
          </div>
        ) : (
          <>
            <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-4 space-y-4">
              {displayedItems.map((item) => (
                <GalleryImage 
                  key={item.id} 
                  item={item} 
                  onClick={() => setSelectedItem(item)} 
                />
              ))}
            </div>
            
            {displayedItems.length < items.length && (
                <div className="mt-12 text-center">
                    <button 
                        onClick={loadMore}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                    >
                        Load More Memories
                    </button>
                </div>
            )}
          </>
        )}
      </div>

      {/* Full View Modal */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-5xl w-full p-0 bg-black/95 border-gray-800 text-white overflow-hidden">
          <div className="relative w-full h-[80vh] flex items-center justify-center">
            {selectedItem && (
              <>
                {(selectedItem.type === 'video' || selectedItem.mediaType === 'video') ? (
                    <video 
                        src={getFullImage(selectedItem)} 
                        controls 
                        autoPlay 
                        className="max-w-full max-h-full"
                        poster={getThumbnail(selectedItem)}
                    >
                        Your browser does not support the video tag.
                    </video>
                ) : (
                    <img 
                      src={getFullImage(selectedItem)} 
                      alt={getName(selectedItem)} 
                      className="max-w-full max-h-full object-contain"
                    />
                )}
                
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-4 text-center">
                  <h3 className="text-xl font-semibold">{getName(selectedItem)}</h3>
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
