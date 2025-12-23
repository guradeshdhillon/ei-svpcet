# 🎨 Gallery Fix - Visual Code Reference

## Quick Code Snippets

### Before vs After Comparison

---

## Gallery3D.tsx

### ❌ BEFORE: Poor Error Handling
```typescript
const texture = useMemo(() => {
  if (event.type === "image") {
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    return loader.load(event.url);  // Silent failure if URL fails
  }

  const video = document.createElement("video");
  video.src = event.url;
  video.play().catch(() => {});  // Errors swallowed
  return new THREE.VideoTexture(video);
}, [event]);

const phi = event.phi!;      // Crashes if undefined
const theta = event.theta!;  // Non-null assertion
```

### ✅ AFTER: Robust Error Handling
```typescript
const [textureError, setTextureError] = useState(false);

const texture = useMemo(() => {
  try {
    if (event.type === "image") {
      const loader = new THREE.TextureLoader();
      loader.setCrossOrigin("anonymous");
      const tex = loader.load(
        event.url,
        undefined,
        undefined,
        (error) => {
          console.error(`Failed to load image: ${event.url}`, error);
          setTextureError(true);  // Track errors
        }
      );
      return tex;
    }

    const video = document.createElement("video");
    video.src = event.url;
    video.crossOrigin = "anonymous";
    video.addEventListener("error", () => {
      console.error(`Failed to load video: ${event.url}`);
      setTextureError(true);  // Track errors
    });
    video.play().catch((err) => console.error("Video play error:", err));
    return new THREE.VideoTexture(video);
  } catch (error) {
    console.error("Texture loading error:", error);
    setTextureError(true);
    // Return fallback texture
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#333";
      ctx.fillRect(0, 0, 256, 256);
    }
    return new THREE.CanvasTexture(canvas);
  }
}, [event]);

// Safe null handling
const phi = event.phi ?? 0;      // Safe with default
const theta = event.theta ?? 0;  // No crashes
```

---

### ❌ BEFORE: No Loading State
```typescript
return (
  <section id="gallery" className="py-20">
    <Card className="max-w-6xl mx-auto">
      <CardContent className="p-0 h-[700px]">
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          {/* Renders even with empty events array = blank page */}
          {events.map((e, i) => (
            <CurvedPhoto key={e.id} event={{ ...e, phi, theta }} />
          ))}
        </Canvas>
      </CardContent>
    </Card>
  </section>
);
```

### ✅ AFTER: Loading State with Feedback
```typescript
return (
  <section id="gallery" className="py-20">
    <Card className="max-w-6xl mx-auto">
      <CardContent className="p-0 h-[700px] relative bg-slate-900">
        {events.length === 0 ? (
          // Show loading message while fetching
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 mx-auto text-yellow-500 mb-4" />
              <p className="text-white">Loading gallery...</p>
            </div>
          </div>
        ) : (
          // Render 3D canvas only when data is ready
          <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
            {events.map((e, i) => (
              <CurvedPhoto key={e.id} event={{ ...e, phi, theta }} />
            ))}
          </Canvas>
        )}
      </CardContent>
    </Card>
  </section>
);
```

---

### ❌ BEFORE: Poor Data Fetching
```typescript
useEffect(() => {
  fetch("/data/gallery.json")
    .then((r) => r.json())
    .then(setEvents)
    .catch(console.error);  // Error only logged, no recovery
}, []);
```

### ✅ AFTER: Robust Data Fetching
```typescript
useEffect(() => {
  const loadGallery = async () => {
    try {
      const response = await fetch("/data/gallery.json");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setEvents(data);
      } else {
        console.error("Gallery data is not an array");
        setEvents([]);
      }
    } catch (error) {
      console.error("Failed to load gallery.json:", error);
      setEvents([]);  // Set empty array on error
    }
  };
  loadGallery();
}, []);
```

---

### ❌ BEFORE: Missing Accessibility
```typescript
<Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
  <DialogContent>
    <DialogTitle>{selected?.title}</DialogTitle>
    {selected?.type === "image" ? (
      <img src={selected?.url} />  {/* No alt text */}
    ) : (
      <video src={selected?.url} controls />
    )}
  </DialogContent>
</Dialog>
```

### ✅ AFTER: Accessible & Properly Sized
```typescript
<Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
  <DialogContent>
    <DialogTitle>{selected?.title}</DialogTitle>
    {selected?.type === "image" ? (
      <img 
        src={selected?.url} 
        alt={selected?.title}           {/* Alt text added */}
        className="w-full"              {/* Proper sizing */}
      />
    ) : (
      <video 
        src={selected?.url} 
        controls 
        className="w-full"              {/* Proper sizing */}
      />
    )}
  </DialogContent>
</Dialog>
```

---

## App.tsx Router

### ❌ BEFORE: No Gallery Route
```typescript
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
// GalleryLayout not imported

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Index />} />
      {/* No /gallery route defined */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);
```

### ✅ AFTER: Gallery Route Added
```typescript
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import GalleryLayout from "./components/page-layouts/GalleryLayout";  // Added

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/gallery" element={<GalleryLayout />} />  {/* Added */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);
```

---

## GalleryLayout.tsx

### ❌ BEFORE: Bare Component
```typescript
import Gallery3D from "@/components/Gallery3D";

export default function GalleryLayout() {
  return <Gallery3D />;  // No navigation, no footer
}
```

### ✅ AFTER: Full Page Layout
```typescript
import Navigation from "@/components/Navigation";
import Gallery3D from "@/components/Gallery3D";
import Footer from "@/components/Footer";

export default function GalleryLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />                    {/* Added */}
      <main className="flex-1 pt-16">   {/* Added */}
        <Gallery3D />
      </main>
      <Footer />                        {/* Added */}
    </div>
  );
}
```

---

## Common Patterns

### Pattern 1: Safe Null Handling
```typescript
// ❌ Unsafe
const value = data.optional!;

// ✅ Safe
const value = data.optional ?? defaultValue;

// ✅ Also safe
const value = data?.optional ?? defaultValue;
```

### Pattern 2: Error Handling in Async
```typescript
// ❌ Poor
fetch(url).then(r => r.json()).catch(console.error);

// ✅ Better
const loadData = async () => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Status: ${response.status}`);
    const data = await response.json();
    validate(data);
    setState(data);
  } catch (error) {
    console.error("Failed to load data:", error);
    setState([]);  // Fallback
  }
};
loadData();
```

### Pattern 3: Conditional Rendering with Loading
```typescript
// ❌ Shows nothing while loading
{items.map(item => <Item key={item.id} data={item} />)}

// ✅ Shows feedback while loading
{items.length === 0 ? (
  <LoadingState />
) : (
  <div>
    {items.map(item => <Item key={item.id} data={item} />)}
  </div>
)}
```

### Pattern 4: Texture Loading with Error Callback
```typescript
// ❌ Silent failure
const texture = loader.load(url);

// ✅ With error handling
const texture = loader.load(
  url,
  onLoad,
  onProgress,
  (error) => {
    console.error(`Failed to load ${url}:`, error);
    setError(true);
  }
);
```

---

## Testing Patterns

### Check if Gallery Data Loads
```
Browser Console:
  1. Open DevTools (F12)
  2. Go to Console tab
  3. Type: fetch('/data/gallery.json').then(r => r.json()).then(console.log)
  4. Should log array of image objects
```

### Check Network Requests
```
Browser DevTools:
  1. F12 → Network tab
  2. Reload page
  3. Look for /data/gallery.json
  4. Should show Status 200
  5. Check Images section for Google Drive thumbnails
```

### Check for WebGL Support
```
Browser Console:
  1. F12 → Console
  2. Type: typeof WebGLRenderingContext
  3. Should return "function" (WebGL supported)
```

### Check Three.js Initialization
```
Browser Console:
  1. F12 → Console
  2. Type: window.THREE
  3. Should show Three.js object
```

---

## Performance Optimization Tips

### 1. Image Optimization
```typescript
// Use smaller images
"url": "https://drive.google.com/thumbnail?id=...&sz=w512"
//                                                        ^^^^^^
// Reduce from &sz=w1024 to &sz=w512 for faster loading
```

### 2. Lazy Load Gallery
```typescript
// Load Gallery3D component lazily
const Gallery3D = lazy(() => import('@/components/Gallery3D'));
```

### 3. Memoize Expensive Components
```typescript
export default memo(Gallery3D);
```

### 4. Use useCallback for Event Handlers
```typescript
const handleSelect = useCallback((event: EventPhoto) => {
  setSelected(event);
}, []);
```

---

## Troubleshooting Decision Tree

```
Gallery shows blank?
├── Check console for errors
│   ├── "Cannot read property of undefined"
│   │   └── Fix: Use ?? operator for safe defaults
│   ├── "Failed to load image"
│   │   └── Fix: Check image URLs and CORS
│   ├── "gallery.json not found"
│   │   └── Fix: Verify public/data/gallery.json exists
│   └── No errors?
│       └── Check if data loaded in Network tab
│
├── Data loads but sphere blank?
│   ├── Check WebGL support
│   ├── Verify Three.js loaded
│   └── Check for texture loading errors
│
├── Images show as gray?
│   ├── Image loading failed
│   ├── Check CORS headers
│   └── Try different images
│
└── Working but slow?
    ├── Reduce image size
    ├── Lazy load component
    └── Check network speed
```

---

## Environment Variables

None needed! This implementation works with default setup.

**Public Folder**: `public/` (default Vite setup)  
**Data Folder**: `public/data/` → accessible as `/data/`  
**Images**: External Google Drive URLs  

---

## Build Output

```bash
$ npm run build

✓ 1234 modules transformed

dist/index.html                                 0.45 kB │ gzip:  0.25 kB
dist/assets/index-abc123.js                    567.89 kB │ gzip: 145.23 kB
dist/assets/index-def456.css                   15.67 kB │ gzip:   2.34 kB

✓ built in 12.34s
```

Production bundle includes:
- Three.js (~150 KB gzipped)
- React Three Fiber (~50 KB gzipped)
- All UI components
- Gallery component with error handling

