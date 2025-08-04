import { useRef, useState, useEffect } from "react";
// @ts-ignore
import backsound from "../assets/backsound.mp3";

export default function BacksoundPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  const handleToggle = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  useEffect(() => {
    if (audioRef.current) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay might be blocked, do nothing
        });
      }
    }
    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-center group select-none">
      <div
        className={`w-16 h-16 rounded-full bg-gradient-to-tr from-green-300 to-green-700 shadow-lg flex items-center justify-center border-4 border-white transition-transform duration-700 ${playing ? "animate-spin-slow" : ""}`}
        style={{ boxShadow: '0 4px 24px 0 rgba(34,139,34,0.15)' }}
        onClick={handleToggle}
        title={playing ? "Pause backsound" : "Putar backsound"}
      >
        <img
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=200&q=80"
          alt="Piringan Backsound Hutan"
          className="w-12 h-12 rounded-full object-cover pointer-events-none"
          style={{ filter: 'brightness(0.95) contrast(1.1)' }}
        />
        <button
          className="absolute w-8 h-8 flex items-center justify-center rounded-full bg-white/80 shadow group-hover:bg-white/90 transition top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          aria-label={playing ? "Pause backsound" : "Putar backsound"}
          tabIndex={0}
        >
          {playing ? (
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>
          ) : (
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="6,4 20,12 6,20 6,4"/></svg>
          )}
        </button>
      </div>
      <audio
        ref={audioRef}
        src={backsound}
        loop
        preload="auto"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        style={{ display: "none" }}
        onLoadedMetadata={() => {
          if (audioRef.current) audioRef.current.volume = 0.6;
        }}
      />
      <span className="mt-2 text-xs text-green-900 bg-white/80 px-2 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition">{playing ? "Sedang diputar" : "Klik untuk backsound"}</span>
    </div>
  );
}
