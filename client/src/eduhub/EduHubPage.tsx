import React from "react";
import { useState, useEffect, useRef } from "react";
// Confetti SVG component
function ConfettiBurst() {
  return (
    <svg className="absolute left-1/2 top-0 -translate-x-1/2 z-10 pointer-events-none" width="220" height="120" viewBox="0 0 220 120" fill="none">
      <g>
        <circle cx="30" cy="30" r="6" fill="#34d399"/>
        <circle cx="60" cy="20" r="4" fill="#fbbf24"/>
        <circle cx="110" cy="10" r="7" fill="#38bdf8"/>
        <circle cx="170" cy="25" r="5" fill="#f472b6"/>
        <circle cx="200" cy="40" r="4" fill="#a3e635"/>
        <circle cx="50" cy="70" r="5" fill="#f87171"/>
        <circle cx="180" cy="80" r="6" fill="#facc15"/>
        <circle cx="120" cy="100" r="8" fill="#4ade80"/>
      </g>
    </svg>
  );
}
import { modules } from "./modules";
import { BadgeCheck } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { saveUserProgressToFirestore, getLeaderboardFromFirestore, cleanupOldZeroProgressUsers } from "./leaderboardApi";


function getUserData() {
  try {
    return JSON.parse(localStorage.getItem("eduhub_userdata") || "{}") || {};
  } catch {
    return {};
  }
}
function setUserData(data: any) {
  localStorage.setItem("eduhub_userdata", JSON.stringify(data));
}

function getProgress() {
  return getUserData().progress || {};
}
function setProgress(progress: any) {
  const data = getUserData();
  setUserData({ ...data, progress });
}

import { useNavigate } from "react-router-dom";

// Trophy SVG (Gold)
function TrophyIcon({ className = "", style = {} }) {
  return (
    <svg className={className} style={style} width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 21h8M12 17v4M17 5V3a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v2M21 5h-4v2a5 5 0 0 1-10 0V5H3v2a7 7 0 0 0 6 6.92"/><path d="M17 5h4v2a7 7 0 0 1-6 6.92"/></svg>
  );
}

export default function EduHubPage() {
  // Ref untuk navigasi scroll ke lesson/quiz
    // const navRef = useRef<HTMLDivElement>(null);
  const lessonRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [lessonIdx, setLessonIdx] = useState(0);
  const [quizIdx, setQuizIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [progress, setProgressState] = useState(getProgress());
  const [userName, setUserName] = useState(getUserData().name || "");
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState<{name:string,progress:number}[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  // Tambahkan state untuk urutan acak quiz
  const [shuffledQuiz, setShuffledQuiz] = useState<any[]>([]);

  useEffect(() => {
    setProgressState(getProgress());
    const data = getUserData();
    if (!data.name) {
      setShowNameDialog(true);
    } else {
      setUserName(data.name);
      // Simpan nama ke Firestore walau progres 0
      saveUserProgressToFirestore(data.name, Object.values(getProgress()).filter(Boolean).length);
    }
    // Cleanup old users with 0 progress
  // cleanupOldZeroProgressUsers();
  }, []);

  // Save progress to Firestore whenever userName or progress changes
  useEffect(() => {
    if (userName) {
      const prog = Object.values(progress).filter(Boolean).length;
      saveUserProgressToFirestore(userName, prog).then(() => {
        if (prog >= 1) fetchLeaderboard();
      });
    }
    // eslint-disable-next-line
  }, [userName, progress]);

  // Fungsi untuk mengacak array dan mengembalikan array baru beserta mapping index
  function shuffleOptions(options: string[], answerIdx: number) {
    const arr = options.map((opt, idx) => ({ opt, idx }));
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    const newOptions = arr.map(a => a.opt);
    const newAnswer = arr.findIndex(a => a.idx === answerIdx);
    return { newOptions, newAnswer };
  }

  const handleFinish = (id: string) => {
    const newProgress = { ...progress, [id]: true };
    setProgress(newProgress);
    setProgressState(newProgress);
  };

  // Handle name input save
  const handleSaveName = async () => {
    if (nameInput.trim().length < 2) return;
    setUserData({ ...getUserData(), name: nameInput.trim(), progress });
    setUserName(nameInput.trim());
    setShowNameDialog(false);
    // Simpan nama ke Firestore walau progres 0
    await saveUserProgressToFirestore(nameInput.trim(), Object.values(progress).filter(Boolean).length);
    fetchLeaderboard();
  };

  const handleStartQuiz = () => {
    const mod = modules.find(m => m.id === selected);
    if (!mod) return;
    // Acak semua soal quiz
    const shuffled = mod.quiz.map(q => {
      const { newOptions, newAnswer } = shuffleOptions(q.options, q.answer);
      return {
        ...q,
        options: newOptions,
        answer: newAnswer,
      };
    });
    setShuffledQuiz(shuffled);
    setShowQuiz(true);
    setQuizIdx(0);
    setAnswers([]);
    setShowResult(false);
  };

  const handleQuizAnswer = (idx: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[quizIdx] = idx;
      return next;
    });
    if (quizIdx < (modules.find(m=>m.id===selected)?.quiz.length||0) - 1) {
      setQuizIdx(quizIdx + 1);
    } else {
      setShowResult(true);
    }
  };

  const handleReset = () => {
    setLessonIdx(0);
    setShowQuiz(false);
    setQuizIdx(0);
    setAnswers([]);
    setShowResult(false);
    setShuffledQuiz([]);
  };

  // Progress bar logic
  const total = modules.length;
  const done = modules.filter(m => progress[m.id]).length;
  const percent = Math.round((done / total) * 100);

  // Fetch leaderboard from Firestore
  const fetchLeaderboard = async () => {
    setLoadingLeaderboard(true);
    try {
  const data = await getLeaderboardFromFirestore(); // ambil semua data, filter di bawah
      // Debug: tampilkan data mentah di konsol
      console.log('LEADERBOARD RAW DATA:', data);
      // Hanya tampilkan user dengan progress >= 1 (pastikan tipe number)
      setLeaderboard((data as any[]).filter(u => Number(u.progress) >= 1).slice(0, 10));
    } catch (e) {
      setLeaderboard([]);
      console.error('LEADERBOARD ERROR:', e);
    }
    setLoadingLeaderboard(false);
  };

  const navigate = typeof window !== 'undefined' ? (window as any).useNavigate?.() || (()=>{}) : ()=>{};
  // fallback: if not using react-router, use window.location
  const goToEduhub = () => {
    if (typeof navigate === 'function' && navigate.length > 0) {
      navigate('/eduhub');
    } else {
      window.location.href = '/eduhub';
    }
  };

  return (
    <div className="relative max-w-3xl mx-auto p-4">
      {/* Navigasi Sidebar Elegan */}
      <div className="hidden md:block fixed left-0 top-24 h-[80vh] w-56 bg-white/80 shadow-lg rounded-r-2xl border-r border-green-200 z-30 overflow-y-auto animate-fade-in" style={{backdropFilter:'blur(4px)'}}>
        <div className="p-4">
          <div className="font-bold text-green-700 mb-2 text-lg">Navigasi EduHub</div>
          <ul className="space-y-1">
            {modules.map((mod, i) => (
              <li key={mod.id}>
                <button
                  className={`w-full text-left px-3 py-2 rounded-lg transition font-semibold ${selected===mod.id?'bg-green-100 text-green-800 border-l-4 border-green-500':'hover:bg-green-50 text-gray-700'}`}
                  onClick={() => {
                    setSelected(mod.id);
                    setLessonIdx(0);
                    setShowQuiz(false);
                    setShowResult(false);
                    setTimeout(() => {
                      if (lessonRef.current) {
                        const y = lessonRef.current.getBoundingClientRect().top + window.scrollY - 80;
                        window.scrollTo({ top: y, behavior: "smooth" });
                      }
                    }, 100);
                  }}
                >
                  <span className="inline-block w-5 text-green-400">{progress[mod.id] ? <BadgeCheck size={18}/> : i+1}</span>
                  <span className="ml-2">{mod.title}</span>
                </button>
                {/* Jika modul ini aktif, tampilkan lesson nav */}
                {selected===mod.id && (
                  <ul className="ml-7 mt-1 space-y-0.5">
                    {mod.lessons.map((lesson, idx) => (
                      <li key={lesson.id}>
                        <button
                          className={`text-left text-sm px-2 py-1 rounded transition ${lessonIdx===idx&&!showQuiz?'bg-green-200 text-green-900':'hover:bg-green-50 text-gray-600'}`}
                          onClick={()=>{
                            setLessonIdx(idx);
                            setShowQuiz(false);
                            setShowResult(false);
                            setTimeout(() => {
                              if (lessonRef.current) {
                                const y = lessonRef.current.getBoundingClientRect().top + window.scrollY - 80;
                                window.scrollTo({ top: y, behavior: "smooth" });
                              }
                            }, 100);
                          }}
                        >📖 {lesson.title}</button>
                      </li>
                    ))}
                    <li>
                      <button
                        className={`text-left text-sm px-2 py-1 rounded transition ${showQuiz?'bg-blue-200 text-blue-900':'hover:bg-blue-50 text-blue-700'}`}
                        onClick={()=>{
                          handleStartQuiz();
                          setTimeout(() => {
                            if (lessonRef.current) {
                              const y = lessonRef.current.getBoundingClientRect().top + window.scrollY - 80;
                              window.scrollTo({ top: y, behavior: "smooth" });
                            }
                          }, 100);
                        }}
                      >📝 Quiz</button>
                    </li>
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <h1 className="text-2xl font-bold mb-4 text-green-700">EduHub Survival & Teknik Alam Terbuka</h1>
      {/* Navigasi mobile (dropdown) */}
      <div className="md:hidden mb-4">
        <select
          className="w-full border rounded p-2 text-green-800 font-semibold bg-green-50"
          value={selected||''}
          onChange={e=>{
            setSelected(e.target.value);
            setLessonIdx(0);
            setShowQuiz(false);
            setShowResult(false);
            setTimeout(() => {
              if (lessonRef.current) {
                const y = lessonRef.current.getBoundingClientRect().top + window.scrollY - 80;
                window.scrollTo({ top: y, behavior: "smooth" });
              }
            }, 100);
          }}
        >
          <option value="" disabled>Pilih Modul...</option>
          {modules.map((mod,i)=>(<option key={mod.id} value={mod.id}>{i+1}. {mod.title}</option>))}
        </select>
        {selected && (
          <div className="flex flex-wrap gap-2 mt-2">
            {modules.find(m=>m.id===selected)?.lessons.map((lesson, idx) => (
              <button
                key={lesson.id}
                className={`px-2 py-1 rounded text-xs font-semibold ${lessonIdx===idx&&!showQuiz?'bg-green-200 text-green-900':'bg-green-50 text-green-700'}`}
                onClick={()=>{
                  setLessonIdx(idx);
                  setShowQuiz(false);
                  setShowResult(false);
                  setTimeout(() => {
                    if (lessonRef.current) {
                      const y = lessonRef.current.getBoundingClientRect().top + window.scrollY - 80;
                      window.scrollTo({ top: y, behavior: "smooth" });
                    }
                  }, 100);
                }}
              >📖 {lesson.title}</button>
            ))}
            <button
              className={`px-2 py-1 rounded text-xs font-semibold ${showQuiz?'bg-blue-200 text-blue-900':'bg-blue-50 text-blue-700'}`}
              onClick={()=>{
                handleStartQuiz();
                setTimeout(() => {
                  if (lessonRef.current) {
                    const y = lessonRef.current.getBoundingClientRect().top + window.scrollY - 80;
                    window.scrollTo({ top: y, behavior: "smooth" });
                  }
                }, 100);
              }}
            >📝 Quiz</button>
          </div>
        )}
      </div>
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-3">
          <span className="font-semibold text-green-700">Progres Penyelesaian:</span>
          <span className="font-mono text-green-900 text-lg">{done} / {total}</span>
          {/* Trophy Button */}
          <button
            className="ml-2 p-1 rounded-full bg-yellow-100 border border-yellow-300 shadow hover:scale-110 transition-transform"
            title="Lihat Peringkat"
            onClick={() => setShowLeaderboard(true)}
            style={{ lineHeight: 0 }}
          >
            <TrophyIcon />
          </button>
        </div>
        <div className="w-full h-5 bg-gray-200 rounded-full overflow-hidden shadow-inner mb-4">
          <div
            className="h-full bg-gradient-to-r from-green-400 via-green-500 to-green-700 transition-all duration-700 ease-in-out flex items-center justify-end pr-2"
            style={{ width: percent + "%" }}
          >
            <span className="text-xs text-white font-bold drop-shadow-sm" style={{opacity: percent>10?1:0}}>{percent}%</span>
          </div>
        </div>
        {/* Leaderboard Dialog */}
        <Dialog open={showLeaderboard} onOpenChange={(open) => {
          setShowLeaderboard(open);
          if (open) {
            fetchLeaderboard();
          }
        }}>
          <DialogContent>
            <DialogHeader>
              <div className="flex items-center gap-2 mb-2">
                <TrophyIcon className="inline-block" style={{ verticalAlign: "middle" }} />
                <span className="text-xl font-bold text-yellow-600">Peringkat Terbaik</span>
              </div>
            </DialogHeader>
            {loadingLeaderboard ? (
              <div className="text-center py-6">Memuat peringkat...</div>
            ) : (
              <>
                {(() => {
                  // Sort leaderboard: skor desc, updatedAt asc
                  const sorted = [...leaderboard].sort((a, b) => {
                    const progA = (typeof a.progress === 'number' ? a.progress : Number(a.progress)) || 0;
                    const progB = (typeof b.progress === 'number' ? b.progress : Number(b.progress)) || 0;
                    if (progB !== progA) return progB - progA;
                    // Compare updatedAt (Firestore Timestamp or Date or string)
                    const getTime = (val: any) => {
                      if (!val) return Infinity;
                      if (typeof val.toDate === 'function') return val.toDate().getTime();
                      if (val instanceof Date) return val.getTime();
                      if (typeof val === 'string' || typeof val === 'number') return new Date(val).getTime();
                      return Infinity;
                    };
                    // Handle missing updatedAt property
                    const aTime = (a && typeof a === 'object' && 'updatedAt' in a && a.updatedAt) ? getTime(a.updatedAt) : Infinity;
                    const bTime = (b && typeof b === 'object' && 'updatedAt' in b && b.updatedAt) ? getTime(b.updatedAt) : Infinity;
                    return aTime - bTime;
                  });
                  // Render 10 besar dan 10+
                  const idx = userName ? sorted.findIndex(u => (u.name || '').toLowerCase() === userName.toLowerCase()) : -1;
                  return <>
                    <ol className="space-y-2 mt-2">
                      {sorted.length === 0 && <div className="text-center text-gray-400">Belum ada data peringkat.</div>}
                      {sorted.slice(0, 10).map((u, i) => {
                        const name = u.name || '(Tanpa Nama)';
                        const progress = (typeof u.progress === 'number' ? u.progress : Number(u.progress)) || 0;
                        const isYou = userName && name.toLowerCase() === userName.toLowerCase();
                        return (
                          <li key={name + i} className={`flex items-center gap-3 p-2 rounded-lg ${i===0?"bg-yellow-100 border-2 border-yellow-400 shadow-lg animate-pulse":i===1?"bg-gray-200 border border-gray-400":""} ${i<3?"font-bold":i===0?"text-yellow-700":i===1?"text-gray-700":i===2?"text-orange-700":""} ${isYou?"ring-2 ring-green-500":''}`}>
                            <span className="w-6 text-center text-lg">
                              {i===0?"🥇":i===1?"🥈":i===2?"🥉":i+1}
                            </span>
                            <span className="flex-1 truncate">{name} {isYou && <span className="text-green-600 font-bold">(You)</span>}</span>
                            <span className="font-mono">{progress} / {total}</span>
                          </li>
                        );
                      })}
                    </ol>
                    {/* 10+ section */}
                    {sorted.length > 10 && (
                      <div className="mt-6 border-t pt-3">
                        <div className="text-xs text-gray-500 mb-1 text-center">Peringkat 10+</div>
                        <ol className="space-y-2">
                          {sorted.slice(10).map((u, i) => {
                            const name = u.name || '(Tanpa Nama)';
                            const progress = (typeof u.progress === 'number' ? u.progress : Number(u.progress)) || 0;
                            const realIdx = i + 10;
                            const isYou = userName && name.toLowerCase() === userName.toLowerCase();
                            return (
                              <li key={name + realIdx} className={`flex items-center gap-3 p-2 rounded-lg ${isYou ? 'ring-2 ring-green-500 bg-green-50 font-bold' : ''}`}>
                                <span className="w-6 text-center text-lg">{realIdx+1}</span>
                                <span className="flex-1 truncate">{name} {isYou && <span className="text-green-600 font-bold">(You)</span>}</span>
                                <span className="font-mono">{progress} / {total}</span>
                              </li>
                            );
                          })}
                        </ol>
                      </div>
                    )}
                  </>;
                })()}
              </>
            )}
            <div className="mt-4 text-xs text-gray-500 text-center">Peringkat dihitung dari jumlah modul selesai. Top 3 mendapat efek khusus!</div>
          </DialogContent>
        </Dialog>
        {/* Name Input Dialog */}
        <Dialog open={showNameDialog}>
          <DialogContent>
            <DialogHeader>
              <div className="text-lg font-bold text-green-700 mb-2">Masukkan Nama Anda</div>
            </DialogHeader>
            <div className="mb-2">Nama ini akan tampil di peringkat dan disimpan di perangkat Anda.</div>
            <Input
              autoFocus
              placeholder="Nama lengkap atau panggilan"
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              maxLength={32}
              className="mb-2"
            />
            <Button
              onClick={handleSaveName}
              disabled={nameInput.trim().length < 2}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >Simpan</Button>
          </DialogContent>
        </Dialog>
        <h2 className="text-lg font-semibold mb-2">Daftar Modul</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {modules.map((mod) => (
            <button
              key={mod.id}
              className={`border rounded-lg p-4 text-left shadow hover:shadow-lg transition bg-white hover:bg-green-50 ${selected===mod.id?"border-green-600":"border-gray-300"}`}
              onClick={() => {
                setSelected(mod.id);
                setLessonIdx(0);
                setShowQuiz(false);
                setShowResult(false);
                setTimeout(() => {
                  if (lessonRef.current) {
                    const y = lessonRef.current.getBoundingClientRect().top + window.scrollY - 80; // 80px offset agar title tidak tertutup
                    window.scrollTo({ top: y, behavior: "smooth" });
                  }
                }, 100);
              }}
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
        <div ref={lessonRef} className="mb-6 border rounded-lg p-4 bg-gray-50">
          {(() => {
            const mod = modules.find(m => m.id === selected);
            if (!mod) return null;
            // Selesai semua: badge
            if (progress[selected]) {
              return (
                <div className="flex flex-col items-center gap-2 text-green-700 font-bold">
                  <BadgeCheck size={32} />
                  <div>Badge: {mod.badge}</div>
                  <button className="mt-2 text-sm underline text-green-600" onClick={handleReset}>Ulangi Modul</button>
                </div>
              );
            }
            // Quiz result
            if (showResult) {
              // Penilaian berdasarkan shuffledQuiz
              const quizArr = shuffledQuiz.length ? shuffledQuiz : mod.quiz;
              const correct = quizArr.filter((q, i) => answers[i] === q.answer).length;
              const allCorrect = correct === quizArr.length;
              return (
                <div className="text-center relative overflow-visible min-h-[180px]">
                  <div className="mb-2 font-bold">Hasil Quiz: {correct} / {quizArr.length} benar</div>
                  {allCorrect ? (
                    <AnimatedBadgeAchievement badge={mod.badge} onSave={()=>handleFinish(selected)} />
                  ) : (
                    <>
                      <div className="text-red-600 font-bold">Belum semua jawaban benar. Coba lagi!</div>
                      <button className="mt-4 bg-gray-300 text-gray-800 px-4 py-2 rounded shadow hover:bg-gray-400" onClick={handleReset}>Ulangi Quiz</button>
                    </>
                  )}
                </div>
              );
            }
            // Quiz
            if (showQuiz) {
              // Gunakan shuffledQuiz jika ada, fallback ke mod.quiz
              const quizArr = shuffledQuiz.length ? shuffledQuiz : mod.quiz;
              const q = quizArr[quizIdx];
              return (
                <div>
                  <div className="font-bold mb-2">Quiz {quizIdx+1} / {quizArr.length}</div>
                  <div className="mb-4">{q.question}</div>
                  <div className="flex flex-col gap-2">
                    {q.options.map((opt: string, idx: number) => (
                      <button key={idx} className="border rounded px-3 py-2 text-left hover:bg-green-100" onClick={()=>handleQuizAnswer(idx)}>{opt}</button>
                    ))}
                  </div>
                </div>
              );
            }
            // Lessons
            const lesson = mod.lessons[lessonIdx];
            return (
              <div>
                <div className="prose prose-green max-w-none mb-4">
                  <h2>{lesson.title}</h2>
                  <p>{lesson.content}</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 rounded bg-gray-200" disabled={lessonIdx===0} onClick={()=>setLessonIdx(i=>i-1)}>Sebelumnya</button>
                  {lessonIdx < mod.lessons.length-1 ? (
                    <button className="px-3 py-1 rounded bg-green-600 text-white" onClick={()=>setLessonIdx(i=>i+1)}>Selanjutnya</button>
                  ) : (
                    <button className="px-3 py-1 rounded bg-blue-600 text-white" onClick={handleStartQuiz}>Mulai Quiz</button>
                  )}
                </div>
              </div>
            );
          })()}
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
// Komponen animasi badge agar tidak error hooks
function AnimatedBadgeAchievement({ badge, onSave }: { badge: string, onSave: () => void }) {
  const [showConfetti, setShowConfetti] = React.useState(true);
  const [showOverlay, setShowOverlay] = React.useState(false);
  React.useEffect(() => {
    setShowConfetti(true);
    setShowOverlay(false);
  }, []);

  // Saat klik simpan badge, munculkan overlay animasi pencapaian
  const handleSave = () => {
    setShowOverlay(true);
    setTimeout(() => {
      setShowOverlay(false);
      onSave();
    }, 2200);
  };

  return (
    <>
      {showConfetti && <ConfettiBurst />}
      <div className="flex flex-col items-center justify-center gap-2 mt-2">
        <span className="relative">
          <BadgeCheck size={64} className="text-green-500 animate-bounce-in" style={{animation:'badgepop 1s cubic-bezier(.2,1.8,.5,1)'}} />
          <style>{`@keyframes badgepop{0%{transform:scale(0.2) rotate(-30deg);}60%{transform:scale(1.2) rotate(10deg);}80%{transform:scale(0.95) rotate(-5deg);}100%{transform:scale(1) rotate(0deg);}}`}</style>
        </span>
        <span className="text-green-700 font-bold text-xl animate-fade-in" style={{animation:'fadein 1.2s'}}>Selamat! Anda mendapatkan badge:</span>
        <span className="text-green-800 font-extrabold text-2xl tracking-wide animate-fade-in" style={{animation:'fadein 1.6s'}}>🏅 {badge}</span>
      </div>
      <button className="mt-6 bg-green-600 text-white px-5 py-2 rounded shadow-lg hover:bg-green-700 transition-all duration-300" onClick={handleSave}>Simpan Badge</button>
      <style>{`@keyframes fadein{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}.animate-fade-in{animation:fadein 1s;}`}</style>

      {/* Overlay animasi pencapaian */}
      {showOverlay && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-80 animate-fade-in-fast">
          <div className="relative flex flex-col items-center justify-center">
            <ConfettiBurst />
            <span className="relative">
              <BadgeCheck size={120} className="text-yellow-400 animate-bounce-in" style={{animation:'badgepopbig 1.2s cubic-bezier(.2,1.8,.5,1)'}} />
              <style>{`@keyframes badgepopbig{0%{transform:scale(0.2) rotate(-30deg);}60%{transform:scale(1.3) rotate(10deg);}80%{transform:scale(1.05) rotate(-5deg);}100%{transform:scale(1) rotate(0deg);}}`}</style>
            </span>
            <span className="text-yellow-300 font-extrabold text-3xl mt-4 animate-fade-in" style={{animation:'fadein 1.2s'}}>Pencapaian Cemerlang!</span>
            <span className="text-white font-extrabold text-2xl tracking-wide animate-fade-in" style={{animation:'fadein 1.6s'}}>🏅 {badge}</span>
            <span className="absolute -top-10 left-1/2 -translate-x-1/2">
              <ConfettiBurst />
            </span>
          </div>
        </div>
      )}
      <style>{`.animate-fade-in-fast{animation:fadein .5s;}`}</style>
    </>
  );
}
