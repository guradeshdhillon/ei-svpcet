import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere } from "@react-three/drei";
import * as THREE from "three";
import { Card, CardContent } from "./ui/card";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { AlertCircle } from "lucide-react";

interface EventPhoto {
  id: number;
  title: string;
  date: string;
  type: string;
  url: string;
  theta?: number;
  phi?: number;
}

function generateSpherePosition(index: number, total: number) {
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const phi = Math.acos(1 - 2 * (index + 0.5) / total);
  const theta = goldenAngle * index;
  return { phi, theta };
}

function resolveDriveUrl(url: string) {
  if (!url.includes('drive.google.com')) return url;
  
  const match = url.match(/id=([a-zA-Z0-9_-]+)/);
  if (match) {
    const id = match[1];
    return `https://lh3.googleusercontent.com/d/${id}=w800`;
  }
  return url;
}

function Earth() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += 0.3 * delta;
    }
  });

  return (
    <Sphere ref={ref} args={[1.8, 32, 32]}>
      <meshStandardMaterial wireframe transparent opacity={0.1} color="#3b82f6" />
    </Sphere>
  );
}

function PhotoSphere({ event, onClick }: {
  event: EventPhoto;
  onClick: (e: EventPhoto) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  
  const texture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = "anonymous";
    
    const tex = loader.load(
      resolveDriveUrl(event.url),
      (loadedTex) => {
        loadedTex.colorSpace = THREE.SRGBColorSpace;
      },
      undefined,
      (error) => {
        console.error(`Failed to load image ${event.id}:`, error);
      }
    );
    return tex;
  }, [event.url, event.id]);

  const radius = 2.2;
  const phi = event.phi ?? 0;
  const theta = event.theta ?? 0;

  const x = radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    
    const targetScale = hovered ? 1.2 : 1;
    groupRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale), 
      5 * delta
    );
    
    if (meshRef.current) {
      meshRef.current.lookAt(0, 0, 0);
    }
  });

  return (
    <group ref={groupRef} position={[x, y, z]}>
      <mesh
        ref={meshRef}
        onClick={() => onClick(event)}
        onPointerOver={() => {
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'default';
        }}
      >
        <planeGeometry args={[0.6, 0.4]} />
        <meshStandardMaterial 
          map={texture} 
          transparent
          opacity={hovered ? 1 : 0.9}
        />
      </mesh>
    </group>
  );
}

export default function Gallery3D() {
  const [events, setEvents] = useState<EventPhoto[]>([]);
  const [selected, setSelected] = useState<EventPhoto | null>(null);
  const [hovering, setHovering] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGallery = async () => {
      try {
        const response = await fetch("/data/gallery.json");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        if (Array.isArray(data)) {
          const eventsWithPositions = data.map((event, index) => {
            const { phi, theta } = generateSpherePosition(index, data.length);
            return { ...event, phi, theta };
          });
          setEvents(eventsWithPositions);
        }
      } catch (error) {
        console.error("Failed to load gallery:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadGallery();
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <Card className="border shadow-lg">
            <CardContent className="p-0 h-[700px] flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading gallery...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <Card className="border shadow-lg">
          <CardContent className="p-0 h-[700px] relative">
            {events.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 mx-auto text-blue-500 mb-4" />
                  <p className="text-gray-600">No images found</p>
                </div>
              </div>
            ) : (
              <Canvas 
                dpr={[1, 2]} 
                camera={{ position: [0, 0, 6], fov: 50 }} 
                gl={{ antialias: true }}
              >
                <Suspense fallback={null}>
                  <color attach="background" args={["#f8fafc"]} />
                  
                  <ambientLight intensity={0.6} />
                  <directionalLight position={[10, 10, 5]} intensity={1} />

                  <Earth />

                  {events.map((event) => (
                    <PhotoSphere
                      key={event.id}
                      event={event}
                      onClick={setSelected}
                    />
                  ))}

                  <OrbitControls
                    autoRotate={!hovering}
                    autoRotateSpeed={0.5}
                    enablePan={false}
                    enableDamping
                    dampingFactor={0.05}
                    minDistance={4}
                    maxDistance={12}
                  />
                </Suspense>
              </Canvas>
            )}
            
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
              <p className="text-sm text-gray-600">🖱️ Drag to rotate • 🔍 Scroll to zoom • 👆 Click to view</p>
            </div>
          </CardContent>

          {events.length > 0 && (
            <div className="p-4 bg-gray-50 border-t">
              <div className="flex gap-2 overflow-x-auto">
                {events.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => setSelected(event)}
                    className="flex-shrink-0 w-20 h-16 rounded overflow-hidden shadow hover:shadow-md transition-shadow"
                  >
                    <img
                      src={resolveDriveUrl(event.url)}
                      alt={event.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-3xl">
          <DialogTitle>{selected?.title}</DialogTitle>
          <div className="text-sm text-gray-500 mb-4">{selected?.date}</div>
          <div className="flex justify-center">
            {selected && (
              <img 
                src={resolveDriveUrl(selected.url)}
                alt={selected.title}
                className="max-w-full max-h-[70vh] object-contain rounded"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
