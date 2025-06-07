import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { getMemberByField } from "@/hooks/use-members";

interface MemberDetail {
  fullName: string;
  fieldName: string;
  batchName: string;
  batchYear: number;
  registrationNumber: string;
  membershipStatus: string;
  photoUrl: string;
}

export default function MemberCardDetailPage() {
  useLocation();
  const [member, setMember] = useState<MemberDetail | null>(null);
  const [loading, setLoading] = useState(true);
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
        });
      } else {
        setMember(null);
      }
      setLoading(false);
    });
  }, [type, input]);

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
    <div className="max-w-5xl mx-auto p-4">
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-center mb-6">Verifikasi Kartu Anggota</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Hanya menampilkan gambar kartu dari URL KTA Firestore */}
          <div className="flex flex-col items-center justify-center w-full">
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
          <div>
            <h3 className="text-xl font-semibold mb-4">Detail Anggota</h3>
            <div className="divide-y">
              <div className="flex justify-between py-2"><span className="font-medium">Nama Lengkap</span><span>{member.fullName}</span></div>
              <div className="flex justify-between py-2"><span className="font-medium">Nomor Registrasi</span><span>{member.registrationNumber}</span></div>
              <div className="flex justify-between py-2"><span className="font-medium">Nama Lapangan</span><span>{member.fieldName}</span></div>
              <div className="flex justify-between py-2"><span className="font-medium">Nama Angkatan</span><span>{member.batchName}</span></div>
              <div className="flex justify-between py-2"><span className="font-medium">Tahun Angkatan</span><span>{member.batchYear}</span></div>
              <div className="flex justify-between py-2"><span className="font-medium">Keanggotaan</span><span>{member.membershipStatus}</span></div>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center mt-8 text-xs text-gray-500">
          <span>© {new Date().getFullYear()} Mahapala Narotama</span>
          <span>www.mahapalanarotama.web.id</span>
        </div>
      </Card>
    </div>
  );
}
