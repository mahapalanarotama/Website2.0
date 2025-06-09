import { Canvas } from '@react-three/fiber';
import { OrbitControls, useTexture } from '@react-three/drei';
import { useLocation } from 'wouter';
import { useEffect, useState, Suspense } from 'react';

function Card3D({ frontUrl, backUrl }: { frontUrl: string; backUrl: string }) {
  const textures = useTexture([frontUrl, backUrl]);
  return (
    <group>
      <mesh>
        <boxGeometry args={[3.4, 2.2, 0.05]} />
        {/* 0: right, 1: left, 2: top, 3: bottom, 4: front, 5: back */}
        <meshStandardMaterial color="#e5e7eb" />
        <meshStandardMaterial color="#e5e7eb" />
        <meshStandardMaterial color="#e5e7eb" />
        <meshStandardMaterial color="#e5e7eb" />
        <meshStandardMaterial map={textures[0]} />
        <meshStandardMaterial map={textures[1]} />
      </mesh>
      {/* Overlay plane di sisi depan, ukurannya sama persis dengan box */}
      <mesh position={[0, 0, 0.0255]}>
        <planeGeometry args={[3.4, 2.2]} />
        <meshBasicMaterial map={textures[0]} transparent />
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

  if (!params.frontUrl || !params.backUrl) {
    return <div className="flex items-center justify-center min-h-screen">URL kartu tidak valid.</div>;
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 bg-black/70">
        <span className="text-white font-bold text-lg">3D Kartu Anggota: {params.fullName}</span>
        <button
          className="text-white bg-gray-800 hover:bg-gray-700 rounded px-4 py-2"
          onClick={() => setLocation('/kartu-anggota')}
        >Tutup</button>
      </div>
      <div className="flex-1">
        <Canvas camera={{ position: [0, 0, 6], fov: 50 }} style={{ width: '100vw', height: '100vh' }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 5, 5]} intensity={0.7} />
          <Card3DWrapper frontUrl={params.frontUrl} backUrl={params.backUrl} />
          <OrbitControls enablePan={false} />
        </Canvas>
      </div>
    </div>
  );
}
