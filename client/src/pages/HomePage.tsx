import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ActivityCard } from "@/components/ActivityCard";
import { LearningModule } from "@/components/LearningModule";
import { useActivities } from "@/hooks/use-activities";
import { useLearningModules } from "@/hooks/use-learning";
import { useGallery } from "@/hooks/use-gallery";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Instagram, Mail, Phone } from "lucide-react";
import { useState, useEffect } from "react";

import BirthdayCountdownHome from "@/components/BirthdayCountdownHome";
import TypewriterText from "@/components/TypewriterText";
import { motion } from "framer-motion";


export default function HomePage() {
  const { data: activities, isLoading: activitiesLoading } = useActivities(3); // hanya 3 terbaru
  const { data: learningModules } = useLearningModules(3); // hanya 3 terbaru
  const { data: gallery, isLoading: galleryLoading } = useGallery();
  const [showContact, setShowContact] = useState(false);
  // Birthday popup state
  const [showBirthdayPopup, setShowBirthdayPopup] = useState(false);

  useEffect(() => {
    // Cek apakah ulang tahun kurang dari 1 bulan (31 hari)
    const now = new Date();
    const nextAnniv = (() => {
      const year = now.getMonth() > 0 || (now.getMonth() === 0 && now.getDate() > 26) ? now.getFullYear() + 1 : now.getFullYear();
      return new Date(year, 0, 26, 0, 0, 0, 0);
    })();
    const diff = nextAnniv.getTime() - now.getTime();
    const days = diff / (1000 * 60 * 60 * 24);
    // Cek sessionStorage agar popup tidak muncul berulang kali dalam 1 sesi
    if (days <= 31 && !sessionStorage.getItem('hideBirthdayPopup')) {
      setShowBirthdayPopup(true);
    }
  }, []);

  const handleCloseBirthdayPopup = () => {
    setShowBirthdayPopup(false);
    sessionStorage.setItem('hideBirthdayPopup', '1');
  };

  // Hanya tampilkan data pembelajaran dari Firestore
  const combinedModules = (learningModules || []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <>
      <BirthdayCountdownHome open={showBirthdayPopup} onClose={handleCloseBirthdayPopup} />
      {/* Hero Section */}
      <motion.section
        className="py-8 sm:py-16 bg-white"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <div className="container mx-auto px-2 sm:px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
          >
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              <TypewriterText
                text="Selamat Datang di Website Resmi Organisasi Mahasiswa Pecinta Alam Universitas Narotama Surabaya"
                speed={30}
              />
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Menjelajahi alam, berbagi pengetahuan, dan menjaga kelestarian lingkungan.
            </p>
          </motion.div>
          <motion.div
            className="relative rounded-xl overflow-hidden shadow-xl"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
            <Carousel 
              opts={{ 
                align: "start",
                loop: true,
              }}
              className="w-full"
              plugins={[
                Autoplay({
                  delay: 5000,
                }),
              ]}
            >
              <CarouselContent>
                {/* Slide 1 */}
                <CarouselItem>
                  <div className="relative h-96">
                    <img 
                      src="https://raw.githubusercontent.com/mahapalanarotama/OfficialWebsite/refs/heads/main/Img/anggota%20mahapala%20narotama.jpg" 
                      alt="Anggota Mahapala Narotama" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                      <div className="p-6 text-white">
                        <h2 className="font-heading text-2xl font-bold mb-2">Kebersamaan adalah simbol Kekuatan</h2>
                        <p className="text-gray-200">Bergabunglah dalam misi kami untuk melindungi lingkungan dan eksplorasi alam.</p>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
                
                {/* Slide 2 */}
                <CarouselItem>
                  <div className="relative h-96">
                    <img 
                      src="https://raw.githubusercontent.com/mahapalanarotama/OfficialWebsite/refs/heads/main/Img/eksplorasi%20alam.jpg" 
                      alt="Pendidikan Rimba Gunung Mahapala Narotama" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                      <div className="p-6 text-white">
                        <h2 className="font-heading text-2xl font-bold mb-2">Petualangan Tanpa Batas</h2>
                        <p className="text-gray-200">Eksplorasi keindahan alam Indonesia bersama Mahapala Narotama.</p>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
                
                {/* Slide 3 */}
                <CarouselItem>
                  <div className="relative h-96">
                    <img 
                      src="https://raw.githubusercontent.com/mahapalanarotama/OfficialWebsite/refs/heads/main/Img/panjat%20tebing.png" 
                      alt="Pendidikan Panjat Tebing Mahapala Narotama" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                      <div className="p-6 text-white">
                        <h2 className="font-heading text-2xl font-bold mb-2">Keseruan dalam Berpetualang</h2>
                        <p className="text-gray-200">Kami berkomitmen untuk pendidikan lingkungan dan pelestarian alam.</p>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              </CarouselContent>
              
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                <CarouselPrevious className="relative -left-0 translate-y-0 bg-white/20 hover:bg-white/40" />
                <CarouselNext className="relative -right-0 translate-y-0 bg-white/20 hover:bg-white/40" />
              </div>
            </Carousel>
          </motion.div>
        </div>
      </motion.section>

      {/* Info Organisasi Section */}
      <motion.section id="info-organisasi" className="py-8 sm:py-16 bg-gray-50"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <div className="container mx-auto px-2 sm:px-4">
          <h2 className="font-heading text-3xl font-bold text-center mb-12">Informasi Organisasi</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-heading text-xl font-semibold text-primary mb-4">Sejarah</h3>
                <p className="text-gray-700 mb-4 text-justify indent-8">
                Mahapala Narotama adalah Unit Kegiatan Mahasiswa Pecinta Alam di Universitas Narotama, Surabaya yang berdiri sejak tahun 2016. Organisasi ini berperan aktif dalam mengadakan kegiatan alam bebas dan konservasi lingkungan, serta turut serta dalam pengabdian masyarakat. Mahapala Narotama juga berperan dalam meningkatkan kesadaran akan pentingnya pelestarian alam dan lingkungan hidup di kalangan mahasiswa dan masyarakat umum.
                </p>
                <p className="text-gray-700 mb-4 text-justify indent-8">
                Universitas Narotama sendiri didirikan pada tahun 1981 oleh Yayasan Pawiyatan Gita Patria. Nama "Narotama" diambil dari seorang tokoh sejarah, Mahapatih dari Prabu Airlangga, yang dikenal sebagai guru ilmu kenegaraan, agama, dan kedigdayaan. Sejak awal berdirinya, universitas ini memiliki komitmen kuat dalam bidang pendidikan dan pengabdian kepada masyarakat.
                </p>
                <p className="text-gray-700 mb-4 text-justify indent-8">
                Mahapala Narotama, sebagai bagian integral dari universitas, telah menunjukkan dedikasi dalam berbagai kegiatan, termasuk pendakian, ekspedisi, dan program konservasi. Mereka juga aktif dalam kolaborasi dengan organisasi lain untuk meningkatkan dampak positif terhadap lingkungan dan masyarakat.
                </p>
                <p className="text-gray-700 mb-4 text-justify indent-8">
                Dengan semangat yang terus berkobar, Mahapala Narotama berkomitmen untuk melanjutkan peranannya dalam menjaga kelestarian alam dan meningkatkan kesadaran lingkungan di kalangan generasi muda.
                </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-heading text-xl font-semibold text-primary mb-4">Visi & Misi</h3>
              <div className="mb-4">
                <h4 className="font-heading font-medium mb-2">Visi:</h4>
                <p className="text-gray-700 text-justify">Membangun kembali semangat kebersamaan dan keaktifan anggota untuk menjadikan organisasi Mahapala sebagai wadah yang solid, aktif, dan berprestasi di bidang kepecintaalaman.</p>
              </div>
              <div>
                <h4 className="font-heading font-medium mb-2">Misi:</h4>
                <ul className="text-gray-700 list-disc pl-5 space-y-1">
                  <li>Membangun dan memperkuat ikatan antaranggota dalam organisasi mahasiswa pecinta alam,</li>
                  <li>Meningkatkan keterlibatan anggota melalui kegiatan berbasis kolaborasi,</li>
                  <li>Menghidupkan kembali program kerja yang relevan dan inovatif,</li>
                  <li>Melakukan rekrutmen anggota baru secara masif dan strategis,</li>
                  <li>Membangun budaya komunikasi yang transparan dan terbuka.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Kegiatan Section */}
      <motion.section id="kegiatan" className="py-8 sm:py-16 bg-white"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <div className="container mx-auto px-2 sm:px-4">
          <h2 className="font-heading text-3xl font-bold text-center mb-4">Kegiatan Terbaru</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Dokumentasi berbagai kegiatan yang telah dilaksanakan oleh Mahapala Narotama dalam menjalankan misi pelestarian dan eksplorasi alam.
          </p>
          
          {activitiesLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg overflow-hidden shadow-md animate-pulse">
                  <div className="w-full h-48 bg-gray-300"></div>
                  <div className="p-5">
                    <div className="flex justify-between items-center mb-3">
                      <div className="h-4 bg-gray-300 rounded w-24"></div>
                      <div className="h-6 bg-gray-300 rounded w-16"></div>
                    </div>
                    <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-full mb-4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activities?.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={{
                    ...activity,
                    date: typeof activity.date === "string" ? activity.date : activity.date.toISOString(),
                  }}
                />
              ))}
            </div>
          )}
          
          <div className="text-center mt-10">
            <Link href="/kegiatan">
              <Button>
                Lihat Semua Kegiatan
              </Button>
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Pembelajaran Section */}
      <motion.section id="pembelajaran" className="py-8 sm:py-16 bg-gray-50"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <div className="container mx-auto px-2 sm:px-4">
          <h2 className="font-heading text-3xl font-bold text-center mb-4">Pembelajaran</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Materi dan panduan kegiatan alam bebas yang dapat diakses oleh seluruh anggota Mahapala Narotama.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {combinedModules.map((module) => (
              <LearningModule key={module.id + module.title} module={module} />
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/pembelajaran">
              <Button>
                Lihat Semua Pembelajaran
              </Button>
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Gallery Section */}
      <motion.section className="py-8 sm:py-16 bg-white"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <div className="container mx-auto px-2 sm:px-4">
          <h2 className="font-heading text-3xl font-bold text-center mb-4">Galeri Kegiatan</h2>
          <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">
            Sekilas dokumentasi kegiatan yang telah dilaksanakan oleh anggota Mahapala Narotama
          </p>
          {galleryLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-gray-200 h-48 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : gallery && gallery.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {gallery.slice(0,4).map(item => (
                <div key={item.id} className="relative group overflow-hidden rounded-lg">
                  <img 
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover transition group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <div>
                      <p className="text-white text-sm text-center font-medium p-2">{item.title}</p>
                      {item.description && <p className="text-white text-xs text-center p-1">{item.description}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-10">Tidak ada data galeri.</div>
          )}
          <div className="text-center mt-10">
            <Link href="/galeri">
              <Button>
                Lihat Galeri Lengkap
              </Button>
            </Link>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section className="py-8 sm:py-16 bg-primary text-white"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <div className="container mx-auto px-2 sm:px-4 text-center">
          <h2 className="font-heading text-3xl font-bold mb-4">Bergabung dengan Mahapala Narotama</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Mari bergabung dalam misi kami untuk melestarikan alam dan mengeksplorasi keindahan Indonesia. Kami membuka pendaftaran anggota baru setiap awal tahun akademik.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pendaftaran">
              <Button variant="secondary" className="bg-white text-primary hover:bg-gray-100">
                Informasi Pendaftaran
              </Button>
            </Link>
            <Button
              variant="outline"
              className="bg-transparent border-2 border-white text-white hover:bg-white/10"
              onClick={e => {
                e.preventDefault();
                setShowContact(true);
              }}
            >
              Hubungi Kami
            </Button>
          </div>
        </div>
        {/* Dialog Kontak */}
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
      </motion.section>

    </>
  );
}
