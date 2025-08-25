import { useState, useEffect } from "react";
import { setDoc, doc, getDoc, collection, addDoc } from "firebase/firestore";
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
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  async function handleLogin() {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  }

  async function handleLogout() {
    await signOut(auth);
  }

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
      let code = customCode.trim() || generateShortCode();
      if (!/^([a-zA-Z0-9_-]{3,20})$/.test(code)) {
        setError("Kode harus 3-20 karakter, huruf/angka/underscore/dash.");
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
      showToast("URL berhasil dipendekkan!", "success");
    } catch (err) {
      setError("Terjadi kesalahan. Coba lagi.");
      showToast("Terjadi kesalahan. Coba lagi.", "error");
    }
    setLoading(false);
  }

  // Copy to clipboard & toast state
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<{msg: string, type: "success"|"error"} | null>(null);

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100 p-4 relative overflow-x-hidden">
      {/* Animated background particles */}
      {[...Array(30)].map((_, i) => (
        <div key={i} className="particle" style={{
          left: `${Math.random()*100}%`,
          top: `${Math.random()*100}%`,
          animationDelay: `${Math.random()*3}s`,
          animationDuration: `${Math.random()*3+2}s`,
        }} />
      ))}
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative z-10 animate-slideUp border border-white/30 backdrop-blur">
        <h1 className="text-2xl font-bold mb-4 text-purple-700 animate-glow">🔗 URL Shortener</h1>
        <p className="text-gray-500 mb-6 text-center animate-fadeIn">Transformasi URL panjang menjadi singkat dan elegan</p>
        {!user ? (
          <button
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded transition mb-4"
            onClick={handleLogin}
          >Login dengan Google</button>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-700">Login sebagai <span className="font-bold">{user.displayName || user.email}</span></div>
              <button className="text-xs text-purple-700 underline" onClick={handleLogout}>Logout</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-3 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400"><i className="fas fa-globe"></i></span>
                <input
                  className="w-full border rounded px-8 py-2 focus:border-purple-400 focus:shadow mb-2 transition"
                  type="url"
                  placeholder="Tempel URL panjang di sini"
                  value={longUrl}
                  onChange={e => setLongUrl(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3 bg-purple-50 border border-purple-100 rounded p-3 animate-slideIn">
                <label className="block mb-1 font-semibold text-gray-700"><i className="fas fa-edit"></i> Kode Kustom <span className="text-gray-400 font-normal">(opsional)</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400"><i className="fas fa-hashtag"></i></span>
                  <input
                    className="w-full border rounded px-8 py-2 focus:border-purple-400 focus:shadow transition"
                    type="text"
                    placeholder="Kode kustom (opsional)"
                    value={customCode}
                    onChange={e => setCustomCode(e.target.value)}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1"><i className="fas fa-info-circle"></i> Kosongkan untuk kode otomatis. Format: huruf, angka, underscore (_), dan dash (-)</div>
              </div>
              <button
                className={`w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-bold py-2 rounded transition mb-2 relative overflow-hidden ${loading ? 'opacity-80 pointer-events-none' : ''}`}
                type="submit"
                disabled={loading}
              >
                {loading ? <span className="absolute right-6 top-1/2 -translate-y-1/2 animate-spin"><i className="fas fa-spinner"></i></span> : <i className="fas fa-magic mr-2"></i>}
                {loading ? "Memproses..." : "Pendekkan URL"}
              </button>
            </form>
          </>
        )}
        {error && <div className="result error bg-red-100 border border-red-300 text-red-700 rounded p-3 mt-2 animate-resultSlideIn">{error}</div>}
        {result && (
          <div className="result bg-green-100 border border-green-300 rounded p-3 mt-2 text-center animate-resultSlideIn">
            <div className="font-semibold text-green-700 mb-2"><i className="fas fa-check-circle"></i> URL Pendek:</div>
            <div className="result-item mb-2 bg-white/70 rounded p-2">
              <span className="text-gray-500 text-xs">URL Asli:</span><br/>
              <span className="break-all text-gray-700">{result.url}</span>
            </div>
            <div className="result-item mb-2 bg-white/70 rounded p-2">
              <span className="text-gray-500 text-xs">URL Pendek:</span><br/>
              <a
                href={`/s/${result.code}`}
                className="short-url-link text-purple-700 underline font-semibold break-all"
                target="_blank"
                rel="noopener noreferrer"
              >{window.location.origin + "/s/" + result.code}</a>
            </div>
            <div className="result-item mb-2 bg-white/70 rounded p-2">
              <span className="text-gray-500 text-xs">Kode:</span> <span className="font-mono bg-gray-100 px-2 py-1 rounded text-gray-700">{result.code}</span>
              {customCode.trim() ? <span className="text-green-600 ml-2">(kustom)</span> : <span className="text-gray-400 ml-2">(otomatis)</span>}
            </div>
            <button
              className={`copy-btn bg-gradient-to-r from-green-500 to-teal-400 hover:from-green-600 hover:to-teal-500 text-white px-4 py-2 rounded mt-2 inline-flex items-center gap-2 transition ${copied ? 'copied bg-gray-500' : ''}`}
              onClick={() => copyToClipboard(window.location.origin + "/s/" + result.code)}
            >
              <i className={`fas ${copied ? 'fa-check' : 'fa-copy'}`}></i> {copied ? 'Tersalin!' : 'Salin URL'}
            </button>
          </div>
        )}
        {/* Toast notification */}
        {toast && (
          <div className={`toast fixed bottom-8 right-8 px-5 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-toastSlideIn ${toast.type === 'error' ? 'bg-gradient-to-r from-red-500 to-pink-400' : 'bg-gradient-to-r from-green-500 to-teal-400'} text-white`}>
            <i className={`fas ${toast.type === 'error' ? 'fa-exclamation-triangle' : 'fa-check'}`}></i>
            <span>{toast.msg}</span>
          </div>
        )}
      </div>
      {/* Animations & styles */}
      <style>{`
        .particle {
          position: absolute;
          width: 6px;
          height: 6px;
          background: rgba(102, 126, 234, 0.15);
          border-radius: 50%;
          animation: float 3s infinite ease-in-out;
          z-index: 1;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 0.8; }
        }
        .animate-slideUp {
          animation: slideUp 0.6s ease-out;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-glow {
          animation: glow 2s ease-in-out infinite alternate;
        }
        @keyframes glow {
          from { text-shadow: 0 0 10px rgba(102, 126, 234, 0.5); }
          to { text-shadow: 0 0 20px rgba(118, 75, 162, 0.8); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out 0.3s forwards;
          opacity: 0;
        }
        @keyframes fadeIn {
          to { opacity: 1; }
        }
        .animate-slideIn {
          animation: slideIn 0.5s ease-out;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-resultSlideIn {
          animation: resultSlideIn 0.5s ease-out;
        }
        @keyframes resultSlideIn {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .copy-btn.copied {
          background: linear-gradient(135deg, #6c757d, #5a6268) !important;
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
