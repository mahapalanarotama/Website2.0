import { useEffect, useState } from "react";
import { getMeta } from "@/lib/meta";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useRef } from "react";
import { useInView } from "framer-motion";
import { AlertCircle, CheckCircle, ArrowRight, Download, Calendar, Users, FileText, Mail, Instagram, Phone } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function PendaftaranPage() {
  // Timeline data dan animasi scroll
  const timelineItems = [
    {
      date: "15 Agustus - 30 September 2025",
      title: "Pendaftaran Online dan Offline",
      desc: "Pengisian formulir pendaftaran dan pengumpulan berkas persyaratan"
    },
    {
      date: "05 - 07 Oktober 2025",
      title: "Tes Tertulis & Wawancara",
      desc: "Tes pengetahuan umum dan wawancara motivasi"
    },
    {
      date: "07 Oktober 2025",
      title: "Pengumuman Hasil Seleksi",
      desc: "Pengumuman calon anggota yang lolos seleksi"
    },
    {
      date: "08 Oktober - 13 November 2025",
      title: "Pra Diklat",
      desc: "Pelatihan dan Pembekalan Materi serta fisik"
    },
    {
      date: "15 - 17 November 2025",
      title: "Diklat Dasar",
      desc: "Pelatihan dasar kepencintaalaman dan team building"
    },
    {
      date: "17 November 2025",
      title: "Pelantikan Anggota Baru",
      desc: "Upacara pelantikan dan penyematan Scraft Kuning anggota baru"
    }
  ];

  // TimelineItem component for animasi scroll
  function TimelineItem({ item, delay }: { item: { date: string; title: string; desc: string }; delay: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: "-50px" });
    return (
      <motion.div
        ref={ref}
        className="relative"
        initial={{ opacity: 0, y: -30 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: -30 }}
        transition={{ duration: 0.5, delay }}
      >
        <div className="absolute -left-[41px] border-4 border-white rounded-full bg-primary h-6 w-6"></div>
        <div>
          <span className="text-sm text-gray-500">{item.date}</span>
          <h4 className="font-medium text-gray-800">{item.title}</h4>
          <p className="text-gray-600 text-sm">{item.desc}</p>
        </div>
      </motion.div>
    );
  }
  // FAQ accordion state
  const [openIdx, setOpenIdx] = useState<number>(-1);
  const [activeTab, setActiveTab] = useState<"general" | "requirements" | "timeline" | "faq">("general");
  // Hapus showForm, tidak perlu popup
  const [googleFormUrl, setGoogleFormUrl] = useState<string>("");
  // Ambil link Google Formulir dan link download dari meta
  const [googleFormDownloadUrl, setGoogleFormDownloadUrl] = useState<string>("");
  useEffect(() => {
    getMeta().then((meta) => {
      if (meta?.googleFormUrl) setGoogleFormUrl(meta.googleFormUrl);
      if (meta?.googleFormDownloadUrl) setGoogleFormDownloadUrl(meta.googleFormDownloadUrl);
    });
  }, []);
  const [showContact, setShowContact] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <>
      <section className="py-8 sm:py-12 bg-white">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3 sm:mb-4 relative inline-block">
              Informasi Pendaftaran Anggota Baru
              <span className="absolute -bottom-2 left-0 w-full h-1 bg-primary rounded-full"></span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto mt-4 sm:mt-6">
              Bergabunglah dengan Mahapala Narotama dan jadilah bagian dari komunitas yang peduli terhadap pelestarian lingkungan dan eksplorasi alam.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="mb-6 sm:mb-8 flex overflow-x-auto scrollbar-hide">
            <div className="max-w-4xl mx-auto flex space-x-1 p-1 bg-gray-100 rounded-lg w-full">
              <Button 
                variant={activeTab === "general" ? "default" : "ghost"}
                onClick={() => setActiveTab("general")}
                className="flex-1 whitespace-nowrap"
              >
                Informasi Umum
              </Button>
              <Button 
                variant={activeTab === "requirements" ? "default" : "ghost"}
                onClick={() => setActiveTab("requirements")}
                className="flex-1 whitespace-nowrap"
              >
                Persyaratan
              </Button>
              <Button 
                variant={activeTab === "timeline" ? "default" : "ghost"}
                onClick={() => setActiveTab("timeline")}
                className="flex-1 whitespace-nowrap"
              >
                Tahapan Seleksi
              </Button>
              <Button 
                variant={activeTab === "faq" ? "default" : "ghost"}
                onClick={() => setActiveTab("faq")}
                className="flex-1 whitespace-nowrap"
              >
                FAQ
              </Button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="max-w-4xl mx-auto">
            {activeTab === "general" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white p-6 rounded-lg shadow-md"
              >
                <h3 className="font-heading text-xl font-semibold mb-4">Informasi Umum Pendaftaran</h3>
                <p className="text-gray-700 mb-4">
                  Mahapala Narotama membuka pendaftaran anggota baru untuk mahasiswa aktif Universitas Narotama yang memiliki minat dan kepedulian pada alam, lingkungan, dan kegiatan outdoor. Pendaftaran dilaksanakan setahun sekali pada awal tahun akademik.
                </p>
                <p className="text-gray-700 mb-4">
                  Sebagai anggota Mahapala Narotama, Anda akan memiliki kesempatan untuk:
                </p>
                
                <motion.ul 
                  className="space-y-3 mb-6 pl-6"
                  variants={container}
                  initial="hidden"
                  animate="show"
                >
                  <motion.li variants={item} className="flex items-start">
                    <CheckCircle className="text-primary min-w-5 h-5 mr-2 mt-0.5" />
                    <span>Mengikuti berbagai ekspedisi dan pendakian gunung di Indonesia</span>
                  </motion.li>
                  <motion.li variants={item} className="flex items-start">
                    <CheckCircle className="text-primary min-w-5 h-5 mr-2 mt-0.5" />
                    <span>Berpartisipasi dalam program konservasi dan pelestarian lingkungan</span>
                  </motion.li>
                  <motion.li variants={item} className="flex items-start">
                    <CheckCircle className="text-primary min-w-5 h-5 mr-2 mt-0.5" />
                    <span>Mempelajari keterampilan survival, navigasi, pertolongan pertama, panjat tebing</span>
                  </motion.li>
                  <motion.li variants={item} className="flex items-start">
                    <CheckCircle className="text-primary min-w-5 h-5 mr-2 mt-0.5" />
                    <span>Membangun jaringan dengan komunitas pecinta alam di seluruh Indonesia</span>
                  </motion.li>
                  <motion.li variants={item} className="flex items-start">
                    <CheckCircle className="text-primary min-w-5 h-5 mr-2 mt-0.5" />
                    <span>Mengembangkan kemampuan kepemimpinan dan kerja sama tim</span>
                  </motion.li>
                </motion.ul>
                
                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-amber-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-amber-700">
                        Pendaftaran hanya dibuka selama periode yang ditentukan. Pastikan Anda melengkapi semua persyaratan dan mengikuti seluruh tahapan seleksi.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-center">
                  <a href={googleFormUrl || undefined} target="_blank" rel="noopener noreferrer">
                    <Button className="gap-2" disabled={!googleFormUrl}>
                      Daftar Sekarang <ArrowRight className="h-4 w-4" />
                    </Button>
                  </a>
                </div>
              </motion.div>
            )}
            
            {activeTab === "requirements" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white p-6 rounded-lg shadow-md"
              >
                <h3 className="font-heading text-xl font-semibold mb-4">Persyaratan Pendaftaran</h3>
                
                <div className="mb-6">
                  <h4 className="font-medium text-lg mb-2">Persyaratan Umum</h4>
                  <ul className="space-y-2 pl-6 list-disc text-gray-700">
                    <li>Mahasiswa aktif Universitas Narotama (dibuktikan dengan kartu mahasiswa)</li>
                    <li>Minimal semester 1 dan maksimal semester 5</li>
                    <li>Sehat jasmani dan rohani (dibuktikan dengan surat keterangan sehat)</li>
                    <li>Memiliki minat dalam kegiatan alam terbuka</li>
                    <li>Bersedia mengikuti seluruh rangkaian proses seleksi</li>
                    <li>Mendapat izin dari orang tua/wali (dibuktikan dengan surat pernyataan)</li>
                  </ul>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-medium text-lg mb-2">Dokumen Pendaftaran</h4>
                  <ul className="space-y-2 pl-6 list-disc text-gray-700">
                    <li>Formulir pendaftaran yang telah diisi lengkap</li>
                    <li>Pas foto berwarna ukuran 3x4 (1 lembar)</li>
                    <li>Fotokopi Kartu Mahasiswa</li>
                    <li>Surat keterangan sehat dari dokter</li>
                    <li>Surat pernyataan kesediaan mengikuti seleksi</li>
                    <li>Surat izin orang tua/wali</li>
                    <li>Essay singkat tentang motivasi bergabung dengan Mahapala (maksimal 1 halaman)</li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h4 className="font-medium text-lg mb-2">Biaya Pendaftaran</h4>
                  <p className="text-gray-700 mb-2">
                    Biaya pendaftaran: Rp 250.000,-
                  </p>
                  <p className="text-gray-700 mb-2">
                    Biaya tersebut mencakup:
                  </p>
                  <ul className="space-y-1 pl-6 list-disc text-gray-700">
                    <li>Administrasi pendaftaran</li>
                    <li>Kit pendaftaran (formulir, modul, dan atribut)</li>
                    <li>Biaya Transportasi dan Tiket masuk</li>
                    <li>Biaya operasional diklat dasar</li>
                  </ul>
                  <p className="text-sm text-gray-500 mt-2">
                    *Pembayaran dapat dilakukan melalui transfer bank atau tunai saat pendaftaran
                  </p>
                </div>
                
                <div className="bg-green-50 border-l-4 border-green-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">
                        Semua dokumen persyaratan dikumpulkan dalam bentuk hardcopy pada saat pendaftaran dan softcopy dikirim ke email ukm.mahapala@narotama.ac.id dengan subjek "PENDAFTARANCAANG2025_[NAMA]_[NIM]"
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            {activeTab === "timeline" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white p-6 rounded-lg shadow-md"
              >
                <h3 className="font-heading text-xl font-semibold mb-4">Timeline Pendaftaran & Seleksi</h3>
                <div className="relative ml-6 pl-8 border-l-2 border-primary/30 space-y-10">
                  {timelineItems.map((item, idx) => (
                    <TimelineItem key={idx} item={item} delay={idx * 0.15} />
                  ))}
                </div>
              </motion.div>
            )}
            
            {activeTab === "faq" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white p-6 rounded-lg shadow-md"
              >
                <h3 className="font-heading text-xl font-semibold mb-6">Pertanyaan Umum (FAQ)</h3>
                {/* Accordion FAQ - use openIdx from component state */}
                {(() => {
                  const faqs = [
                    {
                      q: "Apakah harus memiliki pengalaman kegiatan outdoor sebelumnya?",
                      a: "Tidak, Anda tidak harus memiliki pengalaman kegiatan outdoor sebelumnya. Mahapala Narotama akan memberikan pelatihan dasar untuk semua anggota baru. Yang terpenting adalah minat dan komitmen untuk belajar."
                    },
                    {
                      q: "Apakah ada persyaratan fisik tertentu?",
                      a: "Tidak ada persyaratan fisik khusus, namun Anda diharapkan dalam kondisi sehat dan siap mengikuti rangkaian kegiatan outdoor yang mungkin membutuhkan stamina dan ketahanan fisik. Latihan fisik dasar akan diberikan selama proses seleksi."
                    },
                    {
                      q: "Berapa banyak waktu yang perlu diluangkan jika menjadi anggota Mahapala?",
                      a: "Sebagai anggota Mahapala, Anda diharapkan dapat menghadiri pertemuan rutin mingguan (2-3 jam) dan berpartisipasi dalam kegiatan bulanan (biasanya pada akhir pekan). Kegiatan ekspedisi atau pendakian biasanya dilakukan pada masa liburan semester."
                    },
                    {
                      q: "Berapa biaya yang diperlukan setelah menjadi anggota?",
                      a: "Anggota Mahapala akan dikenakan iuran bulanan sebesar Rp 25.000,- yang digunakan untuk operasional organisasi. Untuk kegiatan-kegiatan tertentu seperti ekspedisi atau pendakian, akan ada biaya tambahan yang besarnya tergantung pada jenis dan lokasi kegiatan."
                    },
                    {
                      q: "Apakah perlu memiliki perlengkapan outdoor sendiri?",
                      a: "Untuk tahap awal, Anda tidak perlu memiliki semua perlengkapan outdoor. Mahapala memiliki beberapa perlengkapan yang dapat dipinjam oleh anggota. Seiring berjalannya waktu, Anda dapat secara bertahap melengkapi perlengkapan pribadi."
                    },
                    {
                      q: "Apakah saya bisa mengikuti kegiatan Mahapala sambil aktif di organisasi lain?",
                      a: "Tidak disarankan, Tetapi Anda tetap bisa aktif di organisasi lain. Namun, perlu diingat bahwa sebagai anggota Mahapala, Anda diharapkan dapat berkomitmen untuk berpartisipasi dalam kegiatan-kegiatan penting dan memenuhi tanggung jawab sebagai anggota."
                    }
                  ];
                  return (
                    <div className="space-y-2">
                      {faqs.map((faq, idx) => (
                        <div key={idx} className="border-b">
                          <button
                            className={`w-full text-left py-3 font-medium text-lg text-primary flex items-center justify-between focus:outline-none`}
                            onClick={() => setOpenIdx(openIdx === idx ? -1 : idx)}
                            aria-expanded={openIdx === idx}
                          >
                            {faq.q}
                            <span className={`ml-2 transition-transform ${openIdx === idx ? 'rotate-90' : ''}`}>▶</span>
                          </button>
                          {openIdx === idx && (
                            <div className="text-gray-700 mt-2 pb-3">
                              {faq.a}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })()}
                
                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-center mb-3">Masih punya pertanyaan lain?</h4>
                  <p className="text-gray-700 text-center mb-4">
                    Jika Anda memiliki pertanyaan lain yang belum terjawab, jangan ragu untuk menghubungi kami.
                  </p>
                  <div className="flex justify-center">
                    <Button variant="outline" className="gap-2" onClick={() => setShowContact(true)}>
                      <Mail className="h-4 w-4" /> Hubungi Kami
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
          
          {/* Timeline Section */}
          <motion.div 
            className="max-w-4xl mx-auto mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-8 rounded-xl shadow-md">
              <div className="flex flex-col md:flex-row justify-between mb-10 space-y-4 md:space-y-0">
                <div className="flex-1">
                  <h2 className="text-2xl font-heading font-bold text-gray-800 mb-2">Periode Pendaftaran 2025</h2>
                  <p className="text-gray-600">Pendaftaran anggota baru Mahapala tahun 2025</p>
                </div>
                <div>
                  {googleFormDownloadUrl ? (
                    <a
                      href={googleFormDownloadUrl}
                      download="formulir_pendaftaran_ukm_mahapala_narotama_2025.docx"
                    >
                      <Button className="gap-2 bg-primary hover:bg-primary/90" asChild>
                        <span>
                          <Download size={16} />
                          Unduh Formulir
                        </span>
                      </Button>
                    </a>
                  ) : (
                    <Button className="gap-2 bg-primary opacity-50 cursor-not-allowed" disabled>
                      <Download size={16} />
                      Unduh Formulir
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="mb-8">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="bg-primary text-white p-3 rounded-full">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">Jadwal Pendaftaran</h3>
                    <p className="text-gray-600">15 Agustus - 30 September 2025</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 mb-4">
                  <div className="bg-primary text-white p-3 rounded-full">
                    <Users size={20} />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">Kuota Anggota</h3>
                    <p className="text-gray-600">Maksimal 50 mahasiswa baru</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="bg-primary text-white p-3 rounded-full">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">Persyaratan Utama</h3>
                    <p className="text-gray-600">Mahasiswa aktif Universitas Narotama</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Contact Cards */}
          <div className="mt-16">
            <h3 className="font-heading text-2xl font-bold text-center mb-8">Kontak Informasi Pendaftaran</h3>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card className="hover:shadow-lg transition duration-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Sekretariat</CardTitle>
                  <CardDescription>Kesekretariatan Mahapala Narotama</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">Ruang BEM (D3.01), Gedung D Lt. 3, Universitas Narotama</p>
                  <p className="text-sm text-gray-500 mt-1">Senin - Jumat, 09:00 - 16:00 WIB</p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition duration-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Narahubung</CardTitle>
                  <CardDescription>Informasi Pendaftaran</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">Yuan (Koordinator): 081234567890</p>
                  <p className="text-sm">Nadia (Sekretaris): 089876543210</p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition duration-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Media Sosial</CardTitle>
                  <CardDescription>Ikuti kami untuk update</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">Instagram: @mahapalanarotama</p>
                  <p className="text-sm">YouTube: @mahapalanarotama1216</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
      {/* Dialog for registration form (Google Formulir) dihapus, hanya open tab baru */}
      
      {/* Dialog for contact information */}
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
    </>
  );
}