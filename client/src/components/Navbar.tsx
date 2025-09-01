import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const toggleMenu = () => setIsOpen(!isOpen);

  const navLinks = [
    { href: "/", label: "Beranda" },
    { href: "/kegiatan", label: "Kegiatan" },
    { href: "/pembelajaran", label: "Pembelajaran" },
    { href: "/sejarah", label: "Sejarah" },
    { href: "/pendaftaran", label: "Informasi Pendaftaran" },
    { href: "/scan-anggota", label: <span className="flex items-center gap-2"><Users className="w-5 h-5" /> Anggota</span> },
  ];

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 bg-white shadow-lg`}>
      <div className="relative">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/Logo%20Mpn.png"
              alt="Logo Mahapala"
              className="w-10 h-10 rounded-full shadow-md border-2 border-primary bg-white animate-navbar-logo"
              style={{ background: 'white' }}
            />
            <span className="font-heading font-bold text-2xl tracking-widest text-primary drop-shadow-lg animate-navbar-logo">
              MAHAPALA <span className="text-accent font-bold drop-shadow-md">NAROTAMA</span>
            </span>
          </Link>
          <nav className="hidden md:flex space-x-6">
            {navLinks.map((link) => (
              <Link key={link.href} to={link.href} className={`relative px-2 py-1 font-medium transition group/nav ${location.pathname === link.href ? 'text-accent' : 'text-primary hover:text-accent'} animate-navbar-link`}>
                <span className="relative z-10">{link.label}</span>
                <span className={`absolute left-0 bottom-0 w-full h-0.5 bg-accent rounded transition-all duration-300 scale-x-0 group-hover/nav:scale-x-100 ${location.pathname === link.href ? 'scale-x-100' : ''}`}></span>
              </Link>
            ))}
          </nav>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-primary"
            onClick={toggleMenu}
            aria-label="Menu"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
        {/* Animasi alam: awan bergerak di atas navbar */}
        <div className="absolute left-0 right-0 top-0 h-8 overflow-hidden pointer-events-none select-none">
          <div className="absolute left-0 top-0 w-full h-full flex gap-8 animate-clouds">
            <div className="w-16 h-8 bg-white rounded-full opacity-70 blur-sm animate-cloud-move" style={{ animationDelay: '0s' }} />
            <div className="w-24 h-10 bg-white rounded-full opacity-60 blur-md animate-cloud-move" style={{ animationDelay: '2s' }} />
            <div className="w-20 h-8 bg-white rounded-full opacity-50 blur animate-cloud-move" style={{ animationDelay: '4s' }} />
          </div>
        </div>
      </div>
      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white animate-navbar-mobile rounded-b-2xl shadow-2xl">
          <div className="container mx-auto px-4 py-2 flex flex-col space-y-2">
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="icon"
                className="text-primary"
                onClick={toggleMenu}
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            {navLinks.map((link) => (
              <Link key={link.href} to={link.href} className={`block text-lg font-semibold py-2 px-4 rounded transition-all duration-300 hover:bg-accent/20 hover:text-accent ${location.pathname === link.href ? 'text-accent bg-accent/10' : 'text-primary'}`}>{link.label}</Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
