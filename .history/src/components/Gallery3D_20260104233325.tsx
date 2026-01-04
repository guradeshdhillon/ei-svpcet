import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface GalleryItem {
  id: string;
  mediaType: 'image' | 'video' | 'photo';
  src: string;
  thumbnail: string;
  caption: string;
  date?: string;
}

interface SphereItem extends GalleryItem {
  phi: number;
  theta: number;
}

const CurvedPhoto = ({ item, onClick }: { item: SphereItem; onClick: (item: SphereItem) => void }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [error, setError] = useState(false);

  const { phi, theta } = item;
  // Convert spherical to cartesian
  // Radius = 5
  const radius = 5;
  const x = radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    // Use thumbnail for the 3D sphere to be faster
    loader.load(
      item.thumbnail,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        setTexture(tex);
      },
      undefined,
      (err) => {
        console.error(`Failed to load texture for ${item.id}`, err);
        setError(true);
      }
    );
  }, [item.thumbnail, item.id]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.lookAt(0, 0, 0);
      // Slight scale animation on hover
      const targetScale = hovered ? 1.2 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[x, y, z]}
      onClick={(e) => {
        e.stopPropagation();
        onClick(item);
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <planeGeometry args={[1.5, 1]} />
      {texture ? (
        <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
      ) : (
        <meshBasicMaterial color={error ? "#ff0000" : "#cccccc"} side={THREE.DoubleSide} />
      )}
    </mesh>
  );
};

const Gallery3D = () => {
  const [items, setItems] = useState<SphereItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<SphereItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/gallery')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        // Flatten sections and sources
        const allItems: GalleryItem[] = [];
        if (data.sections) {
          data.sections.forEach((section: any) => {
            if (section.sources) {
              section.sources.forEach((source: any) => {
                if (source.items) {
                  allItems.push(...source.items);
                }
              });
            }
          });
        } else if (data.items) {
             // Fallback for simple structure
             allItems.push(...data.items);
        }

        // Assign positions
        const total = allItems.length;
        const sphereItems = allItems.map((item, index) => {
          const goldenAngle = Math.PI * (3 - Math.sqrt(5));
          const phi = Math.acos(1 - 2 * (index + 0.5) / total);
          const theta = goldenAngle * index;
          return { ...item, phi, theta };
        });

        setItems(sphereItems);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load gallery data:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <section id="gallery" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 mb-8 text-center">
        <h2 className="text-4xl font-bold mb-4">
          Event <span className="text-blue-600">Gallery</span>
        </h2>
        <p className="text-gray-600">Explore our event memories in 3D</p>
      </div>

      <Card className="max-w-6xl mx-auto shadow-xl overflow-hidden">
        <CardContent className="p-0 h-[600px] relative bg-slate-900">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center text-white z-10">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 mx-auto text-blue-500 mb-4 animate-pulse" />
                <p>Loading 3D Gallery...</p>
              </div>
            </div>
          )}
          
          {error && (
             <div className="absolute inset-0 flex items-center justify-center text-white z-10">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
                <p>Error loading gallery: {error}</p>
              </div>
            </div>
          )}

          {!loading && !error && items.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-white z-10">
              <p>No images found in gallery.</p>
            </div>
          )}

          {!loading && !error && items.length > 0 && (
            <Canvas camera={{ position: [0, 0, 12], fov: 60 }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} intensity={1} />
              <OrbitControls 
                enableZoom={true} 
                enablePan={false} 
                autoRotate={!selectedItem} 
                autoRotateSpeed={0.5} 
                minDistance={5}
                maxDistance={20}
              />
              <group>
                {items.map((item) => (
                  <CurvedPhoto key={item.id} item={item} onClick={setSelectedItem} />
                ))}
              </group>
            </Canvas>
          )}
        </CardContent>
      </Card>

      {/* Thumbnail Strip */}
      {!loading && !error && items.length > 0 && (
        <div className="max-w-6xl mx-auto mt-6 px-4">
            <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                {items.map((item) => (
                    <div 
                        key={item.id} 
                        className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                        onClick={() => setSelectedItem(item)}
                    >
                        <img src={item.thumbnail} alt={item.caption} className="w-full h-full object-cover" />
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* Full View Modal */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-4xl w-full bg-black/95 border-gray-800 text-white p-0 overflow-hidden">
            <div className="relative w-full h-[80vh] flex items-center justify-center">
                {selectedItem && (
                    <>
                         {selectedItem.mediaType === 'video' ? (
                            <video 
                                src={selectedItem.src} 
                                controls 
                                autoPlay 
                                className="max-w-full max-h-full object-contain"
                            />
                        ) : (
                            <img 
                                src={selectedItem.src} 
                                alt={selectedItem.caption} 
                                className="max-w-full max-h-full object-contain"
                            />
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                            <h3 className="text-xl font-bold">{selectedItem.caption}</h3>
                            {selectedItem.date && <p className="text-gray-300 text-sm">{new Date(selectedItem.date).toLocaleDateString()}</p>}
                        </div>
                    </>
                )}
            </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Gallery3D;
