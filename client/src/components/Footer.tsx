import { Link } from "wouter";
import { Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";
import { FaTiktok } from "react-icons/fa";

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-800 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-heading text-xl font-bold mb-4">Tentang Kami</h3>
            <p className="text-gray-300 mb-4">
              Mahapala Narotama adalah organisasi yang bergerak di bidang eksplorasi alam dan pelestarian lingkungan.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </a>
              <a 
                href="https://tiktok.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition"
                aria-label="TikTok"
              >
                <FaTiktok className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-heading text-xl font-bold mb-4">Link Terkait</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://narotama.ac.id" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition"
                >
                  Universitas Narotama
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-gray-300 hover:text-white transition"
                >
                  MAPALA Indonesia
                </a>
              </li>
              <li>
                <Link href="/kegiatan">
                  <a className="text-gray-300 hover:text-white transition">
                    Daftar Kegiatan
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/kegiatan">
                  <a className="text-gray-300 hover:text-white transition">
                    Galeri Foto
                  </a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-heading text-xl font-bold mb-4">Hubungi Kami</h3>
            <address className="not-italic text-gray-300">
              <p className="mb-2 flex items-center">
                <MapPin className="h-4 w-4 mr-2" /> 
                Jl. Arief Rachman Hakim No. 51, Klampis Ngasem, Sukolilo, Kota Surabaya, Jawa Timur
              </p>
              <p className="mb-2 flex items-center">
                <Phone className="h-4 w-4 mr-2" /> 
                (031) 34133 2882
              </p>
              <p className="flex items-center">
                <Mail className="h-4 w-4 mr-2" /> 
                mahapala@narotama.ac.id
              </p>
            </address>
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-6">
          <p className="text-center text-gray-400 text-sm">
            &copy; {currentYear} Organisasi Pecinta Alam. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
