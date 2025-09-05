import { useState, useEffect, useRef } from "react";
import { setDoc, doc, getDoc, collection, addDoc, getDocs, updateDoc, deleteDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";

function generateShortCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default function UrlShortenerPage() {
  const [longUrl, setLongUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [autoCode, setAutoCode] = useState("");
  const [customActive, setCustomActive] = useState(false);
  const customInputRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<any>(null);
  const [userLinks, setUserLinks] = useState<any[]>([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [editId, setEditId] = useState<string|null>(null);
  const [editCode, setEditCode] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [isCustomResult, setIsCustomResult] = useState<boolean>(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // Generate kode otomatis hanya jika URL valid dan customCode kosong
  useEffect(() => {
    if (!customCode.trim()) {
      try {
        if (longUrl.trim()) {
          new URL(longUrl);
          setAutoCode(generateShortCode());
        } else {
          setAutoCode("");
        }
      } catch {
        setAutoCode("");
      }
    }
  }, [longUrl, customCode]);

  // Ambil data shortlinks user
  const fetchLinks = async () => {
    if (!user) {
      setUserLinks([]);
      return;
    }
    setTableLoading(true);
    const snap = await getDocs(collection(db, `users/${user.uid}/shortlinks`));
    const arr: any[] = [];
    snap.forEach(doc => arr.push({ id: doc.id, ...doc.data() }));
    setUserLinks(arr);
    setTableLoading(false);
  };

  useEffect(() => {
    fetchLinks();
  }, [user, result]);

  async function handleLogin() {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  }

  async function handleLogout() {
    await signOut(auth);
  }

  // Edit link & Delete link harus berada sebelum return agar dikenali di JSX
  const handleEditLink = async (id: string) => {
    if (!window.confirm("Simpan perubahan data ini?")) return;
    setError("");
    setLoading(true);
    try {
      // Validasi kode
      if (!/^([a-zA-Z0-9_-]{3,20})$/.test(editCode)) {
        setError("Kode harus 3-20 karakter, huruf/angka/underscore/dash.");
        setLoading(false);
        return;
      }
      // Validasi url
      try {
        new URL(editUrl);
      } catch {
        setError("URL tidak valid.");
        setLoading(false);
        return;
      }
      // Cek kode baru tidak boleh sama dengan kode milik shortlink lain milik user
      const userLinksSnap = await getDocs(collection(db, `users/${user.uid}/shortlinks`));
      const duplicateCode = userLinksSnap.docs.some(doc => doc.id !== id && doc.data().code === editCode);
      if (duplicateCode) {
        setError("Kode sudah digunakan pada data Anda yang lain.");
        setLoading(false);
        return;
      }
      // Update shortlinks utama (jika kode berubah, hapus yang lama, buat baru)
      const userLinkDoc = userLinksSnap.docs.find(doc => doc.id === id);
      const oldCode = userLinkDoc?.data().code;
      if (oldCode && oldCode !== editCode) {
        // Hapus shortlink lama
        await deleteDoc(doc(db, "shortlinks", oldCode));
      }
      await setDoc(doc(db, "shortlinks", editCode), { url: editUrl, created: Date.now(), owner: user.uid, email: user.email });
      // Update di user
      await updateDoc(doc(db, `users/${user.uid}/shortlinks/${id}`), { code: editCode, url: editUrl });
      // Update tabel tanpa reload
      setUserLinks(userLinks.map(link => link.id === id ? { ...link, code: editCode, url: editUrl } : link));
      setEditId(null);
      showToast("Berhasil diupdate!", "success");
    } catch {
      setError("Gagal update data.");
      showToast("Gagal update data.", "error");
    }
    setLoading(false);
  };

  const handleDeleteLink = async (id: string, code: string) => {
    if (!window.confirm("Hapus data ini?")) return;
    setLoading(true);
    try {
      await deleteDoc(doc(db, `users/${user.uid}/shortlinks/${id}`));
      await deleteDoc(doc(db, "shortlinks", code));
      showToast("Berhasil dihapus!", "success");
      await fetchLinks(); // refresh tabel setelah hapus
    } catch {
      setError("Gagal hapus data.");
      showToast("Gagal hapus data.", "error");
    }
    setLoading(false);
  };

  async function handleSubmit(e: any) {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);
    try {
      if (!user) {
        setError("Anda harus login untuk menggunakan fitur ini.");
        setLoading(false);
        return;
      }
      // Validasi URL
      try {
        new URL(longUrl);
      } catch {
        setError("URL tidak valid.");
        setLoading(false);
        return;
      }
      let code = customCode.trim() || autoCode;
      const isCustom = !!customCode.trim();
      if (!/^([a-zA-Z0-9_-]{3,20})$/.test(code)) {
        setError("Kode harus 3-20 karakter, huruf/angka/underscore/dash.");
        setLoading(false);
        return;
      }
      // Cek apakah user sudah pernah membuat shortlink untuk url asli yang sama
      const userLinksSnap = await getDocs(collection(db, `users/${user.uid}/shortlinks`));
      const alreadyExists = userLinksSnap.docs.some(doc => (doc.data().url === longUrl));
      if (alreadyExists) {
        setError("Anda sudah pernah membuat URL pendek untuk URL asli ini.");
        setLoading(false);
        return;
      }
      const ref = doc(db, "shortlinks", code);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setError("Kode sudah digunakan, pilih kode lain.");
        setLoading(false);
        return;
      }
      await setDoc(ref, { url: longUrl, created: Date.now(), owner: user.uid, email: user.email });
      // Simpan juga ke koleksi user
      await addDoc(collection(db, `users/${user.uid}/shortlinks`), { code, url: longUrl, created: Date.now() });
      setResult({ code, url: longUrl });
      setIsCustomResult(isCustom);
      setLongUrl("");
      setCustomCode("");
      setAutoCode("");
      showToast("URL berhasil dipendekkan!", "success");
    } catch (err) {
      setError("Terjadi kesalahan. Coba lagi.");
      showToast("Terjadi kesalahan. Coba lagi.", "error");
    }
    setLoading(false);
  }

  // Copy to clipboard & toast state
  const [copied, setCopied] = useState<string|false>(false);
  const [, setToast] = useState<{msg: string, type: "success"|"error"} | null>(null);

  function copyToClipboard(text: string, code?: string) {
    navigator.clipboard.writeText(text).then(() => {
      if (code) setCopied(code);
      showToast("URL berhasil disalin ke clipboard!", "success");
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      showToast("Gagal menyalin URL", "error");
    });
  }

  function showToast(msg: string, type: "success"|"error") {
    setToast({msg, type});
    setTimeout(() => setToast(null), 2500);
  }

  return (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-green-100 to-yellow-100 p-4 relative overflow-x-hidden">
      {/* Animated floating particles */}
      {[...Array(20)].map((_, i) => (
        <div key={i} className="particle-modern" style={{
          left: `${Math.random()*100}%`,
          top: `${Math.random()*100}%`,
          animationDelay: `${Math.random()*2}s`,
          animationDuration: `${Math.random()*2+2}s`,
        }} />
      ))}
  <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-xl relative z-10 animate-slideUp border border-green-300 backdrop-blur-lg">
        <div className="flex items-center justify-center mb-4">
          <h1 className="text-3xl font-extrabold text-green-600 animate-glow">🔗 URL Shortener</h1>
        </div>
  <p className="text-green-600 mb-6 text-center animate-fadeIn text-lg">Transformasi URL panjang menjadi singkat dan elegan</p>
        {!user ? (
          <button
            className="w-full bg-gradient-to-r from-green-500 to-yellow-400 hover:from-green-600 hover:to-yellow-500 text-white font-bold py-2 rounded-xl transition mb-4 shadow-lg"
            onClick={handleLogin}
          >Login dengan Google</button>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm text-green-600">
                <i className="fas fa-user-circle text-xl text-green-400"></i>
                <span>Login sebagai <span className="font-bold">{user.displayName || user.email}</span></span>
              </div>
              <button className="text-xs text-yellow-600 underline hover:text-green-600 transition" onClick={handleLogout}><i className="fas fa-sign-out-alt mr-1"></i>Logout</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-3 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400"><i className="fas fa-globe"></i></span>
                <input
                  className="w-full border border-green-300 rounded-xl px-8 py-3 focus:border-green-500 focus:shadow-lg mb-2 transition bg-green-100 text-black placeholder:text-green-400"
                  type="url"
                  placeholder="Tempel URL panjang di sini"
                  value={longUrl}
                  onChange={e => setLongUrl(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3 bg-green-100 border border-green-300 rounded-xl p-3 animate-slideIn">
                <label className="block mb-1 font-semibold text-green-600"><i className="fas fa-edit"></i> Kode Kustom <span className="text-gray-400 font-normal">(opsional)</span></label>
                <div className="relative flex items-center">
                  {/* Base URL modern di kiri */}
                  <div className="text-xs text-green-500 font-mono bg-yellow-50 px-2 py-1 rounded shadow flex items-center gap-1 mr-2">
                    <i className="fas fa-link"></i>
                    https://mahapalanarotama.web.id/s/
                  </div>
                  <span className="absolute left-[140px] top-1/2 -transl</div>ate-y-1/2 text-green-400"><i className="fas fa-hashtag"></i></span>
                  <input
                    ref={customInputRef}
                    className={`w-full border border-green-300 rounded-xl pl-5 pr-5 py-3 focus:border-green-500 focus:shadow-lg transition bg-green-100 text-black ${!customActive && autoCode ? 'placeholder:text-black' : 'placeholder:text-green-400'}`}
                    type="text"
                    placeholder={customActive ? "" : (autoCode ? autoCode : "Kode kustom (opsional)")}
                    value={customCode}
                    onChange={e => setCustomCode(e.target.value)}
                    onFocus={() => setCustomActive(true)}
                    onBlur={() => setCustomActive(false)}
                  />
                </div>
                <div className="text-xs text-green-600 mt-1 flex items-center gap-1"><i className="fas fa-info-circle"></i> Kosongkan untuk kode otomatis. Format: huruf, angka, underscore (_), dan dash (-)</div>
              </div>
              <button
                className={`w-full bg-gradient-to-r from-green-500 to-yellow-400 hover:from-green-600 hover:to-yellow-500 text-white font-bold py-3 rounded-xl transition mb-2 relative overflow-hidden shadow-lg ${loading ? 'opacity-80 pointer-events-none' : ''}`}
                type="submit"
                disabled={loading}
              >
                {loading ? <span className="absolute right-6 top-1/2 -translate-y-1/2 animate-spin"><i className="fas fa-spinner"></i></span> : <i className="fas fa-magic mr-2"></i>}
                {loading ? "Memproses..." : "Pendekkan URL"}
              </button>
            </form>
          </>
        )}
  {error && <div className="result error bg-red-50 border border-red-300 text-red-900 rounded-xl p-3 mt-2 animate-resultSlideIn shadow-sm">{error}</div>}
        {result && (
          <div className="result bg-gradient-to-br from-green-100 via-white to-yellow-100 border border-green-300 rounded-2xl p-4 mt-2 text-center animate-resultSlideIn shadow-lg">
            <div className="font-semibold text-green-600 mb-2 flex items-center justify-center gap-2"><i className="fas fa-check-circle text-green-400"></i> URL Pendek:</div>
            <div className="result-item mb-2 bg-white/80 rounded-xl p-2 shadow-sm">
              <span className="text-green-600 text-xs">URL Asli:</span><br/>
              <span className="break-all text-black">{result.url}</span>
            </div>
            <div className="result-item mb-2 bg-white/80 rounded-xl p-2 shadow-sm">
              <span className="text-green-600 text-xs">URL Pendek:</span><br/>
              <a
                href={`/s/${result.code}`}
                className="short-url-link text-yellow-600 underline font-semibold break-all"
                target="_blank"
                rel="noopener noreferrer"
              >{window.location.origin + "/s/" + result.code}</a>
            </div>
            <div className="result-item mb-2 bg-white/80 rounded-xl p-2 shadow-sm">
              <span className="text-green-600 text-xs">Kode:</span> <span className="font-mono bg-green-100 px-2 py-1 rounded text-green-700">{result.code}</span>
              {isCustomResult ? <span className="text-yellow-600 ml-2">(kustom)</span> : <span className="text-gray-400 ml-2">(otomatis)</span>}
            </div>
            <button
              className={`copy-btn bg-gradient-to-r from-green-500 to-yellow-400 hover:from-green-600 hover:to-yellow-500 text-white px-4 py-2 rounded-xl mt-2 inline-flex items-center gap-2 transition shadow ${copied ? 'copied bg-gray-700' : ''}`}
              onClick={() => copyToClipboard(window.location.origin + "/s/" + result.code)}
            >
              <i className={`fas ${copied ? 'fa-check' : 'fa-copy'}`}></i> {copied ? 'Tersalin!' : 'Salin URL'}
            </button>
          </div>
        )}
        {/* Tabel Data URL Shortener User */}
        {/* Toast notification di bawah halaman */}
  {/* Toast notification di pojok kanan bawah halaman telah dihapus */}
      </div>

      {/* Tabel Data URL Shortener User di luar card utama */}
      {user && (
        <div className="w-full flex justify-center mt-12 animate-slideIn">
          <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-6 border border-green-300">
            <h2 className="text-xl font-bold mb-4 text-green-600 flex items-center gap-2"><i className="fas fa-history text-green-400"></i> Riwayat URL Anda</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-green-300 rounded-2xl shadow-lg">
                <thead>
                  <tr className="bg-gradient-to-r from-green-100 to-yellow-100 text-green-600">
                    <th className="px-3 py-2 border-b">Kode</th>
                    <th className="px-3 py-2 border-b">URL Asli</th>
                    <th className="px-3 py-2 border-b">URL Pendek</th>
                    <th className="px-3 py-2 border-b">Tanggal</th>
                    <th className="px-3 py-2 border-b">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {tableLoading ? (
                    <tr><td colSpan={5} className="text-center py-4">Memuat...</td></tr>
                  ) : userLinks.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-4">Belum ada data.</td></tr>
                  ) : userLinks.map(link => (
                    <tr key={link.id} className="border-b hover:bg-green-50 transition">
                      <td className="px-3 py-2 font-mono text-green-600">{link.code}</td>
                      <td className="px-3 py-2 text-black max-w-[120px] md:max-w-[300px] truncate" style={{whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{link.url}</td>
                      <td className="px-3 py-2 break-all">
                        <div className="flex items-center flex-nowrap w-full">
                          <a
                            href={`/s/${link.code}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-yellow-600 underline break-all truncate"
                            style={{
                              maxWidth: '200px',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              flexShrink: 1
                            }}
                          >
                            {window.location.origin + "/s/" + link.code}
                          </a>
                          <button
                            className={`bg-green-100 text-green-700 px-2 py-1 rounded shadow text-xs flex items-center justify-center ml-2 ${copied === link.code ? 'bg-green-100' : 'hover:bg-green-200'}`}
                            title="Salin URL Pendek"
                            onClick={() => {
                              copyToClipboard(window.location.origin + "/s/" + link.code, link.code);
                            }}
                            style={{minWidth:'32px',minHeight:'32px', flexShrink: 0}}
                          >
                            <span className="material-icons" style={{fontSize:'18px', color: copied === link.code ? '#22c55e' : undefined, transition: 'color 0.2s'}} aria-hidden="true">
                              {copied === link.code ? 'check' : 'content_copy'}
                            </span>
                          </button>
                        </div>
                      </td>
      {/* Tambahan style untuk mobile table dan input */}
      <style>{`
        @import url('https://fonts.googleapis.com/icon?family=Material+Icons');
        .material-icons {
          font-family: 'Material Icons';
          font-weight: normal;
          font-style: normal;
          font-size: 18px;
          line-height: 1;
          letter-spacing: normal;
          text-transform: none;
          display: inline-block;
          white-space: nowrap;
          direction: ltr;
          -webkit-font-feature-settings: 'liga';
          -webkit-font-smoothing: antialiased;
        }
        @media (max-width: 600px) {
          table th, table td { padding: 6px !important; }
          table th { font-size: 13px !important; }
          table td { font-size: 12px !important; }
          a.text-yellow-600 { max-width: 120px !important; }
          input[type="text"] { font-size: 15px !important; padding-left: 12px !important; padding-right: 12px !important; }
        }
      `}</style>
                      <td className="px-3 py-2 text-xs text-green-600">{new Date(link.created).toLocaleString()}</td>
                      <td className="px-3 py-2 flex gap-2">
                        <button className="bg-yellow-400 text-green-900 px-2 py-1 rounded-xl shadow" onClick={() => {setEditId(link.id);setEditCode(link.code);setEditUrl(link.url);setShowEditModal(true);}}><i className="fas fa-edit"></i> Edit</button>
                        <button className="bg-red-400 text-white px-2 py-1 rounded-xl shadow" onClick={() => handleDeleteLink(link.id, link.code)}><i className="fas fa-trash"></i> Hapus</button>
                      </td>
      {/* Modal Edit Data */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-green-300 relative">
            <button className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xl" onClick={() => {setShowEditModal(false);setEditId(null);}}><i className="fas fa-times"></i></button>
            <h3 className="text-xl font-bold text-green-600 mb-4 flex items-center gap-2"><i className="fas fa-edit"></i> Edit Data URL</h3>
            <div className="mb-3">
              <label className="block text-green-700 font-semibold mb-1">Kode</label>
              <input value={editCode} onChange={e => setEditCode(e.target.value)} className="w-full border border-green-300 rounded-xl px-4 py-2 focus:border-green-500 focus:shadow-lg transition bg-green-100 text-black" />
            </div>
            <div className="mb-3">
              <label className="block text-green-700 font-semibold mb-1">URL Asli</label>
              <input value={editUrl} onChange={e => setEditUrl(e.target.value)} className="w-full border border-green-300 rounded-xl px-4 py-2 focus:border-green-500 focus:shadow-lg transition bg-green-100 text-black" />
            </div>
            <div className="flex gap-2 mt-4">
              <button className="bg-green-500 text-white px-4 py-2 rounded-xl shadow font-bold" onClick={() => {handleEditLink(editId!);setShowEditModal(false);}}><i className="fas fa-save"></i> Simpan</button>
              <button className="bg-gray-200 text-black px-4 py-2 rounded-xl shadow font-bold" onClick={() => {setShowEditModal(false);setEditId(null);}}><i className="fas fa-times"></i> Batal</button>
            </div>
          </div>
        </div>
      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modern Animations & styles */}
      <style>{`
        .particle-modern {
          position: absolute;
          width: 10px;
          height: 10px;
          background: linear-gradient(135deg, #bbf7d0 40%, #fef9c3 100%);
          border-radius: 50%;
          animation: floatModern 3s infinite ease-in-out;
          z-index: 1;
          opacity: 0.5;
        }
        @keyframes floatModern {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-24px) rotate(180deg); opacity: 0.8; }
        }
        .animate-slideUp {
          animation: slideUp 0.6s cubic-bezier(.4,2,.6,1);
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-glow {
          animation: glow 2s ease-in-out infinite alternate;
        }
        @keyframes glow {
          from { text-shadow: 0 0 10px #bbf7d0; }
          to { text-shadow: 0 0 20px #fef9c3; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out 0.3s forwards;
          opacity: 0;
        }
        @keyframes fadeIn {
          to { opacity: 1; }
        }
        .animate-slideIn {
          animation: slideIn 0.5s cubic-bezier(.4,2,.6,1);
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-24px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-resultSlideIn {
          animation: resultSlideIn 0.5s cubic-bezier(.4,2,.6,1);
        }
        @keyframes resultSlideIn {
          from { opacity: 0; transform: translateY(24px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .copy-btn.copied {
          background: linear-gradient(135deg, #22c55e, #fde047) !important;
        }
        .toast {
          animation: toastSlideIn 0.3s ease-out, toastSlideOut 0.3s ease-in 2.2s;
        }
        @keyframes toastSlideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes toastSlideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
