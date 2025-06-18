import React, { useState } from "react";
import { collection, addDoc, getDocs, query, where, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Helmet } from "react-helmet";

// Helper untuk download buku panduan (dummy PDF)
function DownloadPanduan({ url, label }: { url: string; label: string }) {
  return (
    <a
      href={url}
      download
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-600 to-green-400 text-white font-semibold shadow hover:from-green-700 hover:to-green-500 transition mb-4"
      style={{ textDecoration: 'none' }}
    >
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" /></svg>
      {label}
    </a>
  );
}

// 1. Panduan Survival
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
// 2. PPGD (Pertolongan Pertama Gawat Darurat)
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
// 3. Navigasi Darat
function NavigasiDarat() {
  const [arah, setArah] = useState('Tidak tersedia');
  React.useEffect(() => {
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
// 4. Checklist Survival
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
// 5. Pelacak Lokasi GPS
function PelacakGPS() {
  const [tracking, setTracking] = useState(false);
  const [status, setStatus] = useState("");
  const [positions, setPositions] = useState<any[]>(() => {
    const saved = localStorage.getItem("gps_track");
    return saved ? JSON.parse(saved) : [];
  });
  const [inputNama, setInputNama] = useState('');
  const [nama, setNama] = useState(() => localStorage.getItem('gps_nama') || '');
  const intervalRef = React.useRef<any>(null);

  // Simpan tracker ke localStorage (array)
  function saveTrackerLocal(data: any) {
    const arr = JSON.parse(localStorage.getItem("gps_tracker") || "[]");
    arr.push(data);
    localStorage.setItem("gps_tracker", JSON.stringify(arr));
  }

  // Sinkronisasi ke Firestore saat online
  async function syncTrackerToFirestore() {
    if (!navigator.onLine) return;
    const arr = JSON.parse(localStorage.getItem("gps_tracker") || "[]");
    if (!arr.length) return;
    let success = true;
    for (const data of arr) {
      try {
        await addDoc(collection(db, "gps_tracker"), data);
      } catch (e) {
        success = false;
        break;
      }
    }
    if (success) localStorage.removeItem("gps_tracker");
  }

  // Hapus semua data tracker user ini di Firestore
  async function deleteUserTrackFromFirestore() {
    if (!nama) return;
    const q = query(collection(db, "gps_tracker"), where("nama", "==", nama));
    const snap = await getDocs(q);
    for (const docu of snap.docs) {
      await deleteDoc(docu.ref);
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
    deleteUserTrackFromFirestore();
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
          const data = {
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
            time: new Date().toISOString(),
            nama: nama,
            online: navigator.onLine,
          };
          setPositions((prev: any) => {
            const next = [...prev, data];
            localStorage.setItem("gps_track", JSON.stringify(next));
            return next;
          });
          saveTrackerLocal(data);
          if (navigator.onLine) syncTrackerToFirestore();
        },
        err => setStatus("Gagal mendapatkan lokasi: " + err.message),
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
      );
    }, 10000); // 10 detik
  }

  React.useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  function resetTrack() {
    setPositions([]);
    localStorage.removeItem("gps_track");
    localStorage.removeItem("gps_tracker");
  }
  React.useEffect(() => {
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

// Komponen utama PWA Offline Survival
export default function OfflineSurvivalApp() {
  const [tab, setTab] = useState('survival');
  return (
    <>
      <Helmet>
        <title>Offline Survival | Mahapala Narotama</title>
        <meta property="og:title" content="Offline Survival | Mahapala Narotama" />
        <meta property="og:description" content="Akses panduan survival, navigasi darat, PPGD, checklist, dan pelacak GPS secara offline bersama Mahapala Narotama." />
        <meta property="og:image" content="/favicon.ico" />
        <meta name="twitter:image" content="/favicon.ico" />
        <link rel="icon" href="/favicon.ico" />
      </Helmet>
      <div className="min-h-screen bg-green-900 text-white flex flex-col font-sans">
        <header className="bg-green-800 py-4 px-4 text-center shadow-lg">
          <h1 className="text-2xl font-bold tracking-wide">Offline Survival Mahapala Narotama</h1>
          <p className="text-sm text-green-200">Panduan survival, PPGD, navigasi, checklist, dan pelacak GPS. Bisa diakses offline!</p>
        </header>
        <nav className="flex flex-wrap justify-center gap-3 bg-green-950 py-3 px-2 sticky top-0 z-10">
          <button className={`btn-nav${tab==='survival'?' bg-green-700':''}`} onClick={()=>setTab('survival')}>Panduan Survival</button>
          <button className={`btn-nav${tab==='ppgd'?' bg-green-700':''}`} onClick={()=>setTab('ppgd')}>PPGD</button>
          <button className={`btn-nav${tab==='navigasi'?' bg-green-700':''}`} onClick={()=>setTab('navigasi')}>Navigasi Darat</button>
          <button className={`btn-nav${tab==='checklist'?' bg-green-700':''}`} onClick={()=>setTab('checklist')}>Checklist Survival</button>
          <button className={`btn-nav${tab==='gps'?' bg-green-700':''}`} onClick={()=>setTab('gps')}>Pelacak GPS</button>
        </nav>
        <main className="flex-1 w-full max-w-2xl mx-auto p-4">
          {tab==='survival' && <PanduanSurvival />}
          {tab==='ppgd' && <PPGD />}
          {tab==='navigasi' && <NavigasiDarat />}
          {tab==='checklist' && <ChecklistSurvival />}
          {tab==='gps' && <PelacakGPS />}
        </main>
        <footer className="text-center text-green-200 py-3 text-xs bg-green-950">© {new Date().getFullYear()} Mahapala Narotama</footer>
        <style>{`
          body { background: #14532d; }
          .btn-nav {
            background: #166534;
            color: #fff;
            font-size: 1.1rem;
            border-radius: 0.5rem;
            padding: 0.7rem 1.2rem;
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
    </>
  );
}
