import { useState } from "react";
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
import { Search, IdCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function MemberCardPage() {
  const [searchType, setSearchType] = useState<string>("fullName");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showSearch, setShowSearch] = useState<boolean>(true);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [photoDialog, setPhotoDialog] = useState<{ open: boolean; photoUrl: string; fullName: string }>(
    { open: false, photoUrl: '', fullName: '' }
  );
  
  const { data: members, isLoading } = useMembers();
  
  const handleSearch = () => {
    // This would trigger a search if needed, but we're filtering on the client side
    // If we were querying a large dataset, we'd submit this to the backend
  };
  
  const handleCardClick = (memberId: number) => {
    setSelectedMemberId(memberId);
    setShowSearch(false);
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

  return (
    <>
      <section id="kartu-anggota" className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Kartu Anggota Mahapala Narotama
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Data anggota yang hanya dapat diakses melalui link khusus. Cari informasi anggota dan cetak kartu identitas resmi.
            </p>
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
                        <SelectContent>
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
                            {/* Icon 3D: show url in new tab */}
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => member.qrCode && window.open(member.qrCode, '_blank')}
                              className="text-primary hover:text-primary-foreground hover:bg-primary"
                              disabled={!member.qrCode}
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
                    {searchQuery ? (
                      <>
                        <h3 className="text-lg font-medium text-gray-700">Tidak ada anggota ditemukan</h3>
                        <p className="text-gray-500">Coba ubah kata kunci pencarian Anda</p>
                      </>
                    ) : (
                      <>
                        <h3 className="text-lg font-medium text-gray-700">Masukkan kata kunci untuk mencari anggota</h3>
                        <p className="text-gray-500">Anda dapat mencari berdasarkan nama, tahun angkatan, atau nomor registrasi</p>
                      </>
                    )}
                  </div>
                )}
              </div>
              
              {/* Dialog for ID Card photo */}
              <Dialog open={photoDialog.open} onOpenChange={open => setPhotoDialog(v => ({ ...v, open }))}>
                <DialogContent className="flex flex-col items-center">
                  {photoDialog.photoUrl && (
                    <>
                      <img
                        src={photoDialog.photoUrl}
                        alt={photoDialog.fullName}
                        className="w-[320px] h-[200px] object-contain rounded border mb-4"
                        style={{ aspectRatio: '320/200' }}
                      />
                      <Button
                        variant="default"
                        className="w-full"
                        onClick={async () => {
                          // Download file as blob to force download from URL (bypass CORS if possible)
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
                            // fallback: open in new tab if fetch fails
                            window.open(photoDialog.photoUrl, '_blank');
                          }
                        }}
                      >
                        Unduh Kartu
                      </Button>
                    </>
                  )}
                </DialogContent>
              </Dialog>
            </>
          ) : (
            <>
              <div className="mb-6">
                <Button variant="outline" onClick={handleBackToSearch} className="mb-8">
                  ← Kembali ke Pencarian
                </Button>
                
                {selectedMember && <MemberCard member={selectedMember} />}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
