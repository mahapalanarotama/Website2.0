import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const toggleMenu = () => setIsOpen(!isOpen);

  const navLinks = [
    { href: "/", label: "Beranda" },
    { href: "/kegiatan", label: "Kegiatan" },
    { href: "/pembelajaran", label: "Pembelajaran" },
    { href: "/kartu-anggota", label: "Kartu Anggota" },
  ];

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'shadow-md' : ''}`}>
      <div className="bg-primary text-white">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="font-heading font-bold text-xl">
            MAHAPALA NAROTAMA
          </Link>
          
          <nav className="hidden md:flex space-x-6">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={`hover:text-accent transition ${location === link.href ? 'text-accent font-medium' : ''}`}>
                {link.label}
              </Link>
            ))}
          </nav>
          
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-white"
            onClick={toggleMenu}
            aria-label="Menu"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-secondary">
          <div className="container mx-auto px-4 py-2 flex flex-col space-y-2">
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="icon"
                className="text-white"
                onClick={toggleMenu}
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <a className={`text-white hover:text-accent py-2 transition ${location === link.href ? 'text-accent font-medium' : ''}`}>
                  {link.label}
                </a>
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
