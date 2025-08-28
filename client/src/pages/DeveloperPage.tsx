import { useState, useEffect } from "react";
import ImageInputWithMode from "@/components/ImageInputWithMode";

import { getMeta, setMeta as saveMeta, MetaData } from "@/lib/meta";
import { getPosters, addPoster, updatePoster, deletePoster, PosterConfig } from "@/lib/poster";
import { deleteGithubFile } from "@/lib/github-delete";
import { Timestamp } from "firebase/firestore";
import { getCarouselContent, setCarouselContent, CarouselContentItem } from "@/lib/homepage";
import { DEFAULT_CAROUSEL } from "../shared/carouselDefault";
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getDevLogs, addDevLog, DevLog } from "@/lib/devlog";

const defaultMeta: MetaData = {
  title: "Mahapala Narotama - Organisasi Pecinta Alam | MPN | UKM Narotama",
  description: "Mahapala Narotama (MPN) adalah UKM Pecinta Alam Universitas Narotama Surabaya. Info kegiatan, pembelajaran, dan anggota Mahapala Narotama.",
  keywords: "Mahapala Narotama, mahapala narotama, MPN, ukm narotama, mahapalanarotama, organisasi pecinta alam, mapala, mahasiswa, surabaya, universitas narotama",
  image: "https://opengraph.b-cdn.net/production/images/e0842583-257e-46c1-9055-1c49ee456d3f.jpg?token=p3fN6dOPVL12p7_4AZrWfifa4bvHLMnndwMwNRQCpwg&height=900&width=1200&expires=33285527673",
  favicon: "/favicon.ico",
  faviconFallback: "https://raw.githubusercontent.com/mahapalanarotama/OfficialWebsite/refs/heads/main/Img/favicon.ico",
  faviconPng: "https://raw.githubusercontent.com/mahapalanarotama/OfficialWebsite/refs/heads/main/Img/favicon.png",
  googleFormUrl: "",
  googleFormDownloadUrl: "",
};

export default function DeveloperPage() {
  // Interval ID untuk auto-refresh poster
  const [posterIntervalId, setPosterIntervalId] = useState<NodeJS.Timeout | null>(null);
  // State untuk waktu poster expired berikutnya
  const [nextPosterExpire, setNextPosterExpire] = useState<Date | null>(null);
  const [meta, setMeta] = useState<MetaData>(defaultMeta);
  const [show, setShow] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [pendingMeta, setPendingMeta] = useState(meta);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'poster' | 'meta' | 'logadmin' | 'homepage' | 'visimisi' | 'contact'>('meta');
  // Poster tab state
  const [posters, setPosters] = useState<PosterConfig[]>([]);
  const [loadingPosters, setLoadingPosters] = useState(false);
  const [editPoster, setEditPoster] = useState<PosterConfig | null>(null);
  const [editPosterIdx, setEditPosterIdx] = useState<number | null>(null);
  const [posterDialog, setPosterDialog] = useState(false);
  // Load posters when tab is poster
  useEffect(() => {
    async function refreshPosters() {
      setLoadingPosters(true);
      const data = await getPosters();
      const now = new Date();
      // Filter poster yang sudah expired
      const expired = data.filter(p => p.endTime && p.endTime.toDate() < now && p.id);
      // Hapus semua poster expired
      for (const p of expired) {
        await deletePoster(p.id!);
      }
      // Tampilkan hanya poster yang masih aktif
      const active = data.filter(p => !(p.endTime && p.endTime.toDate() < now));
      setPosters(active);
      setLoadingPosters(false);
      // Hitung waktu poster expired berikutnya
      const futureEnds = active.map(p => p.endTime?.toDate()).filter(d => d && d > now) as Date[];
      if (futureEnds.length > 0) {
        const nextExpire = new Date(Math.min(...futureEnds.map(d => d.getTime())));
        setNextPosterExpire(nextExpire);
      } else {
        setNextPosterExpire(null);
      }
    }
    if (tab === 'poster') {
      refreshPosters();
      // Bersihkan interval sebelumnya
      if (posterIntervalId) clearInterval(posterIntervalId);
      // Jika ada poster yang akan expired, set timeout untuk refresh tepat saat poster expired
      if (nextPosterExpire) {
        const now = new Date();
        const ms = nextPosterExpire.getTime() - now.getTime();
        if (ms > 0) {
          const timeoutId = setTimeout(() => {
            refreshPosters();
          }, ms + 1000); // +1 detik buffer
          setPosterIntervalId(timeoutId as unknown as NodeJS.Timeout);
        }
      }
    }
    // Bersihkan interval saat tab berubah
    return () => {
      if (posterIntervalId) clearTimeout(posterIntervalId);
    };
  }, [tab]);

  // Poster CRUD handlers
  const handlePosterEdit = (item: PosterConfig, idx: number) => {
  // Pastikan id selalu ada di editPoster
  setEditPoster({ ...item, id: item.id });
  setEditPosterIdx(idx);
  setPosterDialog(true);
  };
  const handlePosterAdd = () => {
    setEditPoster({ imageUrl: '', startTime: Timestamp.now(), endTime: Timestamp.now(), linkUrl: '' });
    setEditPosterIdx(null);
    setPosterDialog(true);
  };
  const handlePosterDelete = async (idx: number) => {
    if (window.confirm('Hapus poster ini?')) {
      const poster = posters[idx];
      // Hapus gambar di GitHub jika ada githubPath
      if (poster.githubPath) {
        await deleteGithubFile({
          repo: 'mahapalanarotama/OfficialWebsite',
          path: poster.githubPath,
          branch: 'main',
          token: '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',
        });
      }
      if (poster.id) await deletePoster(poster.id);
      setPosters(prev => prev.filter((_, i) => i !== idx));
    }
  };
  const handlePosterSave = async (poster: PosterConfig) => {
    // Validasi field
    if (!poster.imageUrl || !poster.startTime || !poster.endTime) {
      alert('Semua field wajib diisi!');
      return;
    }
    // Pastikan linkUrl tidak undefined
    const safeLinkUrl = poster.linkUrl === undefined || poster.linkUrl === null ? '' : poster.linkUrl;
    if (editPosterIdx === null) {
      // Add
      await addPoster({
        imageUrl: poster.imageUrl,
        startTime: poster.startTime,
        endTime: poster.endTime,
        linkUrl: safeLinkUrl,
        order: posters.length, // new poster goes to end
        isFirst: false,
        githubPath: poster.githubPath,
      });
    } else if (poster.id) {
      // Jika gambar diubah dan ada githubPath lama, hapus gambar lama di GitHub
      const oldPoster = posters[editPosterIdx];
      if (oldPoster.githubPath && oldPoster.githubPath !== poster.githubPath) {
        await deleteGithubFile({
          repo: 'mahapalanarotama/OfficialWebsite',
          path: oldPoster.githubPath,
          branch: 'main',
          token: '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',
        });
      }
      // Update
      await updatePoster(poster.id, {
        imageUrl: poster.imageUrl,
        startTime: poster.startTime,
        endTime: poster.endTime,
        linkUrl: safeLinkUrl,
        order: poster.order ?? editPosterIdx,
        isFirst: poster.isFirst ?? false,
        githubPath: poster.githubPath,
      });
    } else {
      alert('Gagal edit: ID poster tidak ditemukan!');
      return;
    }
    setPosterDialog(false);
    // Refresh poster list after save
    setLoadingPosters(true);
    const data = await getPosters();
    setPosters(data);
    setLoadingPosters(false);
  };
  // Tipe untuk contact cards
  type ContactCard = {
    title: string;
    description: string;
    content: string[];
  };
  // State untuk contact dialog dan contact cards
  const [contactDialog, setContactDialog] = useState({
    title: '',
    description: '',
    whatsapp: '',
    email: '',
    instagram: '',
  });
  const [contactCards, setContactCards] = useState<ContactCard[]>([]);
  const [loadingContact, setLoadingContact] = useState(false);
  // Firestore: load data saat tab contact dibuka
  useEffect(() => {
    if (tab === 'contact') {
      setLoadingContact(true);
      import('@/lib/firebase').then(({ db }) => {
        import('firebase/firestore').then(({ doc, getDoc }) => {
          getDoc(doc(db, 'homepage', 'contact')).then((snap) => {
            if (snap.exists()) {
              const data = snap.data();
              setContactDialog({
                title: data.title || '',
                description: data.description || '',
                whatsapp: data.whatsapp || '',
                email: data.email || '',
                instagram: data.instagram || '',
              });
              setContactCards(Array.isArray(data.cards)
                ? data.cards.map((c: any) => {
                    // Fallback: if old structure, convert to new
                    if (typeof c === 'object' && c && ('name' in c || 'value' in c || 'icon' in c)) {
                      return {
                        title: c.name || '',
                        description: c.icon || '',
                        content: c.value ? [c.value] : [],
                      };
                    }
                    // New structure
                    if ('title' in c && 'description' in c && 'content' in c) return c;
                    // Unknown, fallback to empty
                    return { title: '', description: '', content: [] };
                  })
                : []);
            } else {
              setContactDialog({ title: '', description: '', whatsapp: '', email: '', instagram: '' });
              setContactCards([]);
            }
            setLoadingContact(false);
          });
        });
      });
    }
  }, [tab]);

  // Handler simpan contact ke Firestore
  // State for edit mode in contact tab
  const [editContactMode, setEditContactMode] = useState(false);
  const [visi, setVisi] = useState('');
  const [misi, setMisi] = useState('');
  const [visiEdit, setVisiEdit] = useState('');
  const [misiEdit, setMisiEdit] = useState('');
  const [loadingVisiMisi, setLoadingVisiMisi] = useState(false);
  const [visiMisiEditMode, setVisiMisiEditMode] = useState(false);
  const [visiMisiConfirmOpen, setVisiMisiConfirmOpen] = useState(false);
  const [visiMisiConfirmed, setVisiMisiConfirmed] = useState(false);
  const [carousel, setCarousel] = useState<CarouselContentItem[]>([]);
  const [carouselLoading, setCarouselLoading] = useState(false);
  const [carouselEdit, setCarouselEdit] = useState<CarouselContentItem | null>(null);
  const [carouselEditIdx, setCarouselEditIdx] = useState<number | null>(null);
  const [carouselDialog, setCarouselDialog] = useState(false);
  const [logs, setLogs] = useState<DevLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [globalConfirmOpen, setGlobalConfirmOpen] = useState(false);
  const [globalConfirmed, setGlobalConfirmed] = useState(false);
  const [pendingSaveType, setPendingSaveType] = useState<'meta' | 'carousel' | 'visimisi' | null>(null);
  const [pendingCarousel, setPendingCarousel] = useState<CarouselContentItem | null>(null);

  // Load visi misi dari Firestore saat tab visimisi dibuka
  useEffect(() => {
    if (tab === 'visimisi') {
      setLoadingVisiMisi(true);
      // Ganti dengan query Firestore asli
      import('@/lib/firebase').then(({ db }) => {
        import('firebase/firestore').then(({ doc, getDoc }) => {
          getDoc(doc(db, 'homepage', 'visimisi')).then((snap) => {
            if (snap.exists()) {
              setVisi(snap.data().visi || '');
              setMisi(snap.data().misi || '');
              setVisiEdit(snap.data().visi || '');
              setMisiEdit(snap.data().misi || '');
              setVisiMisiEditMode(false);
            }
            setLoadingVisiMisi(false);
          });
        });
      });
    }
  }, [tab]);

  const handleSaveVisiMisi = async () => {
    setLoadingVisiMisi(true);
    // Ganti dengan update Firestore asli
    const { db } = await import('@/lib/firebase');
    const { doc, setDoc } = await import('firebase/firestore');
    await setDoc(doc(db, 'homepage', 'visimisi'), { visi: visiEdit, misi: misiEdit }, { merge: true });
    setVisi(visiEdit);
    setMisi(misiEdit);
    setLoadingVisiMisi(false);
    setVisiMisiEditMode(false);
  };

  // Load carousel content when tab is homepage
  useEffect(() => {
    if (tab === 'homepage' && user) {
      setCarouselLoading(true);
      getCarouselContent().then(data => {
        // Always merge default with custom (no duplicate by title)
        const custom = (data || []).filter(c => !DEFAULT_CAROUSEL.some(d => d.title === c.title));
        setCarousel([...DEFAULT_CAROUSEL, ...custom]);
        setCarouselLoading(false);
      });
    }
  }, [tab, user]);

  // Carousel CRUD handlers
  const handleCarouselEdit = (item: CarouselContentItem, idx: number) => {
    setCarouselEdit(item);
    setCarouselEditIdx(idx);
    setCarouselDialog(true);
  };
  const handleCarouselAdd = () => {
    setCarouselEdit({ imageUrl: '', alt: '', title: '', description: '' });
    setCarouselEditIdx(null);
    setCarouselDialog(true);
  };
  const handleCarouselDelete = (idx: number) => {
    if (window.confirm('Hapus slide ini?')) {
      let next = [...carousel];
      next.splice(idx, 1);
      // Always keep at least the default slides
      if (next.length < DEFAULT_CAROUSEL.length) next = [...DEFAULT_CAROUSEL];
      setCarousel(next);
      setCarouselContent(next);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (user) {
      getMeta().then((data) => {
        if (data) {
          setMeta(data);
          setPendingMeta(data);
        }
      });
    }
  }, [user]);

  useEffect(() => {
    if (tab === 'logadmin') {
      setLogsLoading(true);
      getDevLogs().then((data) => {
        setLogs(data);
        setLogsLoading(false);
      });
    }
  }, [tab]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setPendingMeta({ ...pendingMeta, [e.target.name]: e.target.value });
  };

  const handleEdit = () => {
    setEditMode(true);
    setPendingMeta(meta);
  };

  const handleConfirm = async () => {
    await saveMeta(pendingMeta);
    setMeta(pendingMeta);
    setEditMode(false);
    setConfirmOpen(false);
    if (user?.email) {
      await addDevLog({
        action: 'Edit Meta',
        detail: 'Meta diubah melalui halaman developer',
        user: user.email,
      });
    }
  };

  const handleCancel = () => {
    setConfirmOpen(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      if (error.code === 'auth/invalid-credential') {
        setAuthError('Email / Password Salah!');
      } else {
        setAuthError('Login gagal: ' + error.message);
      }
    }
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm">
          <h2 className="text-xl font-bold mb-4 text-center">Login Developer</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input className="w-full border rounded p-2" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
            <input className="w-full border rounded p-2" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
            {authError && <div className="text-red-600 text-sm">{authError}</div>}
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded" type="submit">Login</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-extrabold mb-8 text-center text-primary">Developer Tools</h1>
  <div className="mb-6 flex gap-2 border-b border-blue-200 overflow-x-auto overflow-y-hidden scrollbar-hide px-1 -mx-2 whitespace-nowrap" style={{ WebkitOverflowScrolling: 'touch' }}>
        <button
          className={`flex items-center gap-1 sm:gap-2 group transition-all duration-200 bg-muted px-2 sm:px-4 py-2 rounded-t-lg data-[active=true]:bg-primary/10 data-[active=true]:shadow-lg data-[active=true]:scale-105 data-[active=true]:text-primary data-[active=false]:hover:bg-muted/70 data-[active=false]:bg-muted/90 min-w-[64px] sm:min-w-[140px] justify-center ${tab === 'poster' ? 'data-[active=true]' : 'data-[active=false]'}`}
          data-active={tab === 'poster'}
          onClick={() => setTab('poster')}
        >
          <span className="flex items-center justify-center p-0 sm:p-1">
            {/* Poster icon: vertical rectangle, circle, and text lines */}
            <svg width="22" height="22" className="sm:w-[26px] sm:h-[26px] text-green-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <rect x="5" y="3" width="14" height="18" rx="2"/>
              <circle cx="12" cy="8" r="3"/>
              <line x1="8" y1="15" x2="16" y2="15" />
              <line x1="8" y1="17" x2="16" y2="17" />
            </svg>
          </span>
          <span className="hidden sm:inline transition-all duration-200 group-hover:inline group-focus:inline group-active:inline group-data-[active=true]:inline ml-1 group-hover:font-semibold group-data-[active=true]:font-bold group-data-[active=true]:text-primary">Poster</span>
        </button>
        <button
          className={`flex items-center gap-1 sm:gap-2 group transition-all duration-200 bg-muted px-2 sm:px-4 py-2 rounded-t-lg data-[active=true]:bg-primary/10 data-[active=true]:shadow-lg data-[active=true]:scale-105 data-[active=true]:text-primary data-[active=false]:hover:bg-muted/70 data-[active=false]:bg-muted/90 min-w-[64px] sm:min-w-[140px] justify-center ${tab === 'meta' ? 'data-[active=true]' : 'data-[active=false]'}`}
          data-active={tab === 'meta'}
          onClick={() => setTab('meta')}
        >
          <span className="flex items-center justify-center p-0 sm:p-1"><svg width="22" height="22" className="sm:w-[26px] sm:h-[26px] text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 18v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></span>
          <span className="hidden sm:inline transition-all duration-200 group-hover:inline group-focus:inline group-active:inline group-data-[active=true]:inline ml-1 group-hover:font-semibold group-data-[active=true]:font-bold group-data-[active=true]:text-primary">Meta</span>
        </button>
        <button
          className={`flex items-center gap-1 sm:gap-2 group transition-all duration-200 bg-muted px-2 sm:px-4 py-2 rounded-t-lg data-[active=true]:bg-primary/10 data-[active=true]:shadow-lg data-[active=true]:scale-105 data-[active=true]:text-primary data-[active=false]:hover:bg-muted/70 data-[active=false]:bg-muted/90 min-w-[64px] sm:min-w-[140px] justify-center ${tab === 'logadmin' ? 'data-[active=true]' : 'data-[active=false]'}`}
          data-active={tab === 'logadmin'}
          onClick={() => setTab('logadmin')}
        >
          <span className="flex items-center justify-center p-0 sm:p-1"><svg width="22" height="22" viewBox="0 0 24 24" className="sm:w-[26px] sm:h-[26px] text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></span>
          <span className="hidden sm:inline transition-all duration-200 group-hover:inline group-focus:inline group-active:inline group-data-[active=true]:inline ml-1 group-hover:font-semibold group-data-[active=true]:font-bold group-data-[active=true]:text-primary">Log Admin</span>
        </button>
        <button
          className={`flex items-center gap-1 sm:gap-2 group transition-all duration-200 bg-muted px-2 sm:px-4 py-2 rounded-t-lg data-[active=true]:bg-primary/10 data-[active=true]:shadow-lg data-[active=true]:scale-105 data-[active=true]:text-primary data-[active=false]:hover:bg-muted/70 data-[active=false]:bg-muted/90 min-w-[64px] sm:min-w-[140px] justify-center ${tab === 'homepage' ? 'data-[active=true]' : 'data-[active=false]'}`}
          data-active={tab === 'homepage'}
          onClick={() => setTab('homepage')}
        >
          <span className="flex items-center justify-center p-0 sm:p-1"><svg width="22" height="22" className="sm:w-[26px] sm:h-[26px] text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg></span>
          <span className="hidden sm:inline transition-all duration-200 group-hover:inline group-focus:inline group-active:inline group-data-[active=true]:inline ml-1 group-hover:font-semibold group-data-[active=true]:font-bold group-data-[active=true]:text-primary">Homepage</span>
        </button>
        <button
          className={`flex items-center gap-1 sm:gap-2 group transition-all duration-200 bg-muted px-2 sm:px-4 py-2 rounded-t-lg data-[active=true]:bg-primary/10 data-[active=true]:shadow-lg data-[active=true]:scale-105 data-[active=true]:text-primary data-[active=false]:hover:bg-muted/70 data-[active=false]:bg-muted/90 min-w-[64px] sm:min-w-[140px] justify-center ${tab === 'visimisi' ? 'data-[active=true]' : 'data-[active=false]'}`}
          data-active={tab === 'visimisi'}
          onClick={() => setTab('visimisi')}
        >
          <span className="flex items-center justify-center p-0 sm:p-1"><svg width="22" height="22" viewBox="0 0 24 24" className="sm:w-[26px] sm:h-[26px] text-green-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg></span>
          <span className="hidden sm:inline transition-all duration-200 group-hover:inline group-focus:inline group-active:inline group-data-[active=true]:inline ml-1 group-hover:font-semibold group-data-[active=true]:font-bold group-data-[active=true]:text-primary">Visi & Misi</span>
        </button>
        <button
          className={`flex items-center gap-1 sm:gap-2 group transition-all duration-200 bg-muted px-2 sm:px-4 py-2 rounded-t-lg data-[active=true]:bg-primary/10 data-[active=true]:shadow-lg data-[active=true]:scale-105 data-[active=true]:text-primary data-[active=false]:hover:bg-muted/70 data-[active=false]:bg-muted/90 min-w-[64px] sm:min-w-[140px] justify-center ${tab === 'contact' ? 'data-[active=true]' : 'data-[active=false]'}`}
          data-active={tab === 'contact'}
          onClick={() => setTab('contact')}
        >
          <span className="flex items-center justify-center p-0 sm:p-1"><svg width="22" height="22" className="sm:w-[26px] sm:h-[26px] text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10.5a8.38 8.38 0 0 1-1.9.5 3.48 3.48 0 0 0-2.6-1.5c-1.7 0-3 1.3-3 3 0 .2 0 .4.1.6A8.5 8.5 0 0 1 3 5.5a3 3 0 0 0 1 4c-.9 0-1.7-.3-2.4-.7v.1c0 1.5 1.1 2.8 2.6 3.1-.3.1-.6.2-.9.2-.2 0-.4 0-.6-.1.4 1.2 1.5 2.1 2.8 2.1A6.9 6.9 0 0 1 2 18.5c-.2 0-.4 0-.6-.1A9.9 9.9 0 0 0 8 20.5c6.3 0 9.8-5.2 9.8-9.8v-.4A7.1 7.1 0 0 0 21 10.5z"/></svg></span>
          <span className="hidden sm:inline transition-all duration-200 group-hover:inline group-focus:inline group-active:inline group-data-[active=true]:inline ml-1 group-hover:font-semibold group-data-[active=true]:font-bold group-data-[active=true]:text-primary">Contact</span>
        </button>
      </div>
      <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl shadow-lg p-8 border border-blue-100 min-h-[400px]">
        {tab === 'poster' && (
          <>
            <h2 className="font-bold text-xl mb-4 text-green-900 flex items-center gap-2">
              {/* Poster icon: vertical rectangle, circle, and text lines */}
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                <rect x="5" y="3" width="18" height="18" rx="2"/>
                <circle cx="14" cy="9" r="3"/>
                <line x1="10" y1="16" x2="20" y2="16" />
                <line x1="10" y1="18" x2="20" y2="18" />
              </svg>
              Konfigurasi Poster Popup
            </h2>
            <div className="flex justify-end mb-4">
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow" onClick={handlePosterAdd}>Tambah Poster</button>
            </div>
            {loadingPosters ? (
              <div className="text-center py-10 text-gray-500">Memuat data poster...</div>
            ) : posters.length === 0 ? (
              <div className="text-center py-10 text-gray-400">Belum ada data poster.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-green-100 text-green-900">
                      <th className="p-2">Urutan</th>
                      <th className="p-2">Gambar</th>
                      <th className="p-2">Start</th>
                      <th className="p-2">End</th>
                      <th className="p-2">Link</th>
                      <th className="p-2">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posters.map((item, idx) => (
                      <tr key={item.id || idx} className="border-b last:border-b-0 group hover:bg-green-50" draggable
                        onDragStart={e => {
                          e.dataTransfer.setData('posterIdx', String(idx));
                        }}
                        onDragOver={e => e.preventDefault()}
                        onDrop={async e => {
                          const fromIdx = Number(e.dataTransfer.getData('posterIdx'));
                          if (fromIdx === idx) return;
                          const newPosters = [...posters];
                          const [moved] = newPosters.splice(fromIdx, 1);
                          newPosters.splice(idx, 0, moved);
                          // Update order field
                          for (let i = 0; i < newPosters.length; i++) {
                            newPosters[i].order = i;
                            if (newPosters[i].id) await updatePoster(newPosters[i].id!, { order: i });
                          }
                          setPosters(newPosters);
                        }}
                      >
                        <td className="p-2 text-center">
                          <span className="font-bold">{item.isFirst ? '★' : idx + 1}</span>
                          <button
                            className={`ml-2 px-2 py-1 rounded text-xs ${item.isFirst ? 'bg-yellow-400 text-white' : 'bg-gray-200 text-gray-700'} hover:bg-yellow-500`}
                            title="Tandai sebagai poster utama"
                            onClick={async e => {
                              e.stopPropagation();
                              // Unmark all others
                              const newPosters = posters.map((p, i) => ({ ...p, isFirst: i === idx }));
                              for (let i = 0; i < newPosters.length; i++) {
                                if (newPosters[i].id) await updatePoster(newPosters[i].id!, { isFirst: i === idx });
                              }
                              setPosters(newPosters);
                            }}
                          >{item.isFirst ? 'Utama' : 'Jadikan Utama'}</button>
                        </td>
                        <td className="p-2">
                          <img
                            src={(() => {
                              // Google Drive
                              if (/drive\.google\.com\/file\/d\/(.+?)\//.test(item.imageUrl)) {
                                const match = item.imageUrl.match(/drive\.google\.com\/file\/d\/(.+?)\//);
                                return match ? `https://drive.google.com/uc?export=view&id=${match[1]}` : item.imageUrl;
                              }
                              // Google Photos
                              if (/photos\.google\.com\/share\/.+\?key=/.test(item.imageUrl)) {
                                return item.imageUrl;
                              }
                              return item.imageUrl;
                            })()}
                            alt="Poster"
                            className="h-16 w-28 object-cover rounded"
                          />
                        </td>
                        <td className="p-2">{item.startTime?.toDate().toLocaleString('id-ID', { hour12: false })}</td>
                        <td className="p-2">{item.endTime?.toDate().toLocaleString('id-ID', { hour12: false })}</td>
                        <td className="p-2 max-w-xs truncate">{item.linkUrl || '-'}</td>
                        <td className="p-2 flex gap-2">
                          <button className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded" onClick={() => handlePosterEdit(item, idx)}>Edit</button>
                          <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded" onClick={() => handlePosterDelete(idx)}>Hapus</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="text-xs text-gray-500 mt-2">Seret baris untuk mengubah urutan poster. Klik "Jadikan Utama" untuk menandai poster utama (paling depan).</div>
              </div>
            )}
            {/* Dialog for add/edit poster */}
            {posterDialog && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-md relative overflow-y-auto scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-blue-100 flex flex-col" style={{ maxHeight: '80vh', padding: 0 }}>
                  <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3" style={{ position: 'sticky', top: 0, zIndex: 20, background: 'white' }}>
                    <h3 className="text-lg font-bold m-0">{editPosterIdx === null ? 'Tambah Poster' : 'Edit Poster'}</h3>
                    <button className="text-gray-600 hover:text-red-500 text-2xl font-bold p-0 m-0" onClick={() => setPosterDialog(false)} style={{ lineHeight: 1 }}>×</button>
                  </div>
                  <form onSubmit={e => {e.preventDefault(); if(editPoster) handlePosterSave(editPoster);}} className="space-y-3 px-4 pt-4 pb-4 flex-1">
                    <div>
                      <label className="block font-medium mb-1">Poster Image <span className="text-red-600">*</span></label>
                      {/* ImageInputWithMode: allow user to choose between link or upload to GitHub */}
                      <div className="max-w-xs w-full mx-auto">
                        <div style={{ minWidth: '220px', maxWidth: '100%' }}>
                          <ImageInputWithMode
                            value={editPoster?.imageUrl || ""}
                            onChange={(newUrl: string) => {
                              setEditPoster(editPoster ? { ...editPoster, imageUrl: newUrl } : null);
                            }}
                            repo="mahapalanarotama/OfficialWebsite"
                            path="Img/poster"
                          />
                        </div>
                      </div>
                    </div>
                    {/* Start Date & Time */}
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block font-medium mb-1">Start Date <span className="text-red-600">*</span></label>
                        <input
                          type="date"
                          className="w-full border rounded p-2"
                          value={editPoster?.startTime ? editPoster.startTime.toDate().toISOString().slice(0,10) : ''}
                          onChange={e => {
                            const dateVal = e.target.value;
                            let timeVal = editPoster?.startTime ? editPoster.startTime.toDate().toISOString().slice(11,16) : '00:00';
                            if (dateVal) {
                              // Gabungkan tanggal dan jam secara manual agar tidak offset
                              const [hour, minute] = timeVal.split(':');
                              const dt = new Date(dateVal);
                              dt.setHours(Number(hour || 0), Number(minute || 0), 0, 0);
                              setEditPoster(editPoster ? { ...editPoster, startTime: Timestamp.fromDate(dt) } : null);
                            }
                          }}
                          required
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block font-medium mb-1">Start Time <span className="text-red-600">*</span></label>
                        <input
                          type="time"
                          className="w-full border rounded p-2"
                          value={(() => {
                            if (!editPoster?.startTime) return '';
                            const d = editPoster.startTime.toDate();
                            const h = String(d.getHours()).padStart(2, '0');
                            const m = String(d.getMinutes()).padStart(2, '0');
                            return `${h}:${m}`;
                          })()}
                          onChange={e => {
                            const timeVal = e.target.value;
                            let dateVal = editPoster?.startTime ? (() => {
                              const d = editPoster.startTime.toDate();
                              return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
                            })() : '';
                            if (dateVal && timeVal) {
                              const [hour, minute] = timeVal.split(':');
                              const dt = new Date(dateVal);
                              dt.setHours(Number(hour || 0), Number(minute || 0), 0, 0);
                              setEditPoster(editPoster ? { ...editPoster, startTime: Timestamp.fromDate(dt) } : null);
                            }
                          }}
                          required
                        />
                      </div>
                    </div>
                    {/* End Date & Time */}
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block font-medium mb-1">End Date <span className="text-red-600">*</span></label>
                        <input
                          type="date"
                          className="w-full border rounded p-2"
                          value={editPoster?.endTime ? editPoster.endTime.toDate().toISOString().slice(0,10) : ''}
                          onChange={e => {
                            const dateVal = e.target.value;
                            let timeVal = editPoster?.endTime ? editPoster.endTime.toDate().toISOString().slice(11,16) : '00:00';
                            if (dateVal) {
                              const [hour, minute] = timeVal.split(':');
                              const dt = new Date(dateVal);
                              dt.setHours(Number(hour || 0), Number(minute || 0), 0, 0);
                              setEditPoster(editPoster ? { ...editPoster, endTime: Timestamp.fromDate(dt) } : null);
                            }
                          }}
                          required
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block font-medium mb-1">End Time <span className="text-red-600">*</span></label>
                        <input
                          type="time"
                          className="w-full border rounded p-2"
                          value={(() => {
                            if (!editPoster?.endTime) return '';
                            const d = editPoster.endTime.toDate();
                            const h = String(d.getHours()).padStart(2, '0');
                            const m = String(d.getMinutes()).padStart(2, '0');
                            return `${h}:${m}`;
                          })()}
                          onChange={e => {
                            const timeVal = e.target.value;
                            let dateVal = editPoster?.endTime ? (() => {
                              const d = editPoster.endTime.toDate();
                              return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
                            })() : '';
                            if (dateVal && timeVal) {
                              const [hour, minute] = timeVal.split(':');
                              const dt = new Date(dateVal);
                              dt.setHours(Number(hour || 0), Number(minute || 0), 0, 0);
                              setEditPoster(editPoster ? { ...editPoster, endTime: Timestamp.fromDate(dt) } : null);
                            }
                          }}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block font-medium mb-1">Link URL (optional)</label>
                      <input type="text" className="w-full border rounded p-2" value={editPoster?.linkUrl || ''} onChange={e => setEditPoster(editPoster ? {...editPoster, linkUrl: e.target.value} : null)} />
                    </div>
                    <div className="flex justify-end border-t border-gray-200 px-4 py-3" style={{ position: 'sticky', bottom: 0, zIndex: 20, background: 'white' }}>
                      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700">Simpan</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
        {tab === 'contact' && (
          <>
            <h2 className="font-bold text-xl mb-4 text-blue-900 flex items-center gap-2">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M21 10.5a8.38 8.38 0 0 1-1.9.5 3.48 3.48 0 0 0-2.6-1.5c-1.7 0-3 1.3-3 3 0 .2 0 .4.1.6A8.5 8.5 0 0 1 3 5.5a3 3 0 0 0 1 4c-.9 0-1.7-.3-2.4-.7v.1c0 1.5 1.1 2.8 2.6 3.1-.3.1-.6.2-.9.2-.2 0-.4 0-.6-.1.4 1.2 1.5 2.1 2.8 2.1A6.9 6.9 0 0 1 2 18.5c-.2 0-.4 0-.6-.1A9.9 9.9 0 0 0 8 20.5c6.3 0 9.8-5.2 9.8-9.8v-.4A7.1 7.1 0 0 0 21 10.5z"/></svg>
              Edit Kontak & Hubungi Kami
            </h2>
            {!editContactMode ? (
              <>
                <div className="mb-6">
                  <div className="font-semibold mb-2">Dialog Hubungi Kami</div>
                  <div className="mb-2"><b>Judul:</b> {contactDialog.title}</div>
                  <div className="mb-2"><b>Deskripsi:</b> {contactDialog.description}</div>
                  <div className="mb-2"><b>WhatsApp:</b> {contactDialog.whatsapp}</div>
                  <div className="mb-2"><b>Email:</b> {contactDialog.email}</div>
                  <div className="mb-2"><b>Instagram:</b> {contactDialog.instagram}</div>
                </div>
                <div className="mb-6">
                  <div className="font-semibold mb-2">Contact Cards (Pendaftaran)</div>
                  {contactCards.length === 0 && <div className="text-gray-400">Belum ada contact card.</div>}
                  {contactCards.map((card, idx) => (
                    <div key={idx} className="border rounded p-3 mb-3 bg-white shadow-sm flex items-start gap-3">
                      {/* Icon kiri jika ada */}
                      {card.description && card.description.startsWith('fa-') ? (
                        <i className={`fa ${card.description} text-xl text-blue-600 mt-1`} aria-hidden="true" style={{ minWidth: 28, textAlign: 'center' }}></i>
                      ) : card.description && card.description.startsWith('mdi-') ? (
                        <span className={`mdi ${card.description} text-xl text-blue-600 mt-1`} style={{ minWidth: 28, textAlign: 'center' }}></span>
                      ) : card.description && card.description.startsWith('svg:') ? (
                        <span className="inline-block mt-1" style={{ minWidth: 28, textAlign: 'center' }} dangerouslySetInnerHTML={{ __html: card.description.slice(4) }} />
                      ) : null}
                      <div className="flex-1">
                        <div className="font-bold text-base mb-1">{card.title}</div>
                        {card.content.map((line, i) => (
                          line.trim() === ''
                            ? <div key={i} style={{ height: '1em' }} />
                            : <div className="text-sm" key={i}>{line}</div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 justify-end">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow" onClick={() => setEditContactMode(true)}>Edit</button>
                </div>
              </>
            ) : (
              <>
                <div className="mb-6">
                  <div className="font-semibold mb-2">Dialog Hubungi Kami</div>
                  <input className="w-full border rounded p-2 mb-2" placeholder="Judul (Default=Hubungi Kami)" value={contactDialog.title} onChange={e => setContactDialog({ ...contactDialog, title: e.target.value })} />
                  <textarea className="w-full border rounded p-2 mb-2" placeholder="Deskripsi (Opsional)" value={contactDialog.description} onChange={e => setContactDialog({ ...contactDialog, description: e.target.value })} />
                  <input className="w-full border rounded p-2 mb-2" placeholder="WhatsApp (+628xx-xxxx-xxxx)" value={contactDialog.whatsapp} onChange={e => setContactDialog({ ...contactDialog, whatsapp: e.target.value })} />
                  <input className="w-full border rounded p-2 mb-2" placeholder="Email (xxxx@gmail.com)" value={contactDialog.email} onChange={e => setContactDialog({ ...contactDialog, email: e.target.value })} />
                  <input className="w-full border rounded p-2 mb-2" placeholder="Instagram (not '@' just 'Admin')" value={contactDialog.instagram} onChange={e => setContactDialog({ ...contactDialog, instagram: e.target.value })} />
                </div>
                <div className="mb-6">
                  <div className="font-semibold mb-2">Contact Cards (Pendaftaran)</div>
                  {contactCards.map((card, idx) => (
                    <div key={idx} className="border rounded p-3 mb-3 bg-white shadow-sm flex items-start gap-3">
                      {/* Icon kiri jika ada */}
                      {card.description && card.description.startsWith('fa-') ? (
                        <i className={`fa ${card.description} text-xl text-blue-600 mt-1`} aria-hidden="true" style={{ minWidth: 28, textAlign: 'center' }}></i>
                      ) : card.description && card.description.startsWith('mdi-') ? (
                        <span className={`mdi ${card.description} text-xl text-blue-600 mt-1`} style={{ minWidth: 28, textAlign: 'center' }}></span>
                      ) : card.description && card.description.startsWith('svg:') ? (
                        <span className="inline-block mt-1" style={{ minWidth: 28, textAlign: 'center' }} dangerouslySetInnerHTML={{ __html: card.description.slice(4) }} />
                      ) : null}
                      <div className="flex-1">
                        <div className="flex gap-2 mb-2">
                          <input className="border rounded p-2 flex-1" placeholder="Judul" value={card.title} onChange={e => {
                            setContactCards(prev => prev.map((c, i) => i === idx ? { ...c, title: e.target.value } : c));
                          }} />
                          <input className="border rounded p-2 flex-1" placeholder="Deskripsi (opsional, isi kode ikon: fa-whatsapp, mdi-phone, svg:<svg...>)" value={card.description} onChange={e => {
                            setContactCards(prev => prev.map((c, i) => i === idx ? { ...c, description: e.target.value } : c));
                          }} />
                        </div>
                        <div className="mb-2">
                          <label className="block text-xs text-gray-500 mb-1">Isi Konten (1 baris = 1 item)</label>
                          <textarea
                            className="border rounded p-2 w-full"
                            rows={3}
                            placeholder="Isi konten, pisahkan baris untuk setiap item"
                            value={card.content.join('\n')}
                            onChange={e => {
                              const lines = e.target.value.split(/\r?\n/);
                              setContactCards(prev => prev.map((c, i) => i === idx ? { ...c, content: lines } : c));
                            }}
                          />
                        </div>
                        {idx < 3 ? (
                          <button className="bg-gray-300 text-gray-400 px-2 py-1 rounded cursor-not-allowed" disabled>Hapus (Wajib Ada)</button>
                        ) : (
                          <button
                            className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                            onClick={() => {
                              const confirmed = window.confirm('Centang kotak di bawah ini untuk menghapus:\n\u2611 Saya yakin ingin menghapus card ini.');
                              if (confirmed) {
                                setContactCards(prev => prev.filter((_, i) => i !== idx));
                              }
                            }}
                          >Hapus</button>
                        )}
                      </div>
                    </div>
                  ))}
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mt-2" onClick={() => setContactCards(prev => [...prev, { title: '', description: '', content: [''] }])}>Tambah Card</button>
                </div>
                <div className="flex gap-2 justify-end">
                  <button className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded" onClick={() => setEditContactMode(false)}>Batal</button>
                  <button
                    className={`bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow ${loadingContact ? 'opacity-60 cursor-not-allowed' : ''}`}
                    disabled={loadingContact}
                    onClick={() => {
                      setPendingSaveType('contact' as any);
                      setGlobalConfirmOpen(true);
                    }}
                  >
                    {loadingContact ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </>
            )}
          </>
        )}
        {tab === 'visimisi' && (
          <>
            <h2 className="font-bold text-xl mb-4 text-green-900 flex items-center gap-2">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
              Visi & Misi Homepage
            </h2>
            {loadingVisiMisi ? (
              <div className="text-center text-gray-500">Memuat data...</div>
            ) : (
              <>
                {!visiMisiEditMode ? (
                  <>
                    <div className="space-y-6">
                      <div>
                        <label className="block font-semibold mb-2 text-blue-700">Visi (Tampil di Homepage):</label>
                        <div className="mb-2 p-2 border rounded text-gray-700 whitespace-pre-line bg-transparent">{visi}</div>
                      </div>
                      <div>
                        <label className="block font-semibold mb-2 text-green-700">Misi (Tampil di Homepage):</label>
                        <div className="mb-2 p-2 border rounded text-gray-700 bg-transparent">
                          {misi.split(/\r?\n/).filter(Boolean).length > 1 ? (
                            <ul className="list-disc pl-5 space-y-1">
                              {misi.split(/\r?\n/).filter(Boolean).map((line, idx) => (
                                <li key={idx}>{line}</li>
                              ))}
                            </ul>
                          ) : (
                            <span className="whitespace-pre-line">{misi}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end mt-6">
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow" onClick={() => { setVisiMisiEditMode(true); setVisiEdit(visi); setMisiEdit(misi); }}>Edit</button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <label className="block font-semibold mb-2 text-blue-700">Edit Visi:</label>
                      <textarea className="w-full border rounded p-2 bg-white" rows={2} value={visiEdit} onChange={e => setVisiEdit(e.target.value)} placeholder="Masukkan visi organisasi..." />
                    </div>
                    <div>
                      <label className="block font-semibold mb-2 text-green-700">Edit Misi:</label>
                      <textarea className="w-full border rounded p-2 bg-white" rows={4} value={misiEdit} onChange={e => setMisiEdit(e.target.value)} placeholder="Masukkan misi organisasi..." />
                      <div className="text-xs text-gray-500 mt-1 mb-2">Tekan <b>Enter</b> untuk membuat misi dalam bentuk list/poin.</div>
                      <div className="mt-3">
                        <span className="block font-semibold mb-1 text-green-700">Preview Misi:</span>
                        {misiEdit.split(/\r?\n/).filter(Boolean).length > 1 ? (
                          <ul className="text-gray-700 list-disc pl-5 space-y-1">
                            {misiEdit.split(/\r?\n/).filter(Boolean).map((line, idx) => (
                              <li key={idx}>{line}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-700 text-justify whitespace-pre-line">{misiEdit}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-4 justify-end mt-2">
                      <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow" onClick={() => setVisiMisiConfirmOpen(true)} disabled={loadingVisiMisi}>Simpan</button>
                      <button className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded" onClick={() => { setVisiEdit(visi); setMisiEdit(misi); setVisiMisiEditMode(false); }}>Batal</button>
                    </div>
                    {visiMisiConfirmOpen && (
                      <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                        <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
                          <h3 className="font-bold text-lg mb-2">Konfirmasi Simpan Visi & Misi</h3>
                          <p className="mb-4">Pastikan data sudah benar sebelum disimpan ke homepage.</p>
                          <label className="flex items-center gap-2 mb-4">
                            <input type="checkbox" checked={visiMisiConfirmed} onChange={e => setVisiMisiConfirmed(e.target.checked)} />
                            <span className="text-sm">Saya sudah memeriksa dan data visi & misi sudah benar.</span>
                          </label>
                          <div className="flex gap-2 justify-end">
                            <button
                              className={`px-4 py-2 rounded text-white transition ${(!visiMisiConfirmed || loadingVisiMisi)
                                ? 'bg-green-300 cursor-not-allowed opacity-60'
                                : 'bg-green-600 hover:bg-green-700 shadow'}`}
                              disabled={!visiMisiConfirmed || loadingVisiMisi}
                              onClick={async () => {
                                await handleSaveVisiMisi();
                                window.dispatchEvent(new Event('visimisi-updated'));
                                setVisiMisiConfirmOpen(false);
                                setVisiMisiConfirmed(false);
                              }}
                            >
                              Ya, Simpan
                            </button>
                            <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded" onClick={() => { setVisiMisiConfirmOpen(false); setVisiMisiConfirmed(false); }}>Batal</button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}
        {tab === 'homepage' && (
          <>
            <h2 className="font-bold text-xl mb-4 text-blue-900 flex items-center gap-2">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
              Homepage Carousel Editor
            </h2>
            {carouselLoading ? (
              <div className="text-center py-10 text-gray-500">Memuat data carousel...</div>
            ) : (
              <>
                <div className="flex justify-end mb-4">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow" onClick={handleCarouselAdd}>Tambah Slide</button>
                </div>
                {carousel.length === 0 ? (
                  <div className="text-center text-gray-400 py-10">Belum ada data carousel.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-blue-100 text-blue-900">
                          <th className="p-2">Gambar</th>
                          <th className="p-2">Alt</th>
                          <th className="p-2">Judul</th>
                          <th className="p-2">Deskripsi</th>
                          <th className="p-2">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {carousel.map((item, idx) => (
                          <tr key={idx} className="border-b last:border-b-0">
                            <td className="p-2"><img src={item.imageUrl} alt={item.alt} className="h-16 w-28 object-cover rounded" /></td>
                            <td className="p-2 max-w-xs truncate">{item.alt}</td>
                            <td className="p-2 max-w-xs truncate">{item.title}</td>
                            <td className="p-2 max-w-xs truncate">{item.description}</td>
                            <td className="p-2 flex gap-2">
                              <button className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded" onClick={() => handleCarouselEdit(item, idx)}>Edit</button>
                              <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded" onClick={() => handleCarouselDelete(idx)}>Hapus</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {/* Dialog for add/edit */}
                {carouselDialog && (
                  <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
                      <h3 className="font-bold text-lg mb-4">{carouselEditIdx === null ? 'Tambah' : 'Edit'} Slide Carousel</h3>
                      <div className="grid gap-3 mb-4">
                        <div>
                          <label className="block font-medium mb-1">Gambar (URL)</label>
                          <input className="w-full border rounded p-2" value={carouselEdit?.imageUrl || ''} onChange={e => setCarouselEdit({ ...carouselEdit!, imageUrl: e.target.value })} placeholder="https://..." />
                        </div>
                        <div>
                          <label className="block font-medium mb-1">Alt</label>
                          <input className="w-full border rounded p-2" value={carouselEdit?.alt || ''} onChange={e => setCarouselEdit({ ...carouselEdit!, alt: e.target.value })} />
                        </div>
                        <div>
                          <label className="block font-medium mb-1">Judul</label>
                          <input className="w-full border rounded p-2" value={carouselEdit?.title || ''} onChange={e => setCarouselEdit({ ...carouselEdit!, title: e.target.value })} />
                        </div>
                        <div>
                          <label className="block font-medium mb-1">Deskripsi</label>
                          <textarea className="w-full border rounded p-2" value={carouselEdit?.description || ''} onChange={e => setCarouselEdit({ ...carouselEdit!, description: e.target.value })} />
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded" onClick={() => { setPendingSaveType('carousel'); setPendingCarousel(carouselEdit); setGlobalConfirmOpen(true); }}>Simpan</button>
                        <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded" onClick={() => { setCarouselDialog(false); setCarouselEdit(null); setCarouselEditIdx(null); }}>Batal</button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
        {tab === 'meta' && (
          <>
            <h2 className="font-bold text-xl mb-4 text-blue-900 flex items-center gap-2">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M16 18v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Meta Head Editor
            </h2>
            {!editMode ? (
              <>
                <div className="grid grid-cols-1 gap-3 mb-4">
                  <div className="truncate max-w-full"><span className="font-semibold">Title:</span> {meta.title}</div>
                  <div className="truncate max-w-full"><span className="font-semibold">Description:</span> {meta.description}</div>
                  <div className="truncate max-w-full"><span className="font-semibold">Keywords:</span> {meta.keywords}</div>
                  <div className="truncate max-w-full"><span className="font-semibold">Image:</span> <a href={meta.image} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">{meta.image}</a></div>
                  <div className="truncate max-w-full"><span className="font-semibold">Favicon:</span> <a href={meta.favicon} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">{meta.favicon}</a></div>
                  <div className="truncate max-w-full"><span className="font-semibold">Favicon Fallback:</span> <a href={meta.faviconFallback} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">{meta.faviconFallback}</a></div>
                  <div className="truncate max-w-full"><span className="font-semibold">Favicon PNG:</span> <a href={meta.faviconPng} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">{meta.faviconPng}</a></div>
                  <div className="truncate max-w-full"><span className="font-semibold">Link Google Formulir Pendaftaran:</span> <a href={meta.googleFormUrl} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">{meta.googleFormUrl}</a></div>
                </div>
                <div className="flex gap-2">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow" onClick={handleEdit}>Edit</button>
                  <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded" onClick={() => setShow(!show)}>
                    {show ? 'Sembunyikan' : 'Lihat'} Meta Tag Preview
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-end mb-2">
                  <button className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded shadow border border-gray-300" type="button" onClick={() => setPendingMeta(defaultMeta)}>
                    Kembalikan ke Default
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-4 mb-4">
                  <div>
                    <label className="block font-medium mb-1">Title</label>
                    <input className="w-full border rounded p-2" name="title" value={pendingMeta.title} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Description</label>
                    <textarea className="w-full border rounded p-2" name="description" value={pendingMeta.description} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Keywords</label>
                    <input className="w-full border rounded p-2" name="keywords" value={pendingMeta.keywords} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Image (og:image)</label>
                    <input className="w-full border rounded p-2" name="image" value={pendingMeta.image} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Favicon (ico)</label>
                    <input className="w-full border rounded p-2" name="favicon" value={pendingMeta.favicon} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Favicon Fallback (ico)</label>
                    <input className="w-full border rounded p-2" name="faviconFallback" value={pendingMeta.faviconFallback} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Favicon PNG</label>
                    <input className="w-full border rounded p-2" name="faviconPng" value={pendingMeta.faviconPng} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Link Google Formulir Pendaftaran</label>
                    <input className="w-full border rounded p-2" name="googleFormUrl" value={pendingMeta.googleFormUrl || ''} onChange={handleChange} placeholder="https://docs.google.com/forms/..." />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Link Download Formulir</label>
                    <input className="w-full border rounded p-2" name="googleFormDownloadUrl" value={pendingMeta.googleFormDownloadUrl || ''} onChange={handleChange} placeholder="https://.../formulir.docx" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow" onClick={() => { setPendingSaveType('meta'); setGlobalConfirmOpen(true); }} type="button">Simpan</button>
                  <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded" onClick={() => setEditMode(false)} type="button">Batal</button>
                </div>
                {/* Konfirmasi dialog */}
                {confirmOpen && (
                  <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
                      <h3 className="font-bold text-lg mb-2">Konfirmasi Simpan</h3>
                      <p className="mb-4">Apakah Anda yakin ingin menyimpan perubahan meta tag?</p>
                      <div className="flex gap-2 justify-end">
                        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded" onClick={handleConfirm}>Ya, Simpan</button>
                        <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded" onClick={handleCancel}>Batal</button>
                      </div>
                    </div>
                  </div>
                )}
                {show && (
                  <div className="mt-6 bg-gray-50 p-4 rounded border text-xs overflow-x-auto">
                    <code>
                      {`
                        <!-- Meta Preview -->
                        <title>${meta.title}</title>
                        <meta name="description" content="${meta.description}" />
                        <meta name="keywords" content="${meta.keywords}" />
                        <meta property="og:title" content="${meta.title}" />
                        <meta property="og:description" content="${meta.description}" />
                        <meta property="og:image" content="${meta.image}" />
                        <link rel="icon" href="${meta.favicon}" type="image/x-icon" />
                        <link rel="icon" type="image/x-icon" href="${meta.faviconFallback}" />
                        <link rel="icon" type="image/png" href="${meta.faviconPng}" />
                      `}
                    </code>
                  </div>
                )}
              </>
            )}
          </>
        )}
        {tab === 'logadmin' && (
          <>
            <h2 className="font-bold text-xl mb-4 text-blue-900 flex items-center gap-2">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              Log Admin
            </h2>
            {logsLoading ? (
              <div className="text-center py-10 text-gray-500">Memuat log...</div>
            ) : logs.length === 0 ? (
              <div className="text-center py-10 text-gray-400">Belum ada aktivitas.</div>
            ) : (
              <div className="overflow-x-auto overflow-y-auto max-h-96 scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-blue-50 rounded-lg">
                <table className="w-full min-w-[700px] text-sm font-mono bg-[#181c20] text-[#e0e6ef] rounded-lg shadow-lg">
                  <thead>
                    <tr className="bg-[#23272e] text-[#7dd3fc]">
                      <th className="p-2 text-left font-mono">Waktu</th>
                      <th className="p-2 text-left font-mono">User</th>
                      <th className="p-2 text-left font-mono">Aksi</th>
                      <th className="p-2 text-left font-mono">Detail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, i) => (
                      <tr key={i} className="border-b border-[#23272e] last:border-b-0 hover:bg-[#23272e] transition">
                        <td className="p-2 whitespace-nowrap text-[#a3e635]">{log.createdAt.toLocaleString()}</td>
                        <td className="p-2 whitespace-nowrap text-[#38bdf8]">{log.user}</td>
                        <td className={"p-2 whitespace-nowrap font-bold " +
                          (log.action.toLowerCase().includes('edit') ? 'text-yellow-400' :
                          log.action.toLowerCase().includes('hapus') ? 'text-red-400' :
                          log.action.toLowerCase().includes('tambah') ? 'text-green-400' :
                          'text-[#e0e6ef]')
                        }>{log.action}</td>
                        <td className="p-2 text-[#e0e6ef]">{log.detail}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex items-center justify-center mt-2">
                  <span className="text-xs text-blue-300 font-mono">Geser ke kanan &rarr; untuk melihat detail log &gt;&gt;</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      {/* Global confirm dialog for all save actions */}
      {globalConfirmOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h3 className="font-bold text-lg mb-2">Konfirmasi Simpan Data</h3>
            <p className="mb-4">Pastikan data sudah benar sebelum disimpan ke homepage.</p>
            <label className="flex items-center gap-2 mb-4">
              <input type="checkbox" checked={globalConfirmed} onChange={e => setGlobalConfirmed(e.target.checked)} />
              <span className="text-sm">Saya sudah memeriksa dan data sudah benar.</span>
            </label>
            <div className="flex gap-2 justify-end">
              <button
                className={`px-4 py-2 rounded text-white transition ${(!globalConfirmed)
                  ? 'bg-green-300 cursor-not-allowed opacity-60'
                  : 'bg-green-600 hover:bg-green-700 shadow'}`}
                disabled={!globalConfirmed}
                onClick={async () => {
                  if (pendingSaveType === 'meta') {
                    await handleConfirm();
                  } else if (pendingSaveType === 'carousel') {
                    let next = [...carousel];
                    if (carouselEditIdx === null) {
                      next.push(pendingCarousel!);
                    } else {
                      next[carouselEditIdx!] = pendingCarousel!;
                    }
                    const custom = next.filter(c => !DEFAULT_CAROUSEL.some(d => d.title === c.title));
                    next = [...DEFAULT_CAROUSEL, ...custom];
                    setCarousel(next);
                    setCarouselContent(next);
                    setCarouselDialog(false);
                    setCarouselEdit(null);
                    setCarouselEditIdx(null);
                  } else if (pendingSaveType === 'visimisi') {
                    await handleSaveVisiMisi();
                    window.dispatchEvent(new Event('visimisi-updated'));
                    setVisiMisiEditMode(false);
                  } else if (pendingSaveType === 'contact') {
                    setLoadingContact(true);
                    const { db } = await import('@/lib/firebase');
                    const { doc, setDoc } = await import('firebase/firestore');
                    await setDoc(doc(db, 'homepage', 'contact'), {
                      ...contactDialog,
                      cards: contactCards
                    }, { merge: true });
                    setEditContactMode(false);
                    setLoadingContact(false);
                  }
                  setGlobalConfirmOpen(false);
                  setGlobalConfirmed(false);
                  setPendingSaveType(null);
                  setPendingCarousel(null);
                }}
              >
                Ya, Simpan
              </button>
              <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded" onClick={() => {
                setGlobalConfirmOpen(false);
                setGlobalConfirmed(false);
                setPendingSaveType(null);
                setPendingCarousel(null);
              }}>Batal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
