import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  const navItems = [
    { label: "Home", id: "home" },
    { label: "About", id: "about" },
    { label: "Activities", id: "activities" },
    { label: "Teams", id: "teams" },
    { label: "Gallery", id: "gallery" },
    { label: "Contact", id: "contact" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-md shadow-md"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div  className="flex items-center space-x-2">
                        <img 
                        
              src="/club-logo.png" 
              alt="Engineering India Logo" 
              className="w-22 h-20 object-contain" 
            />
            <span className="text-xl font-bold text-foreground">
              Engineering India SVPCET
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => scrollToSection(item.id)}
                className="hover:bg-primary/10 hover:text-primary transition-colors"
              >
                {item.label}
              </Button>
            ))}
            <Button
              variant="default"
              className="ml-4 bg-gradient-accent hover:opacity-90"
              onClick={() => scrollToSection("contact")}
            >
              Join Us
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-2 animate-slide-up">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => scrollToSection(item.id)}
                className="w-full justify-start hover:bg-primary/10 hover:text-primary"
              >
                {item.label}
              </Button>
            ))}
            <Button
              variant="default"
              className="w-full bg-gradient-accent hover:opacity-90"
              onClick={() => scrollToSection("contact")}
            >
              Join Us
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
