import { useGallery } from "@/hooks/use-gallery";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Instagram, Mail, Phone } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
// Ambil data contact dari Firestore
function useContactData() {
  const [contact, setContact] = useState({
    title: 'Hubungi Kami',
    description: '',
    whatsapp: '',
    email: '',
    instagram: '',
  });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let unsub = () => {};
    async function fetchContact() {
      const { db } = await import("@/lib/firebase");
      const { doc, getDoc } = await import("firebase/firestore");
      const snap = await getDoc(doc(db, "homepage", "contact"));
      if (snap.exists()) {
        const data = snap.data();
        setContact({
          title: data.title || 'Hubungi Kami',
          description: data.description || '',
          whatsapp: data.whatsapp || '',
          email: data.email || '',
          instagram: data.instagram || '',
        });
      }
      setLoading(false);
    }
    fetchContact();
    return () => unsub();
  }, []);
  return { contact, loading };
}
import { motion } from "framer-motion";
import ImagePreviewDialog from "@/components/ImagePreviewDialog";

export default function GalleryPage() {
  const { contact } = useContactData();
  const { data: gallery, isLoading } = useGallery();
  const [showContact, setShowContact] = useState(false);
  const [previewImg, setPreviewImg] = useState<string | null>(null);

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
        ) : gallery && gallery.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 auto-rows-[120px] sm:auto-rows-[180px] md:auto-rows-[220px]">
            {gallery.map((item, idx) => (
              <div
                key={item.id}
                className={
                  `relative overflow-hidden rounded-xl shadow-lg group border border-gray-100 bg-white hover:shadow-2xl transition-all duration-300 flex flex-col justify-end ` +
                  (
                    idx % 7 === 0
                      ? 'md:row-span-2 md:col-span-2 h-[120px] md:h-[320px]'
                      : idx % 5 === 0
                      ? 'md:row-span-2 h-[120px] md:h-[320px]'
                      : 'h-[120px] md:h-full'
                  )
                }
                style={{ cursor: item.imageUrl ? 'pointer' : 'default' }}
                onClick={() => item.imageUrl && setPreviewImg(item.imageUrl)}
              >
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                    Tidak ada gambar
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition flex items-end justify-center pointer-events-none">
                  <div className="w-full p-2 pb-4 text-white text-center bg-gradient-to-t from-black/60 to-transparent rounded-b-xl">
                    <h3 className="font-bold text-base mb-1 drop-shadow-lg line-clamp-1">{item.title}</h3>
                    {item.description && <p className="text-xs line-clamp-2 drop-shadow">{item.description}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <ImagePreviewDialog
              open={!!previewImg}
              onOpenChange={open => setPreviewImg(open ? previewImg : null)}
              imageUrl={previewImg || ""}
            />
            <div className="text-center text-gray-500 py-20">{gallery && gallery.length === 0 ? "Tidak ada data galeri." : null}</div>
          </>
        )}
        <Dialog open={showContact} onOpenChange={setShowContact}>
          <DialogContent className="max-w-xs w-full p-0 rounded-xl">
            <div className="p-6 flex flex-col items-center gap-0">
              <h2 className="font-heading text-lg font-bold" style={{marginBottom: 0}}>{contact.title || 'Hubungi Kami'}</h2>
              {contact.description && <div className="text-center text-sm text-gray-600" style={{marginTop: 0, marginBottom: 18}}>{contact.description}</div>}
              <div className="flex gap-6 justify-center">
                {contact.instagram && (
                  <a
                    href={`https://instagram.com/${contact.instagram.replace('@','')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-red-500 hover:scale-110 transition-transform"
                    title="Instagram"
                  >
                    <Instagram size={36} />
                  </a>
                )}
                {contact.whatsapp && (
                  <a
                    href={`https://wa.me/${contact.whatsapp.replace(/[^0-9]/g,'')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-green-600 hover:scale-110 transition-transform"
                    title="WhatsApp"
                  >
                    <Phone size={36} />
                  </a>
                )}
                {contact.email && (
                  <a
                    href={`mailto:${contact.email}`}
                    className="hover:text-blue-600 hover:scale-110 transition-transform"
                    title="Email"
                  >
                    <Mail size={36} />
                  </a>
                )}
              </div>
              <div className="text-center text-xs text-gray-500 mt-2">
                {contact.instagram && <><span>Instagram: @{contact.instagram.replace('@','')}</span><br /></>}
                {contact.whatsapp && <><span>WhatsApp: {contact.whatsapp}</span><br /></>}
                {contact.email && <><span>Email: {contact.email}</span></>}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
