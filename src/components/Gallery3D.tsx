import { useRef, useState, useMemo } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Sphere } from "@react-three/drei";
import * as THREE from "three";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";

import event1 from "@/assets/event1.jpg";
import event2 from "@/assets/event2.jpg";
import event3 from "@/assets/event3.jpg";
import event4 from "@/assets/event4.jpg";
import event5 from "@/assets/event5.jpg";
import event6 from "@/assets/event6.jpg";

interface EventPhoto {
  id: number;
  title: string;
  date: string;
  position: [number, number, number];
  rotation: [number, number, number];
  image: string;
}

const events: EventPhoto[] = [
  {
    id: 1,
    title: "Annual Hackathon 2024",
    date: "March 15, 2024",
    position: [1.8, 0, 0],
    rotation: [0, Math.PI / 2, 0],
    image: event1,
  },
  {
    id: 2,
    title: "Robotics Workshop",
    date: "February 20, 2024",
    position: [0, 1.8, 0],
    rotation: [-Math.PI / 2, 0, 0],
    image: event2,
  },
  {
    id: 3,
    title: "Tech Seminar Series",
    date: "January 10, 2024",
    position: [-1.8, 0, 0],
    rotation: [0, -Math.PI / 2, 0],
    image: event3,
  },
  {
    id: 4,
    title: "Club Team Photo",
    date: "December 5, 2023",
    position: [0, -1.8, 0],
    rotation: [Math.PI / 2, 0, 0],
    image: event4,
  },
  {
    id: 5,
    title: "Project Exhibition",
    date: "November 18, 2023",
    position: [0, 0, 1.8],
    rotation: [0, 0, 0],
    image: event5,
  },
  {
    id: 6,
    title: "Electronics Workshop",
    date: "October 8, 2023",
    position: [0, 0, -1.8],
    rotation: [0, Math.PI, 0],
    image: event6,
  },
];

function Earth() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
    }
  });

  return (
    <Sphere ref={meshRef} args={[1.6, 64, 64]}>
      <meshStandardMaterial
        color="#1e40af"
        wireframe
        transparent
        opacity={0.15}
      />
    </Sphere>
  );
}

function PhotoPlane({ 
  event, 
  onClick, 
  onHover 
}: { 
  event: EventPhoto; 
  onClick: (event: EventPhoto) => void;
  onHover: (hovering: boolean) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useLoader(THREE.TextureLoader, event.image);

  useFrame(() => {
    if (meshRef.current) {
      const targetScale = hovered ? 1.3 : 1;
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      );
    }
  });

  const handlePointerOver = () => {
    setHovered(true);
    onHover(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    setHovered(false);
    onHover(false);
    document.body.style.cursor = 'auto';
  };

  return (
    <mesh
      ref={meshRef}
      position={event.position}
      rotation={event.rotation}
      onClick={() => onClick(event)}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <planeGeometry args={[0.8, 0.8]} />
      <meshStandardMaterial 
        map={texture} 
        side={THREE.DoubleSide}
        emissive={hovered ? "#fb923c" : "#000000"}
        emissiveIntensity={hovered ? 0.3 : 0}
      />
      {hovered && (
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[0.85, 0.85]} />
          <meshBasicMaterial color="#f97316" transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
      )}
    </mesh>
  );
}

const Gallery3D = () => {
  const [selectedEvent, setSelectedEvent] = useState<EventPhoto | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  const orbitControlsRef = useRef<any>(null);

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
              <div className="h-[600px] w-full bg-gradient-to-b from-primary/5 to-secondary/5">
                <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                  <ambientLight intensity={0.6} />
                  <pointLight position={[10, 10, 10]} intensity={1.2} />
                  <pointLight position={[-10, -10, -10]} intensity={0.6} />
                  <spotLight position={[0, 5, 5]} intensity={0.8} angle={0.3} penumbra={1} />
                  
                  <Earth />
                  
                  {events.map((event) => (
                    <PhotoPlane
                      key={event.id}
                      event={event}
                      onClick={handlePhotoClick}
                      onHover={setIsHovering}
                    />
                  ))}
                  
                  <OrbitControls
                    ref={orbitControlsRef}
                    enableZoom={true}
                    enablePan={false}
                    minDistance={3}
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

      {/* Full Size Image Modal */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <DialogTitle className="sr-only">
            {selectedEvent?.title}
          </DialogTitle>
          {selectedEvent && (
            <div className="relative">
              <img
                src={selectedEvent.image}
                alt={selectedEvent.title}
                className="w-full h-auto"
              />
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
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Gallery3D;
