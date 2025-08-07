import { useState, useEffect } from "react";
import { getMeta, setMeta as saveMeta, MetaData } from "@/lib/meta";
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
  const [tab, setTab] = useState<'meta' | 'logadmin' | 'homepage' | 'visimisi'>('meta');
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
      <div className="mb-6 flex gap-2 border-b border-blue-200">
        <button
          className={`px-4 py-2 font-semibold rounded-t-lg flex items-center gap-2 ${tab === 'meta' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}
          onClick={() => setTab('meta')}
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M16 18v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          Meta
        </button>
        <button
          className={`px-4 py-2 font-semibold rounded-t-lg flex items-center gap-2 ${tab === 'logadmin' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}
          onClick={() => setTab('logadmin')}
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          Log Admin
        </button>
        <button
          className={`px-4 py-2 font-semibold rounded-t-lg flex items-center gap-2 ${tab === 'homepage' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}
          onClick={() => setTab('homepage')}
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><rect x="3" y="3" width="14" height="14" rx="2"/><path d="M3 8h14"/><path d="M8 17V8"/></svg>
          Homepage
        </button>
        <button
          className={`px-4 py-2 font-semibold rounded-t-lg flex items-center gap-2 ${tab === 'visimisi' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}
          onClick={() => setTab('visimisi')}
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><path d="M4 17v-5a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v5"/><circle cx="12" cy="7" r="4"/></svg>
          Visi & Misi
        </button>
      </div>
      <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl shadow-lg p-8 border border-blue-100 min-h-[400px]">
        {tab === 'visimisi' && (
          <>
            <h2 className="font-bold text-xl mb-4 text-green-900 flex items-center gap-2">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><path d="M4 17v-5a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v5"/><circle cx="12" cy="7" r="4"/></svg>
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
                    <label className="block font-medium mb-1">Link Download Formulir (editable)</label>
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
