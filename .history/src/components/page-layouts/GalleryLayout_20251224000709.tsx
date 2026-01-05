import Navigation from "@/components/Navigation";
import Gallery3D from "@/components/Gallery3D";
import Footer from "@/components/Footer";

export default function GalleryLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 pt-16">
        <Gallery3D />
      </main>
      <Footer />
    </div>
  );
}
