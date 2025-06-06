import { useState, useEffect } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Textarea } from './textarea';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from './dialog';

// Base model interfaces
export interface BaseModel {
  id: string;
  imageUrl?: string;
  description: string;
}

// Activity interfaces
export interface Activity extends BaseModel {
  title: string;
  date: Date;
  category: string;
}

export interface ActivityFormData {
  title: string;
  description: string;
  date: string;
  category: string;
  imageUrl: string;
}

// Gallery interfaces
export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  activityId?: string;
}

export interface GalleryFormData {
  title: string;
  description: string;
  imageUrl: string;
  activityId: string;
}

// Member interfaces
export interface Member {
  id: string;
  fullName: string;
  fieldName: string;
  batchName: string;
  batchYear: number;
  registrationNumber: string;
  membershipStatus: string;
  photoUrl?: string;
  email?: string;
  phone?: string;
  gender?: string;
}

export interface MemberFormData {
  fullName: string;
  fieldName: string;
  batchName: string;
  batchYear: number;
  registrationNumber: string;
  membershipStatus: string;
  photoUrl?: string;
  email?: string;
  phone?: string;
  gender?: string;
}

export type FormData = ActivityFormData | GalleryFormData | MemberFormData;

export interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FormData) => Promise<void>;
  type: 'activity' | 'gallery' | 'member';
  isEditing?: boolean;
  initialData?: Partial<FormData>;
  activities?: Activity[];
  loading?: boolean;
  error?: string;
}

export function AdminFormDialog({
  open,
  onOpenChange,
  onSubmit,
  type,
  isEditing = false,
  initialData = {},
  activities = [],
  loading = false,
  error,
}: FormDialogProps) {
  const activityInitialData = type === 'activity' ? initialData as Partial<ActivityFormData> : null;
  const galleryInitialData = type === 'gallery' ? initialData as Partial<GalleryFormData> : null;
  const memberInitialData = type === 'member' ? initialData as Partial<MemberFormData> : null;

  const [formData, setFormData] = useState<FormData>(
    type === 'activity'
      ? {
          title: activityInitialData?.title || '',
          description: activityInitialData?.description || '',
          date: activityInitialData?.date || '',
          category: activityInitialData?.category || '',
          imageUrl: activityInitialData?.imageUrl || '',
        } as ActivityFormData
      : type === 'gallery'
      ? {
          title: galleryInitialData?.title || '',
          description: galleryInitialData?.description || '',
          imageUrl: galleryInitialData?.imageUrl || '',
          activityId: galleryInitialData?.activityId || '',
        } as GalleryFormData
      : {
          fullName: memberInitialData?.fullName || '',
          fieldName: memberInitialData?.fieldName || '',
          batchName: memberInitialData?.batchName || '',
          batchYear: memberInitialData?.batchYear || new Date().getFullYear(),
          registrationNumber: memberInitialData?.registrationNumber || '',
          membershipStatus: memberInitialData?.membershipStatus || 'Active',
          photoUrl: memberInitialData?.photoUrl || '',
          email: memberInitialData?.email || '',
          phone: memberInitialData?.phone || '',
          gender: memberInitialData?.gender || '',
        } as MemberFormData
  );

  // Tambahkan efek agar formData selalu sinkron dengan initialData saat edit
  useEffect(() => {
    // Helper to normalize gender
    const normalizeGender = (val?: string) => {
      if (!val) return '';
      const v = val.toLowerCase();
      if (v === 'l' || v === 'laki-laki' || v === 'male') return 'Laki-laki';
      if (v === 'p' || v === 'perempuan' || v === 'female') return 'Perempuan';
      return val; // fallback to original
    };
    if (type === 'activity') {
      setFormData({
        title: (initialData as ActivityFormData)?.title || '',
        description: (initialData as ActivityFormData)?.description || '',
        date: (initialData as ActivityFormData)?.date || '',
        category: (initialData as ActivityFormData)?.category || '',
        imageUrl: (initialData as ActivityFormData)?.imageUrl || '',
      });
    } else if (type === 'gallery') {
      setFormData({
        title: (initialData as GalleryFormData)?.title || '',
        description: (initialData as GalleryFormData)?.description || '',
        imageUrl: (initialData as GalleryFormData)?.imageUrl || '',
        activityId: (initialData as GalleryFormData)?.activityId || '',
      });
    } else {
      setFormData({
        fullName: (initialData as MemberFormData)?.fullName || '',
        fieldName: (initialData as MemberFormData)?.fieldName || '',
        batchName: (initialData as MemberFormData)?.batchName || '',
        batchYear: (initialData as MemberFormData)?.batchYear || new Date().getFullYear(),
        registrationNumber: (initialData as MemberFormData)?.registrationNumber || '',
        membershipStatus: (initialData as MemberFormData)?.membershipStatus || 'Anggota Muda',
        photoUrl: (initialData as MemberFormData)?.photoUrl || '',
        email: (initialData as MemberFormData)?.email || '',
        phone: (initialData as MemberFormData)?.phone || '',
        gender: normalizeGender((initialData as MemberFormData)?.gender),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, type, isEditing, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => {
      if (name === 'batchYear') {
        return { ...prev, [name]: parseInt(value, 10) };
      }
      return { ...prev, [name]: value };
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full p-0 overflow-hidden">
        <DialogHeader className="bg-primary text-white px-6 py-4">
          <DialogTitle className="text-xl">
            {isEditing
              ? type === 'member'
                ? 'Edit Data Anggota'
                : type === 'activity'
                ? 'Edit Kegiatan'
                : 'Edit Galeri'
              : type === 'member'
              ? 'Tambah Anggota Baru'
              : type === 'activity'
              ? 'Tambah Kegiatan Baru'
              : 'Tambah Galeri Baru'}
          </DialogTitle>
          <p id="form-description" className="text-sm text-gray-200">
            {type === 'activity'
              ? 'Silakan lengkapi detail kegiatan berikut. Semua field wajib diisi.'
              : type === 'gallery'
              ? 'Silakan lengkapi detail galeri berikut. Semua field wajib diisi.'
              : 'Silakan lengkapi data anggota berikut. Field dengan tanda * wajib diisi.'}
          </p>
        </DialogHeader>
        <div className="p-6 bg-white max-h-[70vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            {type === 'member' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nama Lengkap *</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={(formData as MemberFormData).fullName}
                    onChange={handleChange}
                    placeholder="Masukkan nama lengkap"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fieldName">Nama Lapangan *</Label>
                  <Input
                    id="fieldName"
                    name="fieldName"
                    value={(formData as MemberFormData).fieldName}
                    onChange={handleChange}
                    placeholder="Masukkan nama lapangan"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="batchName">Nama Angkatan *</Label>
                  <Input
                    id="batchName"
                    name="batchName"
                    value={(formData as MemberFormData).batchName}
                    onChange={handleChange}
                    placeholder="Contoh: Elang"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="batchYear">Tahun Angkatan *</Label>
                  <Input
                    id="batchYear"
                    name="batchYear"
                    type="number"
                    min="1990"
                    max={new Date().getFullYear()}
                    value={(formData as MemberFormData).batchYear}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registrationNumber">Nomor Registrasi *</Label>
                  <Input
                    id="registrationNumber"
                    name="registrationNumber"
                    value={(formData as MemberFormData).registrationNumber}
                    onChange={handleChange}
                    placeholder="Contoh: MPN-2025-001"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="membershipStatus">Status Keanggotaan *</Label>
                  <select
                    id="membershipStatus"
                    name="membershipStatus"
                    value={(formData as MemberFormData).membershipStatus}
                    onChange={handleChange}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    required
                  >
                    <option value="Anggota Muda">Anggota Muda</option>
                    <option value="Anggota Penuh">Anggota Penuh</option>
                    <option value="Tidak Aktif">Tidak Aktif</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <select
                    id="gender"
                    name="gender"
                    value={(formData as MemberFormData).gender}
                    onChange={handleChange}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  >
                    <option value="">Pilih gender</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={(formData as MemberFormData).email}
                    onChange={handleChange}
                    placeholder="contoh@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Nomor Telepon</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={(formData as MemberFormData).phone}
                    onChange={handleChange}
                    placeholder="Contoh: 081234567890"
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="photoUrl">URL Foto KTA</Label>
                  <Input
                    id="photoUrl"
                    name="photoUrl"
                    type="url"
                    placeholder="Masukkan URL foto KTA"
                    value={(formData as MemberFormData).photoUrl}
                    onChange={handleChange}
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={(formData as ActivityFormData | GalleryFormData).title}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={(formData as ActivityFormData | GalleryFormData).description}
                    onChange={handleChange}
                    required={type === 'activity'}
                  />
                </div>

                {type === 'activity' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        name="date"
                        type="date"
                        value={(formData as ActivityFormData).date}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        name="category"
                        value={(formData as ActivityFormData).category}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </>
                )}

                {type === 'gallery' && (
                  <div className="space-y-2">
                    <Label htmlFor="activityId">Related Activity</Label>
                    <select
                      id="activityId"
                      name="activityId"
                      value={(formData as GalleryFormData).activityId}
                      onChange={handleChange}
                      className="w-full rounded-md border p-2"
                    >
                      <option value="">None</option>
                      {activities.map(activity => (
                        <option key={activity.id} value={activity.id}>
                          {activity.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    name="imageUrl"
                    type="url"
                    placeholder="Enter the URL of the image"
                    value={(formData as ActivityFormData | GalleryFormData).imageUrl}
                    onChange={handleChange}
                    required
                  />
                </div>
              </>
            )}
            {error && <p className="text-sm text-red-500 mt-4">{error}</p>}
            <DialogFooter className="pt-4">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Perbarui' : 'Simpan'}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
