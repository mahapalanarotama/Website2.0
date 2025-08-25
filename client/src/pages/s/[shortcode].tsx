import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function ShortRedirectPage() {
  const { shortcode } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchAndRedirect() {
      if (!shortcode) return;
  const ref = doc(db, "shortlinks", shortcode);
  const snap = await getDoc(ref);
      if (snap.exists()) {
        const { url } = snap.data();
        window.location.replace(url);
      } else {
        navigate("/shortener-notfound", { replace: true });
      }
    }
    fetchAndRedirect();
  }, [shortcode, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100">
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="text-2xl font-bold mb-2 text-purple-700">🔗 Redirecting...</div>
        <div className="text-gray-600">Mohon tunggu, Anda akan diarahkan ke link tujuan.</div>
      </div>
    </div>
  );
}
