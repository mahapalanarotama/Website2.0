import { saveGpsTrackerToFirestore, syncOfflineGpsToFirestore } from "@/lib/gpsFirestore";
import { useState, useEffect, useRef } from "react";
import { BookOpen, Map, Phone, AlertTriangle } from "lucide-react"; // Merged imports
 

// --- Komponen Fitur Survival ---
function DownloadPanduan({ url, label }: { url: string; label: string }) {
  return (
    <button
      onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-600 to-green-400 text-white font-semibold shadow hover:from-green-700 hover:to-green-500 transition mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
      style={{ textDecoration: 'none' }}
    >
      <BookOpen className="w-5 h-5" />
      {label}
    </button>
  );
}

function PanduanSurvival() {
  return (
    <section className="bg-white/90 rounded-2xl shadow-xl p-6 mb-4 text-gray-800">
      <DownloadPanduan url="/panduan-survival.pdf" label="Download Buku Panduan Survival" />
      <h2 className="text-2xl font-bold mb-3 text-green-800">Panduan Survival Dasar</h2>
      <ul className="list-disc pl-5 space-y-2 text-lg">
        <li>Tenang, jangan panik. Analisa situasi dan sumber daya sekitar.</li>
        <li>Cari sumber air bersih dan buat perlindungan (bivak/shelter).</li>
        <li>Jaga suhu tubuh, hindari hipotermia/heatstroke.</li>
        <li>Gunakan api untuk sinyal, hangat, dan memasak.</li>
        <li>Manfaatkan alat survival: kompas, pisau, peluit, senter, dsb.</li>
        <li>Catat lokasi terakhir dan buat tanda jejak jika berpindah.</li>
      </ul>
    </section>
  );
}

function PPGD() {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  function startRJP() {
    setStarted(true);
    setCount(0);
  }
  function tekanDada() {
    setCount(c => c + 1);
  }
  return (
    <section className="bg-white/90 rounded-2xl shadow-xl p-6 mb-4 text-gray-800">
      <DownloadPanduan url="/ppgd.pdf" label="Download Buku PPGD" />
      <h2 className="text-2xl font-bold mb-3 text-green-800">PPGD (Pertolongan Pertama Gawat Darurat)</h2>
      <ol className="list-decimal pl-5 space-y-2 mb-4 text-lg">
        <li>Pastikan keamanan lokasi sebelum menolong.</li>
        <li>Periksa respons korban: sadar/tidak, napas, denyut nadi.</li>
        <li>Lakukan RJP (Resusitasi Jantung Paru) jika perlu.</li>
        <li>Hentikan perdarahan, atasi syok, imobilisasi patah tulang.</li>
        <li>Gunakan alat P3K, jaga kebersihan luka.</li>
        <li>Segera cari bantuan medis jika kondisi berat.</li>
      </ol>
      <div className="bg-green-100 rounded-lg p-4 mb-2 shadow">
        <h3 className="font-semibold mb-2 text-green-700">Simulasi RJP</h3>
        {!started ? (
          <button className="btn-nav" onClick={startRJP}>Mulai Simulasi RJP</button>
        ) : (
          <>
            <div className="mb-2">Tekan tombol di bawah ini sebanyak 30x untuk simulasi kompresi dada!</div>
            <button className="btn-nav mb-2" onClick={tekanDada}>Tekan Dada ({count}/30)</button>
            {count >= 30 && <div className="text-green-700 font-bold">Simulasi selesai! Segera lakukan napas bantuan.</div>}
          </>
        )}
      </div>
    </section>
  );
}

function NavigasiDarat() {
  const [arah, setArah] = useState('Tidak tersedia');
  useEffect(() => {
    function handleOrientation(e: any) {
      if (e.absolute && typeof e.alpha === 'number') {
        const deg = Math.round(e.alpha);
        setArah(`${deg}° (Utara: 0°)`);
      }
    }
    window.addEventListener('deviceorientationabsolute', handleOrientation);
    window.addEventListener('deviceorientation', handleOrientation);
    return () => {
      window.removeEventListener('deviceorientationabsolute', handleOrientation);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);
  return (
    <section className="bg-white/90 rounded-2xl shadow-xl p-6 mb-4 text-gray-800">
      <DownloadPanduan url="/navigasi-darat.pdf" label="Download Buku Navigasi Darat" />
      <h2 className="text-2xl font-bold mb-3 text-green-800">Navigasi Darat</h2>
      <ul className="list-disc pl-5 space-y-2 mb-4 text-lg">
        <li>Gunakan peta topografi dan kompas untuk orientasi.</li>
        <li>Kenali tanda alam: matahari, bintang, arah angin, vegetasi.</li>
        <li>Buat rencana perjalanan dan catat titik penting di jalur.</li>
        <li>Hindari berjalan sendirian, selalu informasikan posisi ke tim.</li>
        <li>Gunakan GPS jika tersedia, tapi tetap siapkan navigasi manual.</li>
      </ul>
      <div className="bg-green-100 rounded-lg p-4 shadow">
        <h3 className="font-semibold mb-2 text-green-700">Simulasi Kompas</h3>
        <div className="text-lg">Arah Utara: <span className="font-bold">{arah}</span></div>
        <div className="text-green-600 text-xs mt-2">(Fitur ini hanya akurat di HP dengan sensor kompas)</div>
      </div>
    </section>
  );
}

function ChecklistSurvival() {
  const items = [
    { icon: '🧭', label: "Kompas" },
    { icon: '🏕️', label: "Bivak/Shelter" },
    { icon: '📯', label: "Peluit" },
    { icon: '🔪', label: "Pisau" },
    { icon: '💡', label: "Senter/Headlamp" },
    { icon: '🍱', label: "Makanan Cadangan" },
    { icon: '🩹', label: "P3K" },
    { icon: '🚰', label: "Botol Air" },
    { icon: '🌧️', label: "Jas Hujan" },
    { icon: '🪢', label: "Tali Paracord" },
    { icon: '👕', label: "Pakaian Cadangan" },
    { icon: '🔥', label: "Korek Api/Firestarter" }
  ];
  const [checked, setChecked] = useState(() => {
    const saved = localStorage.getItem("survival_checklist");
    return saved ? JSON.parse(saved) : Array(items.length).fill(false);
  });
  function toggle(idx: number) {
    const next = [...checked];
    next[idx] = !next[idx];
    setChecked(next);
    localStorage.setItem("survival_checklist", JSON.stringify(next));
  }
  function resetChecklist() {
    const kosong = Array(items.length).fill(false);
    setChecked(kosong);
    localStorage.setItem("survival_checklist", JSON.stringify(kosong));
  }
  return (
    <section className="bg-white/90 rounded-2xl shadow-xl p-6 mb-4 text-gray-800">
      <h2 className="text-2xl font-bold mb-3 text-green-800">Checklist Survival</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((item, i) => (
          <label key={item.label} htmlFor={item.label} className={`flex items-center gap-4 p-4 rounded-xl shadow transition-all cursor-pointer border-2 ${checked[i] ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white hover:bg-green-100'}`}>
            <span className="text-3xl select-none" aria-label={item.label}>{item.icon}</span>
            <span className={`flex-1 text-lg font-semibold select-none ${checked[i] ? 'text-green-700' : 'text-gray-700'}`}>{item.label}</span>
            <input
              type="checkbox"
              id={item.label}
              checked={checked[i]}
              onChange={() => toggle(i)}
              className="form-checkbox h-6 w-6 text-green-600 border-green-400 focus:ring-green-500 transition-all"
              style={{ accentColor: '#22c55e' }}
            />
          </label>
        ))}
      </div>
      <button className="mt-6 px-6 py-2 rounded-full bg-gradient-to-r from-green-600 to-green-400 text-white font-bold shadow hover:from-green-700 hover:to-green-500 transition-all text-lg" onClick={resetChecklist}>
        Reset Checklist
      </button>
      <p className="mt-2 text-green-400 text-sm text-center">Checklist tersimpan otomatis di perangkat Anda.</p>
    </section>
  );
}

function PelacakGPS() {
  const [tracking, setTracking] = useState(false);
  const [status, setStatus] = useState("");
  const [positions, setPositions] = useState<any[]>(() => {
    const saved = localStorage.getItem("gps_track");
    return saved ? JSON.parse(saved) : [];
  });
  const [inputNama, setInputNama] = useState('');
  const [nama, setNama] = useState(() => localStorage.getItem('gps_nama') || '');
  const intervalRef = useRef<any>(null);

  // Sync otomatis saat online kembali
  useEffect(() => {
    function syncIfOnline() {
      if (navigator.onLine) syncOfflineGpsToFirestore();
    }
    window.addEventListener('online', syncIfOnline);
    // Cek saat mount juga
    syncIfOnline();
    return () => window.removeEventListener('online', syncIfOnline);
  }, []);

  async function saveAndSync(data: any) {
    if (navigator.onLine) {
      try {
        await saveGpsTrackerToFirestore(data);
      } catch {}
    } else {
      // Sudah otomatis tersimpan di localStorage
    }
  }

  function stopTracking() {
    setTracking(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setPositions([]);
    localStorage.removeItem("gps_track");
    localStorage.removeItem("gps_tracker");
    setStatus("Pelacakan dimatikan dan data dihapus.");
  }

  function startTracking() {
    if (!nama) return;
    if (!navigator.geolocation) {
      setStatus("Geolocation tidak didukung browser.");
      return;
    }
    setTracking(true);
    setStatus("Pelacakan aktif...");
    intervalRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const now = new Date();
          const data = {
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
            time: now.toLocaleString(),
            nama: nama,
            online: navigator.onLine,
          };
          setPositions((prev: any) => {
            const next = [...prev, data];
            localStorage.setItem("gps_track", JSON.stringify(next));
            // Kirim ke Firestore jika online, jika offline tetap simpan lokal
            saveAndSync(data);
            return next;
          });
        },
        err => setStatus("Gagal mendapatkan lokasi: " + err.message),
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
  );
    }, 10000); // 10 detik
  }

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  function resetTrack() {
    setPositions([]);
    localStorage.removeItem("gps_track");
    localStorage.removeItem("gps_tracker");
  }
  useEffect(() => {
    function updateStatus() {
      setStatus(navigator.onLine ? "Online" : "Mode Offline: Menyimpan data lokal");
    }
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    updateStatus();
    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);
  return (
    <section className="bg-white/90 rounded-2xl shadow-xl p-6 mb-4 text-gray-800">
      <h2 className="text-2xl font-bold mb-3 text-green-800">Pelacak Lokasi GPS</h2>
      {!nama ? (
        <div className="mb-4">
          <label className="block mb-2 text-green-800 font-semibold">Masukkan Nama Anda:</label>
          <input
            className="px-3 py-2 rounded border border-green-400 focus:outline-none focus:ring-2 focus:ring-green-600 text-gray-900"
            value={inputNama}
            onChange={e => setInputNama(e.target.value)}
            placeholder="Nama Lengkap"
          />
          <button
            className="btn-nav ml-2 mt-2"
            onClick={() => {
              setNama(inputNama);
              localStorage.setItem('gps_nama', inputNama);
            }}
            disabled={!inputNama.trim()}
          >Simpan Nama</button>
        </div>
      ) : null}
      <button className="btn-nav mb-4" onClick={startTracking} disabled={tracking || !nama}>Aktifkan Pelacakan</button>
      <button className="btn-nav mb-4 ml-2" onClick={resetTrack}>Reset Data Lokasi</button>
      <button className="btn-nav mb-4 ml-2 bg-red-600 hover:bg-red-700" onClick={stopTracking} disabled={!tracking}>Matikan GPS</button>
      <div className="mb-2 text-green-700 text-sm">{status}</div>
      <div className="overflow-x-auto bg-green-100 rounded-lg p-2 text-xs">
        <table className="w-full">
          <thead><tr><th>Waktu</th><th>Lat</th><th>Lon</th><th>Nama</th><th>Status</th></tr></thead>
          <tbody>
            {positions.map((p: any, i: any) => (
              <tr key={i}>
                <td>{p.time}</td><td>{p.lat}</td><td>{p.lon}</td><td>{p.nama || nama}</td>
                <td>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${p.online ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}`}>
                    {p.online ? 'Online' : 'Offline'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-green-700 text-xs">Data lokasi tersimpan lokal & dikirim ke server jika online.</p>
    </section>
  );
}

const nomorDarurat = [
  { label: "SAR Nasional (Basarnas)", nomor: "115" },
  { label: "BPBD Surabaya", nomor: "031-8499909" },
  { label: "Polisi", nomor: "110" },
  { label: "Ambulans", nomor: "118" },
  { label: "RSU Dr. Soetomo", nomor: "031-5501078" },
];

const tipsSurvival = [
  "Selalu bawa peluit, senter, dan korek api cadangan.",
  "Jangan panik, tetap tenang dan hemat energi.",
  "Cari sumber air bersih dan buat perlindungan sederhana.",
  "Gunakan sinyal darurat (asap, peluit, cermin) untuk menarik perhatian.",
  "Kenali tanaman dan hewan berbahaya di sekitar.",
  "Lakukan pertolongan pertama pada luka ringan sebelum mencari bantuan.",
];

export default function OfflinePage() {
  const [cacheStatus, setCacheStatus] = useState<'checking'|'caching'|'ready'|'error'>('checking');
  const [cacheError, setCacheError] = useState<string|null>(null);
  const [showProgress, setShowProgress] = useState(true);
  const [showStatus, setShowStatus] = useState(true);
  useEffect(() => {
    if (cacheStatus === 'ready') {
      const progressTimeout = setTimeout(() => setShowProgress(false), 3000);
      const statusTimeout = setTimeout(() => setShowStatus(false), 5000);
      return () => {
        clearTimeout(progressTimeout);
        clearTimeout(statusTimeout);
      };
    } else {
      setShowProgress(true);
      setShowStatus(true);
    }
  }, [cacheStatus]);

  useEffect(() => {
    // Komunikasi dengan service worker + fallback polling
    let listener: any;
    let pollInterval: any;
    function sendCheckCache() {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(reg => {
          if (reg.active) {
            console.log('[OfflinePage] Sending CHECK_CACHE to SW');
            reg.active.postMessage({ type: 'CHECK_CACHE' });
          } else {
            console.log('[OfflinePage] SW not active yet');
          }
        });
      }
    }
    sendCheckCache();
    pollInterval = setInterval(sendCheckCache, 2000); // Poll setiap 2 detik sampai status berubah
    listener = (event: any) => {
      if (event.data && event.data.type === 'CACHE_STATUS') {
        console.log('[OfflinePage] Received CACHE_STATUS:', event.data);
        setCacheStatus(event.data.status);
        setCacheError(event.data.error || null);
        if (event.data.status === 'ready' || event.data.status === 'error') {
          clearInterval(pollInterval);
        }
      }
    };
    navigator.serviceWorker.addEventListener('message', listener);
    return () => {
      if (listener) navigator.serviceWorker.removeEventListener('message', listener);
      if (pollInterval) clearInterval(pollInterval);
    };
  }, []);
  const [tab, setTab] = useState('fitur');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  // Deteksi event install PWA
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setIsInstalled(true));
    // Cek jika sudah terinstall (standalone)
    if (window.matchMedia('(display-mode: standalone)').matches) setIsInstalled(true);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    }
  };

  // Status online/offline
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
      
      // Jika offline dan di React component, redirect ke standalone page
      if (!navigator.onLine) {
        setTimeout(() => {
          if (confirm('Koneksi terputus. Pindah ke mode offline standalone?')) {
            window.location.href = '/offline-standalone.html';
          }
        }, 2000);
      }
    };
    
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus(); // Check initial status
    
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-green-50 py-8 px-2 relative">
      {/* Indikator Online/Offline sticky di bawah navbar utama */}
  <div className="sticky top-0 z-40 w-full flex justify-end">
        <span className={`mx-4 my-2 px-3 py-1 rounded-full font-bold text-xs shadow ${isOnline ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}
          title={isOnline ? 'Online' : 'Offline'}>
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>
      {/* Progress bar offline status */}
      <div className="max-w-xl mx-auto mb-4">
        {showProgress && (
          <div className="w-full bg-gray-200 rounded-full h-6 mb-2 overflow-hidden">
            {cacheStatus === 'checking' ? (
              <div className="h-6 rounded-full animate-progress-loading" style={{ width: '33%', background: 'linear-gradient(90deg, #ef4444, #f59e42, #3b82f6, #22c55e)' }}></div>
            ) : cacheStatus === 'caching' ? (
              <div className="h-6 rounded-full transition-all duration-500" style={{ width: '66%', background: 'linear-gradient(90deg, #ef4444, #f59e42, #22c55e)' }}></div>
            ) : cacheStatus === 'ready' ? (
              <div className="h-6 rounded-full transition-all duration-500" style={{ width: '100%', background: 'linear-gradient(90deg, #22c55e, #16a34a)' }}></div>
            ) : (
              <div className="h-6 rounded-full transition-all duration-500" style={{ width: '33%', background: 'linear-gradient(90deg, #ef4444, #f59e42)' }}></div>
            )}
          </div>
        )}
        {/* Notifikasi jika cache belum siap */}
        {cacheStatus === 'error' && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-2 text-center font-semibold">
            <span>Cache offline belum siap. Silakan akses aplikasi ini dalam kondisi online minimal sekali agar semua file penting tercache. Setelah itu, Anda bisa mengakses offline dan refresh tanpa blank.</span>
          </div>
        )}
        <style>{`
          @keyframes progress-loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(300%); }
          }
          .animate-progress-loading {
            animation: progress-loading 1.2s linear infinite;
          }
        `}</style>
        <div className="text-center text-sm font-semibold">
          {cacheStatus==='ready' && showStatus && (
            <span className="flex items-center justify-center gap-2 text-green-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-7.414 7.414a1 1 0 01-1.414 0l-3.414-3.414a1 1 0 111.414-1.414L8 11.586l6.707-6.707a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              Aplikasi sudah siap untuk offline
            </span>
          )}
          {cacheStatus==='caching' && 'Sedang menyiapkan cache offline...'}
          {cacheStatus==='checking' && 'Memeriksa status cache offline...'}
          {cacheStatus==='error' && (
            <span className="text-red-600">Gagal cache offline. {cacheError ? cacheError : ''} Coba reload aplikasi dalam kondisi online, atau clear cache dan ulangi instalasi.</span>
          )}
        </div>
      </div>
      <div className="max-w-xl mx-auto">
        {/* Tombol Install PWA */}
        <div className="flex justify-center mb-4">
          {!isInstalled && deferredPrompt && (
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-green-600 to-green-400 shadow-lg hover:from-green-700 hover:to-green-500 text-white font-bold text-xl transition-all duration-200 animate-bounce-soc border-2 border-green-700"
              style={{ minWidth: 220, minHeight: 56, boxShadow: '0 4px 24px #22c55e55' }}
            >
              <img src="/OfflineApp.png" alt="App Icon" className="w-8 h-8 rounded-full border-2 border-green-300 bg-white shadow" />
              <span>Install di Layar Utama</span>
            </button>
          )}
        </div>
        <style>{`
          @keyframes bounce-soc {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }
          .animate-bounce-soc {
            animation: bounce-soc 1.6s infinite;
          }
        `}</style>
        <h1 className="text-2xl font-bold text-center text-green-800 mb-4">Mode Offline & Survival Tools</h1>
        <p className="text-center text-gray-600 mb-6">Tetap siap di alam bebas! Semua fitur berikut dapat diakses tanpa internet.</p>
        <nav className="flex flex-wrap justify-center gap-2 mb-6">
          <button className={`btn-nav${tab==='fitur'?' bg-green-700 text-white':''}`} onClick={()=>setTab('fitur')}>Fitur Survival</button>
          <button className={`btn-nav${tab==='survival'?' bg-green-700 text-white':''}`} onClick={()=>setTab('survival')}>Panduan Survival</button>
          <button className={`btn-nav${tab==='ppgd'?' bg-green-700 text-white':''}`} onClick={()=>setTab('ppgd')}>PPGD</button>
          <button className={`btn-nav${tab==='navigasi'?' bg-green-700 text-white':''}`} onClick={()=>setTab('navigasi')}>Navigasi Darat</button>
          <button className={`btn-nav${tab==='checklist'?' bg-green-700 text-white':''}`} onClick={()=>setTab('checklist')}>Checklist</button>
          <button className={`btn-nav${tab==='gps'?' bg-green-700 text-white':''}`} onClick={()=>setTab('gps')}>Pelacak GPS</button>
        </nav>
        {tab==='fitur' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <a href="/panduan-survival.pdf" className="block bg-white rounded-xl shadow p-4 hover:bg-green-50 transition">
                <div className="flex items-center gap-3 mb-2"><BookOpen className="w-8 h-8 text-blue-600"/><span className="font-bold text-green-900 text-lg">Panduan Survival Offline</span></div>
                <div className="text-gray-600 text-sm mb-2">Akses panduan survival, P3GD, dan navigasi darat tanpa internet.</div>
                <div className="text-green-700 text-xs font-semibold underline">Buka Panduan Survival</div>
              </a>
              <a href="/navigasi-darat.pdf" className="block bg-white rounded-xl shadow p-4 hover:bg-green-50 transition">
                <div className="flex items-center gap-3 mb-2"><Map className="w-8 h-8 text-green-600"/><span className="font-bold text-green-900 text-lg">Navigasi Darat PDF</span></div>
                <div className="text-gray-600 text-sm mb-2">Pelajari teknik navigasi darat dan orientasi peta-kompas.</div>
                <div className="text-green-700 text-xs font-semibold underline">Buka Navigasi Darat</div>
              </a>
            </div>
            {/* Nomor Darurat */}
            <div id="nomor-darurat" className="mb-8 bg-white rounded-xl shadow p-4">
              <div className="flex items-center gap-2 mb-2">
                <Phone className="w-6 h-6 text-purple-600" />
                <span className="font-bold text-purple-800">Nomor Darurat Penting</span>
              </div>
              <ul className="text-gray-700 text-sm space-y-1">
                {nomorDarurat.map((n, i) => (
                  <li key={i}><span className="font-semibold">{n.label}:</span> <a href={`tel:${n.nomor}`} className="text-blue-700 underline">{n.nomor}</a></li>
                ))}
              </ul>
            </div>
            {/* Tips Survival */}
            <div id="tips-survival" className="mb-8 bg-white rounded-xl shadow p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <span className="font-bold text-red-800">Tips Bertahan Hidup</span>
              </div>
              <ul className="text-gray-700 text-sm list-disc pl-5 space-y-1">
                {tipsSurvival.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
          </>
        )}
        {tab==='survival' && <PanduanSurvival />}
        {tab==='ppgd' && <PPGD />}
        {tab==='navigasi' && <NavigasiDarat />}
        {tab==='checklist' && <ChecklistSurvival />}
        {tab==='gps' && <PelacakGPS />}
      </div>
      <style>{`
        .btn-nav {
          background: #166534;
          color: #fff;
          font-size: 1rem;
          border-radius: 0.5rem;
          padding: 0.5rem 1.1rem;
          font-weight: bold;
          box-shadow: 0 2px 8px #0002;
          border: none;
          margin: 0.2rem;
          transition: background 0.2s;
        }
        .btn-nav:active, .btn-nav:hover, .btn-nav.bg-green-700 {
          background: #22c55e;
          color: #14532d;
        }
        input[type=checkbox] {
          width: 1.3em; height: 1.3em;
        }
      `}</style>
    </div>
  );
}
