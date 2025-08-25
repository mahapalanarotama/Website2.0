import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function ShortRedirectPage() {
  const { shortcode } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchAndRedirect() {
      try {
        if (!shortcode) {
          navigate("/", { replace: true });
          return;
        }
        
        const ref = doc(db, "shortlinks", shortcode);
        const snap = await getDoc(ref);
        
        if (snap.exists()) {
          const { url } = snap.data();
          if (url) {
            window.location.replace(url);
          } else {
            navigate("/", { replace: true });
          }
        } else {
          navigate("/", { replace: true });
        }
      } catch (error) {
        console.error('Error fetching shortcode:', error);
        navigate("/", { replace: true });
      }
    }
    
    fetchAndRedirect().catch((error) => {
      console.error('Unhandled error in fetchAndRedirect:', error);
      navigate("/", { replace: true });
    });
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
