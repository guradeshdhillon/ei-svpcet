// src/components/Gallery3D.tsx
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere } from "@react-three/drei";
import * as THREE from "three";
import { Card, CardContent } from "./ui/card";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { AlertCircle } from "lucide-react";

// Import local preview images
import event1 from "../assets/event1.jpg";
import event2 from "../assets/event2.jpg";
import event3 from "../assets/event3.jpg";
import event4 from "../assets/event4.jpg";
import event5 from "../assets/event5.jpg";
import event6 from "../assets/event6.jpg";
import event7 from "../assets/event7.jpg";
import event8 from "../assets/event8.jpg";
import event9 from "../assets/event9.jpg";
import event10 from "../assets/event10.jpg";
import event11 from "../assets/event11.jpg";
import event12 from "../assets/event12.jpg";
import event13 from "../assets/event13.jpg";
import event14 from "../assets/event14.jpg";
import event15 from "../assets/event15.jpg";
import event16 from "../assets/event16.jpg";

type MediaType = "image" | "video";

interface EventPhoto {
  id: number;
  title: string;
  date: string;
  type: MediaType;
  url: string;
  previewUrl?: string; // local preview image path
  theta?: number;
  phi?: number;
}

// Map event IDs to local preview images
const previewImageMap: Record<number, string> = {
  1: event1, 2: event2, 3: event3, 4: event4, 5: event5, 6: event6,
  7: event7, 8: event8, 9: event9, 10: event10, 11: event11, 12: event12,
  13: event13, 14: event14, 15: event15, 16: event16,
};

function getPreviewImage(eventId: number): string | undefined {
  return previewImageMap[eventId];
}

/* Enhanced Fibonacci / golden-angle distribution for organized sphere layout */
function generateSpherePosition(index: number, total: number) {
  // Use golden ratio for even distribution
  const phi = Math.acos(1 - 2 * (index + 0.5) / total);
  const theta = Math.PI * (1 + Math.sqrt(5)) * index;
  
  // Optional: slightly adjust distribution for more clustered appearance
  // This prevents items from appearing completely scattered
  const adjustedPhi = phi * (0.95 + Math.random() * 0.05); // small randomness
  
  return { phi: adjustedPhi, theta };
}

function resolveDriveUrl(url: string) {
  try {
    const u = new URL(url);
    // handle drive thumbnail links like https://drive.google.com/thumbnail?id=ID&sz=...
    if (u.hostname.includes("drive.google.com")) {
      const id = u.searchParams.get("id") || (u.pathname.match(/\/d\/([a-zA-Z0-9_-]+)/) || [])[1];
      if (id) return `https://drive.google.com/uc?export=view&id=${id}`;
    }
    return url;
  } catch {
    return url;
  }
}

function Earth() {
  const ref = useRef<THREE.Mesh>(null);

  // slow, frame-rate-independent rotation for calm motion
  useFrame((_, delta) => {
    if (!ref.current) return;
    const slowSpeed = 0.06; // radians per second (subtle)
    ref.current.rotation.y += slowSpeed * delta;
    // very slight up/down breathing
    ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, Math.sin(Date.now() * 0.0002) * 0.01, 0.02);
  });

  return (
    <Sphere ref={ref} args={[1.5, 64, 64]}>
      <meshStandardMaterial wireframe transparent opacity={0.05} color="#cbd5e1" />
    </Sphere>
  );
}

function CurvedPhoto({
  event,
  onClick,
  onHover,
}: {
  event: EventPhoto;
  onClick: (e: EventPhoto) => void;
  onHover: (h: boolean) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef<THREE.Group>(null);
  const [textureError, setTextureError] = useState(false);

  const texture = useMemo(() => {
    try {
      const loader = new THREE.TextureLoader();
      
      // For image events, try local preview first, fallback to full resolution if available
      if (event.type === "image") {
        const previewUrl = getPreviewImage(event.id);
        const urlToLoad = previewUrl || resolveDriveUrl(event.url);
        
        const tex = loader.load(
          urlToLoad,
          undefined,
          undefined,
          (error) => {
            console.error(`Failed to load image: ${urlToLoad}`, error);
            setTextureError(true);
          }
        );
        // prefer sRGB encoding for color-correct results when available
        try {
          if (tex) (tex as any).encoding = (THREE as any).sRGBEncoding ?? (tex as any).encoding;
        } catch {}
        return tex;
      }

      // For video, use the full URL
      const video = document.createElement("video");
      video.src = resolveDriveUrl(event.url);
      video.crossOrigin = "anonymous";
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.addEventListener("error", () => {
        console.error(`Failed to load video: ${event.url}`);
        setTextureError(true);
      });
      video.play().catch((err) => console.error("Video play error:", err));
      return new THREE.VideoTexture(video);
    } catch (error) {
      console.error("Texture loading error:", error);
      setTextureError(true);
      // Return a placeholder texture
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#e5e7eb";
        ctx.fillRect(0, 0, 256, 256);
        ctx.fillStyle = "#9ca3af";
        ctx.font = "16px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("No image", 128, 128);
      }
      return new THREE.CanvasTexture(canvas);
    }
  }, [event]);

  const radius = 1.65;
  // increase radius for balanced, even spacing across the globe
  const radiusAdjusted = radius + 0.15;
  const phi = event.phi ?? 0;
  const theta = event.theta ?? 0;

  // normalize spherical coordinates to safe ranges to avoid invalid geometry args
  const normTheta = ((theta % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  const normPhi = Math.max(0, Math.min(Math.PI, phi));

  const x = radiusAdjusted * Math.sin(normPhi) * Math.cos(normTheta);
  const y = radiusAdjusted * Math.cos(normPhi);
  const z = radiusAdjusted * Math.sin(normPhi) * Math.sin(normTheta);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const s = hovered ? 1.15 : 1;
    // smooth scaling with easing for elegant feel
    const scaleLerpFactor = 1 - Math.exp(-10 * delta);
    groupRef.current.scale.lerp(new THREE.Vector3(s, s, s), scaleLerpFactor);
    // subtle z-offset on hover for depth feel, not aggressive
    const zOffset = hovered ? 0.1 : 0;
    groupRef.current.position.z = z + THREE.MathUtils.damp(groupRef.current.position.z - z, zOffset, 8, delta);
  });

  const geometry = useMemo(() => {
    // create a small curved patch using normalized angles
    const phiStart = Math.max(0, normTheta - 0.25);
    const phiLen = 0.5;
    const thetaStart = Math.max(0, normPhi + Math.PI / 2 - 0.25);
    const thetaLen = 0.5;
    return new THREE.SphereGeometry(radiusAdjusted, 16, 16, phiStart, phiLen, thetaStart, thetaLen);
  }, [normPhi, normTheta, radius]);

  if (textureError) {
    return (
      <group ref={groupRef} position={[x, y, z]}>
        <mesh
          geometry={geometry}
          onClick={() => onClick(event)}
          onPointerOver={() => {
            setHovered(true);
            onHover(true);
          }}
          onPointerOut={() => {
            setHovered(false);
            onHover(false);
          }}
        >
          <meshStandardMaterial color="#555" side={THREE.DoubleSide} />
        </mesh>
      </group>
    );
  }

  return (
    <group ref={groupRef} position={[x, y, z]}>
      <mesh
        geometry={geometry}
        onClick={() => onClick(event)}
        onPointerOver={() => {
          setHovered(true);
          onHover(true);
        }}
        onPointerOut={() => {
          setHovered(false);
          onHover(false);
        }}
      >
        <meshStandardMaterial
          map={texture}
          side={THREE.DoubleSide}
          roughness={0.5}
          metalness={0}
          toneMapped={true}
        />
      </mesh>
    </group>
  );
}

export default function Gallery3D() {
  const [events, setEvents] = useState<EventPhoto[]>([]);
  const [selected, setSelected] = useState<EventPhoto | null>(null);
  const [hovering, setHovering] = useState(false);

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
        setEvents([]);
      }
    };
    loadGallery();
  }, []);

  return (
    <section id="gallery" className="py-20 bg-white">
      <Card className="max-w-6xl mx-auto border border-slate-200 shadow-md">
        <CardContent className="p-0 h-[700px] relative bg-white">
          {events.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 mx-auto text-blue-500 mb-4" />
                <p className="text-slate-700">Loading gallery...</p>
              </div>
            </div>
          ) : (
            <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0.3, 6.5], fov: 48 }} gl={{ antialias: true, alpha: true }}>
              <Suspense fallback={null}>
                {/* Bright white background */}
                <color attach="background" args={["#ffffff"]} />
                {/* Strong hemisphere for bright, even fill */}
                <hemisphereLight skyColor={0xffffff} groundColor={0xe8e8e8} intensity={1.2} />
                {/* Bright key light from top-right */}
                <directionalLight position={[6, 8, 4]} intensity={1.1} color={0xffffff} castShadow={false} />
                {/* Gentle fill light from opposite side */}
                <directionalLight position={[-4, 3, -5]} intensity={0.6} color={0xf0f4ff} castShadow={false} />

                <Earth />

                {events.map((e, i) => {
                  const { phi, theta } = generateSpherePosition(i, events.length);
                  return (
                    <CurvedPhoto
                      key={e.id}
                      event={{ ...e, phi, theta }}
                      onClick={setSelected}
                      onHover={setHovering}
                    />
                  );
                })}

                <OrbitControls
                  autoRotate={!hovering}
                  autoRotateSpeed={0.2}
                  enablePan={false}
                  enableDamping
                  dampingFactor={0.12}
                  minDistance={4.2}
                  maxDistance={10}
                />
              </Suspense>
            </Canvas>
          )}
        </CardContent>

        {/* Thumbnails strip */}
        {events.length > 0 && (
          <div className="p-4 border-t border-slate-200 bg-white">
            <div className="flex items-center gap-3 overflow-x-auto">
              {events.map((ev) => {
                const previewUrl = getPreviewImage(ev.id);
                const thumbUrl = previewUrl || resolveDriveUrl(ev.url);
                return (
                  <button
                    key={ev.id}
                    onClick={() => setSelected(ev)}
                    className="flex-shrink-0 rounded overflow-hidden w-28 h-20 shadow-sm ring-1 ring-slate-300 hover:ring-blue-500 transition-all hover:scale-105"
                    aria-label={ev.title}
                  >
                    <img
                      src={thumbUrl}
                      alt={ev.title}
                      className="w-full h-full object-cover"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='180'%3E%3Crect width='100%25' height='100%25' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' fill='%239ca3af' font-size='12' dominant-baseline='middle' text-anchor='middle'%3Eunavailable%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl">
          <DialogTitle>{selected?.title}</DialogTitle>
          <div className="text-sm text-slate-600 mb-3">{selected?.date}</div>
          {selected?.type === "image" ? (
            <img 
              src={resolveDriveUrl(selected?.url || "")} 
              alt={selected?.title} 
              className="w-full max-h-[70vh] object-contain rounded" 
              crossOrigin="anonymous"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='480'%3E%3Crect width='100%25' height='100%25' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' fill='%239ca3af' font-size='18' dominant-baseline='middle' text-anchor='middle'%3EImage unavailable%3C/text%3E%3C/svg%3E";
              }}
            />
          ) : (
            <video 
              src={resolveDriveUrl(selected?.url || "")} 
              controls 
              className="w-full max-h-[70vh] rounded"
              crossOrigin="anonymous"
            />
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
