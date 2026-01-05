import React, { useEffect, useState, useCallback } from 'react';
import './gallery.css';
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCcw, AlertCircle, PlayCircle } from "lucide-react";

type MediaType = 'photo' | 'video';

interface MediaItem {
    id: string;
    mediaType: MediaType;
    src: string;
    thumbnail?: string;
    caption?: string;
    date?: string;
    duration?: string;
    credit?: string;
}

interface SourceGroup {
    label: string;
    folderId?: string;
    items: MediaItem[];
    error?: string;
}

interface GallerySection {
    id: string;
    title: string;
    description?: string;
    sources: SourceGroup[];
}

function formatDate(d?: string) {
    if (!d) return '';
    try {
        return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
        return d;
    }
}

const IMAGE_PLACEHOLDER = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450"><rect width="100%" height="100%" fill="%23f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-family="Arial, Helvetica, sans-serif" font-size="20">Image not available</text></svg>';
const VIDEO_PLACEHOLDER = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450"><rect width="100%" height="100%" fill="%23f8fafc"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-family="Arial, Helvetica, sans-serif" font-size="20">Video thumbnail not available</text></svg>';

function SourceView({ source, open }: { source: SourceGroup; open: (item: MediaItem) => void }) {
    const [visibleCount, setVisibleCount] = useState(20);
    const [loadStatus, setLoadStatus] = useState<Record<string, 'loading' | 'success' | 'error'>>({});

    const items = source.items || [];

    // Sort items: successfully loaded first, then loading, then errors
    const sortedItems = React.useMemo(() => {
        return [...items].sort((a, b) => {
            const statusA = loadStatus[a.id] || 'loading';
            const statusB = loadStatus[b.id] || 'loading';
            const priority = { success: 0, loading: 1, error: 2 };
            return priority[statusA] - priority[statusB];
        });
    }, [items, loadStatus]);

    const visibleItems = sortedItems.slice(0, visibleCount);

    const handleImageLoad = (id: string) => {
        setLoadStatus(prev => ({ ...prev, [id]: 'success' }));
    };

    const handleImageError = (id: string) => {
        setLoadStatus(prev => ({ ...prev, [id]: 'error' }));
    };

    // Helper to check if caption should be shown
    const shouldShowCaption = (caption?: string) => {
        if (!caption) return false;
        const lower = caption.toLowerCase();
        return !lower.includes('untitled') && caption.trim().length > 0;
    };

    return (
        <div>
            <h4 className="text-lg font-semibold mb-4 text-foreground/80 flex items-center gap-2">
                {source.label}
                <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {items.length} items
                </span>
            </h4>

            {source.error ? (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-md flex items-center gap-3 text-yellow-600 dark:text-yellow-400">
                    <AlertCircle className="w-5 h-5" />
                    <p className="text-sm">Could not load this album: {source.error}</p>
                </div>
            ) : items.length === 0 ? (
                <div className="p-8 bg-muted/30 rounded-lg text-center border border-dashed border-muted-foreground/20">
                    <p className="text-muted-foreground">No media found in this folder.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {visibleItems.map((item, index) => {
                            const showCaption = shouldShowCaption(item.caption);
                            return (
                                <button
                                    key={item.id}
                                    className="group relative aspect-video bg-muted rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-300 hover:shadow-lg"
                                    onClick={() => open(item)}
                                    aria-label={`View ${showCaption ? item.caption : 'media'}`}
                                    style={{
                                        opacity: loadStatus[item.id] === 'error' ? 0.5 : 1,
                                        transition: 'all 0.3s ease-in-out'
                                    }}
                                >
                                    {item.mediaType === 'video' ? (
                                        <div className="relative w-full h-full">
                                            <img
                                                src={item.thumbnail || `https://drive.google.com/thumbnail?id=${item.id.replace('/api/media/', '')}&sz=w400`}
                                                alt={showCaption ? item.caption : ''}
                                                loading={index < 10 ? 'eager' : 'lazy'}
                                                className="w-full h-full object-cover transition-transform duration-300"
                                                onLoad={() => handleImageLoad(item.id)}
                                                onError={() => handleImageError(item.id)}
                                            />
                                        </div>
                                    ) : (
                                        <img
                                            src={item.thumbnail || item.src}
                                            alt={showCaption ? item.caption : ''}
                                            loading={index < 10 ? 'eager' : 'lazy'}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            onLoad={() => handleImageLoad(item.id)}
                                            onError={(e) => {
                                                handleImageError(item.id);
                                                const t = e.target as HTMLImageElement;
                                                t.onerror = null;
                                                t.src = IMAGE_PLACEHOLDER;
                                            }}
                                        />
                                    )}

                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                        {item.mediaType === 'video' ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <PlayCircle className="w-12 h-12 text-white drop-shadow-lg" />
                                                <span className="text-white text-xs font-medium">Play Video</span>
                                            </div>
                                        ) : (
                                            <div className="text-white text-xs font-medium px-2 py-1 bg-black/50 rounded-full">
                                                View Photo
                                            </div>
                                        )}
                                    </div>

                                    {/* Caption Gradient - Only show if caption exists and is not "Untitled" */}
                                    {showCaption && (
                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                            <p className="text-white text-xs font-medium truncate">{item.caption}</p>
                                            {item.date && <p className="text-white/70 text-[10px]">{formatDate(item.date)}</p>}
                                        </div>
                                    )}

                                    {/* Video Badge */}
                                    {item.mediaType === 'video' && (
                                        <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] px-2 py-1 rounded flex items-center gap-1 font-semibold shadow-lg">
                                            <PlayCircle className="w-3 h-3" />
                                            VIDEO
                                        </div>
                                    )}

                                    {/* Loading indicator */}
                                    {loadStatus[item.id] === 'loading' && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 backdrop-blur-sm">
                                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                        </div>
                                    )}

                                    {/* Error indicator */}
                                    {loadStatus[item.id] === 'error' && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-muted/80">
                                            <div className="text-center p-2">
                                                <AlertCircle className="w-6 h-6 mx-auto text-muted-foreground mb-1" />
                                                <p className="text-[10px] text-muted-foreground">Failed to load</p>
                                            </div>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {visibleCount < items.length && (
                        <div className="text-center pt-4">
                            <Button
                                variant="outline"
                                onClick={() => setVisibleCount(prev => prev + 20)}
                                className="min-w-[150px]"
                            >
                                Load More ({items.length - visibleCount} remaining)
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function GalleryView() {
    const [sections, setSections] = useState<GallerySection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [active, setActive] = useState<MediaItem | null>(null);
    const [flatItems, setFlatItems] = useState<MediaItem[]>([]);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const fetchGallery = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const r = await fetch('/api/gallery');
            if (!r.ok) throw new Error(`Server returned ${r.status}`);
            const json = await r.json();

            const s = (json && json.sections) || [];
            const shaped = s.map((sec: GallerySection) => ({
                id: sec.id,
                title: sec.title,
                description: sec.description,
                sources: (sec.sources || []).map((src: SourceGroup & { type?: string; folderUrl?: string }) => ({
                    label: src.label || '',
                    folderId: src.folderId,
                    items: src.items || [],
                    error: src.error,
                })),
            }));
            setSections(shaped);

            // build flat list for navigation
            const flat: MediaItem[] = [];
            for (const sec of shaped) {
                for (const src of sec.sources || []) {
                    for (const it of src.items || []) flat.push(it);
                }
            }
            setFlatItems(flat);
        } catch (err: any) {
            console.error('Failed to fetch gallery', err);
            setError(err.message || "Failed to load gallery data");
            setSections([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGallery();
    }, [fetchGallery]);

    const open = useCallback((item: MediaItem) => {
        setActive(item);
        const idx = flatItems.findIndex((f) => f.id === item.id);
        setActiveIndex(idx >= 0 ? idx : null);
        document.body.style.overflow = 'hidden';
    }, [flatItems]);

    const close = useCallback(() => {
        setActive(null);
        setActiveIndex(null);
        document.body.style.overflow = '';
    }, []);

    const next = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (!flatItems.length || activeIndex === null) return;
        const ni = (activeIndex + 1) % flatItems.length;
        setActive(flatItems[ni]);
        setActiveIndex(ni);
    }, [flatItems, activeIndex]);

    const prev = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (!flatItems.length || activeIndex === null) return;
        const pi = (activeIndex - 1 + flatItems.length) % flatItems.length;
        setActive(flatItems[pi]);
        setActiveIndex(pi);
    }, [flatItems, activeIndex]);

    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (!active) return;
            if (e.key === 'Escape') close();
            if (e.key === 'ArrowRight') next();
            if (e.key === 'ArrowLeft') prev();
        }
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [active, close, next, prev]);

    if (loading) {
        return (
            <section className="py-20 min-h-[50vh] flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
                    <p className="text-muted-foreground">Loading gallery contents...</p>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="py-20 min-h-[50vh] flex items-center justify-center">
                <div className="text-center space-y-4 max-w-md mx-auto p-6 bg-destructive/5 rounded-lg border border-destructive/20">
                    <AlertCircle className="w-12 h-12 mx-auto text-destructive" />
                    <h3 className="text-lg font-bold text-foreground">Gallery Unavailable</h3>
                    <p className="text-muted-foreground">{error}</p>
                    <Button onClick={fetchGallery} variant="outline" className="gap-2">
                        <RefreshCcw className="w-4 h-4" /> Try Again
                    </Button>
                </div>
            </section>
        );
    }

    return (
        <section id="gallery" className="gallery-container py-12 md:py-20">
            <div className="container mx-auto px-4">
                <div className="gallery-header text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        Event <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">Gallery</span>
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Showcasing photos and videos from club activities, workshops, and events.
                    </p>
                </div>

                <div className="space-y-16">
                    {sections.map((section) => (
                        <div key={section.id} className="gallery-section">
                            <div className="mb-8 border-b pb-4">
                                <h3 className="text-2xl font-bold text-foreground">{section.title}</h3>
                                {section.description && <p className="text-muted-foreground mt-1">{section.description}</p>}
                            </div>

                            <div className="space-y-10">
                                {section.sources.map((source, idx) => (
                                    <SourceView key={`${source.label}-${idx}`} source={source} open={open} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Lightbox / Modal */}
                {active && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-200" role="dialog" aria-modal="true" onClick={close}>

                        {/* Nav Left */}
                        <button
                            onClick={prev}
                            className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10 hidden md:block"
                            aria-label="Previous image"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                        </button>

                        {/* Nav Right */}
                        <button
                            onClick={next}
                            className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10 hidden md:block"
                            aria-label="Next image"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                        </button>

                        {/* Close */}
                        <button
                            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
                            onClick={close}
                            aria-label="Close"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 18 18" /></svg>
                        </button>

                        {/* Content */}
                        <div className="relative w-full h-full max-w-7xl max-h-screen p-4 md:p-10 flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
                            <div className="relative w-full h-full flex items-center justify-center">
                                {active.mediaType === 'photo' ? (
                                    <img
                                        src={active.src}
                                        alt={active.caption || ''}
                                        className="max-w-full max-h-full object-contain shadow-2xl rounded-sm select-none"
                                    />
                                ) : (
                                    <video
                                        src={active.src}
                                        controls
                                        autoPlay
                                        className="max-w-full max-h-full shadow-2xl rounded-sm bg-black"
                                    />
                                )}
                            </div>

                            {/* Caption Bar */}
                            <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none">
                                <div className="inline-block bg-black/60 backdrop-blur-md px-6 py-3 rounded-full text-white pointer-events-auto">
                                    {active.caption && !active.caption.toLowerCase().includes('untitled') ? (
                                        <>
                                            <p className="font-medium text-sm md:text-base">{active.caption}</p>
                                            <p className="text-xs md:text-sm text-white/70 mt-0.5">
                                                {formatDate(active.date)}
                                                {active.credit && ` • ${active.credit}`}
                                                {flatItems.length > 1 && ` • ${activeIndex !== null ? activeIndex + 1 : 0} / ${flatItems.length}`}
                                            </p>
                                        </>
                                    ) : (
                                        <p className="text-xs md:text-sm text-white/70">
                                            {active.mediaType === 'video' ? 'Video' : 'Photo'}
                                            {flatItems.length > 1 && ` • ${activeIndex !== null ? activeIndex + 1 : 0} / ${flatItems.length}`}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
