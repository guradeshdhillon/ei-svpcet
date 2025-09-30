import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, Html } from "@react-three/drei";
import * as THREE from "three";
import { Card, CardContent } from "@/components/ui/card";

interface EventPhoto {
  id: number;
  title: string;
  date: string;
  position: [number, number, number];
  image: string;
}

const events: EventPhoto[] = [
  {
    id: 1,
    title: "Annual Hackathon 2024",
    date: "March 15, 2024",
    position: [2, 0.5, 0],
    image: "/placeholder.svg",
  },
  {
    id: 2,
    title: "AI Workshop",
    date: "February 20, 2024",
    position: [0, 2, 0.5],
    image: "/placeholder.svg",
  },
  {
    id: 3,
    title: "TechFest 2023",
    date: "November 10, 2023",
    position: [-1.5, -1, 1],
    image: "/placeholder.svg",
  },
  {
    id: 4,
    title: "IoT Seminar",
    date: "January 8, 2024",
    position: [1, -1.5, -1],
    image: "/placeholder.svg",
  },
  {
    id: 5,
    title: "Industry Visit",
    date: "December 5, 2023",
    position: [-2, 0, -0.5],
    image: "/placeholder.svg",
  },
];

function Earth() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001;
    }
  });

  return (
    <Sphere ref={meshRef} args={[1.5, 64, 64]}>
      <meshStandardMaterial
        color="#1e40af"
        wireframe
        transparent
        opacity={0.3}
      />
    </Sphere>
  );
}

function EventMarker({ event, onClick }: { event: EventPhoto; onClick: (event: EventPhoto) => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <group position={event.position}>
      <Sphere
        args={[0.1, 16, 16]}
        onClick={() => onClick(event)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={hovered ? "#fb923c" : "#f97316"}
          emissive={hovered ? "#fb923c" : "#f97316"}
          emissiveIntensity={hovered ? 0.8 : 0.5}
        />
      </Sphere>
      {hovered && (
        <Html distanceFactor={5}>
          <div className="bg-card border border-border rounded-lg p-2 shadow-lg min-w-[150px] pointer-events-none">
            <p className="text-xs font-semibold text-foreground">{event.title}</p>
            <p className="text-xs text-muted-foreground">{event.date}</p>
          </div>
        </Html>
      )}
    </group>
  );
}

const Gallery3D = () => {
  const [selectedEvent, setSelectedEvent] = useState<EventPhoto | null>(null);

  return (
    <section id="gallery" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Event <span className="bg-gradient-accent bg-clip-text text-transparent">Gallery</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Explore our events around the globe - click on pins to view details
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <Card className="overflow-hidden border-border shadow-glow">
            <CardContent className="p-0">
              <div className="h-[600px] w-full bg-gradient-to-b from-primary/5 to-secondary/5">
                <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                  <ambientLight intensity={0.5} />
                  <pointLight position={[10, 10, 10]} intensity={1} />
                  <pointLight position={[-10, -10, -10]} intensity={0.5} />
                  
                  <Earth />
                  
                  {events.map((event) => (
                    <EventMarker
                      key={event.id}
                      event={event}
                      onClick={setSelectedEvent}
                    />
                  ))}
                  
                  <OrbitControls
                    enableZoom={true}
                    enablePan={false}
                    minDistance={3}
                    maxDistance={8}
                    autoRotate
                    autoRotateSpeed={0.5}
                  />
                </Canvas>
              </div>

              {selectedEvent && (
                <div className="p-6 bg-gradient-card border-t border-border">
                  <div className="max-w-2xl mx-auto text-center">
                    <h3 className="text-2xl font-bold text-foreground mb-2">
                      {selectedEvent.title}
                    </h3>
                    <p className="text-muted-foreground mb-4">{selectedEvent.date}</p>
                    <button
                      onClick={() => setSelectedEvent(null)}
                      className="text-sm text-primary hover:underline"
                    >
                      Close Details
                    </button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              💡 Drag to rotate • Scroll to zoom • Click pins to view event details
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Gallery3D;
