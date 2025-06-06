// Firebase imports
import { useEffect, useState } from 'react';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { collection, getDocs, addDoc, doc, deleteDoc } from 'firebase/firestore';
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

// Utilities and animations
import { cn } from '@/lib/utils';

// Icons
import {   Calendar,
  Image as ImageIcon,
  ImagePlus,
  LogOut,
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
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
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
      // Fetch activities
      const activitiesSnapshot = await getDocs(collection(db, 'activities'));
      setActivities(activitiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Activity[]);

      // Fetch gallery items
      const gallerySnapshot = await getDocs(collection(db, 'gallery'));
      setGallery(gallerySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as GalleryItem[]);      // Fetch members from "anggota" collection
      const membersSnapshot = await getDocs(collection(db, 'anggota'));
      setMembers(membersSnapshot.docs.map(doc => {
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
        };
      }));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Fetch recycle bin data
  const fetchRecycleBin = async () => {
    setRecycleLoading(true);
    const snapshot = await getDocs(collection(db, 'recycle_bin'));
    const now = new Date();
    // Hapus otomatis data yang sudah >30 hari
    await Promise.all(snapshot.docs.map(async (docSnap) => {
      const data = docSnap.data();
      if (data.deletedAt && differenceInDays(now, new Date(data.deletedAt)) > 30) {
        await deleteDoc(doc(db, 'recycle_bin', docSnap.id));
      }
    }));
    // Ambil ulang data recycle bin setelah auto-delete
    const freshSnap = await getDocs(collection(db, 'recycle_bin'));
    setRecycleBin(freshSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setRecycleLoading(false);
  };

  // Tab change effect
  useEffect(() => {
    if (activeTab === 'recycle') {
      fetchRecycleBin();
    }
  }, [activeTab]);

  // Handle form submission for AdminFormDialog
  const handleFormSubmit = async (_data: any) => {
    // You can customize this logic based on formType and isEditing
    // For now, just close the dialog and refresh data
    setFormDialogOpen(false);
    await fetchData();
  };

  // Handle delete action for confirmation dialog
  const handleDelete = async () => {
    if (!currentItem) return;
    // Move item to recycle_bin and remove from original collection
    let originalType = formType;
    let itemId = currentItem.id;
    let dataToDelete = { ...currentItem, originalType, deletedAt: new Date().toISOString() };
    try {
      await addDoc(collection(db, 'recycle_bin'), dataToDelete);
      // Remove from original collection
      let collectionName = originalType === 'member' ? 'anggota' : originalType + 's';
      await deleteDoc(doc(db, collectionName, itemId));
      setDeleteDialogOpen(false);
      setDeleteChecked(false);
      setCurrentItem(null);
      await fetchData();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
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
                            setFormType('activity');
                            setCurrentItem(activity);
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
            {gallery.map((item) => (
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
                        setFormType('gallery');
                        setCurrentItem(item);
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
            <Table>              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Informasi Anggota</TableHead>
                  <TableHead>Info Kontak</TableHead>
                  <TableHead>Angkatan</TableHead>
                  <TableHead>Status</TableHead>
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
                            <img 
                              src={member.photoUrl} 
                              alt={member.fullName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary">
                              {member.fullName.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{member.fullName}</div>
                          <div className="text-sm text-gray-500">
                            <Badge variant="outline" className="mt-1">
                              {member.fieldName || 'Belum ada nama lapangan'}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {member.registrationNumber || 'No. Reg belum diatur'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{member.email || '-'}</div>
                        <div className="text-gray-500">{member.phone || '-'}</div>
                        <div className="text-gray-500 mt-1">
                          <Badge variant="secondary" className="text-xs ">
                            {member.gender === 'L' ? 'Laki-laki' : member.gender === 'P' ? 'Perempuan' : 'Belum diatur'}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{member.batchName || 'Belum diatur'}</div>
                        <div className="text-gray-500">
                          {member.batchYear ? `Tahun ${member.batchYear}` : 'Tahun belum diatur'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn(
                        member.membershipStatus === 'Aktif' ? 'bg-green-100 text-green-800' : 
                        member.membershipStatus === 'Tidak Aktif' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      )}>
                        {member.membershipStatus}
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
                            setFormType('member');
                            setCurrentItem(member);
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
                            // Restore: pindahkan kembali ke koleksi asli
                            const { id, originalType, deletedAt, ...restoreData } = item;
                            await addDoc(collection(db, originalType === 'member' ? 'anggota' : originalType + 's'), restoreData);
                            await deleteDoc(doc(db, 'recycle_bin', item.id));
                            fetchRecycleBin();
                            fetchData();
                          }}
                        >Pulihkan</Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={async () => {
                            await deleteDoc(doc(db, 'recycle_bin', item.id));
                            fetchRecycleBin();
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
      </Tabs>

      {/* Form Dialog */}
      <AdminFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        type={formType}
        isEditing={isEditing}
        initialData={currentItem}
        onSubmit={handleFormSubmit}
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
              onClick={handleDelete}
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