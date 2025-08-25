import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function ShortRedirectPage() {
  const params = useParams();
  const shortcode = params.shortcode;
  const [, setLocation] = useLocation();

  useEffect(() => {
    async function fetchAndRedirect() {
      try {
        console.log('ShortRedirectPage - shortcode:', shortcode);
        
        if (!shortcode) {
          console.log('No shortcode provided, redirecting to home');
          setLocation("/");
          return;
        }
        
        console.log('Fetching shortlink data for:', shortcode);
        const ref = doc(db, "shortlinks", shortcode);
        const snap = await getDoc(ref);
        
        if (snap.exists()) {
          const data = snap.data();
          const { url } = data;
          console.log('Shortlink found, redirecting to:', url);
          
          if (url) {
            // Menambahkan delay kecil untuk memastikan UI tampil
            setTimeout(() => {
              window.location.href = url;
            }, 500);
          } else {
            console.log('No URL in document, redirecting to home');
            setLocation("/");
          }
        } else {
          console.log('Shortlink not found, redirecting to home');
          setLocation("/");
        }
      } catch (error) {
        console.error('Error fetching shortcode:', error);
        setLocation("/");
      }
    }
    
    fetchAndRedirect().catch((error) => {
      console.error('Unhandled error in fetchAndRedirect:', error);
      setLocation("/");
    });
  }, [shortcode, setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100">
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="text-2xl font-bold mb-2 text-purple-700">🔗 Mengalihkan...</div>
        <div className="text-gray-600">Mohon tunggu, Anda akan diarahkan ke link tujuan.</div>
        <div className="mt-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
        </div>
        {shortcode && (
          <div className="mt-4 text-sm text-gray-500">
            Kode: {shortcode}
          </div>
        )}
      </div>
    </div>
  );
}
