import { useEffect, useState } from "react";

export default function ShortRedirectPage() {
  const [shortcode, setShortcode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        // Ambil shortcode dari URL secara manual
        const path = window.location.pathname || '';
        const pathParts = path.split('/');
        const extractedShortcode = pathParts[2]; // /s/[shortcode]
        
        console.log('Path:', path, 'Extracted shortcode:', extractedShortcode);
        
        if (!mounted) return;
        setShortcode(extractedShortcode);
        
        if (!extractedShortcode) {
          console.log('No shortcode found in path');
          if (mounted) setError('Kode tidak valid');
          setTimeout(() => {
            if (mounted) window.location.href = '/';
          }, 2000);
          return;
        }

        // Dynamic import untuk Firebase
        const { db } = await import("@/lib/firebase");
        const { doc, getDoc } = await import("firebase/firestore");
        
        if (!mounted) return;
        console.log('Fetching shortlink data for:', extractedShortcode);
        
        const ref = doc(db, "shortlinks", extractedShortcode);
        const snap = await getDoc(ref);
        
        if (!mounted) return;
        
        if (snap.exists()) {
          const data = snap.data();
          const url = data?.url;
          console.log('Shortlink found, redirecting to:', url);
          
          if (url && typeof url === 'string') {
            setTimeout(() => {
              if (mounted) {
                console.log('Redirecting to:', url);
                window.location.href = url;
              }
            }, 1000);
          } else {
            console.log('No valid URL in document');
            if (mounted) setError('URL tidak valid');
            setTimeout(() => {
              if (mounted) window.location.href = '/';
            }, 2000);
          }
        } else {
          console.log('Shortlink not found');
          if (mounted) setError('Link tidak ditemukan');
          setTimeout(() => {
            if (mounted) window.location.href = '/';
          }, 2000);
        }
      } catch (error) {
        console.error('Error in ShortRedirectPage:', error);
        if (mounted) {
          setError('Terjadi kesalahan');
          setTimeout(() => {
            if (mounted) window.location.href = '/';
          }, 2000);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    initialize();

    return () => {
      mounted = false;
    };
  }, []);

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
