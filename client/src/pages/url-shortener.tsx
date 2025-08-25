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
    } catch (err) {
      setError("Terjadi kesalahan. Coba lagi.");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100 p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-purple-700">🔗 URL Shortener</h1>
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
              <input
                className="w-full border rounded px-3 py-2 mb-3"
                type="url"
                placeholder="Tempel URL panjang di sini"
                value={longUrl}
                onChange={e => setLongUrl(e.target.value)}
                required
              />
              <input
                className="w-full border rounded px-3 py-2 mb-3"
                type="text"
                placeholder="Kode kustom (opsional)"
                value={customCode}
                onChange={e => setCustomCode(e.target.value)}
              />
              <button
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded transition mb-2"
                type="submit"
                disabled={loading}
              >{loading ? "Memproses..." : "Pendekkan URL"}</button>
            </form>
          </>
        )}
        {error && <div className="text-red-600 mb-2">{error}</div>}
        {result && (
          <div className="bg-green-100 rounded p-3 mt-2 text-center">
            <div className="font-semibold text-green-700">URL Pendek:</div>
            <a
              href={`/s/${result.code}`}
              className="text-purple-700 underline break-all"
              target="_blank"
              rel="noopener noreferrer"
            >{window.location.origin + "/s/" + result.code}</a>
          </div>
        )}
      </div>
    </div>
  );
}
