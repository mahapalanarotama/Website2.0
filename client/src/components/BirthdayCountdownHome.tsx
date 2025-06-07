import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

function getNextAnniversary() {
  const now = new Date();
  const year = now.getMonth() > 0 || (now.getMonth() === 0 && now.getDate() > 26) ? now.getFullYear() + 1 : now.getFullYear();
  return new Date(year, 0, 26, 0, 0, 0, 0); // Jan = 0
}

function getAnniversaryNumber() {
  const orgStartYear = 2017;
  const now = new Date();
  const nextYear = now.getMonth() > 0 || (now.getMonth() === 0 && now.getDate() > 26)
    ? now.getFullYear() + 1
    : now.getFullYear();
  return nextYear - orgStartYear;
}

export default function BirthdayCountdownHome({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    function calculateTimeLeft() {
      const now = new Date();
      const nextAnniv = getNextAnniversary();
      const diff = nextAnniv.getTime() - now.getTime();
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      return { days, hours, minutes, seconds };
    }
    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!open) return null;

  // Efek visual confetti sederhana
  // (bisa diganti dengan library confetti-react jika ingin lebih advanced)
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full p-0 overflow-visible bg-gradient-to-br from-yellow-50 to-pink-100 border-4 border-yellow-300 relative shadow-2xl rounded-2xl animate-fadeIn">
        {/* Confetti effect */}
        <div className="pointer-events-none absolute inset-0 z-10">
          {[...Array(30)].map((_, i) => (
            <span
              key={i}
              className="absolute rounded-full opacity-80 animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${8 + Math.random() * 12}px`,
                height: `${8 + Math.random() * 12}px`,
                background: `hsl(${Math.random() * 360},90%,70%)`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
        <div className="relative z-20 flex flex-col items-center justify-center py-10 px-6">
          <div className="mb-4">
            <svg className="mx-auto h-16 w-16 text-yellow-400 drop-shadow-lg animate-bounce" fill="none" viewBox="0 0 48 48" stroke="currentColor">
              <circle cx="24" cy="24" r="22" strokeWidth="4" className="stroke-yellow-300 fill-yellow-100" />
              <path d="M16 32c2-2 6-2 8 0m8-8c-2 2-6 2-8 0" strokeWidth="2" className="stroke-pink-400" />
              <circle cx="18" cy="20" r="2" className="fill-pink-400" />
              <circle cx="30" cy="20" r="2" className="fill-pink-400" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-yellow-700 mb-2 drop-shadow">Perayaan Ulang Tahun Mahapala Narotama ke-{getAnniversaryNumber()}</h2>
          <p className="text-lg text-gray-700 mb-4">Menuju hari ulang tahun organisasi pada <b>26 Januari</b>!</p>
          {timeLeft ? (
            <div className="mb-6 text-3xl font-mono flex justify-center gap-3 text-pink-600">
              <span>{timeLeft.days} <span className="text-xs font-normal text-gray-500">hari</span></span>
              <span>:</span>
              <span>{String(timeLeft.hours).padStart(2, '0')}<span className="text-xs font-normal text-gray-500">j</span></span>
              <span>:</span>
              <span>{String(timeLeft.minutes).padStart(2, '0')}<span className="text-xs font-normal text-gray-500">m</span></span>
              <span>:</span>
              <span>{String(timeLeft.seconds).padStart(2, '0')}<span className="text-xs font-normal text-gray-500">d</span></span>
            </div>
          ) : (
            <p className="mb-6">Menghitung...</p>
          )}
          <Button onClick={onClose} className="mt-2 bg-pink-500 hover:bg-pink-600 text-white font-bold shadow-lg rounded-full px-6 py-2">Tutup</Button>
        </div>
      </DialogContent>
      <style>{`
        @keyframes confetti {
          0% { transform: translateY(-40px) scale(1) rotate(0deg); opacity: 1; }
          100% { transform: translateY(400px) scale(0.7) rotate(360deg); opacity: 0.7; }
        }
        .animate-confetti {
          animation: confetti 2.5s linear infinite;
        }
        .animate-fadeIn {
          animation: fadeIn 0.7s cubic-bezier(.4,0,.2,1);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </Dialog>
  );
}
