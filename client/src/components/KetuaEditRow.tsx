import React from "react";

const LockIcon = ({ locked }: { locked: boolean }) => (
  locked ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 17a1.5 1.5 0 001.5-1.5V14a1.5 1.5 0 10-3 0v1.5A1.5 1.5 0 0012 17zm6-6V9a6 6 0 10-12 0v2a2 2 0 00-2 2v7a2 2 0 002 2h12a2 2 0 002-2v-7a2 2 0 00-2-2zm-2 0H8V9a4 4 0 118 0v2z" /></svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 11V9a5 5 0 00-10 0v2M7 11V9a5 5 0 0110 0v2m-5 4v2m0 0a2 2 0 104 0v-2a2 2 0 10-4 0z" /></svg>
  )
);

export interface KetuaEditRowProps {
  ketua: any;
  onChange: (k: any) => void;
  onRemove: () => void;
}

const KetuaEditRow = ({ ketua, onChange, onRemove }: KetuaEditRowProps) => {
  const [unlocked, setUnlocked] = React.useState(!ketua.locked);
  React.useEffect(() => { setUnlocked(!ketua.locked); }, [ketua.locked]);
  return (
    <div className="w-full overflow-x-auto">
      <div className={`flex gap-2 mb-2 items-center border rounded p-2 bg-yellow-50 min-w-[500px] transition-all duration-200 ${ketua.locked ? 'opacity-60 grayscale' : ''}`}>
        <img src={ketua.foto} alt={ketua.nama} className="w-12 h-12 rounded-full object-cover" />
        <input
          value={ketua.nama}
          onChange={e => onChange({ ...ketua, nama: e.target.value })}
          disabled={!unlocked}
          placeholder="Nama Ketua Umum"
          className="flex-1 rounded border border-yellow-300 p-1 text-gray-800 bg-white min-w-[120px]"
        />
        <input
          value={ketua.periode}
          onChange={e => onChange({ ...ketua, periode: e.target.value })}
          disabled={!unlocked}
          placeholder="Periode"
          className="w-24 sm:w-32 rounded border border-yellow-300 p-1 text-gray-800 bg-white"
        />
        <input
          value={ketua.foto}
          onChange={e => onChange({ ...ketua, foto: e.target.value })}
          disabled={!unlocked}
          placeholder="URL Foto"
          className="w-32 sm:w-40 rounded border border-yellow-300 p-1 text-gray-800 bg-white"
        />
        <button
          className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-transparent hover:bg-yellow-100 focus:outline-none"
          title={ketua.locked ? "Buka Kunci" : "Kunci Data"}
          onClick={() => {
            if (ketua.locked) {
              const kode = window.prompt("Masukkan kode untuk membuka kunci data ketua umum!");
              if (kode === "2601") {
                setUnlocked(true);
                onChange({ ...ketua, locked: false });
              } else if (kode !== null) {
                alert("Kode salah!");
              }
            } else {
              setUnlocked(false);
              onChange({ ...ketua, locked: true });
            }
          }}
        >
          <LockIcon locked={ketua.locked} />
        </button>
        <button
          disabled={!unlocked}
          className={`text-red-600 font-bold px-2 ${!unlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={async () => {
            if (!unlocked) return;
            const kode = window.prompt("Konfirmasi hapus: Masukkan kode untuk menghapus data ketua umum!");
            if (kode === "2601") {
              if (window.confirm("Yakin ingin menghapus data ketua umum ini?")) {
                onRemove();
              }
            } else if (kode !== null) {
              alert("Kode salah!");
            }
          }}
        >Hapus</button>
      </div>
    </div>
  );
}

export default KetuaEditRow;
