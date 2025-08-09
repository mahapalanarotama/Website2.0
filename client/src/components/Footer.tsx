import { Link } from "wouter";
import { Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";
import { FaTiktok } from "react-icons/fa6";

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
                href="https://www.instagram.com/mahapalanarotama?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://www.youtube.com/@mahapalanarotama1216"
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
                  href="https://narotama.ac.id/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition"
                >
                  Universitas Narotama
                </a>
              </li>
              <li>
                <a
                  href="https://wartapalaindonesia.com/"
                  className="text-gray-300 hover:text-white transition"
                >
                  WARTAPALA Indonesia
                </a>
              </li>
              <li>
                <Link href="/kegiatan" className="text-gray-300 hover:text-white transition">
                  Daftar Kegiatan
                </Link>
              </li>
              <li>
                <Link href="/galeri" className="text-gray-300 hover:text-white transition">
                  Galeri Foto
                </Link>
              </li>
            </ul>
          </div>

            <div>
            <h3 className="font-heading text-xl font-bold mb-4">Hubungi Kami</h3>
            <address className="not-italic text-gray-300">
              <p className="mb-2 flex items-center">
                <span className="flex items-center justify-center h-7 w-7 mr-2">
                  <MapPin className="h-6 w-6" strokeWidth={2} />
                </span>
                <span>Jl. Arief Rachman Hakim No. 51, Klampis Ngasem, Sukolilo, Kota Surabaya, Jawa Timur</span>
              </p>
              <p className="mb-2 flex items-center">
              <Phone className="h-5 w-5 mr-2" strokeWidth={2} />
              <span>(031) 34133 2882</span>
              </p>
              <p className="flex items-center">
              <Mail className="h-5 w-5 mr-2" strokeWidth={2} />
              <span>ukm.mahapala@narotama.ac.id</span>
              </p>
            </address>
            </div>
        </div>

        <div className="border-t border-gray-700 pt-6">
          <p className="text-center text-gray-400 text-sm">
            &copy; {currentYear} Mahapala Narotama. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}