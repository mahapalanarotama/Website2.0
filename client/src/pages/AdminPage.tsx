// Firebase imports
import { useEffect, useState } from 'react';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { collection, getDocs, addDoc, doc, deleteDoc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { differenceInDays } from 'date-fns';

// UI Component imports
import { TabsContent, Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Admin Forms
import { AdminFormDialog } from "@/components/ui/admin-forms";
import type { 
  Activity, 
  GalleryItem,
  Member,
} from "@/components/ui/admin-forms";

// Icons
import {   Calendar,
  Image as ImageIcon,
  ImagePlus,
  LogOut,
  MapPin,
  PencilLine,
  Plus,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';

export default function AdminPage() {
  // Authentication state
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Data states
  const [activities, setActivities] = useState<Activity[]>([]);
  const [gallerys, setGallery] = useState<GalleryItem[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [trackers, setTrackers] = useState<any[]>([]);
  const [trackerHistory, setTrackerHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('activities');

  // Dialog states
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [formType, setFormType] = useState<'activity' | 'gallery' | 'member'>('activity');
  const [isEditing, setIsEditing] = useState(false);

  // Recycle bin states
  const [recycleBin, setRecycleBin] = useState<any[]>([]);
  const [recycleLoading, setRecycleLoading] = useState(false);
  const [deleteChecked, setDeleteChecked] = useState(false);

  // PIN input states
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  // Authentication effect
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  // Data fetching effect
  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      setAuthError('Login failed: ' + error.message);
    }
  };

  // Fetch data from Firestore
  const fetchData = async () => {
    try {
      // Fetch recycle bin first
      const recycleSnap = await getDocs(collection(db, 'recycle_bin'));
      const recycleIds = new Set(recycleSnap.docs.map(doc => doc.id)); // Perbaikan di sini
      // Fetch activities
      const activitiesSnapshot = await getDocs(collection(db, 'activities'));
      setActivities(
        activitiesSnapshot.docs
          .filter(doc => !recycleIds.has(doc.id))
          .map(doc => ({ id: doc.id, ...doc.data() })) as Activity[]
      );
      // Fetch gallery items
      const gallerySnapshot = await getDocs(collection(db, 'gallerys'));
      setGallery(
        gallerySnapshot.docs
          .filter(doc => !recycleIds.has(doc.id))
          .map(doc => ({
            id: doc.id,
            title: doc.data().title || '',
            description: doc.data().description || '',
            imageUrl: doc.data().imageUrl || '',
            activityId: doc.data().activityId || '',
            createdAt: doc.data().createdAt || null,
            updatedAt: doc.data().updatedAt || null,
          }))
      );      // Fetch members from "anggota" collection
      const membersSnapshot = await getDocs(collection(db, 'anggota'));
      const updateStatusAktif = ['Caba', 'Cella', 'Ratel', 'Lupus', 'Orca', 'Loni', 'Ola'];
      const batch: Promise<any>[] = [];
      membersSnapshot.docs.forEach(docSnap => {
        const data = docSnap.data();
        if (updateStatusAktif.includes(data.namalengkap) && data.statusMahasiswa !== 'Aktif') {
          batch.push(setDoc(doc(db, 'anggota', docSnap.id), { ...data, statusMahasiswa: 'Aktif' }, { merge: true }));
        }
      });
      if (batch.length > 0) await Promise.all(batch);
      setMembers(
        membersSnapshot.docs
          .filter(doc => !recycleIds.has(doc.id))
          .map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              fullName: data.namalengkap || "",
              fieldName: data.namalapangan || "",
              batchName: data.namaangkatan || "",
              batchYear: data.tahun || 0,
              registrationNumber: data.nomorregistrasi || "",
              membershipStatus: data.keanggotaan || "Tidak Aktif",
              photoUrl: data.foto || "",
              qrCode: data.url || "",
              email: data.email || "",
              phone: data.phone || "",
              gender: data.gender || "",
              statusMahasiswa: data.statusMahasiswa, // Tambahkan mapping untuk statusMahasiswa
            };
          })
      );
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Fetch GPS tracker data
  const fetchTrackers = async () => {
    const snap = await getDocs(collection(db, "gps_tracker"));
    setTrackers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  // Fetch tracker history (tracker yang sudah dihapus)
  async function fetchTrackerHistory() {
    const snap = await getDocs(collection(db, 'gps_tracker_history'));
    setTrackerHistory(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }

  // Notifikasi sederhana
  const notify = (msg: string) => window.alert(msg);

  // CREATE/EDIT handler
  const handleFormSubmit = async (data: any) => {
    try {
      let collectionName = formType === 'member' ? 'anggota' : formType + 's';
      // --- AUTO GENERATE DOCUMENT ID FOR NEW MEMBER ---
      if (formType === 'member' && !isEditing) {
        // Get all member IDs (assume numeric string or fallback to 0)
        const membersSnapshot = await getDocs(collection(db, 'anggota'));
        const numericIds = membersSnapshot.docs
          .map(doc => parseInt(doc.id, 10))
          .filter(n => !isNaN(n));
        const nextId = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 1;
        const docId = String(nextId).padStart(4, '0'); // e.g. 0001, 0002, ...
        const memberData = {
          namalengkap: data.namalengkap || data.fullName || '',
          namalapangan: data.namalapangan || data.fieldName || '',
          namaangkatan: data.namaangkatan || data.batchName || '',
          tahun: data.tahun || data.batchYear || new Date().getFullYear(),
          nomorregistrasi: data.nomorregistrasi || data.registrationNumber || '',
          keanggotaan: data.keanggotaan || data.membershipStatus || 'Anggota Muda',
          foto: data.foto || data.photoUrl || '',
          email: data.email || '',
          phone: data.phone || '',
          gender: data.gender || '',
          statusMahasiswa: data.statusMahasiswa, // Perbaikan di sini
          url: data.url || '',
          updateat: new Date().toISOString(),
          id: docId,
        };
        await setDoc(doc(db, 'anggota', docId), memberData);
        notify('Data anggota berhasil ditambahkan dengan ID otomatis!');
        setFormDialogOpen(false);
        await fetchData();
        return;
      }
      if (formType === 'member' && (data.id || data.customId)) {
        // Always map to Firestore field names for update
        const docId = data.customId || data.id;
        const memberData = {
          namalengkap: data.namalengkap || data.fullName || '',
          namalapangan: data.namalapangan || data.fieldName || '',
          namaangkatan: data.namaangkatan || data.batchName || '',
          tahun: data.tahun || data.batchYear || new Date().getFullYear(),
          nomorregistrasi: data.nomorregistrasi || data.registrationNumber || '',
          keanggotaan: data.keanggotaan || data.membershipStatus || 'Anggota Muda',
          foto: data.foto || data.photoUrl || '',
          email: data.email || '',
          phone: data.phone || '',
          gender: data.gender || '',
          statusMahasiswa: data.statusMahasiswa, // Perbaikan di sini
          url: data.url || '',
          updateat: new Date().toISOString(),
          id: docId,
        };
        await setDoc(doc(db, collectionName, docId), memberData);
        notify('Data anggota berhasil diperbarui!');
      } else if (isEditing && formType === 'activity' && data.id) {
        // Pastikan mapping field activity ke Firestore benar
        const activityData = {
          title: data.title || '',
          description: data.description || '',
          date: data.date || '',
          category: data.category || '',
          imageUrl: data.imageUrl || '',
          id: data.id,
        };
        await setDoc(doc(db, 'activities', data.id), activityData);
        notify('Data kegiatan berhasil diperbarui!');
      } else if (isEditing && formType === 'gallery' && data.id) {
        // Mapping field galeri ke Firestore harus konsisten
        const galleryData = {
          title: data.title || '',
          description: data.description || '',
          imageUrl: data.imageUrl || '',
          activityId: data.activityId || '',
          createdAt: data.createdAt || null,
          updatedAt: new Date().toISOString(),
          id: data.id,
        };
        await setDoc(doc(db, 'gallerys', data.id), galleryData);
        notify('Data galeri berhasil diperbarui!');
      } else if (formType === 'activity' && !isEditing) {
        // TAMBAH DATA KEGIATAN BARU
        const activityData = {
          title: data.title || '',
          description: data.description || '',
          date: data.date || '',
          category: data.category || '',
          imageUrl: data.imageUrl || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await addDoc(collection(db, 'activities'), activityData);
        notify('Data kegiatan berhasil ditambahkan!');
      } else {
        // Create
        if (formType === 'member' && data.customId) {
          // Use customId as document ID
          const { customId, ...memberData } = data;
          await setDoc(doc(db, 'anggota', customId), memberData);
          notify('Data berhasil ditambahkan dengan ID custom!');
        } else {
          await addDoc(collection(db, collectionName), data);
          notify('Data berhasil ditambahkan!');
        }
      }
      setFormDialogOpen(false);
      await fetchData();
    } catch (error) {
      notify('Gagal menyimpan data!');
      console.error(error);
    }
  };

  // DELETE handler (pindah ke recycle bin)
  // Refactor: handleDelete menerima parameter
  // Helper to map formType to Firestore collection name
  const getCollectionName = (type: 'activity' | 'gallery' | 'member') => {
    if (type === 'activity') return 'activities';
    if (type === 'gallery') return 'gallerys'; // Firestore collection is 'gallerys'
    if (type === 'member') return 'anggota';
    return '';
  };

  const handleDelete = async (type?: 'activity' | 'gallery' | 'member', item?: any) => {
    const tipe = type || formType;
    const dataItem = item || currentItem;
    if (!dataItem || !dataItem.id) {
      notify('Data tidak valid atau ID tidak ditemukan!');
      return;
    }
    let originalType = tipe;
    let itemId = dataItem.id;
    let collectionName = getCollectionName(originalType);
    try {
      // Ambil data asli dari Firestore
      const docSnap = await getDoc(doc(db, collectionName, itemId));
      if (!docSnap.exists()) {
        notify('Data tidak ditemukan di database!');
        return;
      }
      const dataAsli = docSnap.data();
      const dataToDelete = { ...dataAsli, originalType, deletedAt: new Date().toISOString() };
      await setDoc(doc(db, 'recycle_bin', itemId), dataToDelete);
      await deleteDoc(doc(db, collectionName, itemId));
      setDeleteDialogOpen(false);
      setDeleteChecked(false);
      setCurrentItem(null);
      await fetchData();
      await fetchRecycleBin();
      notify('Data berhasil dipindahkan ke Recycle Bin!');
    } catch (error) {
      notify('Gagal menghapus data!');
      console.error(error);
    }
  };

  // RESTORE handler di recycle bin
  // (removed unused handleRestore function)

  // PERMANENT DELETE handler di recycle bin
  // (removed unused handlePermanentDelete function)

  // AUTO DELETE recycle bin > 30 hari
  const fetchRecycleBin = async () => {
    setRecycleLoading(true);
    const snapshot = await getDocs(collection(db, 'recycle_bin'));
    const now = new Date();
    await Promise.all(snapshot.docs.map(async (docSnap) => {
      const data = docSnap.data();
      if (data.deletedAt && differenceInDays(now, new Date(data.deletedAt)) > 30) {
        await deleteDoc(doc(db, 'recycle_bin', docSnap.id));
      }
    }));
    const freshSnap = await getDocs(collection(db, 'recycle_bin'));
    setRecycleBin(freshSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setRecycleLoading(false);
  };

  // Tab change effect
  useEffect(() => {
    if (activeTab === 'recycle') {
      fetchRecycleBin();
    } else if (activeTab === 'tracker') {
      fetchTrackers();
    }
  }, [activeTab]);

  // Login form
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Admin Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {authError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                  {authError}
                </div>
              )}
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Admin dashboard
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button 
          variant="ghost" 
          className="flex items-center gap-2"
          onClick={() => auth.signOut()}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-8">
          <TabsTrigger value="activities" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Activities
          </TabsTrigger>
          <TabsTrigger value="gallery" className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Gallery
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Members
          </TabsTrigger>
          <TabsTrigger value="recycle" className="flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            Recycle Bin
          </TabsTrigger>
            <TabsTrigger value="tracker" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Tracker
            </TabsTrigger>
        </TabsList>

        <TabsContent value="activities">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Activities Management</h2>
            <Button
              onClick={() => {
                setFormType('activity');
                setIsEditing(false);
                setCurrentItem(null);
                setFormDialogOpen(true);
              }}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Activity
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-medium">{activity.title}</TableCell>
                    <TableCell>{new Date(activity.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge>{activity.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setFormType('activity');
                            setIsEditing(true);
                            setCurrentItem(activity);
                            setFormDialogOpen(true);
                          }}
                        >
                          <PencilLine className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600"
                          onClick={() => {
                            setCurrentItem(activity);
                            setFormType('activity');
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="gallery">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Gallery Management</h2>
            <Button
              onClick={() => {
                setFormType('gallery');
                setIsEditing(false);
                setCurrentItem(null);
                setFormDialogOpen(true);
              }}
              className="flex items-center gap-2"
            >
              <ImagePlus className="h-4 w-4" />
              Add Image
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gallerys.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="relative aspect-video">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                  <div className="mt-4 flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFormType('gallery');
                        setIsEditing(true);
                        setCurrentItem(item);
                        setFormDialogOpen(true);
                      }}
                    >
                      <PencilLine className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600"
                      onClick={() => {
                        setCurrentItem(item);
                        setFormType('gallery');
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="members">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Members Management</h2>
            <Button
              onClick={() => {
                setFormType('member');
                setIsEditing(false);
                setCurrentItem(null);
                setFormDialogOpen(true);
              }}
              className="flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Add Member
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Informasi Anggota</TableHead>
                  <TableHead>Info Kontak</TableHead>
                  <TableHead>Angkatan</TableHead>
                  <TableHead>Keanggotaan</TableHead>
                  <TableHead>Status Mahasiswa</TableHead>
                  {/* Optionally show Document ID column if needed: */}
                  {/* <TableHead>Document ID</TableHead> */}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100">
                          {member.photoUrl ? (
                            <img src={member.photoUrl} alt={member.fullName} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary">{member.fullName.charAt(0).toUpperCase()}</div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{member.fullName}</div>
                          <div className="text-sm text-gray-500"><Badge variant="outline" className="mt-1">{member.fieldName || 'Belum ada nama lapangan'}</Badge></div>
                          <div className="text-sm text-gray-500 mt-1">{member.registrationNumber || 'No. Reg belum diatur'}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{member.email || '-'}</div>
                        <div className="text-gray-500">{member.phone || '-'}</div>
                        <div className="text-gray-500 mt-1">
                          <Badge variant="secondary" className="text-xs text-zinc-50">
                            {(() => {
                              const g = (member.gender || '').toString().trim().toUpperCase();
                              if (g === 'L' || g === 'LAKI-LAKI' || g === 'LAKI' || g === 'LKI') return 'Laki-laki';
                              if (g === 'P' || g === 'PEREMPUAN' || g === 'PR' || g === 'WANITA') return 'Perempuan';
                              if (g.length > 0) return member.gender;
                              return 'Belum diatur';
                            })()}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{member.batchName || 'Belum diatur'}</div>
                        <div className="text-gray-500">{member.batchYear ? `Tahun ${member.batchYear}` : 'Tahun belum diatur'}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {member.membershipStatus === 'Anggota Penuh' ? (
                        <Badge className="bg-green-600 text-white font-bold border-green-700 shadow">
                          {member.membershipStatus}
                        </Badge>
                      ) : member.membershipStatus === 'Anggota Muda' ? (
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                          {member.membershipStatus}
                        </Badge>
                      ) : member.membershipStatus === 'Aktif' ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          {member.membershipStatus}
                        </Badge>
                      ) : member.membershipStatus === 'Tidak Aktif' ? (
                        <Badge className="bg-red-100 text-red-800 border-red-200">
                          {member.membershipStatus}
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                          {member.membershipStatus}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {/* Status Mahasiswa */}
                      <Badge
                        className={
                          member.statusMahasiswa === 'Aktif'
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : member.statusMahasiswa === 'Tidak Aktif'
                            ? 'bg-red-100 text-red-800 border-red-200'
                            : member.statusMahasiswa === 'Lulus'
                            ? 'bg-blue-100 text-blue-800 border-blue-200'
                            : member.statusMahasiswa === 'Cuti'
                            ? 'bg-yellow-100 text-yellow-900 border-yellow-300'
                            : 'bg-gray-100 text-gray-800 border-gray-200'
                        }
                      >
                        {member.statusMahasiswa || 'Belum diatur'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setFormType('member');
                            setIsEditing(true);
                            setCurrentItem(member);
                            setFormDialogOpen(true);
                          }}
                        >
                          <PencilLine className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600"
                          onClick={() => {
                            setCurrentItem(member);
                            setFormType('member');
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="recycle">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recycle Bin</h2>
            <Button onClick={fetchRecycleBin} variant="outline" size="sm">Refresh</Button>
          </div>
          {recycleLoading ? (
            <div className="py-10 text-center text-gray-500">Loading...</div>
          ) : recycleBin.length === 0 ? (
            <div className="py-10 text-center text-gray-500">Recycle Bin kosong.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Jenis</TableHead>
                    <TableHead>Nama/Title</TableHead>
                    <TableHead>Dihapus Pada</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recycleBin.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>{item.originalType}</TableCell>
                      <TableCell>{item.fullName || item.title || '-'}</TableCell>
                      <TableCell>{item.deletedAt ? new Date(item.deletedAt).toLocaleString() : '-'}</TableCell>
                      <TableCell className="text-right flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            try {
                              const { id, originalType, deletedAt, ...restoreData } = item;
                              let collectionName = originalType === 'member' ? 'anggota' : originalType === 'activity' ? 'activities' : originalType + 's';
                              let dataToRestore = restoreData;
                              if (originalType === 'activity') {
                                // Only restore allowed fields for activity
                                dataToRestore = {
                                  title: restoreData.title || '',
                                  description: restoreData.description || '',
                                  date: restoreData.date || '',
                                  category: restoreData.category || '',
                                  imageUrl: restoreData.imageUrl || '',
                                  id: id,
                                };
                              }
                              await setDoc(doc(db, collectionName, id), dataToRestore);
                              await deleteDoc(doc(db, 'recycle_bin', id));
                              await fetchData();
                              await fetchRecycleBin();
                              notify('Data berhasil dipulihkan!');
                            } catch (error) {
                              notify('Gagal memulihkan data!');
                              console.error(error);
                            }
                          }}
                        >Pulihkan</Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={async () => {
                            if (!window.confirm('Yakin ingin menghapus data ini secara permanen?')) return;
                            try {
                              await deleteDoc(doc(db, 'recycle_bin', item.id));
                              await fetchRecycleBin();
                              notify('Data berhasil dihapus permanen!');
                            } catch (error) {
                              notify('Gagal menghapus data permanen!');
                              console.error(error);
                            }
                          }}
                        >Hapus Permanen</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="tracker">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">GPS Tracker</h2>
            <Button onClick={fetchTrackers} variant="outline" size="sm">Refresh</Button>
          </div>
          <div className="overflow-x-auto bg-white rounded-lg shadow p-2">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Waktu</th>
                  <th>Lat</th>
                  <th>Lon</th>
                  <th>Status</th>
                  <th>View Maps</th>
                </tr>
              </thead>
              <tbody>
                {trackers.map((t) => (
                  <tr key={t.id}>
                    <td>{t.nama}</td>
                    <td>{t.time}</td>
                    <td>{t.lat}</td>
                    <td>{t.lon}</td>
                    <td>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${t.online ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}`}>
                        {t.online ? 'Online' : 'Offline'}
                      </span>
                    </td>
                    <td>
                      {t.lat && t.lon ? (
                        <a
                          href={`https://www.google.com/maps?q=${t.lat},${t.lon}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline hover:text-blue-800"
                          title="Lihat di Google Maps"
                        >
                          Lihat Maps
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Riwayat Tracker */}
          <div className="mt-8">
            <h3 className="font-semibold mb-2">Riwayat Tracker (Tracker yang sudah dihapus)</h3>
            {!showHistory ? (
              <div className="flex gap-2 items-center">
                <input
                  type="password"
                  placeholder="Masukkan PIN"
                  value={pinInput}
                  onChange={e => setPinInput(e.target.value)}
                  className="border rounded px-2 py-1 text-sm"
                />
                <Button size="sm" onClick={() => {
                  if (pinInput === '2408') {
                    setShowHistory(true);
                    setPinError('');
                    fetchTrackerHistory();
                  } else {
                    setPinError('PIN salah');
                  }
                }}>Lihat Riwayat</Button>
                {pinError && <span className="text-red-500 text-xs ml-2">{pinError}</span>}
              </div>
            ) : (
              <div className="overflow-x-auto bg-gray-50 rounded-lg shadow p-2 mt-2">
                <table className="w-full text-xs">
                  <thead>
                    <tr>
                      <th>Nama</th>
                      <th>Waktu</th>
                      <th>Lat</th>
                      <th>Lon</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trackerHistory.length === 0 ? (
                      <tr><td colSpan={5} className="text-center text-gray-400">Belum ada riwayat tracker terhapus.</td></tr>
                    ) : trackerHistory.map((t) => (
                      <tr key={t.id}>
                        <td>{t.nama}</td>
                        <td>{t.time}</td>
                        <td>{t.lat}</td>
                        <td>{t.lon}</td>
                        <td>{t.online ? 'Online' : 'Offline'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Form Dialog */}
      <AdminFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        type={formType}
        isEditing={isEditing}
        initialData={currentItem}
        onSubmit={handleFormSubmit}
        activities={activities}
      />

      {/* Delete Confirmation Dialog dengan checklist */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Data akan dipindahkan ke Recycle Bin dan dapat dipulihkan dalam 30 hari. Centang untuk melanjutkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex items-center gap-2 my-4">
            <input
              type="checkbox"
              id="delete-check"
              checked={deleteChecked}
              onChange={e => setDeleteChecked(e.target.checked)}
              className="accent-red-600 h-4 w-4"
            />
            <label htmlFor="delete-check" className="text-sm select-none">Saya yakin ingin menghapus data ini</label>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              onClick={() => handleDelete(currentItem && formType, currentItem)}
              disabled={!deleteChecked}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}