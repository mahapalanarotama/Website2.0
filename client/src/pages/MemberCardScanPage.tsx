import { useState } from "react";
import { useEffect, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { getMemberByField } from "../hooks/use-members";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function MemberCardScanPage() {
  const [regNum, setRegNum] = useState("");
  const [member, setMember] = useState<any>(null);
  const [error, setError] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    let active = true;
    codeReader.decodeFromVideoDevice(undefined, videoRef.current!, async (result, err) => {
      if (!active) return;
      if (result) {
        const data = result.getText();
        setRegNum(data);
        try {
          const memberData = await getMemberByField("nomorregistrasi", data);
          if (memberData) {
            setMember(memberData);
            setError("");
          } else {
            setMember(null);
            setError("Data anggota tidak ditemukan!");
          }
        } catch {
          setMember(null);
          setError("Gagal mengambil data anggota!");
        }
      } else if (err && err.name && !err.name.includes("NotFoundException")) {
        setError("Gagal membaca barcode: " + err);
      }
    });
    return () => {
      active = false;
      // No reset/stop needed, camera will be released automatically
    };
  }, []);

  return (
    <div className="max-w-5xl mx-auto py-10 p-2 sm:p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Scan Barcode Kartu Anggota</h1>
      <div className="flex justify-center mb-8">
        <div className="w-full sm:w-96 h-64 border rounded flex items-center justify-center bg-black">
          <video ref={videoRef} className="w-full h-full object-cover" />
        </div>
      </div>
      {regNum && (
        <div className="mt-4 text-center">
          <span className="font-semibold">Nomor Registrasi Pokok:</span> {regNum}
        </div>
      )}
      {member ? (
        <Card className="p-2 sm:p-6 mt-8">
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6">Verifikasi Kartu Anggota</h2>
          {/* Tombol unduh dihapus, hanya tampil di halaman detail kartu anggota */}
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 mb-4 sm:mb-8">
            <div className="flex flex-col items-center justify-center w-full sm:w-1/2 relative" id="member-card-front">
              {member.statusMahasiswa === 'Aktif' && (
                <motion.span
                  initial={{ opacity: 0.7, textShadow: '0 0 0px #22c55e' }}
                  animate={{
                    opacity: [0.7, 1, 0.7],
                    textShadow: [
                      '0 0 0px #22c55e',
                      '0 0 12px #22c55e, 0 0 24px #16a34a',
                      '0 0 0px #22c55e'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute top-3 right-2 z-10 px-3 py-1 rounded-full font-bold text-sm select-none"
                  style={{ color: '#22c55e' }}
                >
                  • Mahasiswa Aktif
                </motion.span>
              )}
              {member.photoUrl ? (
                <div className="p-2 border-2 border-gray-400 rounded-lg">
                  <img
                    src={member.photoUrl}
                    alt="Kartu Anggota"
                    className="rounded-lg shadow-lg max-w-full h-auto"
                  />
                </div>
              ) : (
                <div className="p-2 border-2 border-gray-400 rounded-lg w-full flex items-center justify-center min-h-[275px]">
                  <span className="text-gray-400 text-center">Kartu anggota tidak tersedia.</span>
                </div>
              )}
            </div>
            <div className="w-full sm:w-1/2">
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Detail Anggota</h3>
              <div className="divide-y text-xs sm:text-base">
                <div className="flex justify-between py-2"><span className="font-medium">Nama Lengkap</span><span>{member.fullName}</span></div>
                <div className="flex justify-between py-2"><span className="font-medium">Nomor Registrasi</span><span>{member.nomorregistrasi || member.registrationNumber}</span></div>
                <div className="flex justify-between py-2"><span className="font-medium">Nama Lapangan</span><span>{member.fieldName}</span></div>
                <div className="flex justify-between py-2"><span className="font-medium">Nama Angkatan</span><span>{member.batchName}</span></div>
                <div className="flex justify-between py-2"><span className="font-medium">Tahun Angkatan</span><span>{member.batchYear}</span></div>
                <div className="flex justify-between py-2"><span className="font-medium">Keanggotaan</span><span>{member.membershipStatus}</span></div>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 sm:mt-8 text-xs text-gray-500 gap-2">
            <span>© {new Date().getFullYear()} Mahapala Narotama</span>
            <span>www.mahapalanarotama.web.id</span>
          </div>
        </Card>
      ) : error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : null}
    </div>
  );
}
