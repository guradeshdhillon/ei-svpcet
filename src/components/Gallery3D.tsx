// src/components/Gallery3D.tsx
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
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

  const texture = useMemo(() => {
    if (event.type === "image") {
      const loader = new THREE.TextureLoader();
      loader.setCrossOrigin("anonymous");
      return loader.load(event.url);
    }

    const video = document.createElement("video");
    video.src = event.url;
    video.crossOrigin = "anonymous";
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.play().catch(() => {});
    return new THREE.VideoTexture(video);
  }, [event]);

  const radius = 1.65;
  const phi = event.phi!;
  const theta = event.theta!;

  const x = radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  useFrame(() => {
    if (!groupRef.current) return;
    const s = hovered ? 1.25 : 1;
    groupRef.current.scale.lerp(new THREE.Vector3(s, s, s), 0.12);
  });

  const geometry = useMemo(
    () => new THREE.SphereGeometry(radius, 16, 16, theta - 0.25, 0.5, phi + Math.PI / 2 - 0.25, 0.5),
    [phi, theta]
  );

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
    fetch("/data/gallery.json")
      .then((r) => r.json())
      .then(setEvents)
      .catch(console.error);
  }, []);

  return (
    <section id="gallery" className="py-20">
      <Card className="max-w-6xl mx-auto">
        <CardContent className="p-0 h-[700px]">
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
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          <DialogTitle>{selected?.title}</DialogTitle>
          {selected?.type === "image" ? (
            <img src={selected?.url} />
          ) : (
            <video src={selected?.url} controls />
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
