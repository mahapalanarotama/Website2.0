import { useParams } from "wouter";
import { useActivities } from "@/hooks/use-activities";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Link } from "wouter";

export default function DetailActivityPage() {
  const params = useParams();
  const { data: activities, isLoading } = useActivities();
  const activity = activities?.find((a) => a.id === params.id);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-bold mb-2">Kegiatan Tidak Ditemukan</h2>
        <p className="text-gray-500 mb-6">Kegiatan yang Anda cari tidak tersedia atau telah dihapus.</p>
        <Link href="/kegiatan">
          <a className="px-6 py-2 bg-primary text-white rounded-lg font-semibold shadow hover:bg-primary/90 transition">Kembali ke Daftar Kegiatan</a>
        </Link>
      </div>
    );
  }

  const formattedDate = format(new Date(activity.date), 'EEEE, d MMMM yyyy', { locale: id });

  return (
    <section className="py-12 bg-gradient-to-br from-white to-blue-50 min-h-[80vh]">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-8">
          <Link href="/kegiatan">
            <a className="inline-flex items-center gap-2 text-primary hover:underline font-medium mb-4">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              Kembali ke Daftar Kegiatan
            </a>
          </Link>
        </div>
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="relative h-64 md:h-80 w-full overflow-hidden">
            <img
              src={activity.imageUrl || 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&h=450'}
              alt={activity.title}
              className="w-full h-full object-cover object-center transition hover:scale-105 duration-700"
            />
            <div className="absolute top-4 left-4">
              <Badge variant="secondary" className="text-base px-4 py-2 shadow-lg bg-white/80 text-primary font-bold border border-primary">
                {activity.category}
              </Badge>
            </div>
          </div>
          <div className="p-8 md:p-10">
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              {activity.title}
            </h1>
            <div className="flex items-center gap-4 mb-6 flex-wrap">
              <span className="inline-flex items-center gap-2 text-gray-500">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                {formattedDate}
              </span>
            </div>
            <div className="prose max-w-none text-lg text-gray-700 mb-8">
              {activity.description}
            </div>
            <div className="flex flex-wrap gap-3 mt-8">
              <Badge className="bg-gradient-to-r from-primary to-blue-400 text-white px-4 py-2 text-base font-semibold shadow">Kategori: {activity.category}</Badge>
              {/* Tambahkan badge atau info lain jika ada */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
