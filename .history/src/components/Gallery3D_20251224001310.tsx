// src/components/Gallery3D.tsx
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere } from "@react-three/drei";
import * as THREE from "three";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { AlertCircle } from "lucide-react";

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

/* Fibonacci / golden-angle distribution */
function generateSpherePosition(index: number, total: number) {
  const phi = Math.acos(1 - 2 * (index + 0.5) / total);
  const theta = Math.PI * (1 + Math.sqrt(5)) * index;
  return { phi, theta };
}

function Earth() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (ref.current) ref.current.rotation.y += 0.0015;
  });

  return (
    <Sphere ref={ref} args={[1.5, 64, 64]}>
      <meshStandardMaterial wireframe transparent opacity={0.08} color="#1e40af" />
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
      if (event.type === "image") {
        const loader = new THREE.TextureLoader();
        // do not call removed/unsupported TextureLoader helpers here
        const tex = loader.load(
          event.url,
          undefined,
          undefined,
          (error) => {
            console.error(`Failed to load image: ${event.url}`, error);
            setTextureError(true);
          }
        );
        // prefer sRGB encoding for color-correct results when available
        try {
          if (tex) (tex as any).encoding = (THREE as any).sRGBEncoding ?? (tex as any).encoding;
        } catch {}
        return tex;
      }

      const video = document.createElement("video");
      video.src = event.url;
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
        ctx.fillStyle = "#333";
        ctx.fillRect(0, 0, 256, 256);
      }
      return new THREE.CanvasTexture(canvas);
    }
  }, [event]);

  const radius = 1.65;
  const phi = event.phi ?? 0;
  const theta = event.theta ?? 0;

  // normalize spherical coordinates to safe ranges to avoid invalid geometry args
  const normTheta = ((theta % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  const normPhi = Math.max(0, Math.min(Math.PI, phi));

  const x = radius * Math.sin(normPhi) * Math.cos(normTheta);
  const y = radius * Math.cos(normPhi);
  const z = radius * Math.sin(normPhi) * Math.sin(normTheta);

  useFrame(() => {
    if (!groupRef.current) return;
    const s = hovered ? 1.25 : 1;
    groupRef.current.scale.lerp(new THREE.Vector3(s, s, s), 0.12);
  });

  const geometry = useMemo(() => {
    // create a small curved patch using normalized angles
    const phiStart = Math.max(0, normTheta - 0.25);
    const phiLen = 0.5;
    const thetaStart = Math.max(0, normPhi + Math.PI / 2 - 0.25);
    const thetaLen = 0.5;
    return new THREE.SphereGeometry(radius, 16, 16, phiStart, phiLen, thetaStart, thetaLen);
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
        <meshStandardMaterial map={texture} side={THREE.DoubleSide} />
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
    <section id="gallery" className="py-20">
      <Card className="max-w-6xl mx-auto">
        <CardContent className="p-0 h-[700px] relative bg-slate-900">
          {events.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 mx-auto text-yellow-500 mb-4" />
                <p className="text-white">Loading gallery...</p>
              </div>
            </div>
          ) : (
            <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
              <Suspense fallback={null}>
                <ambientLight intensity={0.6} />
                <pointLight position={[10, 10, 10]} intensity={1.2} />

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

                <OrbitControls autoRotate={!hovering} enablePan={false} />
              </Suspense>
            </Canvas>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          <DialogTitle>{selected?.title}</DialogTitle>
          {selected?.type === "image" ? (
            <img src={selected?.url} alt={selected?.title} className="w-full" />
          ) : (
            <video src={selected?.url} controls className="w-full" />
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
