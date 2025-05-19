import { useActivities } from "@/hooks/use-activities";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function GalleryPage() {
  const { data: activities, isLoading } = useActivities();

  // Example: alternate grid sizes for a modern look
  // You can further enhance with CSS grid-area for more complex layouts
  return (
    <section className="py-16 bg-white min-h-screen">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-heading text-3xl font-bold">Galeri Kegiatan</h1>
          <Link href="/">
            <Button variant="outline">Kembali ke Beranda</Button>
          </Link>
        </div>
        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="bg-gray-200 animate-pulse h-64 rounded-xl" />
            ))}
          </div>
        ) : activities && activities.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 auto-rows-[200px] md:auto-rows-[250px]">
            {activities.map((activity, idx) => (
              <div
                key={activity.id}
                className={`relative overflow-hidden rounded-xl shadow-lg group ${
                  idx % 7 === 0
                    ? 'md:row-span-2 md:col-span-2 h-[520px]'
                    : idx % 5 === 0
                    ? 'md:row-span-2 h-[520px]'
                    : 'h-full'
                }`}
              >
                {activity.imageUrl ? (
                  <img
                    src={activity.imageUrl}
                    alt={activity.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                    Tidak ada gambar
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <div className="text-white text-center p-4">
                    <h3 className="font-bold text-lg mb-1">{activity.title}</h3>
                    <p className="text-sm">{activity.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-20">Tidak ada data kegiatan.</div>
        )}
      </div>
    </section>
  );
}
