import { useState, useEffect } from "react";
import { getMeta, setMeta as saveMeta, MetaData } from "@/lib/meta";
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
  const [tab, setTab] = useState<'meta' | 'logadmin'>('meta');
  const [logs, setLogs] = useState<DevLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

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

  const handleSave = () => {
    setConfirmOpen(true);
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
          className={`px-4 py-2 font-semibold rounded-t-lg ${tab === 'meta' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}
          onClick={() => setTab('meta')}
        >
          Meta
        </button>
        <button
          className={`px-4 py-2 font-semibold rounded-t-lg ${tab === 'logadmin' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}
          onClick={() => setTab('logadmin')}
        >
          Log Admin
        </button>
      </div>
      <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl shadow-lg p-8 border border-blue-100 min-h-[400px]">
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
                </div>
                <div className="flex gap-2">
                  <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow" onClick={handleSave} type="button">Simpan</button>
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
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-blue-100 text-blue-900">
                      <th className="p-2 text-left">Waktu</th>
                      <th className="p-2 text-left">User</th>
                      <th className="p-2 text-left">Aksi</th>
                      <th className="p-2 text-left">Detail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, i) => (
                      <tr key={i} className="border-b last:border-b-0">
                        <td className="p-2 whitespace-nowrap">{log.createdAt.toLocaleString()}</td>
                        <td className="p-2 whitespace-nowrap">{log.user}</td>
                        <td className="p-2 whitespace-nowrap">{log.action}</td>
                        <td className="p-2">{log.detail}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
