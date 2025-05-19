import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ActivityCard } from "@/components/ActivityCard";
import { LearningModule } from "@/components/LearningModule";
import { useActivities } from "@/hooks/use-activities";
import { useLearningModules } from "@/hooks/use-learning";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

export default function HomePage() {
  const { data: activities, isLoading: activitiesLoading } = useActivities(3); // hanya 3 terbaru
  const { data: learningModules, isLoading: modulesLoading } = useLearningModules(3); // hanya 3 terbaru

  return (
    <>
      {/* Hero Section */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Selamat Datang di Website Resmi Organisasi Mahasiswa Pecinta Alam Universitas Narotama Surabaya
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Menjelajahi alam, berbagi pengetahuan, dan menjaga kelestarian lingkungan.
            </p>
          </div>
          
          <div className="relative rounded-xl overflow-hidden shadow-xl">
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
                      src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=1080" 
                      alt="Anggota Mahapala Narotama dalam kegiatan konservasi lingkungan" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                      <div className="p-6 text-white">
                        <h2 className="font-heading text-2xl font-bold mb-2">Bersama Melestarikan Alam</h2>
                        <p className="text-gray-200">Bergabunglah dalam misi kami untuk melindungi lingkungan dan eksplorasi alam.</p>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
                
                {/* Slide 2 */}
                <CarouselItem>
                  <div className="relative h-96">
                    <img 
                      src="https://images.unsplash.com/photo-1455156218388-5e61b526818b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=1080" 
                      alt="Kelompok pendaki gunung Mahapala Narotama" 
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
                      src="https://images.unsplash.com/photo-1519331379826-f10be5486c6f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=1080" 
                      alt="Kegiatan konservasi Mahapala Narotama" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                      <div className="p-6 text-white">
                        <h2 className="font-heading text-2xl font-bold mb-2">Konservasi dan Edukasi</h2>
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
          </div>
        </div>
      </section>

      {/* Info Organisasi Section */}
      <section id="info-organisasi" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-3xl font-bold text-center mb-12">Informasi Organisasi</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-heading text-xl font-semibold text-primary mb-4">Sejarah</h3>
              <p className="text-gray-700 mb-4">
                Mahapala Narotama adalah Unit Kegiatan Mahasiswa Pecinta Alam di Universitas Narotama, Surabaya yang berdiri sejak tahun 2016. Organisasi ini berperan aktif dalam mengadakan kegiatan alam bebas dan konservasi lingkungan, serta turut serta dalam menjelajahi, mempelajari, Mahapala Narotama juga berperan dalam menyelenggarakan pendidikan dasar kepencintaalaman untuk mahasiswa baru.
              </p>
              <p className="text-gray-700">
                Sejak pendiriannya, Mahapala Narotama telah melaksanakan berbagai program konservasi, ekspedisi alam, dan kegiatan sosial di berbagai daerah di Indonesia.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-heading text-xl font-semibold text-primary mb-4">Visi & Misi</h3>
              <div className="mb-4">
                <h4 className="font-heading font-medium mb-2">Visi:</h4>
                <p className="text-gray-700">Membangun kembali semangat kebersamaan dan keilmuan anggota untuk menjadikan organisasi Mahapala sebagai wadah yang solid, aktif, dan berprestasi di bidang kepencintaalaman.</p>
              </div>
              <div>
                <h4 className="font-heading font-medium mb-2">Misi:</h4>
                <ul className="text-gray-700 list-disc pl-5 space-y-1">
                  <li>Mengembangkan keterampilan dan pengetahuan anggota dalam kegiatan alam bebas</li>
                  <li>Berkontribusi dalam upaya pelestarian lingkungan</li>
                  <li>Membangun jaringan dengan organisasi pecinta alam lainnya</li>
                  <li>Menyelenggarakan kegiatan ekspedisi dan konservasi alam secara berkala</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Kegiatan Section */}
      <section id="kegiatan" className="py-16 bg-white">
        <div className="container mx-auto px-4">
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
                <ActivityCard key={activity.id} activity={activity} />
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
      </section>

      {/* Pembelajaran Section */}
      <section id="pembelajaran" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-3xl font-bold text-center mb-4">Pembelajaran</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Materi dan panduan kegiatan alam bebas yang dapat diakses oleh seluruh anggota Mahapala Narotama.
          </p>
          
          {modulesLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-md animate-pulse">
                  <div className="flex items-center mb-4">
                    <div className="bg-gray-300 rounded-full h-12 w-12 mr-4"></div>
                    <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                  </div>
                  <div className="h-4 bg-gray-300 rounded w-full mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded w-full mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {learningModules?.map((module) => (
                <LearningModule key={module.id} module={module} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-3xl font-bold text-center mb-4">Galeri Kegiatan</h2>
          <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">
            Sekilas dokumentasi kegiatan yang telah dilaksanakan oleh anggota Mahapala Narotama
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="relative group overflow-hidden rounded-lg">
              <img 
                src="https://images.unsplash.com/photo-1536431311719-398b6704d4cc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=800" 
                alt="Pendakian Gunung Semeru" 
                className="w-full h-full object-cover transition group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <p className="text-white text-sm text-center font-medium p-2">Pendakian Gunung Semeru 2023</p>
              </div>
            </div>
            
            <div className="relative group overflow-hidden rounded-lg">
              <img 
                src="https://images.unsplash.com/photo-1488462237308-ecaa28b729d7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=800" 
                alt="Kegiatan Bersih Pantai" 
                className="w-full h-full object-cover transition group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <p className="text-white text-sm text-center font-medium p-2">Bersih Pantai Kenjeran 2023</p>
              </div>
            </div>
            
            <div className="relative group overflow-hidden rounded-lg">
              <img 
                src="https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=800" 
                alt="Pelatihan Tali-Temali" 
                className="w-full h-full object-cover transition group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <p className="text-white text-sm text-center font-medium p-2">Pelatihan Teknik Tali-Temali 2022</p>
              </div>
            </div>
            
            <div className="relative group overflow-hidden rounded-lg">
              <img 
                src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=800" 
                alt="Ekspedisi Hutan Jawa Timur" 
                className="w-full h-full object-cover transition group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <p className="text-white text-sm text-center font-medium p-2">Ekspedisi Hutan Jawa Timur 2022</p>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-10">
            <Link href="/galeri">
              <Button>
                Lihat Galeri Lengkap
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
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
            <Button variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white/10">
              Hubungi Kami
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
