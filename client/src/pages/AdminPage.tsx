import { useEffect, useState } from 'react';
import { signInWithEmailAndPassword, onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, getDocs, addDoc, updateDoc, doc, where, deleteDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { TabsContent, Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AdminFormDialog } from "@/components/ui/admin-forms";
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
import { Loader2, Plus, PencilLine, Trash2, IdCard, Mail, Phone } from "lucide-react";
import type { 
  Activity, 
  GalleryItem,
  Member,
  ActivityFormData, 
  GalleryFormData,
  MemberFormData,
  FormData
} from "@/components/ui/admin-forms";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";

// Type guards
function isActivityFormData(data: FormData): data is ActivityFormData {
  return 'title' in data && 'category' in data && 'date' in data;
}

function isGalleryFormData(data: FormData): data is GalleryFormData {
  return 'title' in data && 'activityId' in data;
}

function isMemberFormData(data: FormData): data is MemberFormData {
  return 'fullName' in data && 'fieldName' in data && 'batchName' in data;
}

export default function AdminPage() {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Data states
  const [activities, setActivities] = useState<Activity[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [recycleBinItems, setRecycleBinItems] = useState<any[]>([]);
  
  // UI states
  const [activeTab, setActiveTab] = useState('activities');
  const [showActivityDialog, setShowActivityDialog] = useState(false);
  const [showGalleryDialog, setShowGalleryDialog] = useState(false);
  const [showMemberDialog, setShowMemberDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Activity | GalleryItem | Member | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);

  // Form states
  const [activityForm, setActivityForm] = useState<ActivityFormData>({
    title: '',
    description: '',
    date: '',
    category: '',
    imageUrl: '',
  });

  const [galleryForm, setGalleryForm] = useState<GalleryFormData>({
    title: '',
    description: '',
    imageUrl: '',
    activityId: '',
  });
  const [memberForm, setMemberForm] = useState<MemberFormData>({
    fullName: '',
    fieldName: '',
    batchName: '',
    batchYear: new Date().getFullYear(),
    registrationNumber: '',
    membershipStatus: 'Anggota Muda',
    photoUrl: '',
    email: '',
    phone: '',
    gender: '',
  });

  // Auth listener
  useEffect(() => {
    const checkStorageAvailability = () => {
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
      } catch (e) {
        return false;
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        if (!checkStorageAvailability()) {
          setError('Browser storage restrictions may affect login persistence');
        }
        fetchData();
      }
    });

    return () => unsubscribe();
  }, []);

  // Data fetching
  // Fetch data utama (hanya yang belum dihapus)
  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      // Fetch activities
      const activitiesQuery = query(collection(db, 'activities'), where('deletedAt', '==', null));
      const activitiesSnap = await getDocs(activitiesQuery);
      const activitiesData = activitiesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Activity[];
      setActivities(activitiesData);
      // Fetch gallery
      const galleryQuery = query(collection(db, 'gallery'));
      const gallerySnap = await getDocs(galleryQuery);
      const galleryData = gallerySnap.docs
        .filter(doc => {
          const data = doc.data();
          return !('deletedAt' in data) || data.deletedAt === null;
        })
        .map(doc => ({ id: doc.id, ...doc.data() })) as GalleryItem[];
      setGallery(galleryData);
      // Fetch members
      const membersQuery = query(collection(db, 'anggota'));
      const membersSnap = await getDocs(membersQuery);
      const membersData = membersSnap.docs
        .filter(doc => {
          const data = doc.data();
          // Tampilkan jika deletedAt tidak ada atau null
          return !('deletedAt' in data) || data.deletedAt === null;
        })
        .map(doc => ({
          id: doc.id,
          fullName: doc.data().namalengkap || '',
          fieldName: doc.data().namalapangan || '',
          batchName: doc.data().namaangkatan || '',
          batchYear: doc.data().tahun || new Date().getFullYear(),
          registrationNumber: doc.data().nomorregistrasi || '',
          membershipStatus: doc.data().keanggotaan || 'Anggota Muda',
          photoUrl: doc.data().foto || '',
          email: doc.data().email || '',
          phone: doc.data().phone || '',
          gender: doc.data().gender || '',
        })) as Member[];
      setMembers(membersData);
      await fetchRecycleBinItems();
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch recycle bin items (hanya yang deletedAt != null)
  const fetchRecycleBinItems = async () => {
    const items: any[] = [];
    // Activities
    const actSnap = await getDocs(query(collection(db, 'activities'), where('deletedAt', '!=', null)));
    actSnap.forEach(docu => {
      const data = docu.data();
      if (data.deletedAt) items.push({ id: docu.id, type: 'activity', data, deletedAt: new Date(data.deletedAt), deletedBy: data.deletedBy });
    });
    // Gallery
    const galSnap = await getDocs(query(collection(db, 'gallery'), where('deletedAt', '!=', null)));
    galSnap.forEach(docu => {
      const data = docu.data();
      if (data.deletedAt) items.push({ id: docu.id, type: 'gallery', data, deletedAt: new Date(data.deletedAt), deletedBy: data.deletedBy });
    });
    // Members
    const memSnap = await getDocs(query(collection(db, 'anggota'), where('deletedAt', '!=', null)));
    memSnap.forEach(docu => {
      const data = docu.data();
      if (data.deletedAt) items.push({ id: docu.id, type: 'member', data, deletedAt: new Date(data.deletedAt), deletedBy: data.deletedBy });
    });
    setRecycleBinItems(items);
  };

  // Auth handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code === 'auth/third-party-cookies-blocked') {
        setError('Please enable third-party cookies or use a different browser');
      } else {
        setError('Invalid credentials');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Form handlers
  const handleActivitySubmit = async (data: FormData) => {
    if (!isActivityFormData(data)) {
      throw new Error('Invalid form data for activity');
    }
    
    try {
      setLoading(true);
      setError('');
      const { title, description, date, category, imageUrl } = data;

      const activityData = {
        title,
        description,
        date: new Date(date),
        category,
        imageUrl: imageUrl || null,
        updatedAt: new Date(),
        createdAt: isEditing ? undefined : new Date()
      };

      if (isEditing && selectedItem && 'category' in selectedItem) {
        const activityRef = doc(db, 'activities', selectedItem.id);
        await updateDoc(activityRef, activityData);
      } else {
        await addDoc(collection(db, 'activities'), activityData);
      }

      await fetchData();
      setShowActivityDialog(false);
      resetForms();
    } catch (err: any) {
      console.error('Error submitting activity:', err);
      setError(err.message || 'Failed to save activity');
    } finally {
      setLoading(false);
    }
  };

  const handleGallerySubmit = async (data: FormData) => {
    if (!isGalleryFormData(data)) {
      throw new Error('Invalid form data for gallery');
    }
    
    try {
      setLoading(true);
      setError('');
      const { title, description, imageUrl, activityId } = data;
      
      if (!imageUrl) {
        throw new Error('Image URL is required');
      }

      const galleryData = {
        title,
        description,
        imageUrl,
        activityId: activityId || null,
        updatedAt: new Date(),
        createdAt: isEditing ? undefined : new Date()
      };

      if (isEditing && selectedItem && !('category' in selectedItem) && !('batchName' in selectedItem)) {
        const galleryRef = doc(db, 'gallery', selectedItem.id);
        await updateDoc(galleryRef, galleryData);
      } else {
        await addDoc(collection(db, 'gallery'), galleryData);
      }

      await fetchData();
      setShowGalleryDialog(false);
      resetForms();
    } catch (err: any) {
      console.error('Error submitting gallery item:', err);
      setError(err.message || 'Failed to save gallery item');
    } finally {
      setLoading(false);
    }
  };

  const handleMemberSubmit = async (data: FormData) => {
    if (!isMemberFormData(data)) {
      throw new Error('Invalid form data for member');
    }
    
    try {
      setLoading(true);
      setError('');

      // Validate required fields
      if (!data.fullName.trim()) throw new Error('Nama Lengkap wajib diisi');
      if (!data.fieldName.trim()) throw new Error('Nama Lapangan wajib diisi');
      if (!data.batchName.trim()) throw new Error('Nama Angkatan wajib diisi');
      if (!data.registrationNumber.trim()) throw new Error('Nomor Registrasi wajib diisi');

      // Validate email format if provided
      if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        throw new Error('Format email tidak valid');
      }

      // Validate phone format if provided
      if (data.phone && !/^[\d+\-() ]{10,}$/.test(data.phone)) {
        throw new Error('Format nomor telepon tidak valid');
      }

      // Map the data to Firestore schema
      type MemberFirestoreData = {
        namalengkap: string;
        namalapangan: string;
        namaangkatan: string;
        tahun: number;
        nomorregistrasi: string;
        keanggotaan: string;
        foto: string | null;
        email: string | null;
        phone: string | null;
        gender: string | null;
        updatedAt: Date;
        createdAt?: Date;
      };

      let memberData: MemberFirestoreData = {
        namalengkap: data.fullName.trim(),
        namalapangan: data.fieldName.trim(),
        namaangkatan: data.batchName.trim(),
        tahun: data.batchYear,
        nomorregistrasi: data.registrationNumber.trim(),
        keanggotaan: data.membershipStatus,
        foto: data.photoUrl?.trim() || null,
        email: data.email?.trim() || null,
        phone: data.phone?.trim() || null,
        gender: data.gender?.trim() || null,
        updatedAt: new Date(),
      };

      if (isEditing && selectedItem && 'batchName' in selectedItem) {
        // Update existing member
        const memberRef = doc(db, 'anggota', selectedItem.id);
        await updateDoc(memberRef, memberData);
      } else {
        // Check if registration number exists
        const membersRef = collection(db, 'anggota');
        const q = query(membersRef, where('nomorregistrasi', '==', data.registrationNumber.trim()));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          throw new Error('Nomor Registrasi sudah terdaftar');
        }
        
        // Add createdAt for new members
        memberData = {
          ...memberData,
          createdAt: new Date(),
        };
        await addDoc(collection(db, 'anggota'), memberData);
      }

      await fetchData();
      setShowMemberDialog(false);
      resetForms();
    } catch (err: any) {
      console.error('Error submitting member:', err);
      setError(err.message || 'Gagal menyimpan data anggota');
    } finally {
      setLoading(false);
    }
  };

  // Delete handler
  const handleDelete = async () => {
    if (!selectedItem) return;
    try {
      setLoading(true);
      let ref;
      let now = new Date().toISOString();
      let userEmail = user?.email || 'unknown';
      if ('category' in selectedItem) {
        ref = doc(db, 'activities', selectedItem.id);
      } else if ('batchName' in selectedItem) {
        ref = doc(db, 'anggota', selectedItem.id);
      } else {
        ref = doc(db, 'gallery', selectedItem.id);
      }
      await updateDoc(ref, { deletedAt: now, deletedBy: userEmail });
      await fetchData();
      setShowDeleteDialog(false);
      setSelectedItem(null);
      setDeleteConfirmed(false);
    } catch (err: any) {
      setError(err.message || 'Gagal menghapus data');
    } finally {
      setLoading(false);
    }
  };

  // Restore dari recycle bin
  const restoreFromRecycleBin = async (item: any) => {
    let ref;
    if (item.type === 'activity') ref = doc(db, 'activities', item.id);
    else if (item.type === 'gallery') ref = doc(db, 'gallery', item.id);
    else ref = doc(db, 'anggota', item.id);
    await updateDoc(ref, { deletedAt: null, deletedBy: null });
    await fetchData();
  };
  // Hapus permanen
  const deletePermanent = async (item: any) => {
    let ref;
    if (item.type === 'activity') ref = doc(db, 'activities', item.id);
    else if (item.type === 'gallery') ref = doc(db, 'gallery', item.id);
    else ref = doc(db, 'anggota', item.id);
    await deleteDoc(ref);
    await fetchData();
  };

  // Helper functions
  const resetForms = () => {
    setActivityForm({
      title: '',
      description: '',
      date: '',
      category: '',
      imageUrl: '',
    });

    setGalleryForm({
      title: '',
      description: '',
      imageUrl: '',
      activityId: '',
    });

    setMemberForm({
      fullName: '',
      fieldName: '',
      batchName: '',
      batchYear: new Date().getFullYear(),
      registrationNumber: '',
      membershipStatus: 'Anggota Muda',
      photoUrl: '',
      email: '',
      phone: '',
      gender: '',
    });

    setIsEditing(false);
    setSelectedItem(null);
    setError('');
  };

  const handleEdit = (item: Activity | GalleryItem | Member) => {
    setSelectedItem(item);
    setIsEditing(true);

    if ('category' in item) {
      let dateStr = '';
      if (item.date) {
        const d = new Date(item.date);
        if (!isNaN(d.getTime())) {
          dateStr = d.toISOString().split('T')[0];
        }
      }
      setActivityForm({
        title: item.title,
        description: item.description || '',
        date: dateStr,
        category: item.category,
        imageUrl: item.imageUrl || '',
      });
      setShowActivityDialog(true);
    } else if ('batchName' in item) {
      setMemberForm({
        fullName: item.fullName || '',
        fieldName: item.fieldName || '',
        batchName: item.batchName || '',
        batchYear: item.batchYear || new Date().getFullYear(),
        registrationNumber: item.registrationNumber || '',
        membershipStatus: item.membershipStatus || 'Anggota Muda',
        photoUrl: item.photoUrl || '',
        email: item.email || '',
        phone: item.phone || '',
        gender: item.gender || '',
      });
      setShowMemberDialog(true);
    } else {
      setGalleryForm({
        title: item.title,
        description: item.description || '',
        imageUrl: item.imageUrl,
        activityId: item.activityId || '',
      });
      setShowGalleryDialog(true);
    }
  };

  // If not authenticated, show login form
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button variant="ghost" onClick={handleLogout}>Logout</Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="activities">Kegiatan</TabsTrigger>
            <TabsTrigger value="gallery">Galeri</TabsTrigger>
            <TabsTrigger value="members">Anggota</TabsTrigger>
            <TabsTrigger value="recyclebin">Recycle Bin</TabsTrigger>
          </TabsList>

          {/* Tabs Content */}
          {/* Activities Tab */}
          <TabsContent value="activities">
            <div className="mb-4">
              <Button onClick={() => { resetForms(); setIsEditing(false); setShowActivityDialog(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Activity
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activities.map(activity => (
                <Card key={activity.id}>
                  <CardHeader>
                    <div className="aspect-video relative rounded-lg overflow-hidden mb-4">
                      <img 
                        src={activity.imageUrl || ''} 
                        alt={activity.title}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <CardTitle className="text-xl">{activity.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500 mb-2">
                      {new Date(activity.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm line-clamp-2">{activity.description}</p>
                    <div className="mt-2">
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded">
                        {activity.category}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleEdit(activity)}
                    >
                      <PencilLine className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => { setSelectedItem(activity); setShowDeleteDialog(true); }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery">
            <div className="mb-4">
              <Button onClick={() => { resetForms(); setIsEditing(false); setShowGalleryDialog(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Gallery Item
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {gallery.map(item => (
                <Card key={item.id}>
                  <CardHeader>
                    <div className="aspect-square relative rounded-lg overflow-hidden mb-4">
                      <img 
                        src={item.imageUrl} 
                        alt={item.title}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm line-clamp-2">{item.description}</p>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleEdit(item)}
                    >
                      <PencilLine className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => { setSelectedItem(item); setShowDeleteDialog(true); }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members">
            <div className="mb-4">
              <Button onClick={() => { resetForms(); setShowMemberDialog(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Anggota
              </Button>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Lengkap</TableHead>
                    <TableHead>Nama Lapangan</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telepon</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Nama Angkatan</TableHead>
                    <TableHead>Tahun Angkatan</TableHead>
                    <TableHead>No. Registrasi</TableHead>
                    <TableHead>Keanggotaan</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map(member => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.fullName}</TableCell>
                      <TableCell>{member.fieldName}</TableCell>
                      <TableCell>{member.email ? (
                        <a href={`mailto:${member.email}`} className="flex items-center hover:text-primary">
                          <Mail className="h-4 w-4 mr-1" />
                          {member.email}
                        </a>
                      ) : '-'}</TableCell>
                      <TableCell>{member.phone ? (
                        <a href={`tel:${member.phone}`} className="flex items-center hover:text-primary">
                          <Phone className="h-4 w-4 mr-1" />
                          {member.phone}
                        </a>
                      ) : '-'}</TableCell>
                      <TableCell>{member.gender || '-'}</TableCell>
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
                        <Button 
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(member)}
                          className="text-primary hover:text-primary-foreground hover:bg-primary"
                        >
                          <PencilLine className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline"
                          size="icon"
                          onClick={() => { setSelectedItem(member); setShowDeleteDialog(true); }}
                          className="text-red-500 hover:text-white hover:bg-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => window.open(member.photoUrl || '', '_blank')}
                          className="text-primary hover:text-primary-foreground hover:bg-primary"
                          disabled={!member.photoUrl}
                        >
                          <IdCard className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Recycle Bin Tab */}
          <TabsContent value="recyclebin">
            <div className="mb-4">
              <h2 className="text-xl font-bold mb-2">Recycle Bin</h2>
              <p className="text-sm text-gray-500 mb-4">Data yang dihapus dapat dipulihkan atau dihapus permanen.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recycleBinItems.length === 0 && (
                  <div className="col-span-full text-center text-gray-400">Recycle Bin kosong</div>
                )}
                {recycleBinItems.map(item => (
                  <Card key={item.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {item.type === 'member' ? item.data.namalengkap || item.data.fullName : item.data.title}
                      </CardTitle>
                      <div className="text-xs text-gray-500">Dihapus oleh: {item.deletedBy}<br/>Pada: {item.deletedAt.toLocaleString()}</div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm mb-2">Tipe: {item.type}</div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={async () => { await restoreFromRecycleBin(item); await fetchRecycleBinItems(); await fetchData(); }}>Pulihkan</Button>
                        <Button size="sm" variant="destructive" onClick={async () => { await deletePermanent(item); await fetchRecycleBinItems(); await fetchData(); }}>Hapus Permanen</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Admin Form Dialogs */}
        <AdminFormDialog
          open={showActivityDialog}
          onOpenChange={setShowActivityDialog}
          onSubmit={handleActivitySubmit}
          type="activity"
          isEditing={isEditing}
          initialData={activityForm}
          loading={loading}
          error={error}
        />

        <AdminFormDialog
          open={showGalleryDialog}
          onOpenChange={setShowGalleryDialog}
          onSubmit={handleGallerySubmit}
          type="gallery"
          isEditing={isEditing}
          initialData={galleryForm}
          activities={activities}
          loading={loading}
          error={error}
        />

        <AdminFormDialog
          open={showMemberDialog}
          onOpenChange={setShowMemberDialog}
          onSubmit={handleMemberSubmit}
          type="member"
          isEditing={isEditing}
          initialData={memberForm}
          loading={loading}
          error={error}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={(open) => { setShowDeleteDialog(open); if (!open) setDeleteConfirmed(false); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
              <AlertDialogDescription>
                Tindakan ini tidak dapat dibatalkan. Data akan dipindahkan ke Recycle Bin.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex items-center space-x-2 my-4">
              <input
                id="delete-confirm"
                type="checkbox"
                checked={deleteConfirmed}
                onChange={e => setDeleteConfirmed(e.target.checked)}
              />
              <label htmlFor="delete-confirm" className="text-sm select-none cursor-pointer">
                Saya yakin ingin menghapus data ini
              </label>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction 
                className="bg-red-500 hover:bg-red-600"
                onClick={handleDelete}
                disabled={!deleteConfirmed || loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
