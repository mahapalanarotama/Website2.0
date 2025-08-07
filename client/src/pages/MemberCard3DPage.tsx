import { Canvas } from '@react-three/fiber';
import { OrbitControls, useTexture } from '@react-three/drei';
import { useLocation } from 'wouter';
import { useEffect, useState, Suspense } from 'react';
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

function Card3D({ frontUrl, backUrl }: { frontUrl: string; backUrl: string }) {
  const textures = useTexture([frontUrl, backUrl]);
  return (
    <group>
      {/* 3D card body with slight thickness */}
      <mesh>
        <boxGeometry args={[3.4, 2.2, 0.06]} />
        {/* 0: right, 1: left, 2: top, 3: bottom, 4: front, 5: back */}
        <meshStandardMaterial attach="material-0" color="#e5e7eb" />
        <meshStandardMaterial attach="material-1" color="#e5e7eb" />
        <meshStandardMaterial attach="material-2" color="#e5e7eb" />
        <meshStandardMaterial attach="material-3" color="#e5e7eb" />
        <meshStandardMaterial attach="material-4" map={textures[0]} />
        <meshStandardMaterial attach="material-5" map={textures[1]} />
      </mesh>
      {/* Overlay plane for front */}
      <mesh position={[0, 0, 0.031]}> {/* slightly above front face */}
        <planeGeometry args={[3.4, 2.2]} />
        <meshBasicMaterial map={textures[0]} transparent />
      </mesh>
      {/* Overlay plane for back */}
      <mesh position={[0, 0, -0.031]} rotation={[0, Math.PI, 0]}> {/* slightly above back face */}
        <planeGeometry args={[3.4, 2.2]} />
        <meshBasicMaterial map={textures[1]} transparent />
      </mesh>
    </group>
  );
}

function Card3DWrapper({ frontUrl, backUrl }: { frontUrl: string; backUrl: string }) {
  return (
    <Suspense fallback={null}>
      <Card3D frontUrl={frontUrl} backUrl={backUrl} />
    </Suspense>
  );
}

export default function MemberCard3DPage() {
  const [params, setParams] = useState<{ frontUrl: string; backUrl: string; fullName: string }>({ frontUrl: '', backUrl: '', fullName: '' });
  const [, setLocation] = useLocation();
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setParams({
      frontUrl: urlParams.get('frontUrl') || '',
      backUrl: urlParams.get('backUrl') || '',
      fullName: urlParams.get('fullName') || '',
    });
    // Lock scroll saat halaman 3D aktif
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Fungsi unduh kartu anggota (depan & belakang)
  const handleDownloadCard = async () => {
    setDownloading(true);
    try {
      // Download depan
      if (params.frontUrl) {
        const response = await fetch(params.frontUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `kartu-anggota-${params.fullName || "depan"}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
      // Download belakang
      if (params.backUrl) {
        const responseBack = await fetch(params.backUrl);
        const blobBack = await responseBack.blob();
        const urlBack = window.URL.createObjectURL(blobBack);
        const linkBack = document.createElement("a");
        linkBack.href = urlBack;
        linkBack.download = `kartu-anggota-belakang.png`;
        document.body.appendChild(linkBack);
        linkBack.click();
        document.body.removeChild(linkBack);
        window.URL.revokeObjectURL(urlBack);
      }
    } catch (e) {
      alert("Gagal mengunduh kartu. Silakan coba lagi.");
    }
    setDownloading(false);
  };

  if (!params.frontUrl || !params.backUrl) {
    return <div className="flex items-center justify-center min-h-screen">URL kartu tidak valid.</div>;
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="sticky top-0 flex flex-col sm:flex-row items-center justify-between gap-2 p-3 sm:p-4 bg-black/70 z-10 w-full">
        <span className="text-white font-bold text-base sm:text-lg text-center w-full sm:w-auto truncate">3D Kartu Anggota: {params.fullName}</span>
        <div className="flex gap-2 w-full sm:w-auto justify-center sm:justify-end">
          <Button
            className="bg-primary text-white w-full sm:w-auto"
            onClick={handleDownloadCard}
            disabled={downloading}
          >
            <Printer className="w-4 h-4 mr-2" />
            {downloading ? "Mengunduh..." : "Unduh Kartu Anggota Untuk Print"}
          </Button>
          <button
            className="text-white bg-gray-800 hover:bg-gray-700 rounded px-4 py-2 w-full sm:w-auto"
            onClick={() => setLocation('/kartu-anggota')}
          >Tutup</button>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <div className="w-full h-[60vh] sm:h-full">
          <Canvas camera={{ position: [0, 0, 6], fov: 50 }} style={{ width: '100vw', height: '100%', minHeight: 320, maxHeight: '100vh', background: 'black' }}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[5, 5, 5]} intensity={0.7} />
            <Card3DWrapper frontUrl={params.frontUrl} backUrl={params.backUrl} />
            <OrbitControls enablePan={false} />
          </Canvas>
        </div>
      </div>
    </div>
  );
}
