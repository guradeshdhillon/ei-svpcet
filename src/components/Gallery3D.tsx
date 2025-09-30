import { useRef, useState } from "react";
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
import event7 from "@/assets/event7.jpg";
import event8 from "@/assets/event8.jpg";
import event9 from "@/assets/event9.jpg";
import event10 from "@/assets/event10.jpg";
import event11 from "@/assets/event11.jpg";
import event12 from "@/assets/event12.jpg";
import event13 from "@/assets/event13.jpg";
import event14 from "@/assets/event14.jpg";
import event15 from "@/assets/event15.jpg";
import event16 from "@/assets/event16.jpg";

interface EventPhoto {
  id: number;
  title: string;
  date: string;
  theta: number; // horizontal angle
  phi: number; // vertical angle
  image: string;
}

const events: EventPhoto[] = [
  { id: 1, title: "Annual Hackathon 2024", date: "March 15, 2024", theta: 0, phi: 0, image: event1 },
  { id: 2, title: "Robotics Workshop", date: "February 20, 2024", theta: Math.PI / 2, phi: 0, image: event2 },
  { id: 3, title: "Tech Seminar Series", date: "January 10, 2024", theta: Math.PI, phi: 0, image: event3 },
  { id: 4, title: "Club Team Photo", date: "December 5, 2023", theta: -Math.PI / 2, phi: 0, image: event4 },
  { id: 5, title: "Project Exhibition", date: "November 18, 2023", theta: Math.PI / 4, phi: Math.PI / 3, image: event5 },
  { id: 6, title: "Electronics Workshop", date: "October 8, 2023", theta: -Math.PI / 4, phi: Math.PI / 3, image: event6 },
  { id: 7, title: "Team Building Event", date: "September 22, 2023", theta: 3 * Math.PI / 4, phi: Math.PI / 3, image: event7 },
  { id: 8, title: "Achievement Celebration", date: "August 12, 2023", theta: -3 * Math.PI / 4, phi: Math.PI / 3, image: event8 },
  { id: 9, title: "Circuit Lab Session", date: "July 5, 2023", theta: Math.PI / 4, phi: -Math.PI / 3, image: event9 },
  { id: 10, title: "Guest Speaker Event", date: "June 18, 2023", theta: -Math.PI / 4, phi: -Math.PI / 3, image: event10 },
  { id: 11, title: "College Festival Booth", date: "May 10, 2023", theta: 3 * Math.PI / 4, phi: -Math.PI / 3, image: event11 },
  { id: 12, title: "3D Printing Workshop", date: "April 25, 2023", theta: -3 * Math.PI / 4, phi: -Math.PI / 3, image: event12 },
  { id: 13, title: "Coding Competition", date: "March 30, 2023", theta: Math.PI / 6, phi: Math.PI / 6, image: event13 },
  { id: 14, title: "Project Demo Day", date: "February 14, 2023", theta: -Math.PI / 6, phi: Math.PI / 6, image: event14 },
  { id: 15, title: "Club Orientation", date: "January 20, 2023", theta: 5 * Math.PI / 6, phi: -Math.PI / 6, image: event15 },
  { id: 16, title: "Drone Workshop", date: "December 8, 2022", theta: -5 * Math.PI / 6, phi: -Math.PI / 6, image: event16 },
];

function Earth() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
    }
  });

  return (
    <Sphere ref={meshRef} args={[1.5, 64, 64]}>
      <meshStandardMaterial
        color="#1e40af"
        wireframe
        transparent
        opacity={0.1}
      />
    </Sphere>
  );
}

function CurvedPhoto({ 
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
  const groupRef = useRef<THREE.Group>(null);
  const texture = useLoader(THREE.TextureLoader, event.image);

  const radius = 1.65;
  
  // Calculate position on sphere surface
  const x = radius * Math.sin(event.phi) * Math.cos(event.theta);
  const y = radius * Math.cos(event.phi);
  const z = radius * Math.sin(event.phi) * Math.sin(event.theta);

  useFrame(() => {
    if (groupRef.current) {
      const targetScale = hovered ? 1.25 : 1;
      const currentScale = groupRef.current.scale.x;
      const newScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.1);
      groupRef.current.scale.set(newScale, newScale, newScale);
      
      // Move outward when hovered
      const targetRadius = hovered ? radius + 0.3 : radius;
      const currentRadius = Math.sqrt(
        groupRef.current.position.x ** 2 + 
        groupRef.current.position.y ** 2 + 
        groupRef.current.position.z ** 2
      );
      const newRadius = THREE.MathUtils.lerp(currentRadius, targetRadius, 0.1);
      const scale = newRadius / currentRadius;
      groupRef.current.position.multiplyScalar(scale);
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

  // Create a curved surface using SphereGeometry segment
  const curvedGeometry = new THREE.SphereGeometry(
    radius, 
    16, 
    16, 
    event.theta - 0.25, 
    0.5, 
    event.phi + Math.PI / 2 - 0.25, 
    0.5
  );

  return (
    <group ref={groupRef} position={[x, y, z]}>
      <mesh
        ref={meshRef}
        geometry={curvedGeometry}
        onClick={() => onClick(event)}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <meshStandardMaterial 
          map={texture} 
          side={THREE.DoubleSide}
          emissive={hovered ? "#fb923c" : "#000000"}
          emissiveIntensity={hovered ? 0.4 : 0}
        />
      </mesh>
      {hovered && (
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[radius * 1.02, 16, 16, event.theta - 0.26, 0.52, event.phi + Math.PI / 2 - 0.26, 0.52]} />
          <meshBasicMaterial color="#f97316" transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
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
              <div className="h-[700px] w-full bg-gradient-to-b from-primary/5 to-secondary/5">
                <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                  <ambientLight intensity={0.6} />
                  <pointLight position={[10, 10, 10]} intensity={1.2} />
                  <pointLight position={[-10, -10, -10]} intensity={0.6} />
                  <spotLight position={[0, 5, 5]} intensity={0.8} angle={0.3} penumbra={1} />
                  
                  <Earth />
                  
                  {events.map((event) => (
                    <CurvedPhoto
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
