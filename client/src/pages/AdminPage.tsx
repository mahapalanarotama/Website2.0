// Firebase imports
import { useEffect, useState } from 'react';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { collection, getDocs, addDoc, doc, deleteDoc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { differenceInDays } from 'date-fns';
import { format, toZonedTime } from 'date-fns-tz';

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
  Book,
  ImagePlus,
  LogOut,
  MapPin,
  PencilLine,
  Plus,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import TrackerMap, { getColor } from '@/components/TrackerMap';
import { addDevLog } from '@/lib/devlog';

export default function AdminPage() {
  // ...existing code...
  // State untuk expand jejak per pengguna
  const [expandedHistoryUser, setExpandedHistoryUser] = useState<string | null>(null);
  // Authentication state
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Data states
  const [activities, setActivities] = useState<Activity[]>([]);
  const [gallerys, setGallery] = useState<GalleryItem[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [learnings, setLearnings] = useState<any[]>([]); // Learning state
  const [trackers, setTrackers] = useState<any[]>([]);
  const [trackerHistory, setTrackerHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('activities');

  // Dialog states
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [formType, setFormType] = useState<'activity' | 'gallery' | 'member' | 'learning'>('activity');
  const [isEditing, setIsEditing] = useState(false);

  // Recycle bin states
  const [recycleBin, setRecycleBin] = useState<any[]>([]);
  const [recycleLoading, setRecycleLoading] = useState(false);
  const [deleteChecked, setDeleteChecked] = useState(false);

  // Tracker selection state
  const [selectedTrackerIds, setSelectedTrackerIds] = useState<string[]>([]);
  const isAllSelected = trackers.length > 0 && selectedTrackerIds.length === trackers.length;

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
      if (email) {
        try {
          await addDevLog({
            action: 'Login',
            detail: 'Login ke halaman admin',
            user: email,
          });
        } catch (logErr: any) {
          window.alert('Gagal menulis log admin: ' + (logErr?.message || logErr));
        }
      }
    } catch (error: any) {
      setAuthError('Login failed: ' + error.message);
    }
  };

  // Fetch data from Firestore
  const fetchData = async () => {
    try {
      // Fetch recycle bin first
      const recycleSnap = await getDocs(collection(db, 'recycle_bin'));
      const recycleIds = new Set(recycleSnap.docs.map(doc => doc.id));
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
      );
      // Fetch learning items
      const learningSnapshot = await getDocs(collection(db, 'learnings'));
      setLearnings(
        learningSnapshot.docs
          .filter(doc => !recycleIds.has(doc.id))
          .map(doc => ({
            id: doc.id,
            title: doc.data().title || '',
            description: doc.data().description || '',
            icon: doc.data().icon || '',
            link: doc.data().link || '',
            createdAt: doc.data().createdAt || null,
            updatedAt: doc.data().updatedAt || null,
          }))
      );
      // Fetch members from "anggota" collection
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
              statusMahasiswa: data.statusMahasiswa,
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
    // Only show the latest tracker per user (doc id = nama)
    setTrackers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  // Fetch all tracker history for all users
  const fetchTrackerHistory = async () => {
    const snap = await getDocs(collection(db, "gps_history"));
    setTrackerHistory(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  // (handleDeleteUserHistory removed because it was unused)

  // Notifikasi sederhana
  const notify = (msg: string) => window.alert(msg);

  // CREATE/EDIT handler
  const handleFormSubmit = async (data: any) => {
    try {
      let collectionName = formType === 'member' ? 'anggota' : formType === 'learning' ? 'learnings' : formType + 's';
      // --- AUTO GENERATE DOCUMENT ID FOR NEW MEMBER ---
      if (formType === 'member' && !isEditing) {
        // ...existing code...
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
          statusMahasiswa: data.statusMahasiswa,
          url: data.url || '',
          updateat: new Date().toISOString(),
          id: docId,
        };
        await setDoc(doc(db, 'anggota', docId), memberData);
        try {
          await addDevLog({
            action: 'Tambah Member',
            detail: `Tambah member baru: ${memberData.namalengkap} (${docId})`,
            user: user?.email || 'unknown',
          });
        } catch (logErr: any) {
          window.alert('Gagal menulis log admin: ' + (logErr?.message || logErr));
        }
        notify('Data anggota berhasil ditambahkan dengan ID otomatis!');
        setFormDialogOpen(false);
        await fetchData();
        return;
      }
      if (formType === 'member' && (data.id || data.customId)) {
        // ...existing code...
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
          statusMahasiswa: data.statusMahasiswa,
          url: data.url || '',
          updateat: new Date().toISOString(),
          id: docId,
        };
        await setDoc(doc(db, collectionName, docId), memberData);
        try {
          await addDevLog({
            action: 'Edit Member',
            detail: `Edit member: ${memberData.namalengkap} (${docId})`,
            user: user?.email || 'unknown',
          });
        } catch (logErr: any) {
          window.alert('Gagal menulis log admin: ' + (logErr?.message || logErr));
        }
        notify('Data anggota berhasil diperbarui!');
      } else if (isEditing && formType === 'activity' && data.id) {
        // ...existing code...
        const activityData = {
          title: data.title || '',
          description: data.description || '',
          date: data.date || '',
          category: data.category || '',
          imageUrl: data.imageUrl || '',
          id: data.id,
        };
        await setDoc(doc(db, 'activities', data.id), activityData);
        try {
          await addDevLog({
            action: 'Edit Activity',
            detail: `Edit activity: ${activityData.title} (${data.id})`,
            user: user?.email || 'unknown',
          });
        } catch (logErr: any) {
          window.alert('Gagal menulis log admin: ' + (logErr?.message || logErr));
        }
        notify('Data kegiatan berhasil diperbarui!');
      } else if (isEditing && formType === 'gallery' && data.id) {
        // ...existing code...
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
        try {
          await addDevLog({
            action: 'Edit Gallery',
            detail: `Edit gallery: ${galleryData.title} (${data.id})`,
            user: user?.email || 'unknown',
          });
        } catch (logErr: any) {
          window.alert('Gagal menulis log admin: ' + (logErr?.message || logErr));
        }
        notify('Data galeri berhasil diperbarui!');
      } else if (isEditing && formType === 'learning' && data.id) {
        // Update learning
        const learningData = {
          title: data.title || '',
          description: data.description || '',
          icon: data.icon || '',
          link: data.link || '',
          updatedAt: new Date().toISOString(),
          id: data.id,
        };
        await setDoc(doc(db, 'learnings', data.id), learningData);
        try {
          await addDevLog({
            action: 'Edit Learning',
            detail: `Edit learning: ${learningData.title} (${data.id})`,
            user: user?.email || 'unknown',
          });
        } catch (logErr: any) {
          window.alert('Gagal menulis log admin: ' + (logErr?.message || logErr));
        }
        notify('Data pembelajaran berhasil diperbarui!');
      } else if (formType === 'activity' && !isEditing) {
        // ...existing code...
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
        try {
          await addDevLog({
            action: 'Tambah Activity',
            detail: `Tambah activity: ${activityData.title}`,
            user: user?.email || 'unknown',
          });
        } catch (logErr: any) {
          window.alert('Gagal menulis log admin: ' + (logErr?.message || logErr));
        }
        notify('Data kegiatan berhasil ditambahkan!');
      } else if (formType === 'learning' && !isEditing) {
        // Create new learning
        const learningData = {
          title: data.title || '',
          description: data.description || '',
          icon: data.icon || '',
          link: data.link || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await addDoc(collection(db, 'learnings'), learningData);
        try {
          await addDevLog({
            action: 'Tambah Learning',
            detail: `Tambah learning: ${learningData.title}`,
            user: user?.email || 'unknown',
          });
        } catch (logErr: any) {
          window.alert('Gagal menulis log admin: ' + (logErr?.message || logErr));
        }
        notify('Data pembelajaran berhasil ditambahkan!');
      } else {
        // ...existing code...
        if (formType === 'member' && data.customId) {
          const { customId, ...memberData } = data;
          await setDoc(doc(db, 'anggota', customId), memberData);
          try {
            await addDevLog({
              action: 'Tambah Member (Custom ID)',
              detail: `Tambah member custom: ${memberData.namalengkap} (${customId})`,
              user: user?.email || 'unknown',
            });
          } catch (logErr: any) {
            window.alert('Gagal menulis log admin: ' + (logErr?.message || logErr));
          }
          notify('Data berhasil ditambahkan dengan ID custom!');
        } else {
          await addDoc(collection(db, collectionName), data);
          try {
            await addDevLog({
              action: 'Tambah Data',
              detail: `Tambah data ke ${collectionName}`,
              user: user?.email || 'unknown',
            });
          } catch (logErr: any) {
            window.alert('Gagal menulis log admin: ' + (logErr?.message || logErr));
          }
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
  const getCollectionName = (type: 'activity' | 'gallery' | 'member' | 'learning') => {
    if (type === 'activity') return 'activities';
    if (type === 'gallery') return 'gallerys';
    if (type === 'member') return 'anggota';
    if (type === 'learning') return 'learnings';
    return '';
  };

  const handleDelete = async (type?: 'activity' | 'gallery' | 'member' | 'learning', item?: any) => {
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
      try {
        await addDevLog({
          action: 'Hapus Data',
          detail: `Hapus data ${originalType} (${itemId})`,
          user: user?.email || 'unknown',
        });
      } catch (logErr: any) {
        window.alert('Gagal menulis log admin: ' + (logErr?.message || logErr));
      }
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
      fetchTrackerHistory(); // fetch history when tracker tab active
    }
  }, [activeTab]);

  // Helper to get WIB time string
  function getWIBTimeString(date: Date | string | undefined | null) {
    if (!date) return '-';
    const timeZone = 'Asia/Jakarta';
    let d: Date;
    if (typeof date === 'string') {
      d = new Date(date);
      if (isNaN(d.getTime())) return date; // fallback: show raw string if invalid
    } else if (date instanceof Date) {
      d = date;
    } else {
      return '-';
    }
    const zoned = toZonedTime(d, timeZone);
    return format(zoned, 'yyyy-MM-dd HH:mm:ss', { timeZone }) + ' WIB';
  }

  // Select all/none for tracker table
  function handleSelectAll() {
    if (isAllSelected) setSelectedTrackerIds([]);
    else setSelectedTrackerIds(trackers.map(t => t.id));
  }

  // Select single for tracker table
  function handleSelectOne(id: string) {
    setSelectedTrackerIds(ids => ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]);
  }

  // Delete selected trackers
  const handleDeleteSelected = async () => {
    if (!window.confirm('Yakin ingin menghapus data tracker yang dipilih?')) return;
    for (const id of selectedTrackerIds) {
      await deleteDoc(doc(db, 'gps_tracker', id));
    }
    setSelectedTrackerIds([]);
    fetchTrackers();
    notify('Data tracker terpilih berhasil dihapus!');
  };

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
  <TabsList className="mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide px-2 -mx-4">
          <TabsTrigger value="activities" className="flex items-center gap-2 group transition-all duration-200 bg-muted data-[state=active]:bg-primary/10 data-[state=active]:shadow-lg data-[state=active]:scale-105 data-[state=inactive]:hover:bg-muted/70 data-[state=inactive]:bg-muted/90">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline transition-all duration-200 group-hover:inline group-focus:inline group-active:inline group-data-[state=active]:inline ml-1 group-hover:font-semibold group-data-[state=active]:font-bold group-data-[state=active]:text-primary">Activities</span>
          </TabsTrigger>
          <TabsTrigger value="gallery" className="flex items-center gap-2 group transition-all duration-200 bg-muted data-[state=active]:bg-primary/10 data-[state=active]:shadow-lg data-[state=active]:scale-105 data-[state=inactive]:hover:bg-muted/70 data-[state=inactive]:bg-muted/90">
            <ImageIcon className="h-4 w-4" />
            <span className="hidden sm:inline transition-all duration-200 group-hover:inline group-focus:inline group-active:inline group-data-[state=active]:inline ml-1 group-hover:font-semibold group-data-[state=active]:font-bold group-data-[state=active]:text-primary">Gallery</span>
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center gap-2 group transition-all duration-200 bg-muted data-[state=active]:bg-primary/10 data-[state=active]:shadow-lg data-[state=active]:scale-105 data-[state=inactive]:hover:bg-muted/70 data-[state=inactive]:bg-muted/90">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline transition-all duration-200 group-hover:inline group-focus:inline group-active:inline group-data-[state=active]:inline ml-1 group-hover:font-semibold group-data-[state=active]:font-bold group-data-[state=active]:text-primary">Members</span>
          </TabsTrigger>
          <TabsTrigger value="learning" className="flex items-center gap-2 group transition-all duration-200 bg-muted data-[state=active]:bg-primary/10 data-[state=active]:shadow-lg data-[state=active]:scale-105 data-[state=inactive]:hover:bg-muted/70 data-[state=inactive]:bg-muted/90">
            <Book className="h-4 w-4" />
            <span className="hidden sm:inline transition-all duration-200 group-hover:inline group-focus:inline group-active:inline group-data-[state=active]:inline ml-1 group-hover:font-semibold group-data-[state=active]:font-bold group-data-[state=active]:text-primary">Learnings</span>
          </TabsTrigger>
          <TabsTrigger value="recycle" className="flex items-center gap-2 group transition-all duration-200 bg-muted data-[state=active]:bg-primary/10 data-[state=active]:shadow-lg data-[state=active]:scale-105 data-[state=inactive]:hover:bg-muted/70 data-[state=inactive]:bg-muted/90">
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline transition-all duration-200 group-hover:inline group-focus:inline group-active:inline group-data-[state=active]:inline ml-1 group-hover:font-semibold group-data-[state=active]:font-bold group-data-[state=active]:text-primary">Recycle Bin</span>
          </TabsTrigger>
          <TabsTrigger value="tracker" className="flex items-center gap-2 group transition-all duration-200 bg-muted data-[state=active]:bg-primary/10 data-[state=active]:shadow-lg data-[state=active]:scale-105 data-[state=inactive]:hover:bg-muted/70 data-[state=inactive]:bg-muted/90">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline transition-all duration-200 group-hover:inline group-focus:inline group-active:inline group-data-[state=active]:inline ml-1 group-hover:font-semibold group-data-[state=active]:font-bold group-data-[state=active]:text-primary">Tracker</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="learning">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Learning Management</h2>
            <Button
              onClick={() => {
                setFormType('learning');
                setIsEditing(false);
                setCurrentItem(null);
                setFormDialogOpen(true);
              }}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Learning
            </Button>
          </div>
          <div className="bg-white rounded-lg shadow overflow-x-auto w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Icon</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {learnings.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>
                      {item.icon ? (
                        <span className="inline-flex items-center gap-1"><i className={`fa fa-${item.icon}`}></i> {item.icon}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.link ? (
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">Lihat</a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setFormType('learning');
                            setIsEditing(true);
                            setCurrentItem(item);
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
                            setCurrentItem(item);
                            setFormType('learning');
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

          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <Table className="min-w-[600px]">
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
            <Button
              onClick={async () => {
                await fetchTrackers();
                await fetchTrackerHistory();
              }}
              variant="outline"
              size="sm"
            >Refresh</Button>
          </div>
          <div className="mb-6">
            <TrackerMap 
              key={
                (Array.isArray(trackers) && trackers.length)
                  ? `${trackers[trackers.length-1].lat},${trackers[trackers.length-1].lon},${trackers[trackers.length-1].time}`
                  : (Array.isArray(trackerHistory) && trackerHistory.length)
                    ? `${trackerHistory[trackerHistory.length-1].lat},${trackerHistory[trackerHistory.length-1].lon},${trackerHistory[trackerHistory.length-1].time}`
                    : 'default-map'
              }
              points={Array.isArray(trackers) ? trackers.map(t => ({ lat: t.lat, lon: t.lon, nama: t.nama, time: t.time })) : []}
              history={Array.isArray(trackerHistory) ? trackerHistory.map(t => ({ lat: t.lat, lon: t.lon, nama: t.nama, time: t.time })) : []}
            />
          </div>
          <div className="overflow-x-auto bg-white rounded-xl shadow-lg p-3 mb-8 border border-gray-200">
            <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gradient-to-r from-blue-50 to-blue-100">
                <tr>
                  <th className="py-2 px-2 border-b font-semibold">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={handleSelectAll}
                        className="accent-primary h-4 w-4 rounded"
                        title="Pilih semua"
                      />
                      Nama
                    </div>
                  </th>
                  <th className="py-2 px-2 border-b font-semibold">Waktu</th>
                  <th className="py-2 px-2 border-b font-semibold">Lat</th>
                  <th className="py-2 px-2 border-b font-semibold">Lon</th>
                  <th className="py-2 px-2 border-b font-semibold">Status</th>
                  <th className="py-2 px-2 border-b font-semibold">View Maps</th>
                </tr>
              </thead>
              <tbody>
                {trackers.map((t) => (
                  <tr key={t.id} className="hover:bg-blue-50 transition-all border-b last:border-b-0">
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedTrackerIds.includes(t.id)}
                          onChange={() => handleSelectOne(t.id)}
                          className="accent-primary h-4 w-4 rounded"
                          title="Pilih baris ini"
                        />
                        {/* Titik warna sesuai polyline/marker */}
                        <span
                          className="inline-block h-3 w-3 rounded-full mr-2 border border-gray-300"
                          style={{ background: (typeof t.nama === 'string') ? getColor(t.nama) : '#888' }}
                          title="Warna penanda di peta"
                        ></span>
<span className="font-medium text-gray-800">{t.nama}</span>
                      </div>
                    </td>
                    <td className="py-2 px-2">{getWIBTimeString(t.time)}</td>
                    <td className="py-2 px-2">{t.lat}</td>
                    <td className="py-2 px-2">{t.lon}</td>
                    <td className="py-2 px-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold shadow-sm ${t.online ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}
                        title={t.online ? 'Pengguna online' : 'Pengguna offline'}>
                        {t.online ? (
                          <span className="h-2 w-2 rounded-full bg-green-500 inline-block"></span>
                        ) : (
                          <span className="h-2 w-2 rounded-full bg-gray-400 inline-block"></span>
                        )}
                        {t.online ? 'Online' : 'Offline'}
                      </span>
                    </td>
                    <td className="py-2 px-2">
                      {t.lat && t.lon ? (
                        <a
                          href={`https://www.google.com/maps?q=${t.lat},${t.lon}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 transition text-xs font-semibold shadow"
                          title="Lihat di Google Maps"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 12.414a4 4 0 10-1.414 1.414l4.243 4.243a1 1 0 001.414-1.414z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                          Maps
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                disabled={selectedTrackerIds.length === 0}
                onClick={handleDeleteSelected}
                className={`rounded shadow flex items-center gap-1 px-3 py-2 text-sm font-semibold transition
                  ${selectedTrackerIds.length === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                    : 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-200 cursor-pointer'}
                `}
                title="Hapus semua tracker yang dipilih"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                Hapus Data Terpilih
              </button>
            </div>
          </div>

          {/* Tabel gps_history: satu baris per nama pengguna (jejak terakhir), expandable */}
          <div className="overflow-x-auto bg-white rounded-xl shadow-lg p-3 border border-gray-200 mt-8">
            <div className="font-bold mb-2 text-blue-900 text-lg">Riwayat Jejak (gps_history, per pengguna)</div>
            <table className="w-full text-xs border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gradient-to-r from-blue-50 to-blue-100">
                <tr>
                  <th className="py-2 px-2 border-b font-semibold">Nama</th>
                  <th className="py-2 px-2 border-b font-semibold">Waktu Terakhir</th>
                  <th className="py-2 px-2 border-b font-semibold">Lat</th>
                  <th className="py-2 px-2 border-b font-semibold">Lon</th>
                  <th className="py-2 px-2 border-b font-semibold">View Maps</th>
                  <th className="py-2 px-2 border-b font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  if (trackerHistory.length === 0) {
                    return <tr><td colSpan={6} className="text-center text-gray-400 py-4">Belum ada data jejak.</td></tr>;
                  }
                  // Gabungkan per nama, ambil jejak terakhir (berdasarkan time terbesar)
                  const grouped = trackerHistory.reduce((acc, cur) => {
                    if (!cur.nama) return acc;
                    if (!acc[cur.nama] || (cur.time && cur.time > acc[cur.nama].time)) {
                      acc[cur.nama] = cur;
                    }
                    return acc;
                  }, {} as Record<string, any>);
                  return Object.values(grouped).map((h: any) => (
                    <>
                      <tr key={h.nama} className="bg-gray-50 hover:bg-blue-50 transition-all border-b last:border-b-0">
                        <td className="py-2 px-2 font-semibold text-blue-900">{h.nama}</td>
                        <td className="py-2 px-2">{getWIBTimeString(h.time)}</td>
                        <td className="py-2 px-2">{h.lat}</td>
                        <td className="py-2 px-2">{h.lon}</td>
                        <td className="py-2 px-2">
                          {h.lat && h.lon ? (
                            <a
                              href={`https://www.google.com/maps?q=${h.lat},${h.lon}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 transition text-xs font-semibold shadow"
                              title="Lihat di Google Maps"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 12.414a4 4 0 10-1.414 1.414l4.243 4.243a1 1 0 001.414-1.414z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                              Maps
                            </a>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-2 px-2 flex flex-col gap-1">
                          <button
                            type="button"
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold shadow ${expandedHistoryUser === h.nama ? 'bg-blue-200 text-blue-900' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'} mb-1`}
                            onClick={() => setExpandedHistoryUser(expandedHistoryUser === h.nama ? null : h.nama)}
                            title={expandedHistoryUser === h.nama ? 'Sembunyikan jejak' : 'Lihat semua jejak'}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={expandedHistoryUser === h.nama ? 'M20 12H4' : 'M12 4v16m8-8H4'} /></svg>
                            {expandedHistoryUser === h.nama ? 'Sembunyikan Jejak' : 'Lihat Semua Jejak'}
                          </button>
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold shadow bg-red-100 text-red-700 hover:bg-red-200"
                            onClick={async () => {
                              if (!window.confirm(`Hapus semua jejak milik '${h.nama}'?`)) return;
                              try {
                                // Hapus semua history milik nama ini
                                const all = trackerHistory.filter(x => x.nama === h.nama);
                                for (const item of all) {
                                  await deleteDoc(doc(db, 'gps_history', item.id));
                                }
                                await fetchTrackerHistory();
                                notify('Semua jejak pengguna berhasil dihapus!');
                                if (expandedHistoryUser === h.nama) setExpandedHistoryUser(null);
                              } catch (err) {
                                notify('Gagal menghapus jejak!');
                                console.error(err);
                              }
                            }}
                            title="Hapus semua jejak pengguna ini"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            Hapus Semua Jejak
                          </button>
                        </td>
                      </tr>
                      {expandedHistoryUser === h.nama && (
                        <tr>
                          <td colSpan={6} className="bg-white p-0">
                            <div className="p-2 border rounded shadow-inner max-h-[300px] overflow-y-auto">
                              <div className="font-semibold mb-1 text-blue-900">Semua Jejak {h.nama}:</div>
                              <table className="w-full text-xs border border-gray-200 rounded-lg overflow-hidden">
                                <thead className="bg-gradient-to-r from-blue-50 to-blue-100">
                                  <tr>
                                    <th className="py-1 px-1 border-b">#</th>
                                    <th className="py-1 px-1 border-b">Waktu</th>
                                    <th className="py-1 px-1 border-b">Lat</th>
                                    <th className="py-1 px-1 border-b">Lon</th>
                                    <th className="py-1 px-1 border-b">Map</th>
                                    <th className="py-1 px-1 border-b">Aksi</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {trackerHistory.filter(x => x.nama === h.nama)
                                    .sort((a, b) => (b.time || 0) - (a.time || 0))
                                    .map((item, idx) => (
                                      <tr key={item.id} className="hover:bg-blue-50 transition-all border-b last:border-b-0">
                                        <td className="py-1 px-1 font-semibold">{idx + 1}</td>
                                        <td className="py-1 px-1">{getWIBTimeString(item.time)}</td>
                                        <td className="py-1 px-1">{item.lat}</td>
                                        <td className="py-1 px-1">{item.lon}</td>
                                        <td className="py-1 px-1">
                                          {item.lat && item.lon ? (
                                            <a
                                              href={`https://www.google.com/maps?q=${item.lat},${item.lon}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 transition text-xs font-semibold shadow"
                                              title="Lihat di Google Maps"
                                            >
                                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 12.414a4 4 0 10-1.414 1.414l4.243 4.243a1 1 0 001.414-1.414z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                              Lokasi
                                            </a>
                                          ) : (
                                            <span className="text-gray-400">-</span>
                                          )}
                                        </td>
                                        <td className="py-1 px-1">
                                          <button
                                            type="button"
                                            className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold shadow bg-red-100 text-red-700 hover:bg-red-200"
                                            onClick={async () => {
                                              if (!window.confirm('Hapus jejak ini?')) return;
                                              try {
                                                await deleteDoc(doc(db, 'gps_history', item.id));
                                                await fetchTrackerHistory();
                                                notify('Jejak berhasil dihapus!');
                                              } catch (err) {
                                                notify('Gagal menghapus jejak!');
                                                console.error(err);
                                              }
                                            }}
                                            title="Hapus jejak ini"
                                          >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                            Hapus
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ));
                })()}
              </tbody>
            </table>
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