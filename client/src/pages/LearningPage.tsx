import { PosterPopup } from "@/components/PosterPopup";
// ...existing code...
<PosterPopup />
import { useState, useEffect, useRef } from "react";
import { LearningModule } from "@/components/LearningModule";
import { useLearningModules } from "@/hooks/use-learning";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
// import { learningModulesFront } from "@/components/externalLearningLinks"; // dihapus, gunakan Firestore

export default function LearningPage() {
  const navigate = typeof window !== 'undefined' ? (window as any).useNavigate?.() || (()=>{}) : ()=>{};
  // fallback: if not using react-router, use window.location
  const goToEduhub = () => {
    if (typeof navigate === 'function' && navigate.length > 0) {
      navigate('/eduhub');
    } else {
      window.location.href = '/eduhub';
    }
  };
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { data: modules, isLoading } = useLearningModules();
  const eduhubBtnRef = useRef<HTMLButtonElement>(null);

  // Gabungkan data dari backend dan eksternal (frontend)
  const allModules = modules || [];

  // Filter modules berdasarkan search query
  const filteredModules = allModules.filter((module) => {
    return searchQuery
      ? module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          module.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
  });

  useEffect(() => {
    function isVisible(el: Element | null) {
      if (!el) return false;
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.right > 0;
    }
    function updateFabPosition() {
      // Cek beberapa kemungkinan class/id tombol scroll to top
      const scrollBtn = document.querySelector('.scroll-to-top, .scroll-to-top-visible, #scrollToTop, .scrollTopBtn');
      const fab = eduhubBtnRef.current;
      if (!fab) return;
      if (scrollBtn && isVisible(scrollBtn)) {
        fab.classList.add('eduhub-fab-shift');
      } else {
        fab.classList.remove('eduhub-fab-shift');
      }
    }
    updateFabPosition();
    window.addEventListener('scroll', updateFabPosition);
    window.addEventListener('resize', updateFabPosition);
    // Jaga-jaga jika tombol scroll-to-top muncul karena event lain
    const interval = setInterval(updateFabPosition, 400);
    return () => {
      window.removeEventListener('scroll', updateFabPosition);
      window.removeEventListener('resize', updateFabPosition);
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      {/* Tombol Navigasi ke /eduhub di pojok kanan atas */}
      <div className="w-full flex justify-center md:justify-end items-center mt-4 mb-2 pr-0 md:pr-4">
        <button
          ref={eduhubBtnRef}
          onClick={goToEduhub}
          className="bg-gradient-to-r from-green-500 via-green-400 to-green-600 text-white shadow-xl rounded-full px-6 py-3 font-bold text-lg flex items-center gap-2 hover:scale-105 hover:shadow-2xl transition-all duration-300 border-4 border-white/70 backdrop-blur-lg"
          style={{boxShadow:'0 4px 24px 0 rgba(34,197,94,0.18)'}}
        >
          <span className="inline-block animate-pulse">🏕️</span>
          <span>Ke EduHub</span>
        </button>
      </div>
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Pembelajaran Mahapala Narotama
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Materi dan panduan kegiatan alam bebas yang dapat diakses oleh seluruh anggota Mahapala Narotama
            </p>
          </div>
          <div className="max-w-md mx-auto mb-10">
            <div className="bg-gray-50 p-6 rounded-lg shadow-md">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Cari Materi
              </label>
              <Input
                id="search"
                placeholder="Cari judul atau deskripsi materi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          {isLoading && allModules.length === 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-md animate-pulse">
                  <div className="flex items-center mb-4">
                    <Skeleton className="h-12 w-12 rounded-full mr-4" />
                    <Skeleton className="h-6 w-3/4" />
                  </div>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-4" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          ) : filteredModules && filteredModules.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredModules.map((module) => (
                <LearningModule key={module.id + module.title} module={module} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <h3 className="text-lg font-medium text-gray-700">Tidak ada materi pembelajaran ditemukan</h3>
              <p className="text-gray-500">Coba ubah kata kunci pencarian Anda</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
