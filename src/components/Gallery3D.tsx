import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere } from "@react-three/drei";
import * as THREE from "three";
import { Card, CardContent } from "./ui/card";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { AlertCircle, Loader2 } from "lucide-react";

interface GalleryItem {
  id: number;
  title: string;
  date: string;
  type: string;
  url: string;
  thumbnailUrl?: string;
  theta?: number;
  phi?: number;
}

function generateSpherePosition(index: number, total: number) {
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const phi = Math.acos(1 - 2 * (index + 0.5) / total);
  const theta = goldenAngle * index;
  return { phi, theta };
}

function Earth() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += 0.2 * delta;
    }
  });

  return (
    <Sphere ref={ref} args={[1.8, 32, 32]}>
      <meshStandardMaterial wireframe transparent opacity={0.1} color="#3b82f6" />
    </Sphere>
  );
}

function PhotoSphere({ item, onClick }: {
  item: GalleryItem;
  onClick: (item: GalleryItem) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = "anonymous";
    
    const imageUrl = item.thumbnailUrl || item.url;
    loader.load(
      imageUrl,
      (loadedTexture) => {
        loadedTexture.colorSpace = THREE.SRGBColorSpace;
        setTexture(loadedTexture);
      },
      undefined,
      (error) => {
        console.error(`Failed to load texture for item ${item.id}:`, error);
      }
    );
  }, [item.url, item.thumbnailUrl, item.id]);

  const radius = 2.2;
  const phi = item.phi ?? 0;
  const theta = item.theta ?? 0;

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
        onClick={() => onClick(item)}
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
        {texture ? (
          <meshStandardMaterial 
            map={texture} 
            transparent
            opacity={hovered ? 1 : 0.9}
          />
        ) : (
          <meshStandardMaterial 
            color="#e5e7eb"
            transparent
            opacity={0.7}
          />
        )}
      </mesh>
    </group>
  );
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
        
        // Try API first, fallback to static JSON
        let response;
        try {
          response = await fetch('/api/gallery');
        } catch {
          response = await fetch('/data/gallery.json');
        }
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        if (Array.isArray(data)) {
          const itemsWithPositions = data.map((item, index) => {
            const { phi, theta } = generateSpherePosition(index, data.length);
            return { ...item, phi, theta };
          });
          setItems(itemsWithPositions);
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
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <Card className="border shadow-lg">
            <CardContent className="p-0 h-[700px] flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-12 h-12 mx-auto text-blue-600 mb-4 animate-spin" />
                <p className="text-gray-600">Loading gallery...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <Card className="border shadow-lg">
            <CardContent className="p-0 h-[700px] flex items-center justify-center">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
                <p className="text-gray-600">{error}</p>
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
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Gallery</h2>
          <p className="text-gray-600">Explore our collection in 3D</p>
        </div>
        
        <Card className="border shadow-lg">
          <CardContent className="p-0 h-[700px] relative">
            {displayedItems.length === 0 ? (
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

                  {displayedItems.map((item) => (
                    <PhotoSphere
                      key={item.id}
                      item={item}
                      onClick={setSelected}
                    />
                  ))}

                  <OrbitControls
                    autoRotate
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
              <p className="text-sm text-gray-600">🖱️ Drag • 🔍 Zoom • 👆 Click</p>
            </div>
          </CardContent>

          {displayedItems.length > 0 && (
            <div className="p-4 bg-gray-50 border-t">
              <div className="flex gap-2 overflow-x-auto mb-4">
                {displayedItems.slice(0, 10).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelected(item)}
                    className="flex-shrink-0 w-20 h-16 rounded overflow-hidden shadow hover:shadow-md transition-all duration-300"
                  >
                    <img
                      src={item.thumbnailUrl || item.url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
              
              {items.length > visibleItems && (
                <button
                  onClick={() => setVisibleItems(prev => prev + 20)}
                  className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Load More ({items.length - visibleItems} remaining)
                </button>
              )}
            </div>
          )}
        </Card>
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-4xl">
          <DialogTitle>{selected?.title}</DialogTitle>
          <div className="text-sm text-gray-500 mb-4">{selected?.date}</div>
          <div className="flex justify-center">
            {selected && (
              <img 
                src={selected.url}
                alt={selected.title}
                className="max-w-full max-h-[70vh] object-contain rounded"
                loading="lazy"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}