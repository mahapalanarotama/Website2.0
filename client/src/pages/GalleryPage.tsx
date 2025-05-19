import { useActivities } from "@/hooks/use-activities";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Instagram, Mail, Phone } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import { motion } from "framer-motion";

export default function GalleryPage() {
  const { data: activities, isLoading } = useActivities();
  const [showContact, setShowContact] = useState(false);

  return (
    <section className="py-10 sm:py-16 bg-gradient-to-br from-white via-blue-50 to-blue-100 min-h-screen">
      <div className="container mx-auto px-2 sm:px-4">
        <motion.div
          className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: 'spring' }}
        >
          <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-center sm:text-left bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent drop-shadow-lg">
            Galeri Kegiatan
          </h1>
          <div className="flex gap-2 w-full sm:w-auto justify-center">
            <Link href="/">
              <Button variant="outline" className="w-full sm:w-auto shadow-md hover:scale-105 transition-transform">Kembali ke Beranda</Button>
            </Link>
            <Button
              variant="default"
              className="w-full sm:w-auto shadow-md hover:scale-105 transition-transform bg-gradient-to-r from-primary to-blue-600 text-white"
              onClick={e => {
                e.preventDefault();
                setShowContact(true);
              }}
            >
              Hubungi Kami
            </Button>
          </div>
        </motion.div>
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6 animate-pulse">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-40 sm:h-56 md:h-64 rounded-xl" />
            ))}
          </div>
        ) : activities && activities.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 auto-rows-[160px] xs:auto-rows-[180px] sm:auto-rows-[220px] md:auto-rows-[250px]"
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.07 } },
            }}
          >
            {activities.map((activity, idx) => (
              <motion.div
                key={activity.id}
                className={`relative overflow-hidden rounded-xl shadow-lg group border border-gray-100 bg-white hover:shadow-2xl transition-all duration-300 ${
                  idx % 7 === 0
                    ? 'md:row-span-2 md:col-span-2 h-[320px] md:h-[520px]'
                    : idx % 5 === 0
                    ? 'md:row-span-2 h-[320px] md:h-[520px]'
                    : 'h-full'
                }`}
                whileHover={{ scale: 1.03 }}
                variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }}
              >
                {activity.imageUrl ? (
                  <img
                    src={activity.imageUrl}
                    alt={activity.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                    Tidak ada gambar
                  </div>
                )}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition flex items-end justify-center"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="w-full p-4 pb-6 text-white text-center bg-gradient-to-t from-black/60 to-transparent rounded-b-xl">
                    <h3 className="font-bold text-lg mb-1 drop-shadow-lg">{activity.title}</h3>
                    <p className="text-sm line-clamp-3 drop-shadow">{activity.description}</p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center text-gray-500 py-20">Tidak ada data kegiatan.</div>
        )}
        <Dialog open={showContact} onOpenChange={setShowContact}>
          <DialogContent className="max-w-xs w-full p-0 rounded-xl">
            <div className="p-6 flex flex-col items-center gap-4">
              <h2 className="font-heading text-lg font-bold mb-2">Hubungi Kami</h2>
              <div className="flex gap-6 justify-center">
                <a
                  href="https://instagram.com/mahapalanarotama"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary hover:scale-110 transition-transform"
                  title="Instagram"
                >
                  <Instagram size={36} />
                </a>
                <a
                  href="https://wa.me/6281234567890"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-green-600 hover:scale-110 transition-transform"
                  title="WhatsApp"
                >
                  <Phone size={36} />
                </a>
                <a
                  href="mailto:ukm.mahapala@narotama.ac.id"
                  className="hover:text-blue-600 hover:scale-110 transition-transform"
                  title="Email"
                >
                  <Mail size={36} />
                </a>
              </div>
              <div className="text-center text-xs text-gray-500 mt-2">
                Instagram: @mahapalanarotama<br />
                WhatsApp: 0812-3456-7890<br />
                Email: ukm.mahapala@narotama.ac.id
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
