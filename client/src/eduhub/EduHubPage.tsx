import { useState, useEffect } from "react";
import { modules } from "./modules";
import ReactMarkdown from "react-markdown";
import { BadgeCheck } from "lucide-react";

function getProgress() {
  try {
    return JSON.parse(localStorage.getItem("eduhub_progress") || "{}") || {};
  } catch {
    return {};
  }
}
function setProgress(progress: any) {
  localStorage.setItem("eduhub_progress", JSON.stringify(progress));
}

export default function EduHubPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [progress, setProgressState] = useState(getProgress());
  const [showFAQ, setShowFAQ] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  useEffect(() => {
    setProgressState(getProgress());
  }, []);

  const handleFinish = (id: string) => {
    const newProgress = { ...progress, [id]: true };
    setProgress(newProgress);
    setProgressState(newProgress);
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-green-700">EduHub Survival & Teknik Alam Terbuka</h1>
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Daftar Modul</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {modules.map((mod) => (
            <button
              key={mod.id}
              className={`border rounded-lg p-4 text-left shadow hover:shadow-lg transition bg-white hover:bg-green-50 ${selected===mod.id?"border-green-600":"border-gray-300"}`}
              onClick={() => setSelected(mod.id)}
            >
              <span className="font-bold text-green-700">{mod.title}</span>
              {progress[mod.id] && (
                <span className="ml-2 inline-block align-middle text-green-600"><BadgeCheck size={18} /></span>
              )}
            </button>
          ))}
        </div>
      </div>
      {selected && (
        <div className="mb-6 border rounded-lg p-4 bg-gray-50">
          <div className="prose prose-green max-w-none mb-4">
            <ReactMarkdown>{modules.find(m=>m.id===selected)?.markdown||""}</ReactMarkdown>
          </div>
          {!progress[selected] ? (
            <button className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700" onClick={()=>handleFinish(selected)}>
              Tandai Selesai & Dapatkan Badge
            </button>
          ) : (
            <div className="flex items-center gap-2 text-green-700 font-bold">
              <BadgeCheck size={20} />
              Badge: {modules.find(m=>m.id===selected)?.badge}
            </div>
          )}
        </div>
      )}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Badge/Pencapaian Anda</h2>
        <div className="flex flex-wrap gap-2">
          {modules.filter(m=>progress[m.id]).map(m=>(
            <span key={m.id} className="bg-green-100 text-green-700 px-3 py-1 rounded-full flex items-center gap-1 font-semibold border border-green-300">
              <BadgeCheck size={16} /> {m.badge}
            </span>
          ))}
          {Object.values(progress).filter(Boolean).length===0 && <span className="text-gray-400">Belum ada badge</span>}
        </div>
      </div>
      <div className="mb-6">
        <button className="bg-green-500 text-white px-4 py-2 rounded shadow hover:bg-green-600" onClick={()=>setShowFAQ(v=>!v)}>
          FAQ Survival & Mahapala
        </button>
        {showFAQ && (
          <div className="mt-4">
            {[{
              q: "Apa itu survival?",
              a: "Survival adalah kemampuan bertahan hidup di alam terbuka dengan memanfaatkan sumber daya yang ada."
            },{
              q: "Apa perlengkapan wajib untuk survival?",
              a: "Perlengkapan wajib meliputi pisau, tali, pelindung tubuh, makanan cadangan, dan alat navigasi."
            },{
              q: "Bagaimana cara membangun bivak yang aman?",
              a: "Pilih lokasi datar, jauh dari bahaya, gunakan bahan alami atau perlengkapan yang dibawa."
            },{
              q: "Apa tips mendaki gunung yang aman?",
              a: "Persiapkan fisik, bawa perlengkapan sesuai kebutuhan, dan selalu informasikan rencana pendakian."
            }].map((faq, idx) => (
              <div key={idx} className="border-b">
                <button className="w-full text-left py-2 font-semibold flex justify-between items-center" onClick={()=>setOpenFAQ(openFAQ===idx?null:idx)}>
                  <span>{faq.q}</span>
                  <span>{openFAQ===idx?"-":"+"}</span>
                </button>
                {openFAQ===idx && <div className="py-2 text-gray-700">{faq.a}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
