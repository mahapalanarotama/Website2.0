import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function ShortRedirectPage() {
  const [, setLocation] = useLocation();
  const [shortcode, setShortcode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Ambil shortcode dari URL secara manual
    const path = window.location.pathname;
    const pathParts = path.split('/');
    const extractedShortcode = pathParts[2]; // /s/[shortcode]
    
    console.log('Path:', path, 'Extracted shortcode:', extractedShortcode);
    setShortcode(extractedShortcode);
    
    if (!extractedShortcode) {
      console.log('No shortcode found in path');
      setError('Kode tidak valid');
      setTimeout(() => setLocation("/"), 2000);
      return;
    }

    async function fetchAndRedirect() {
      try {
        setIsLoading(true);
        console.log('Fetching shortlink data for:', extractedShortcode);
        
        const ref = doc(db, "shortlinks", extractedShortcode);
        const snap = await getDoc(ref);
        
        if (snap.exists()) {
          const data = snap.data();
          const { url } = data;
          console.log('Shortlink found, redirecting to:', url);
          
          if (url) {
            setError(null);
            setTimeout(() => {
              console.log('Redirecting to:', url);
              window.location.href = url;
            }, 1000);
          } else {
            console.log('No URL in document');
            setError('URL tidak ditemukan');
            setTimeout(() => setLocation("/"), 2000);
          }
        } else {
          console.log('Shortlink not found');
          setError('Link tidak ditemukan');
          setTimeout(() => setLocation("/"), 2000);
        }
      } catch (error) {
        console.error('Error fetching shortcode:', error);
        setError('Terjadi kesalahan');
        setTimeout(() => setLocation("/"), 2000);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchAndRedirect();
  }, [setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100">
      <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md w-full mx-4">
        {error ? (
          <>
            <div className="text-2xl font-bold mb-2 text-red-600">❌ {error}</div>
            <div className="text-gray-600 mb-4">Anda akan dialihkan ke halaman utama...</div>
            <div className="text-sm text-gray-500">Kode: {shortcode || 'tidak valid'}</div>
          </>
        ) : (
          <>
            <div className="text-2xl font-bold mb-2 text-purple-700">🔗 Mengalihkan...</div>
            <div className="text-gray-600 mb-4">Mohon tunggu, Anda akan diarahkan ke link tujuan.</div>
            {isLoading && (
              <div className="mt-4">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
              </div>
            )}
            {shortcode && (
              <div className="mt-4 text-sm text-gray-500">
                Kode: {shortcode}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
