import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Activities from "@/components/Activities";
import Teams from "@/components/Teams";
import Gallery3D from "@/components/Gallery3D";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <About />
      <Activities />
      <Teams />
      <Gallery3D />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;
