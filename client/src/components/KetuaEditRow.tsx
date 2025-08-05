import React from "react";

export interface KetuaEditRowProps {
  ketua: any;
  onChange: (k: any) => void;
  onRemove: () => void;
}

const KetuaEditRow = ({ ketua, onChange, onRemove }: KetuaEditRowProps) => {
  const [unlockInput, setUnlockInput] = React.useState("");
  const [unlocked, setUnlocked] = React.useState(!ketua.locked);
  React.useEffect(() => { setUnlocked(!ketua.locked); }, [ketua.locked]);
  return (
    <div className="flex gap-2 mb-2 items-center border rounded p-2 bg-yellow-50">
      <img src={ketua.foto} alt={ketua.nama} className="w-12 h-12 rounded-full object-cover" />
      <input
        value={ketua.nama}
        onChange={e => onChange({ ...ketua, nama: e.target.value })}
        disabled={!unlocked}
        placeholder="Nama Ketua Umum"
        className="flex-1 rounded border border-yellow-300 p-1 text-gray-800 bg-white"
      />
      <input
        value={ketua.periode}
        onChange={e => onChange({ ...ketua, periode: e.target.value })}
        disabled={!unlocked}
        placeholder="Periode"
        className="w-32 rounded border border-yellow-300 p-1 text-gray-800 bg-white"
      />
      <input
        value={ketua.foto}
        onChange={e => onChange({ ...ketua, foto: e.target.value })}
        disabled={!unlocked}
        placeholder="URL Foto"
        className="w-40 rounded border border-yellow-300 p-1 text-gray-800 bg-white"
      />
      {!unlocked ? (
        <div className="flex flex-col items-center">
          <input
            type="password"
            value={unlockInput}
            onChange={e => setUnlockInput(e.target.value)}
            placeholder="Kode"
            className="w-16 rounded border border-yellow-400 p-1 text-xs mb-1"
          />
          <button
            className="text-xs bg-yellow-600 text-white px-2 py-1 rounded"
            onClick={() => {
              if (unlockInput === "2601") {
                setUnlocked(true);
                onChange({ ...ketua, locked: false });
                setUnlockInput("");
              } else {
                setUnlockInput("");
                alert("Kode salah!");
              }
            }}
          >Unlock</button>
        </div>
      ) : (
        <button
          className="text-xs bg-gray-400 text-white px-2 py-1 rounded"
          onClick={() => {
            setUnlocked(false);
            onChange({ ...ketua, locked: true });
          }}
        >Lock</button>
      )}
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
  );
}

export default KetuaEditRow;
