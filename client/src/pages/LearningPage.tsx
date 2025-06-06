import { useState } from "react";
import { LearningModule } from "@/components/LearningModule";
import { useLearningModules } from "@/hooks/use-learning";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { learningModulesFront } from "@/components/externalLearningLinks";

export default function LearningPage() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { data: modules, isLoading } = useLearningModules();

  // Gabungkan data dari backend dan eksternal (frontend)
  const allModules = [
    ...(modules || []),
    ...learningModulesFront.filter(
      (ext) => !modules?.some((m) => m.title === ext.title)
    ),
  ];

  // Filter modules berdasarkan search query
  const filteredModules = allModules.filter((module) => {
    return searchQuery
      ? module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          module.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
  });

  return (
    <>
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
