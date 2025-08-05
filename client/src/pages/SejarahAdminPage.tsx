// Interface untuk props komponen edit ketua umum
import React, { useState, useEffect } from "react";
import KetuaEditRow from "@/components/KetuaEditRow";
import { DraggableList } from "@/components/DraggableList";
import { motion } from "framer-motion";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword, onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc, DocumentData } from "firebase/firestore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";


// Struktur data sama seperti di SejarahPage
const defaultData = {
  sejarahNarasi: `Mahapala Narotama adalah Unit Kegiatan Mahasiswa (UKM) di Universitas Narotama Surabaya yang bergerak di bidang pecinta alam dan petualangan. Berdiri pada tahun 2016, Mahapala Narotama aktif dalam kegiatan pendidikan dasar, ekspedisi gunung, penjelajahan, konservasi alam, bakti sosial, serta pengembangan karakter dan kepemimpinan mahasiswa. Dengan semangat kekeluargaan dan jiwa petualang, Mahapala Narotama telah melahirkan banyak kader yang berkontribusi dalam pelestarian alam dan pengabdian masyarakat, serta menjadi wadah pengembangan minat dan bakat mahasiswa di bidang alam bebas.`,
  ketuaList: [
    { nama: "Roro Christiatirani Suwoto", periode: "2016-2017", foto: "https://raw.githubusercontent.com/mahapalanarotama/OfficialWebsite/main/Img/Mantum/20250805_084125.jpg", locked: true },
    { nama: "Arif Muhammad Rizal", periode: "2017-2018", foto: "https://raw.githubusercontent.com/mahapalanarotama/OfficialWebsite/main/Img/Mantum/20250805_084151.jpg", locked: true },
    { nama: "Ayu Wulandari Narhendra", periode: "2018-2019", foto: "https://raw.githubusercontent.com/mahapalanarotama/OfficialWebsite/main/Img/Mantum/20250805_084234.jpg", locked: true },
    { nama: "Moch. Fakhrul Islam", periode: "2019-2021", foto: "https://raw.githubusercontent.com/mahapalanarotama/OfficialWebsite/main/Img/Mantum/20250805_084327.jpg", locked: true },
    { nama: "Agna Mahireksha", periode: "2021-2022", foto: "https://raw.githubusercontent.com/mahapalanarotama/OfficialWebsite/main/Img/Mantum/20250805_084401.jpg", locked: true },
    { nama: "Robiatul Adawiyah", periode: "2023-2024", foto: "https://raw.githubusercontent.com/mahapalanarotama/OfficialWebsite/main/Img/Mantum/20250805_084425.jpg", locked: true },
    { nama: "Muhammad Fairus Fawas Afanza", periode: "2024-sekarang", foto: "https://raw.githubusercontent.com/mahapalanarotama/OfficialWebsite/main/Img/Mantum/20250805_084448.png", locked: true },
  ],
  kilasBalik: [
    { tahun: "2016", momen: "Pendirian Mahapala Narotama dan Pendidikan Dasar Angkatan I (DIKLATSAR I)." },
    { tahun: "2017", momen: "Ekspedisi Gunung Lawu dan kegiatan bakti sosial di lereng gunung." },
    { tahun: "2018", momen: "DIKLATSAR II dan ekspedisi Gunung Semeru." },
    { tahun: "2019", momen: "Pendidikan Lanjut Rimba Gunung I dan penanaman pohon di kawasan konservasi." },
    { tahun: "2020", momen: "Aksi peduli lingkungan: penanaman 1000 pohon di Surabaya Timur." },
    { tahun: "2021", momen: "DIKLATSAR III (Sendang Banthak) dan pelatihan SAR Mahasiswa." },
    { tahun: "2022", momen: "Ekspedisi Gunung Arjuno-Welirang dan bakti sosial di desa binaan." },
    { tahun: "2023", momen: "DIKLATSAR IV (Panca Laksamana) dan kegiatan bakti sosial serta buka bersama." },
    { tahun: "2024", momen: "Penyelenggaraan seminar nasional konservasi dan pelantikan anggota terbanyak." },
  ],
  videoMomentum: [
    { title: "Bakti sosial & Buka Bersama 2025", url: "https://www.youtube.com/embed/hTP4gwO7X80" },
    { title: "DIKLATSAR ANGKATAN KE IV (PANCA LAKSMANA) MAHAPALA NAROTAMA", url: "https://www.youtube.com/embed/A3rabYoh5v0" },
    { title: "PENDIDIKAN LANJUT RIMBA GUNUNG III MAHAPALA NAROTAMA", url: "https://www.youtube.com/embed/PXqneMBAOoU" },
    { title: "DIKLATSAR ANGKATAN KE III (SENDANG BANTHAK) MAHAPALA NAROTAMA", url: "https://www.youtube.com/embed/IIi19T-bt70" },
  ],
};

export default function SejarahAdminPage() {
  // --- AUTH ---
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);

  // --- DATA ---
  const [data, setData] = useState(defaultData);
  const [editMode, setEditMode] = useState(false);
  const [pendingData, setPendingData] = useState(defaultData);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");

  // Listen for auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // Fetch sejarah data from Firestore
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const snap = await getDoc(doc(db, "sejarah_page", "main"));
        if (snap.exists()) {
          const d: DocumentData = snap.data();
          setData({
            sejarahNarasi: d.sejarahNarasi || defaultData.sejarahNarasi,
            ketuaList: Array.isArray(d.ketuaList) ? d.ketuaList : defaultData.ketuaList,
            kilasBalik: Array.isArray(d.kilasBalik) ? d.kilasBalik : defaultData.kilasBalik,
            videoMomentum: Array.isArray(d.videoMomentum) ? d.videoMomentum : defaultData.videoMomentum,
          });
        } else {
          setData(defaultData);
        }
      } catch {
        setData(defaultData);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  // --- AUTH HANDLER ---
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setAuthError("Login gagal: " + (err?.message || ""));
    }
    setLoading(false);
  }

  // --- EDIT HANDLER ---
  function startEdit() {
    setPendingData(data);
    setEditMode(true);
  }
  function cancelEdit() {
    setEditMode(false);
    setPendingData(data);
  }
  function handleChangeNarasi(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setPendingData({ ...pendingData, sejarahNarasi: e.target.value });
  }
  function handleChangeKilas(i: number, field: "tahun"|"momen", value: string) {
    setPendingData({ ...pendingData, kilasBalik: pendingData.kilasBalik.map((k: any, idx: number) => idx === i ? { ...k, [field]: value } : k) });
  }
  function addKilas() {
    setPendingData({ ...pendingData, kilasBalik: [...pendingData.kilasBalik, { tahun: "", momen: "" }] });
  }
  function removeKilas(i: number) {
    setPendingData({ ...pendingData, kilasBalik: pendingData.kilasBalik.filter((_: any, idx: number) => idx !== i) });
  }
  function handleChangeVideo(i: number, field: "title"|"url", value: string) {
    setPendingData({ ...pendingData, videoMomentum: pendingData.videoMomentum.map((v: any, idx: number) => idx === i ? { ...v, [field]: value } : v) });
  }
  function addVideo() {
    setPendingData({ ...pendingData, videoMomentum: [...pendingData.videoMomentum, { title: "", url: "" }] });
  }
  function removeVideo(i: number) {
    setPendingData({ ...pendingData, videoMomentum: pendingData.videoMomentum.filter((_: any, idx: number) => idx !== i) });
  }

  // --- SAVE HANDLER ---
  async function handleSave() {
    setConfirmOpen(false);
    setSaveStatus("");
    setLoading(true);
    try {
      await setDoc(doc(db, "sejarah_page", "main"), pendingData);
      setData(pendingData);
      setEditMode(false);
      setSaveStatus("Berhasil disimpan!");
    } catch (err: any) {
      setSaveStatus("Gagal menyimpan: " + (err?.message || ""));
    }
    setLoading(false);
  }

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm">
          <h2 className="text-xl font-bold mb-4 text-center">Login Admin Sejarah</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input className="w-full" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
            <Input className="w-full" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
            {authError && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{authError}</div>}
            <Button type="submit" className="w-full">Login</Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-green-50 py-10">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.h1 initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
          className="text-3xl md:text-4xl font-extrabold text-center text-blue-900 mb-8">
          Admin Edit Sejarah Mahapala Narotama
        </motion.h1>
        {!editMode ? (
          <>
            <div className="mb-8">
              <label className="block font-bold mb-2 text-yellow-800">Daftar Ketua Umum</label>
              {data.ketuaList.map((k: any, i: number) => (
                <div key={i} className="flex gap-2 mb-2 items-center border rounded p-2">
                  <img src={k.foto} alt={k.nama} className="w-12 h-12 rounded-full object-cover" />
                  <div className="flex-1">
                    <div className="font-bold text-yellow-900">{k.nama}</div>
                    <div className="text-xs text-gray-600">Periode {k.periode}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mb-8">
              <label className="block font-bold mb-2 text-blue-800">Narasi Sejarah</label>
              <div className="bg-white rounded p-3 border border-blue-200 text-gray-800 whitespace-pre-line">{data.sejarahNarasi}</div>
            </div>
            <div className="mb-8">
              <label className="block font-bold mb-2 text-green-800">Kilas Balik</label>
              {data.kilasBalik.map((k: any, i: number) => (
                <div key={i} className="flex gap-2 mb-2 items-center">
                  <div className="w-20 font-bold text-green-700">{k.tahun}</div>
                  <div className="flex-1 text-gray-800">{k.momen}</div>
                </div>
              ))}
            </div>
            <div className="mb-8">
              <label className="block font-bold mb-2 text-purple-800">Video Momentum</label>
              {data.videoMomentum.map((v: any, i: number) => (
                <div key={i} className="flex gap-2 mb-2 items-center">
                  <div className="flex-1 text-gray-800">{v.title}</div>
                  <div className="flex-1 text-blue-700 underline">{v.url}</div>
                </div>
              ))}
            </div>
            <Button onClick={startEdit} className="bg-blue-700 text-white">Edit Data</Button>
            {saveStatus && <div className="mt-4 text-green-700 font-bold">{saveStatus}</div>}
          </>
        ) : (
          <>
            <div className="mb-8">
              <label className="block font-bold mb-2 text-yellow-800">Daftar Ketua Umum</label>
              {pendingData.ketuaList.map((k: any, i: number) => (
                <React.Fragment key={i}>
                <KetuaEditRow ketua={k} onChange={(newK: any) => {
                    setPendingData({
                      ...pendingData,
                      ketuaList: pendingData.ketuaList.map((item: any, idx: number) => idx === i ? newK : item)
                    });
                  }} onRemove={() => {
                    setPendingData({
                      ...pendingData,
                      ketuaList: pendingData.ketuaList.filter((_: any, idx: number) => idx !== i)
                    });
                  }} />
                </React.Fragment>
              ))}
              <Button onClick={() => setPendingData({
                ...pendingData,
                ketuaList: [...pendingData.ketuaList, { nama: "", periode: "", foto: "", locked: false }]
              })} className="mt-2 px-3 py-1 bg-yellow-600 text-white rounded">Tambah Ketua Umum</Button>
            </div>

            <div className="mb-8">
              <label className="block font-bold mb-2 text-blue-800">Narasi Sejarah</label>
              <textarea value={pendingData.sejarahNarasi} onChange={handleChangeNarasi} rows={5} className="w-full rounded border border-blue-300 p-2 text-gray-800" />
            </div>
            <div className="mb-8">
              <label className="block font-bold mb-2 text-green-800">Kilas Balik</label>
              <DraggableList
                items={pendingData.kilasBalik}
                onChange={newList => setPendingData({ ...pendingData, kilasBalik: newList })}
                renderItem={(k, i) => (
                  <div className="flex gap-2 mb-2 items-center bg-green-50 rounded p-1" style={{border: '1px dashed #6ee7b7'}}>
                    <span className="cursor-move text-green-600 font-bold px-2">≡</span>
                    <input value={k.tahun} onChange={e => handleChangeKilas(i, "tahun", e.target.value)} placeholder="Tahun" className="w-20 rounded border border-green-300 p-1 text-gray-800" />
                    <input value={k.momen} onChange={e => handleChangeKilas(i, "momen", e.target.value)} placeholder="Momen" className="flex-1 rounded border border-green-300 p-1 text-gray-800" />
                    <button onClick={() => removeKilas(i)} className="text-red-600 font-bold px-2">Hapus</button>
                  </div>
                )}
              />
              <Button onClick={addKilas} className="mt-2 px-3 py-1 bg-green-600 text-white rounded">Tambah Kilas Balik</Button>
            </div>
            <div className="mb-8">
              <label className="block font-bold mb-2 text-purple-800">Video Momentum</label>
              {pendingData.videoMomentum.map((v: any, i: number) => (
                <div key={i} className="flex gap-2 mb-2 items-center">
                  <input value={v.title} onChange={e => handleChangeVideo(i, "title", e.target.value)} placeholder="Judul Video" className="flex-1 rounded border border-purple-300 p-1 text-gray-800" />
                  <input value={v.url} onChange={e => handleChangeVideo(i, "url", e.target.value)} placeholder="URL Embed Youtube" className="flex-1 rounded border border-purple-300 p-1 text-gray-800" />
                  <button onClick={() => removeVideo(i)} className="text-red-600 font-bold px-2">Hapus</button>
                </div>
              ))}
              <Button onClick={addVideo} className="mt-2 px-3 py-1 bg-purple-600 text-white rounded">Tambah Video</Button>
            </div>
            <div className="flex gap-2">
              <Button onClick={cancelEdit} className="bg-gray-400 text-white">Batal</Button>
              <Button onClick={() => setConfirmOpen(true)} className="bg-blue-700 text-white">Simpan</Button>
            </div>
            {saveStatus && <div className="mt-4 text-green-700 font-bold">{saveStatus}</div>}
            {/* Konfirmasi dialog */}
            {confirmOpen && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-sm w-full">
                  <div className="font-bold text-lg mb-4">Konfirmasi Simpan</div>
                  <div className="mb-4">Yakin ingin menyimpan perubahan data sejarah?</div>
                  <div className="flex gap-2 justify-end">
                    <Button onClick={() => setConfirmOpen(false)} className="bg-gray-400 text-white">Batal</Button>
                    <Button onClick={handleSave} className="bg-blue-700 text-white">Ya, Simpan</Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
