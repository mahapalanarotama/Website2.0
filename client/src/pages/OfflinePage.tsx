import { saveGpsTrackerToFirestore, syncOfflineGpsToFirestore } from "@/lib/gpsFirestore";
import { useState, useEffect, useRef } from "react";
import { BookOpen, Map, Phone, AlertTriangle } from "lucide-react";


// --- Komponen Fitur Survival ---
function DownloadPanduan({ url, label }: { url: string; label: string }) {
  return (
    <a
      href={url}
      download
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-600 to-green-400 text-white font-semibold shadow hover:from-green-700 hover:to-green-500 transition mb-4"
      style={{ textDecoration: 'none' }}
    >
      <BookOpen className="w-5 h-5" />
      {label}
    </a>
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
    "Kompas", "Bivak/Shelter", "Peluit", "Pisau", "Senter/Headlamp", "Makanan Cadangan", "P3K", "Botol Air", "Jas Hujan", "Tali Paracord", "Pakaian Cadangan", "Korek Api/Firestarter"
  ];
  const [checked, setChecked] = useState(() => {
    const saved = localStorage.getItem("survival_checklist");
    return saved ? JSON.parse(saved) : Array(items.length).fill(false);
  });
  function toggle(idx: any) {
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
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={item} className="flex items-center gap-3">
            <input type="checkbox" id={item} checked={checked[i]} onChange={() => toggle(i)} />
            <label htmlFor={item} className="text-lg select-none">{item}</label>
          </li>
        ))}
      </ul>
      <button className="btn-nav mt-4" onClick={resetChecklist}>Reset Checklist</button>
      <p className="mt-2 text-green-200 text-sm">Checklist tersimpan otomatis di perangkat Anda.</p>
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
  const [tab, setTab] = useState('fitur');
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-green-50 py-8 px-2">
      <div className="max-w-xl mx-auto">
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
