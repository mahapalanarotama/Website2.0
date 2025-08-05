import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";





type KilasBalik = { tahun: string; momen: string };
type VideoMomentum = { title: string; url: string };

export default function SejarahPage() {
  const [sejarahNarasi, setSejarahNarasi] = useState<string|null>(null);
  const [kilasBalik, setKilasBalik] = useState<KilasBalik[]|null>(null);
  const [videoMomentum, setVideoMomentum] = useState<VideoMomentum[]|null>(null);
  const [ketuaList, setKetuaList] = useState<any[]|null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    async function fetchSejarah() {
      setLoading(true);
      try {
        const snap = await getDoc(doc(db, "sejarah_page", "main"));
        if (snap.exists()) {
          const d = snap.data();
          setSejarahNarasi(typeof d.sejarahNarasi === 'string' ? d.sejarahNarasi : null);
          setKilasBalik(Array.isArray(d.kilasBalik) ? d.kilasBalik : null);
          setVideoMomentum(Array.isArray(d.videoMomentum) ? d.videoMomentum : null);
          setKetuaList(Array.isArray(d.ketuaList) ? d.ketuaList : null);
        } else {
          setSejarahNarasi(null);
          setKilasBalik(null);
          setVideoMomentum(null);
          setKetuaList(null);
        }
      } catch {
        setSejarahNarasi(null);
        setKilasBalik(null);
        setVideoMomentum(null);
      }
      setLoading(false);
    }
    fetchSejarah();
  }, []);

  // Marquee + slider mantan ketua umum (tidak boleh diedit admin)
  const marqueeRef = useRef<HTMLDivElement>(null);
  const [marqueePos, setMarqueePos] = useState(0); // 0..1
  const [isAuto, setIsAuto] = useState(true);
  const idleTimeout = useRef<NodeJS.Timeout | null>(null);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-green-50">
        <div className="text-lg text-gray-600">Memuat data sejarah...</div>
      </div>
    );
  }
  if (!sejarahNarasi || !kilasBalik || !videoMomentum || !ketuaList) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-green-50">
        <div className="text-lg text-red-600">Data sejarah belum tersedia.</div>
      </div>
    );
  }

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
          className="text-2xl font-bold text-blue-800 mb-4 text-center">Jejak Ketua Umum</motion.h2>
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
          {kilasBalik.map((k: KilasBalik, i: number) => (
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
          {videoMomentum.map((v: VideoMomentum, i: number) => (
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
