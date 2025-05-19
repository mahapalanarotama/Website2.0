import { useState } from "react";
import { ActivityCard } from "@/components/ActivityCard";
import { useActivities } from "@/hooks/use-activities";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export default function ActivitiesPage() {
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  const { data: activities, isLoading } = useActivities();
  
  // Filter activities based on category and search query
  const filteredActivities = activities?.filter(activity => {
    const matchesCategory = categoryFilter && categoryFilter !== "all" ? activity.category === categoryFilter : true;
    const matchesSearch = searchQuery 
      ? activity.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        activity.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Kegiatan Mahapala Narotama
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Eksplorasi alam, konservasi lingkungan, dan berbagi pengetahuan bersama Mahapala Narotama
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto mb-10">
            <div className="bg-gray-50 p-6 rounded-lg shadow-md">
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1">
                  <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                    Cari Kegiatan
                  </label>
                  <Input
                    id="search"
                    placeholder="Cari judul atau deskripsi kegiatan..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="w-full md:w-48">
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori
                  </label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Semua Kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Kategori</SelectItem>
                      <SelectItem value="Ekspedisi">Ekspedisi</SelectItem>
                      <SelectItem value="Konservasi">Konservasi</SelectItem>
                      <SelectItem value="Edukasi">Edukasi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-lg overflow-hidden shadow-md animate-pulse">
                  <Skeleton className="w-full h-48" />
                  <div className="p-5">
                    <div className="flex justify-between items-center mb-3">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredActivities && filteredActivities.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredActivities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <h3 className="text-lg font-medium text-gray-700">Tidak ada kegiatan ditemukan</h3>
              <p className="text-gray-500">Coba ubah filter atau kata kunci pencarian Anda</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
