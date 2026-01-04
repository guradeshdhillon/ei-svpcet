import Navigation from '../Navigation';
import Gallery3D from '../Gallery3D';
import Footer from '../Footer';

const GalleryLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 pt-16">
        <Gallery3D />
      </main>
      <Footer />
    </div>
  );
};

export default GalleryLayout;
