// src/components/Gallery3D.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere } from "@react-three/drei";
import * as THREE from "three";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";

type MediaType = "image" | "video";

interface EventPhoto {
  id: number;
  title: string;
  date: string;
  type: MediaType;
  url: string;
  theta?: number;
  phi?: number;
}

/** Golden-angle / Fibonacci sphere distribution for even placement */
function generateSpherePosition(index: number, total: number) {
  const phi = Math.acos(1 - 2 * (index + 0.5) / total);
  const theta = Math.PI * (1 + Math.sqrt(5)) * index;
  return { phi, theta };
}

function Earth() {
  const meshRef = useRef<THREE.Mesh | null>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.0015;
    }
  });

  return (
    <Sphere ref={meshRef} args={[1.5, 64, 64]}>
      <meshStandardMaterial color="#1e40af" wireframe transparent opacity={0.08} />
    </Sphere>
  );
}

function CurvedPhoto({
  event,
  onClick,
  onHover,
}: {
  event: EventPhoto;
  onClick: (event: EventPhoto) => void;
  onHover: (h: boolean) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef<THREE.Group | null>(null);

  // Build texture or video texture via useMemo to avoid recreating each render
  const texture = useMemo<THREE.Texture | null>(() => {
    try {
      if (event.type === "image") {
        const loader = new THREE.TextureLoader();
        // try to set crossOrigin if available
        // @ts-ignore
        if (loader.setCrossOrigin) loader.setCrossOrigin("anonymous");
        const tex = loader.load(event.url);
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = false;
        return tex;
      } else {
        const video = document.createElement("video");
        video.src = event.url;
        video.crossOrigin = "anonymous";
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        // autoplay might be blocked on some browsers; play() is attempted but not awaited
        // muted ensures autoplay is allowed
        void video.play().catch(() => {
          /* ignore play errors; user can open modal to play */
        });
        const vtex = new THREE.VideoTexture(video);
        vtex.minFilter = THREE.LinearFilter;
        vtex.magFilter = THREE.LinearFilter;
        vtex.generateMipmaps = false;
        return vtex;
      }
    } catch (err) {
      console.error("Failed to create texture for", event, err);
      return null;
    }
  }, [event.url, event.type]);

  const radius = 1.65;
  // fallback phi/theta to place the item at front if missing
  const phi = event.phi ?? Math.PI / 2;
  const theta = event.theta ?? 0;

  const x = radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  useFrame(() => {
    if (!groupRef.current) return;
    const targetScale = hovered ? 1.25 : 1;
    const currentScale = groupRef.current.scale.x;
    const newScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.12);
    groupRef.current.scale.set(newScale, newScale, newScale);

    // Move outward slightly when hovered
    const currentRadius = Math.sqrt(
      groupRef.current.position.x ** 2 +
        groupRef.current.position.y ** 2 +
        groupRef.current.position.z ** 2
    );
    const targetRadius = hovered ? radius + 0.34 : radius;
    const newRadius = THREE.MathUtils.lerp(currentRadius, targetRadius, 0.12);
    if (currentRadius > 0.0001) {
      const scale = newRadius / currentRadius;
      groupRef.current.position.multiplyScalar(scale);
    }
  });

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    setHovered(true);
    onHover(true);
    document.body.style.cursor = "pointer";
  };

  const handlePointerOut = (e: any) => {
    e.stopPropagation();
    setHovered(false);
    onHover(false);
    document.body.style.cursor = "auto";
  };

  // geometry segment attempts to map a curved patch; keep parameters conservative
  const curvedGeometry = useMemo(() => {
    // params: radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength
    // We'll compute phiStart/thetaStart from theta/phi to roughly cover a patch
    const phiStart = theta - 0.25;
    const phiLength = 0.5;
    const thetaStart = phi + Math.PI / 2 - 0.25;
    const thetaLength = 0.5;
    return new THREE.SphereGeometry(radius, 16, 16, phiStart, phiLength, thetaStart, thetaLength);
    // note: SphereGeometry is not disposed here; three will manage lifecycles in simple apps
  }, [radius, phi, theta]);

  return (
    <group ref={groupRef} position={[x, y, z]}>
      <mesh
        geometry={curvedGeometry}
        onClick={(ev) => {
          ev.stopPropagation();
          onClick(event);
        }}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <meshStandardMaterial
          map={texture ?? undefined}
          side={THREE.DoubleSide}
          emissive={hovered ? "#fb923c" : "#000000"}
          emissiveIntensity={hovered ? 0.35 : 0}
        />
      </mesh>

      {hovered && (
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[radius * 1.02, 16, 16, theta - 0.26, 0.52, phi + Math.PI / 2 - 0.26, 0.52]} />
          <meshBasicMaterial color="#f97316" transparent opacity={0.35} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

export default function Gallery3D() {
  const [events, setEvents] = useState<EventPhoto[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventPhoto | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  const orbitControlsRef = useRef<any>(null);

  useEffect(() => {
    // fetch gallery JSON placed in public/data/gallery.json
    fetch("/data/gallery.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch gallery.json");
        return res.json();
      })
      .then((data: EventPhoto[]) => {
        // ensure we have the fields we expect; don't overwrite incoming theta/phi if present
        setEvents(
          data.map((it, i) => ({
            ...it,
            // keep theta/phi if provided else will be set during rendering via generateSpherePosition
          }))
        );
      })
      .catch((err) => {
        console.error("Error loading gallery data:", err);
      });
  }, []);

  const handlePhotoClick = (event: EventPhoto) => {
    setSelectedEvent(event);
  };

  return (
    <section id="gallery" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Event <span className="bg-gradient-accent bg-clip-text text-transparent">Gallery</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Explore our events around the globe - hover to lift, click to view
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <Card className="overflow-hidden border-border shadow-glow">
            <CardContent className="p-0">
              <div className="h-[700px] w-full bg-gradient-to-b from-primary/5 to-secondary/5">
                <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                  <ambientLight intensity={0.6} />
                  <pointLight position={[10, 10, 10]} intensity={1.2} />
                  <pointLight position={[-10, -10, -10]} intensity={0.6} />
                  <spotLight position={[0, 5, 5]} intensity={0.8} angle={0.3} penumbra={1} />

                  <Earth />

                  {events.length === 0 ? null : (
                    events.map((event, i) => {
                      // if theta/phi are provided in JSON, keep them; otherwise generate
                      const hasPosition = typeof event.theta === "number" && typeof event.phi === "number";
                      const { phi, theta } = hasPosition ? { phi: event.phi!, theta: event.theta! } : generateSpherePosition(i, events.length);

                      return (
                        <CurvedPhoto
                          key={event.id}
                          event={{ ...event, phi, theta }}
                          onClick={handlePhotoClick}
                          onHover={setIsHovering}
                        />
                      );
                    })
                  )}

                  <OrbitControls
                    ref={orbitControlsRef}
                    enableZoom={true}
                    enablePan={false}
                    minDistance={3.5}
                    maxDistance={8}
                    autoRotate={!isHovering}
                    autoRotateSpeed={0.5}
                  />
                </Canvas>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              💡 Drag to rotate • Scroll to zoom • Hover to lift • Click to view full size
            </p>
          </div>
        </div>
      </div>

      {/* Full Size Modal */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <DialogTitle className="sr-only">{selectedEvent?.title}</DialogTitle>

          {selectedEvent ? (
            <div className="relative">
              {selectedEvent.type === "image" ? (
                <img src={selectedEvent.url} alt={selectedEvent.title} className="w-full h-auto" />
              ) : (
                // video preview in modal: don't autoplay here so user has control
                <video src={selectedEvent.url} controls className="w-full h-auto" />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-2xl font-bold mb-2">{selectedEvent.title}</h3>
                <p className="text-sm opacity-90">{selectedEvent.date}</p>
              </div>

              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  );
}
