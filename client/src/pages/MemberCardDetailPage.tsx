import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { getMemberByField } from "@/hooks/use-members";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

interface MemberDetail {
  fullName: string;
  fieldName: string;
  batchName: string;
  batchYear: number;
  registrationNumber: string;
  membershipStatus: string;
  photoUrl: string;
  statusMahasiswa?: string;
}

export default function MemberCardDetailPage() {
  useLocation();
  const [member, setMember] = useState<MemberDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const params = new URLSearchParams(window.location.search);
  const type = params.get("type") || "fieldName";
  const input = params.get("input") || "";

  useEffect(() => {
    setLoading(true);
    getMemberByField(type, input).then((data) => {
      if (data) {
        setMember({
          fullName: data.fullName,
          fieldName: data.fieldName,
          batchName: data.batchName,
          batchYear: data.batchYear,
          registrationNumber: data.registrationNumber,
          membershipStatus: data.membershipStatus,
          photoUrl: data.photoUrl,
          statusMahasiswa: data.statusMahasiswa,
        });
      } else {
        setMember(null);
      }
      setLoading(false);
    });
  }, [type, input]);

  // Fungsi download kartu anggota (depan & belakang)
  const handleDownloadCard = async () => {
    if (!member?.photoUrl) return;
    setDownloading(true);
    try {
      // Download depan
      const response = await fetch(member.photoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `kartu-anggota-${member.registrationNumber || member.fieldName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      // Download belakang
      const backUrl = "https://raw.githubusercontent.com/mahapalanarotama/OfficialWebsite/refs/heads/main/Img/back.png";
      const responseBack = await fetch(backUrl);
      const blobBack = await responseBack.blob();
      const urlBack = window.URL.createObjectURL(blobBack);
      const linkBack = document.createElement("a");
      linkBack.href = urlBack;
      linkBack.download = `kartu-anggota-${member.registrationNumber || member.fieldName}-belakang.png`;
      document.body.appendChild(linkBack);
      linkBack.click();
      document.body.removeChild(linkBack);
      window.URL.revokeObjectURL(urlBack);
    } catch (e) {
      alert("Gagal mengunduh kartu. Silakan coba lagi.");
    }
    setDownloading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span>Loading...</span>
      </div>
    );
  }
  if (!member) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span>Data anggota tidak ditemukan.</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-2 sm:p-4">
      <Card className="p-2 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6">Verifikasi Kartu Anggota</h2>
        {/* Tombol unduh tampil jika ada foto KTA */}
        {member.photoUrl && (
          <div className="flex justify-center mb-6">
            <Button
              className="gap-2 bg-primary text-white"
              onClick={handleDownloadCard}
              disabled={downloading}
            >
              <Printer className="w-4 h-4" />
              {downloading ? "Mengunduh..." : "Unduh Kartu Anggota Untuk Print"}
            </Button>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 mb-4 sm:mb-8">
          {/* Bagian depan kartu */}
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
          {/* Detail tabel */}
          <div className="w-full sm:w-1/2">
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Detail Anggota</h3>
            <div className="divide-y text-xs sm:text-base">
              <div className="flex justify-between py-2"><span className="font-medium">Nama Lengkap</span><span>{member.fullName}</span></div>
              <div className="flex justify-between py-2"><span className="font-medium">Nomor Registrasi</span><span>{member.registrationNumber}</span></div>
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
    </div>
  );
}
