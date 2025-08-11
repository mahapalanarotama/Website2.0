import { useRef, useState, useEffect } from "react";
// Import semua backsound yang tersedia
// @ts-ignore
import backsound1 from "../assets/backsound.mp3";
// @ts-ignore
import backsound2 from "../assets/backsound1.mp3";
// @ts-ignore
import backsound3 from "../assets/backsound2.mp3";
//import jika ada baru
// @ts-ignore
//import backsound4 from "../assets/backsound3.mp3";

const backsounds = [
  { src: backsound1, label: "MPN Jaya" },
  { src: backsound2, label: "Sendu" },
  { src: backsound3, label: "Fun" },
  //   { src: backsound4, label: "Backsound 4" },
];

let globalBacksoundInstance: HTMLAudioElement | null = null;


export default function BacksoundPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [selected, setSelected] = useState(0);
  const [showSelect, setShowSelect] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showPlayDialog, setShowPlayDialog] = useState(false);
  const [showPauseBtn, setShowPauseBtn] = useState(false);
  const hideTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleToggle = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  // Ganti backsound, otomatis play jika sebelumnya play, dan simpan ke cookie
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const idx = parseInt(e.target.value, 10);
    setSelected(idx);
    document.cookie = `backsound_selected=${idx}; path=/; max-age=31536000`;
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        if (playing) audioRef.current.play();
      }
    }, 100);
    // Reset timer sembunyi select
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    hideTimeout.current = setTimeout(() => setShowSelect(false), 5000);
  };

  // Ambil pilihan backsound dari cookie saat mount & cek info box
  useEffect(() => {
    const match = document.cookie.match(/backsound_selected=(\d+)/);
    if (match) {
      setSelected(Number(match[1]));
    }
    // Cegah suara ganda: hanya satu audio aktif di window
    if (audioRef.current) {
      if (globalBacksoundInstance && globalBacksoundInstance !== audioRef.current) {
        try { globalBacksoundInstance.pause(); } catch {}
      }
      globalBacksoundInstance = audioRef.current;
    }
    // Otomatis play backsound saat awal masuk jika belum play
    if (audioRef.current && !playing) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.then(() => setPlaying(true)).catch(() => {
          // Autoplay might diblock browser, user harus klik dulu
        });
      }
    }
    // Tampilkan info box hanya jika belum pernah close
    if (!localStorage.getItem('backsound_info_closed')) {
      setShowInfo(true);
    }
    return () => {
      if (audioRef.current) audioRef.current.pause();
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
      // Hapus global instance jika unmount
      if (globalBacksoundInstance === audioRef.current) {
        globalBacksoundInstance = null;
      }
    };
  }, []);

  // Auto-hide pause button setelah 3 detik tidak ada aktivitas
  useEffect(() => {
    if (playing && showPauseBtn) {
      const t = setTimeout(() => setShowPauseBtn(false), 3000);
      return () => clearTimeout(t);
    }
  }, [playing, showPauseBtn]);

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-center group select-none">
      {showInfo && (
        <div className="mb-3 bg-white/90 border border-green-400 rounded-lg shadow px-4 py-2 text-sm text-green-900 relative max-w-xs animate-fade-in">
          <button
            className="absolute top-1 right-2 text-green-700 hover:text-red-500 text-lg font-bold focus:outline-none"
            onClick={() => {
              if (window.confirm('Sudah paham cara mengganti backsound?')) {
                setShowInfo(false);
                localStorage.setItem('backsound_info_closed', '1');
              }
            }}
            aria-label="Tutup info"
          >×</button>
          <b>Cara mengganti backsound:</b><br />
          Klik ikon piringan, lalu pilih backsound dari daftar yang muncul. Musik akan otomatis berganti.
        </div>
      )}
      {showSelect && (
        <div className="mb-2 animate-fade-in">
          <select
            className="rounded px-2 py-1 text-sm border border-green-400 bg-white shadow"
            value={selected}
            onChange={handleChange}
            autoFocus
            onBlur={() => setShowSelect(false)}
          >
            {backsounds.map((b, i) => (
              <option value={i} key={b.label}>{b.label}</option>
            ))}
          </select>
        </div>
      )}
      <div
        className={`w-16 h-16 rounded-full bg-gradient-to-tr from-green-300 to-green-700 shadow-lg flex items-center justify-center border-4 border-white transition-transform duration-700 relative ${playing ? "animate-spin-slow" : ""}`}
        style={{ boxShadow: '0 4px 24px 0 rgba(34,139,34,0.15)' }}
        onClick={() => {
          setShowSelect(true);
          if (hideTimeout.current) clearTimeout(hideTimeout.current);
          hideTimeout.current = setTimeout(() => setShowSelect(false), 5000);
        }}
        title={playing ? "Pause backsound" : "Putar backsound"}
        onMouseEnter={() => setShowPauseBtn(true)}
        onMouseLeave={() => { if (playing) setShowPauseBtn(false); }}
        onTouchStart={() => setShowPauseBtn(true)}
      >
        <img
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=200&q=80"
          alt="Piringan Backsound Hutan"
          className="w-12 h-12 rounded-full object-cover pointer-events-none"
          style={{ filter: 'brightness(0.95) contrast(1.1)' }}
        />
        {playing && (showPauseBtn || showPlayDialog) && (
          <button
            className="absolute w-10 h-10 flex items-center justify-center rounded-full bg-white/80 shadow group-hover:bg-white/90 transition border border-green-400 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
            aria-label="Pause backsound"
            tabIndex={0}
            onClick={e => { e.stopPropagation(); setShowPlayDialog(true); }}
            onMouseLeave={() => setShowPauseBtn(false)}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>
          </button>
        )}
      </div>
      {!playing && (
        <button
          className="mt-2 w-10 h-10 flex items-center justify-center rounded-full bg-white/80 shadow group-hover:bg-white/90 transition border border-green-400"
          aria-label="Putar backsound"
          tabIndex={0}
          onClick={e => { e.stopPropagation(); setShowPlayDialog(true); }}
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="6,4 20,12 6,20 6,4"/></svg>
        </button>
      )}

      {/* Dialog play musik */}
      {showPlayDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-xs w-full relative animate-fade-in">
            <button className="absolute top-2 right-3 text-xl text-gray-500 hover:text-red-500" onClick={() => setShowPlayDialog(false)} aria-label="Tutup">×</button>
            <div className="flex flex-col items-center gap-3">
              <span className="text-green-700 text-lg font-bold">Play Musik?</span>
              <span className="text-sm text-gray-700 text-center">Klik tombol di bawah untuk memulai atau pause backsound.</span>
              <button
                className="mt-2 px-4 py-2 rounded bg-green-600 text-white font-semibold hover:bg-green-700 transition"
                onClick={() => { handleToggle(); setShowPlayDialog(false); }}
              >{playing ? "Pause" : "Play"} Musik</button>
            </div>
          </div>
        </div>
      )}
      <audio
        ref={audioRef}
        src={backsounds[selected].src}
        loop
        preload="auto"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        style={{ display: "none" }}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            audioRef.current.volume = 0.6;
            // Otomatis play jika belum playing
            if (!playing) {
              const playPromise = audioRef.current.play();
              if (playPromise !== undefined) {
                playPromise.then(() => setPlaying(true)).catch(() => {
                  // Autoplay might be blocked
                });
              }
            }
          }
        }}
      />
      <span className="mt-2 text-xs text-green-900 bg-white/80 px-2 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition">{playing ? "Sedang diputar" : "Klik untuk backsound"}</span>
    </div>
  );
}
