import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function ShortRedirectPage() {
  const { shortcode } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function fetchAndRedirect() {
      if (!shortcode) return;
      try {
        const ref = doc(db, "shortlinks", shortcode);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const { url } = snap.data();
          if (url && typeof url === "string") {
            window.location.replace(url);
          } else {
            setError("Data URL tidak valid pada kode ini.");
          }
        } else {
          setError("Kode tidak ditemukan atau sudah dihapus.");
        }
      } catch (e: any) {
        setError("Gagal mengambil data shortlink: " + (e?.message || e));
      }
    }
    fetchAndRedirect();
  }, [shortcode, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100">
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        {error ? (
          <>
            <div className="text-2xl font-bold mb-2 text-red-700">Terjadi Kesalahan</div>
            <div className="text-gray-600">{error}</div>
          </>
        ) : (
          <>
            <div className="text-2xl font-bold mb-2 text-purple-700">🔗 Redirecting...</div>
            <div className="text-gray-600">Mohon tunggu, Anda akan diarahkan ke link tujuan.</div>
          </>
        )}
      </div>
    </div>
  );
}