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
  DialogDescription,
} from './dialog';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
  statusMahasiswa?: string;
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
  statusMahasiswa?: string;
  customId?: string; // Tambahan agar ID dokumen selalu ada
}




export interface LearningFormData {
  title: string;
  description: string;
  icon: string;
  link: string;
}

export type FormData = ActivityFormData | GalleryFormData | MemberFormData | LearningFormData;

export interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FormData) => Promise<void>;
  type: 'activity' | 'gallery' | 'member' | 'learning';
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


  // Helper untuk mapping Firestore ke form (Firestore -> camelCase)
  const mapFirestoreToForm = (data: any) => ({
    fullName: data.namalengkap || data.fullName || '',
    fieldName: data.namalapangan || data.fieldName || '',
    batchName: data.namaangkatan || data.batchName || '',
    batchYear: data.tahun || data.batchYear || new Date().getFullYear(),
    registrationNumber: data.nomorregistrasi || data.registrationNumber || '',
    membershipStatus: data.keanggotaan || data.membershipStatus || 'Anggota Muda',
    photoUrl: data.foto || data.photoUrl || '',
    email: data.email || '',
    phone: data.phone || '',
    gender: data.gender || '',
    statusMahasiswa: data.statusMahasiswa || '',
    url: data.url || '',
    updateat: data.updateat || '',
    id: data.id || '',
  });

  // Always use mapFirestoreToForm for member formData initialization
  const [formData, setFormData] = useState<any>(
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
      : mapFirestoreToForm(memberInitialData || {})
  );

  // Tambahkan state untuk nextDocumentId
  const [nextDocumentId, setNextDocumentId] = useState('');

  // Update formData when initialData changes (for edit mode)
  useEffect(() => {
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
    } else if (type === 'member') {
      setFormData(mapFirestoreToForm(initialData || {}));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, type, isEditing, open]);

  // Ambil nextDocumentId hanya saat tambah anggota (bukan edit)
  useEffect(() => {
    async function fetchNextId() {
      if (type === 'member' && open && !isEditing) {
        const membersSnapshot = await getDocs(collection(db, 'anggota'));
        const numericIds = membersSnapshot.docs
          .map(doc => parseInt(doc.id, 10))
          .filter(n => !isNaN(n));
        const nextId = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 1;
        setNextDocumentId(String(nextId));
        setFormData((prev: any) => ({ ...prev, id: String(nextId) }));
      }
    }
    fetchNextId();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, open, isEditing]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (type === 'member') {
      await onSubmit({
        namalengkap: formData.fullName || '',
        namalapangan: formData.fieldName || '',
        namaangkatan: formData.batchName || '',
        tahun: formData.batchYear || new Date().getFullYear(),
        nomorregistrasi: formData.registrationNumber || '',
        keanggotaan: formData.membershipStatus || 'Anggota Muda',
        foto: formData.photoUrl || '',
        email: formData.email || '',
        phone: formData.phone || '',
        gender: formData.gender || '',
        statusMahasiswa: formData.statusMahasiswa,
        url: formData.url || '',
        updateat: new Date().toISOString(),
        id: formData.id || '',
      } as any);
    } else if (isEditing && type === 'gallery' && (initialData as any)?.id) {
      // Only include updatedAt for gallery
      await onSubmit({
        title: formData.title || '',
        description: formData.description || '',
        imageUrl: formData.imageUrl || '',
        activityId: formData.activityId || '',
        createdAt: formData.createdAt || null,
        // Only add updatedAt if the type is GalleryFormData
        ...(type === 'gallery' ? { updatedAt: new Date().toISOString() } : {}),
        id: (initialData as any).id,
      } as GalleryFormData & { id: string; updatedAt?: string });
    } else if (isEditing && type === 'activity' && (initialData as any)?.id) {
      await onSubmit({ ...(formData as any), id: (initialData as any).id });
    } else {
      // For create, only submit known fields for the type
      if (type === 'gallery') {
        await onSubmit({
          title: formData.title || '',
          description: formData.description || '',
          imageUrl: formData.imageUrl || '',
          activityId: formData.activityId || '',
          createdAt: formData.createdAt || null,
        } as GalleryFormData);
      } else {
        await onSubmit(formData);
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => {
      if (name === 'tahun') {
        return { ...prev, [name]: parseInt(value, 10) };
      }
      return { ...prev, [name]: value };
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full p-0 overflow-hidden" aria-describedby="form-description">
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
          <DialogDescription id="form-description">
            {type === 'activity'
              ? 'Silakan lengkapi detail kegiatan berikut. Semua field wajib diisi.'
              : type === 'gallery'
              ? 'Silakan lengkapi detail galeri berikut. Semua field wajib diisi.'
              : 'Silakan lengkapi data anggota berikut. Field dengan tanda * wajib diisi.'}
          </DialogDescription>
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
                    value={formData.fullName || ''}
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
                    value={formData.fieldName || ''}
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
                    value={formData.batchName || ''}
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
                    value={formData.batchYear ?? ''}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registrationNumber">Nomor Registrasi *</Label>
                  <Input
                    id="registrationNumber"
                    name="registrationNumber"
                    value={formData.registrationNumber || ''}
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
                    value={formData.membershipStatus || ''}
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
                  <Label htmlFor="statusMahasiswa">Status Mahasiswa *</Label>
                  <select
                    id="statusMahasiswa"
                    name="statusMahasiswa"
                    value={formData.statusMahasiswa || ''}
                    onChange={handleChange}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    required
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Tidak Aktif">Tidak Aktif</option>
                    <option value="Lulus">Lulus</option>
                    <option value="Cuti">Cuti</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender || ''}
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
                    value={formData.email || ''}
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
                    value={formData.phone || ''}
                    onChange={handleChange}
                    placeholder="Contoh: 081234567890"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="photoUrl">URL Foto KTA</Label>
                  <Input
                    id="photoUrl"
                    name="photoUrl"
                    type="url"
                    placeholder="Masukkan URL foto KTA"
                    value={formData.photoUrl || ''}
                    onChange={handleChange}
                  />
                  {Boolean(formData.photoUrl) && (
                    <div className="mt-2">
                      <span className="block text-xs text-gray-500 mb-1">Preview:</span>
                      {/https?:\/\//.test(formData.photoUrl || '') ? (
                        <img
                          src={formData.photoUrl}
                          alt="Preview Foto KTA"
                          className="max-h-32 rounded border"
                          onError={e => (e.currentTarget.style.display = 'none')}
                        />
                      ) : (
                        <span className="text-xs text-red-500">URL tidak valid</span>
                      )}
                      <div className="text-xs text-blue-600 break-all mt-1">{formData.photoUrl}</div>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="documentId">Document ID</Label>
                  <Input
                    id="documentId"
                    name="documentId"
                    value={isEditing ? formData.id || '' : nextDocumentId || formData.id || ''}
                    readOnly
                    className="bg-gray-100 cursor-not-allowed"
                    placeholder="ID dokumen Firestore"
                  />
                </div>
              </div>
            ) : (
              <>
                {/* Learning Form */}
                {type === 'learning' ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        name="title"
                        value={formData.title || ''}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description || ''}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="icon">Icon</Label>
                      <Input
                        id="icon"
                        name="icon"
                        value={formData.icon || ''}
                        onChange={handleChange}
                        placeholder="Contoh: map-marked-alt"
                        required
                      />
                      <div className="flex items-center gap-2 mt-1">
                        {formData.icon && (
                          <span className="inline-flex items-center gap-1 text-lg"><i className={`fa fa-${formData.icon}`}></i> {formData.icon}</span>
                        )}
                        <a
                          href="https://fontawesome.com/v4.7/icons/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline text-xs hover:text-blue-800 ml-2"
                        >
                          Panduan icon (FontAwesome v4.7)
                        </a>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="link">Link</Label>
                      <Input
                        id="link"
                        name="link"
                        value={formData.link || ''}
                        onChange={handleChange}
                        placeholder="https://..."
                        required
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        name="title"
                        value={type === 'activity' || type === 'gallery' ? formData.title || '' : ''}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={type === 'activity' || type === 'gallery' ? formData.description || '' : ''}
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
                            value={(formData as ActivityFormData).date || ''}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="category">Category</Label>
                          <Input
                            id="category"
                            name="category"
                            value={(formData as ActivityFormData).category || ''}
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
                          value={(formData as GalleryFormData).activityId || ''}
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
                        value={type === 'activity' || type === 'gallery' ? formData.imageUrl || '' : ''}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </>
                )}
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

// Note: Table whitespace warning is likely in AdminPage, not here. If needed, fix there.
