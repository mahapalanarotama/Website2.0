import React from "react";
import { motion } from "framer-motion";
import { useRef, useEffect, useState } from "react";

const sejarahNarasi = `Mahapala Narotama adalah Unit Kegiatan Mahasiswa (UKM) di Universitas Narotama Surabaya yang bergerak di bidang pecinta alam dan petualangan. Berdiri pada tahun 2016, Mahapala Narotama aktif dalam kegiatan pendidikan dasar, ekspedisi gunung, penjelajahan, konservasi alam, bakti sosial, serta pengembangan karakter dan kepemimpinan mahasiswa. Dengan semangat kekeluargaan dan jiwa petualang, Mahapala Narotama telah melahirkan banyak kader yang berkontribusi dalam pelestarian alam dan pengabdian masyarakat, serta menjadi wadah pengembangan minat dan bakat mahasiswa di bidang alam bebas.`;

const ketuaList = [
  { nama: "Roro Christiatirani Suwoto", periode: "2016-2017", foto: "https://raw.githubusercontent.com/mahapalanarotama/OfficialWebsite/main/Img/Mantum/20250805_084125.jpg" },
  { nama: "Arif Muhammad Rizal", periode: "2017-2018", foto: "https://raw.githubusercontent.com/mahapalanarotama/OfficialWebsite/main/Img/Mantum/20250805_084151.jpg" },
  { nama: "Ayu Wulandari Narhendra", periode: "2018-2019", foto: "https://raw.githubusercontent.com/mahapalanarotama/OfficialWebsite/main/Img/Mantum/20250805_084234.jpg" },
  { nama: "Moch. Fakhrul Islam", periode: "2019-2021", foto: "https://raw.githubusercontent.com/mahapalanarotama/OfficialWebsite/main/Img/Mantum/20250805_084327.jpg" },
  { nama: "Agna Mahireksha", periode: "2021-2022", foto: "https://raw.githubusercontent.com/mahapalanarotama/OfficialWebsite/main/Img/Mantum/20250805_084401.jpg" },
  { nama: "Robiatul Adawiyah", periode: "2023-2024", foto: "https://raw.githubusercontent.com/mahapalanarotama/OfficialWebsite/main/Img/Mantum/20250805_084425.jpg" },
  { nama: "Muhammad Fairus Fawas Afanza", periode: "2024-sekarang", foto: "https://raw.githubusercontent.com/mahapalanarotama/OfficialWebsite/main/Img/Mantum/20250805_084448.png" },
  // { nama: "Hadi Saputra", periode: "2023-2024", foto: "https://randomuser.me/api/portraits/men/36.jpg" },
];

const kilasBalik = [
  { tahun: "2016", momen: "Pendirian Mahapala Narotama dan Pendidikan Dasar Angkatan I (DIKLATSAR I)." },
  { tahun: "2017", momen: "Ekspedisi Gunung Lawu dan kegiatan bakti sosial di lereng gunung." },
  { tahun: "2018", momen: "DIKLATSAR II dan ekspedisi Gunung Semeru." },
  { tahun: "2019", momen: "Pendidikan Lanjut Rimba Gunung I dan penanaman pohon di kawasan konservasi." },
  { tahun: "2020", momen: "Aksi peduli lingkungan: penanaman 1000 pohon di Surabaya Timur." },
  { tahun: "2021", momen: "DIKLATSAR III (Sendang Banthak) dan pelatihan SAR Mahasiswa." },
  { tahun: "2022", momen: "Ekspedisi Gunung Arjuno-Welirang dan bakti sosial di desa binaan." },
  { tahun: "2023", momen: "DIKLATSAR IV (Panca Laksamana) dan kegiatan bakti sosial serta buka bersama." },
  { tahun: "2024", momen: "Penyelenggaraan seminar nasional konservasi dan pelantikan anggota terbanyak." },
];

const videoMomentum = [
  { title: "Bakti sosial & Buka Bersama 2025", url: "https://www.youtube.com/embed/hTP4gwO7X80" },
  { title: "DIKLATSAR ANGKATAN KE IV (PANCA LAKSMANA) MAHAPALA NAROTAMA", url: "https://www.youtube.com/embed/A3rabYoh5v0" },
  { title: "PENDIDIKAN LANJUT RIMBA GUNUNG III MAHAPALA NAROTAMA", url: "https://www.youtube.com/embed/PXqneMBAOoU" },
  { title: "DIKLATSAR ANGKATAN KE III (SENDANG BANTHAK) MAHAPALA NAROTAMA", url: "https://www.youtube.com/embed/IIi19T-bt70" },
];

export default function SejarahPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Marquee + slider mantan ketua umum
  const marqueeRef = useRef<HTMLDivElement>(null);
  const [marqueePos, setMarqueePos] = useState(0); // 0..1
  const [isAuto, setIsAuto] = useState(true);
  const idleTimeout = useRef<NodeJS.Timeout | null>(null);

  // Panjang satu set konten (tanpa duplikasi)

  // Auto-scroll effect
  useEffect(() => {
    if (!isAuto) return;
    let frame: number;
    const step = () => {
      setMarqueePos(pos => {
        let next = pos + 0.0007; // kecepatan
        if (next > 1) next -= 1;
        return next;
      });
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [isAuto]);

  // (fungsi slider tidak dipakai, logika langsung di onChange/onMouseDown/onMouseUp/onTouchStart/onTouchEnd input)

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-green-50 py-10">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.h1 initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
          className="text-3xl md:text-4xl font-extrabold text-center text-blue-900 mb-8">
          Sejarah Mahapala Narotama
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.7 }}
          className="text-lg text-gray-700 text-center mb-10 leading-relaxed">
          {sejarahNarasi}
        </motion.p>

        {/* Mantan Ketua Umum */}
        <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.7 }}
          className="text-2xl font-bold text-blue-800 mb-4 text-center">Mantan Ketua Umum</motion.h2>
<div className="relative w-full overflow-hidden py-4">
  <div
    ref={marqueeRef}
    className="flex gap-6 min-w-[700px] pb-2 px-2"
    style={{
      width: 'max-content',
      transform: `translateX(-${marqueePos * (ketuaList.length * 190 + 32)}px)`,
      transition: isAuto ? 'none' : 'transform 0.2s',
      willChange: 'transform',
    }}
  >
    {(() => {
      // Duplikasi 2x agar infinite loop benar-benar seamless
      const cards = [...ketuaList, ...ketuaList];
      const nowIdx = ketuaList.length - 1;
      return cards.map((k, i) => {
        // Separator di antara ketua terakhir dan pertama
        let separator = null;
        if ((i + 1) % ketuaList.length === 0) {
          separator = <div key={"sep-"+i} className="flex items-center mx-2 text-3xl font-bold text-gray-400 select-none">|</div>;
        }
        const isNow = (i % ketuaList.length) === nowIdx;
        return (
          <React.Fragment key={i}>
            <motion.div
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * (i % ketuaList.length) }}
              className={
                "bg-white rounded-xl shadow-lg p-4 flex flex-col items-center min-w-[180px] hover:scale-105 transition-transform duration-300 border " +
                (isNow ? "border-yellow-400 ring-4 ring-yellow-300 animate-glow shadow-yellow-200" : "border-blue-100")
              }
            >
              <img src={k.foto} alt={k.nama} className={
                "w-20 h-20 rounded-full object-cover mb-2 " +
                (isNow ? "border-4 border-yellow-400 shadow-lg" : "border-4 border-blue-200")
              } />
              <div className={
                "font-bold text-lg text-center " +
                (isNow ? "text-yellow-700" : "text-blue-700")
              }>{k.nama}</div>
              <div className={
                "text-xs text-center " +
                (isNow ? "text-yellow-600 font-bold" : "text-gray-500")
              }>Periode {k.periode}</div>
              {isNow && <div className="mt-1 px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 text-xs font-semibold animate-pulse">Ketua Umum Sekarang</div>}
            </motion.div>
            {separator}
          </React.Fragment>
        );
      });
    })()}
  </div>
  {/* Slider */}
  <input
    type="range"
    min={0}
    max={ketuaList.length - 1}
    step={1}
    value={Math.round(marqueePos * (ketuaList.length - 1))}
    onChange={e => {
      setIsAuto(false);
      setMarqueePos(Number(e.target.value) / (ketuaList.length - 1));
      if (idleTimeout.current) clearTimeout(idleTimeout.current);
      idleTimeout.current = setTimeout(() => setIsAuto(true), 5000);
    }}
    onMouseDown={() => { setIsAuto(false); if (idleTimeout.current) clearTimeout(idleTimeout.current); }}
    onMouseUp={() => { if (idleTimeout.current) clearTimeout(idleTimeout.current); idleTimeout.current = setTimeout(() => setIsAuto(true), 5000); }}
    onTouchStart={() => { setIsAuto(false); if (idleTimeout.current) clearTimeout(idleTimeout.current); }}
    onTouchEnd={() => { if (idleTimeout.current) clearTimeout(idleTimeout.current); idleTimeout.current = setTimeout(() => setIsAuto(true), 5000); }}
    className="w-full mt-4 accent-yellow-500"
    aria-label="Scroll mantan ketua umum"
  />
</div>

        <style>{`
          @keyframes animate-glow {
            0% { box-shadow: 0 0 0 0 #fde68a, 0 0 10px 2px #fde68a44; }
            50% { box-shadow: 0 0 0 8px #fde68a44, 0 0 20px 8px #fde68a44; }
            100% { box-shadow: 0 0 0 0 #fde68a, 0 0 10px 2px #fde68a44; }
          }
          .animate-glow { animation: animate-glow 2s infinite; }
        `}</style>

        {/* Kilas Balik */}
        <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.7 }}
          className="text-2xl font-bold text-green-800 mb-4 mt-10 text-center">Kilas Balik</motion.h2>
        <div className="space-y-4 mb-10">
          {kilasBalik.map((k, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * i }}
              className="bg-white rounded-lg shadow p-4 flex items-center gap-4 border-l-4 border-green-400">
              <div className="text-2xl font-bold text-green-600 w-16 text-center">{k.tahun}</div>
              <div className="text-gray-700 text-base">{k.momen}</div>
            </motion.div>
          ))}
        </div>

        {/* Video Momentum */}
        <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.7 }}
          className="text-2xl font-bold text-purple-800 mb-4 mt-10 text-center">Video Momentum</motion.h2>
        <div className="grid md:grid-cols-3 gap-6">
          {videoMomentum.map((v, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 * i }}
              className="bg-white rounded-xl shadow-lg p-2 flex flex-col items-center">
              <div className="aspect-w-16 aspect-h-9 w-full mb-2">
                <iframe src={v.url} title={v.title} allowFullScreen className="w-full h-40 rounded-lg"></iframe>
              </div>
              <div className="text-sm text-center text-gray-700 font-semibold">{v.title}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
