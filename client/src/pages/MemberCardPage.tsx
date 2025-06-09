import { useState, useEffect, useRef } from "react";
import { useMembers } from "@/hooks/use-members";
import { MemberCard } from "@/components/MemberCard";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, IdCard, Maximize2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";

// AnimatedNumber component
function AnimatedNumber({ value, duration = 1000, className = "" }: { value: number, duration?: number, className?: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  const raf = useRef<number>();
  const startTimestamp = useRef<number>();
  const startValue = useRef<number>(0);

  useEffect(() => {
    startValue.current = 0;
    setDisplayValue(0);
    function animate(ts: number) {
      if (!startTimestamp.current) startTimestamp.current = ts;
      const progress = Math.min((ts - startTimestamp.current) / duration, 1);
      setDisplayValue(Math.floor(progress * (value - startValue.current) + startValue.current));
      if (progress < 1) {
        raf.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    }
    raf.current = requestAnimationFrame(animate);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      startTimestamp.current = undefined;
    };
  }, [value, duration]);

  return <span className={className}>{displayValue.toLocaleString()}</span>;
}

// Tambahkan komponen 3D Card Popup
function Card3DPopup({ open, onClose, frontUrl, backUrl, fullName }: { open: boolean, onClose: () => void, frontUrl: string, backUrl: string, fullName: string }) {
  const [isFront, setIsFront] = useState(true);
  useEffect(() => { if (open) setIsFront(true); }, [open]);
  const handleFullscreen = () => {
    const params = new URLSearchParams({ frontUrl, backUrl, fullName });
    window.open(`/member-card-3d?${params.toString()}`, '_blank');
  };
  return (
    open ? (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="absolute inset-0" onClick={onClose} />
        <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl bg-white/10 p-6 flex flex-col items-center">
          <div className="w-[340px] h-[220px] mb-4" style={{ perspective: 1200 }}>
            <div
              className={`relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] ${isFront ? '' : '[transform:rotateY(180deg)]'}`}
            >
              <img
                src={frontUrl}
                alt={fullName + ' - depan'}
                className="absolute w-full h-full object-cover rounded-2xl shadow-lg bg-white [backface-visibility:hidden]"
                style={{ backfaceVisibility: 'hidden', aspectRatio: '340/220' }}
              />
              <img
                src={backUrl}
                alt={fullName + ' - belakang'}
                className="absolute w-full h-full object-cover rounded-2xl shadow-lg bg-white [backface-visibility:hidden]"
                style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden', aspectRatio: '340/220' }}
              />
            </div>
            <button
              className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full p-2 shadow"
              title="Tampilkan 3D Fullscreen"
              onClick={handleFullscreen}
            >
              <Maximize2 className="w-5 h-5 text-gray-700" />
            </button>
          </div>
          <div className="flex gap-4">
            <Button variant="secondary" onClick={() => setIsFront(!isFront)}>
              {isFront ? 'Lihat Belakang' : 'Lihat Depan'}
            </Button>
            <Button variant="outline" onClick={onClose}>Tutup</Button>
          </div>
        </div>
      </div>
    ) : null
  );
}

// Tambahkan state dan komponen BirthdayCountdown dummy agar error hilang
type BirthdayCountdownProps = { name: string; onClose: () => void };
function BirthdayCountdown({ onClose }: BirthdayCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{days: number, hours: number, minutes: number, seconds: number} | null>(null);

  useEffect(() => {
    function getNextAnniversary() {
      const now = new Date();
      const year = now.getMonth() > 0 || (now.getMonth() === 0 && now.getDate() > 26) ? now.getFullYear() + 1 : now.getFullYear();
      return new Date(year, 0, 26, 0, 0, 0, 0); // Jan = 0
    }
    function calculateTimeLeft() {
      const now = new Date();
      const nextAnniv = getNextAnniversary();
      const diff = nextAnniv.getTime() - now.getTime();
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      return { days, hours, minutes, seconds };
    }
    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full text-center">
        <h2 className="text-xl font-bold mb-4">Countdown Ulang Tahun</h2>
        {timeLeft ? (
          <div className="mb-4 text-2xl font-mono flex justify-center gap-2">
            <span>{timeLeft.days} <span className="text-xs font-normal">hari</span></span>
            <span>:</span>
            <span>{String(timeLeft.hours).padStart(2, '0')}<span className="text-xs font-normal">j</span></span>
            <span>:</span>
            <span>{String(timeLeft.minutes).padStart(2, '0')}<span className="text-xs font-normal">m</span></span>
            <span>:</span>
            <span>{String(timeLeft.seconds).padStart(2, '0')}<span className="text-xs font-normal">d</span></span>
          </div>
        ) : (
          <p className="mb-4">Menghitung...</p>
        )}
        <p className="mb-4">
          Menuju ulang tahun <b>Mahapala Narotama</b> yang ke{" "}
          {
            (() => {
              const now = new Date();
              const orgStartYear = 2017;
              const nextYear = now.getMonth() > 0 || (now.getMonth() === 0 && now.getDate() > 26)
                ? now.getFullYear() + 1
                : now.getFullYear();
              return nextYear - orgStartYear;
            })()
          }
          {" "}pada tanggal 26 Januari {(() => {
            const now = new Date();
            return now.getMonth() > 0 || (now.getMonth() === 0 && now.getDate() > 26)
              ? now.getFullYear() + 1
              : now.getFullYear();
          })()}
        </p>
        <Button onClick={onClose}>Tutup</Button>
      </div>
    </div>
  );
}

export default function MemberCardPage() {
  const [searchType, setSearchType] = useState<string>("fullName");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showSearch, setShowSearch] = useState<boolean>(true);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [photoDialog, setPhotoDialog] = useState<{ open: boolean; photoUrl: string; fullName: string; zoom?: boolean }>(
    { open: false, photoUrl: '', fullName: '', zoom: false }
  );
  const [card3DPopup, setCard3DPopup] = useState<{ open: boolean; frontUrl: string; backUrl: string; fullName: string }>(
    { open: false, frontUrl: '', backUrl: '', fullName: '' }
  );
  const [showBirthdayCountdown, setShowBirthdayCountdown] = useState(false);
  
  const { data: members, isLoading } = useMembers();
  
  const handleSearch = () => {
    // This would trigger a search if needed, but we're filtering on the client side
    // If we were querying a large dataset, we'd submit this to the backend
  };
  
  
  const handleBackToSearch = () => {
    setSelectedMemberId(null);
    setShowSearch(true);
  };
  
  const filteredMembers = members?.filter(member => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    switch (searchType) {
      case 'fullName':
        return member.fullName.toLowerCase().includes(query);
      case 'batchYear':
        return member.batchYear.toString().includes(query);
      case 'registrationNumber':
        return member.registrationNumber.toLowerCase().includes(query);
      default:
        return true;
    }
  });
  
  const selectedMember = members?.find(member => member.id === selectedMemberId);

  // Dashboard calculations
  const orgStartDate = new Date(2017, 0, 26); // 26 Januari 2017
  const today = new Date();
  const diffYears = today.getFullYear() - orgStartDate.getFullYear();
  const diffMonths = today.getMonth() - orgStartDate.getMonth();
  const diffDays = today.getDate() - orgStartDate.getDate();
  let ageString = `${diffYears} tahun`;
  if (diffMonths > 0 || (diffMonths === 0 && diffDays >= 0)) {
    ageString = `${diffYears} tahun\n${diffMonths >= 0 ? diffMonths : 12 + diffMonths} bulan`;
  } else if (diffYears > 0) {
    ageString = `${diffYears - 1} tahun\n${12 + diffMonths} bulan`;
  }

  const totalMembers = members?.length || 0;
  const uniqueBatches = members ? Array.from(new Set(members.map(m => m.batchName))).length : 0;
  const totalMale = members ? members.filter(m => (m.gender || '').toLowerCase() === 'laki-laki' || (m.gender || '').toLowerCase() === 'l' || (m.gender || '').toLowerCase() === 'male').length : 0;
  const totalFemale = members ? members.filter(m => (m.gender || '').toLowerCase() === 'perempuan' || (m.gender || '').toLowerCase() === 'p' || (m.gender || '').toLowerCase() === 'female').length : 0;

  return (
    <>
      <section id="kartu-anggota" className="py-12 bg-white">
        <div className="container mx-auto px-4">
          {/* DASHBOARD */}
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-10 text-center">
            <div className="bg-green-50 rounded-lg p-4 flex flex-col items-center justify-center text-center shadow h-full relative">
              {/* Icon countdown di pojok kanan atas */}
              <button
                type="button"
                className="absolute top-2 right-2 p-1 rounded-full hover:bg-green-100 transition"
                aria-label="Lihat hitung mundur ulang tahun"
                onClick={() => setShowBirthdayCountdown(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7c0-1.105.895-2 2-2s2 .895 2 2" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7c0-1.105-.895-2-2-2s-2 .895-2 2" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v2" />
                </svg>
              </button>
              <span className="text-xs text-gray-500 mb-1">Umur Organisasi</span>
              <span className="text-2xl font-bold text-green-700 whitespace-pre-line">{ageString}</span>
              <span className="text-xs text-gray-400 mt-1">Sejak 26 Januari 2017</span>
              {/* Birthday Countdown Popup */}
              {showBirthdayCountdown && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <div className="absolute inset-0" onClick={() => setShowBirthdayCountdown(false)} />
                <div className="relative z-10 bg-white rounded-xl shadow-lg p-8 flex flex-col items-center min-w-[320px]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-pink-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7c0-1.105.895-2 2-2s2 .895 2 2" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7c0-1.105-.895-2-2-2s-2 .895-2 2" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v2" />
                </svg>
                <BirthdayCountdown name="Organisasi" onClose={() => setShowBirthdayCountdown(false)} />
                <Button className="mt-4" variant="outline" onClick={() => setShowBirthdayCountdown(false)}>
                  Tutup
                </Button>
                </div>
              </div>
              )}
            </div>
            <div className="bg-blue-50 rounded-lg p-4 flex flex-col items-center justify-center text-center shadow h-full">
              <span className="text-s text-gray-500 mb-1">Jumlah Anggota</span>
              <AnimatedNumber value={totalMembers} className="text-2xl font-bold text-blue-700" />
              <span className="text-s text-gray-400 mt-1">Total anggota terdaftar</span>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 flex flex-col items-center justify-center text-center shadow h-full">
              <span className="text-s text-gray-500 mb-1">Jumlah Angkatan</span>
              <AnimatedNumber value={uniqueBatches} className="text-2xl font-bold text-yellow-700" />
              <span className="text-s text-gray-400 mt-1">Total Angkatan</span>
            </div>
            <div className="bg-emerald-50 rounded-lg p-4 flex flex-col items-center justify-center text-center shadow h-full">
              <span className="text-s text-gray-500 mb-1">Anggota Penuh</span>
              <AnimatedNumber value={members ? members.filter(m => m.membershipStatus === 'Anggota Penuh').length : 0} className="text-2xl font-bold text-emerald-700" />
              <span className="text-s text-gray-400 mt-1">Total anggota penuh</span>
            </div>
            <div className="bg-lime-50 rounded-lg p-4 flex flex-col items-center justify-center text-center shadow h-full">
              <span className="text-s text-gray-500 mb-1">Anggota Muda</span>
              <AnimatedNumber value={members ? members.filter(m => m.membershipStatus === 'Anggota Muda').length : 0} className="text-2xl font-bold text-lime-700" />
              <span className="text-s text-gray-400 mt-1">Total anggota muda</span>
            </div>
            <div className="bg-indigo-50 rounded-lg p-4 flex flex-col items-center justify-center text-center shadow h-full">
              <span className="text-s text-gray-500 mb-1">Anggota Laki-laki</span>
              <AnimatedNumber value={totalMale} className="text-2xl font-bold text-indigo-700" />
              <span className="text-s text-gray-400 mt-1">Total anggota laki-laki</span>
            </div>
            <div className="bg-pink-50 rounded-lg p-4 flex flex-col items-center justify-center text-center shadow h-full">
              <span className="text-s text-gray-500 mb-1">Anggota Perempuan</span>
              <AnimatedNumber value={totalFemale} className="text-2xl font-bold text-pink-700" />
              <span className="text-s text-gray-400 mt-1">Total anggota perempuan</span>
            </div>
          </div>
          
          {showSearch ? (
            <>
              {/* Search Form */}
              <div className="max-w-3xl mx-auto mb-10 bg-gray-50 p-6 rounded-lg shadow-md">
                <div className="mb-6">
                  <p className="text-gray-700 mb-4">Masukkan informasi anggota untuk pencarian:</p>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <Select value={searchType} onValueChange={setSearchType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Tipe Pencarian" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="fullName">Nama Lengkap</SelectItem>
                          <SelectItem value="batchYear">Tahun Angkatan</SelectItem>
                          <SelectItem value="registrationNumber">Nomor Registrasi</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1">
                      <Input
                        placeholder="Masukkan kata kunci..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Button 
                      onClick={handleSearch}
                      className="gap-2"
                    >
                      <Search className="h-4 w-4" />
                      Cari
                    </Button>
                  </div>
                </div>
                
                <div className="text-sm text-gray-500">
                  <p className="flex items-center gap-1">
                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Data anggota hanya dapat diakses oleh pihak yang berwenang. Hasil pencarian akan menampilkan informasi dasar anggota.
                  </p>
                </div>
              </div>
              
              {/* Results Table */}
              {searchQuery ? (
                <div className="overflow-x-auto bg-white rounded-lg shadow-md">
                  {isLoading ? (
                    <div className="p-8">
                      <div className="flex flex-col gap-4">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                      </div>
                    </div>
                  ) : filteredMembers && filteredMembers.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nama Lengkap</TableHead>
                          <TableHead>Nama Lapangan</TableHead>
                          <TableHead>Nama Angkatan</TableHead>
                          <TableHead>Tahun Angkatan</TableHead>
                          <TableHead>No. Registrasi</TableHead>
                          <TableHead>Keanggotaan</TableHead>
                          <TableHead>Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredMembers.map((member) => (
                          <TableRow key={member.id}>
                            <TableCell className="font-medium">{member.fullName}</TableCell>
                            <TableCell>{member.fieldName}</TableCell>
                            <TableCell>{member.batchName}</TableCell>
                            <TableCell>{member.batchYear}</TableCell>
                            <TableCell>{member.registrationNumber}</TableCell>
                            <TableCell>
                              {member.membershipStatus === 'Anggota Penuh' ? (
                                <Badge variant="penuh">Anggota Penuh</Badge>
                              ) : member.membershipStatus === 'Anggota Muda' ? (
                                <Badge variant="muda">Anggota Muda</Badge>
                              ) : (
                                <Badge>{member.membershipStatus}</Badge>
                              )}
                            </TableCell>
                            <TableCell className="flex space-x-2">
                              {/* Icon ID Card: show photo in popup with download */}
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setPhotoDialog({ open: true, photoUrl: member.photoUrl || '', fullName: member.fullName })}
                                className="text-primary hover:text-primary-foreground hover:bg-primary"
                                disabled={!member.photoUrl}
                              >
                                <IdCard className="h-4 w-4" />
                              </Button>
                              {/* Icon 3D: show 3D card popup */}
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setCard3DPopup({ open: true, frontUrl: member.photoUrl || '', backUrl: 'https://raw.githubusercontent.com/mahapalanarotama/OfficialWebsite/refs/heads/main/Img/back.png', fullName: member.fullName })}
                                className="text-primary hover:text-primary-foreground hover:bg-primary"
                                disabled={!member.photoUrl}
                              >
                                <span className="font-bold">3D</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      <h3 className="text-lg font-medium text-gray-700">Tidak ada anggota ditemukan</h3>
                      <p className="text-gray-500">Coba ubah kata kunci pencarian Anda</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium text-gray-700">Masukkan kata kunci untuk mencari anggota</h3>
                  <p className="text-gray-500">Anda dapat mencari berdasarkan nama, tahun angkatan, atau nomor registrasi</p>
                </div>
              )}
              
              {/* Dialog for ID Card photo */}
                <Dialog open={photoDialog.open} onOpenChange={open => setPhotoDialog(v => ({ ...v, open }))}>
                <DialogContent className="flex flex-col items-center">
                  {photoDialog.photoUrl && (
                  <>
                  <div
                  className="relative overflow-hidden rounded border mt-5 mb-4 bg-white"
                  style={{
                    width: 480,
                    height: 300,
                    maxWidth: "90vw",
                    maxHeight: "70vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "zoom-in"
                  }}
                  tabIndex={0}
                  onClick={e => {
                    // Open zoom modal
                    e.stopPropagation();
                    setPhotoDialog(v => ({ ...v, zoom: true }));
                  }}
                  onKeyDown={e => {
                    if (e.key === "Enter" || e.key === " ") {
                    setPhotoDialog(v => ({ ...v, zoom: true }));
                    }
                  }}
                  aria-label="Perbesar gambar"
                  >
                  <img
                    src={photoDialog.photoUrl}
                    alt={photoDialog.fullName}
                    className="object-contain w-full h-full"
                    style={{ aspectRatio: '3/2', maxHeight: "100%", maxWidth: "100%" }}
                  />
                  <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded pointer-events-none">
                    Klik untuk zoom
                  </span>
                  </div>
                  <Button
                  variant="default"
                  className="w-full"
                  onClick={async () => {
                    try {
                    const response = await fetch(photoDialog.photoUrl, { mode: 'cors' });
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = photoDialog.photoUrl.split('/').pop() || 'kartu-anggota.jpg';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                    } catch (err) {
                    window.open(photoDialog.photoUrl, '_blank');
                    }
                  }}
                  >
                  Unduh Kartu
                  </Button>
                  {/* Zoom Modal */}
                  {photoDialog.zoom && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setPhotoDialog(v => ({ ...v, zoom: false }))}>
                    <div
                      className="relative bg-white rounded-lg shadow-lg p-4"
                      style={{ maxWidth: "95vw", maxHeight: "90vh" }}
                      onClick={e => e.stopPropagation()}
                    >
                      <img
                        src={photoDialog.photoUrl}
                        alt={photoDialog.fullName}
                        className="object-contain"
                        style={{ maxHeight: "80vh", maxWidth: "90vw" }}
                      />
                      <Button
                        variant="outline"
                        className="absolute top-2 right-2"
                        onClick={() => setPhotoDialog(v => ({ ...v, zoom: false }))}
                      >
                        Tutup
                      </Button>
                    </div>
                  </div>
                  )}
                  </>
                  )}
                </DialogContent>
                </Dialog>

              {/* 3D Card Popup */}
              <Card3DPopup
                open={card3DPopup.open}
                onClose={() => setCard3DPopup(v => ({ ...v, open: false }))}
                frontUrl={card3DPopup.frontUrl}
                backUrl={card3DPopup.backUrl}
                fullName={card3DPopup.fullName}
              />
            </>
          ) : (
            <>
              <div className="mb-6">
                <Button variant="outline" onClick={handleBackToSearch} className="mb-8">
                  ← Kembali ke Pencarian
                </Button>
                
                {selectedMember && <MemberCard member={{ ...selectedMember, id: String(selectedMember.id) }} />}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
