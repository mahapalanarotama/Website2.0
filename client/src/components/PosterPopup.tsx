import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, Timestamp } from "firebase/firestore";

export interface Poster {
  id: string;
  imageUrl: string;
  startTime: Timestamp;
  endTime: Timestamp;
  linkUrl?: string;
}


export const PosterPopup: React.FC = () => {
  const [posters, setPosters] = useState<Poster[]>([]);
  const [visible, setVisible] = useState<string[]>([]);

  // Get today's date string (YYYY-MM-DD)
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    const fetchPosters = async () => {
      const now = Timestamp.now();
      const snapshot = await getDocs(collection(db, "posters"));
      const activePosters: Poster[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        if (
          data.startTime?.toMillis() <= now.toMillis() &&
          data.endTime?.toMillis() >= now.toMillis()
        ) {
          activePosters.push({
            id: doc.id,
            imageUrl: data.imageUrl,
            startTime: data.startTime,
            endTime: data.endTime,
            linkUrl: data.linkUrl || undefined,
          });
        }
      });

      // Check localStorage for closed posters for today
      const closedRaw = localStorage.getItem("closedPosters");
      let closed: Record<string, string> = {};
      try {
        closed = closedRaw ? JSON.parse(closedRaw) : {};
      } catch {}

      // Only show posters not closed today
      const visiblePosters = activePosters.filter(p => closed[p.id] !== today);
      setPosters(activePosters);
      setVisible(visiblePosters.map(p => p.id));
    };
    fetchPosters();
  }, [today]);

  const handleClose = (id: string) => {
    setVisible(v => v.filter(vid => vid !== id));
    // Mark poster as closed for today
    const closedRaw = localStorage.getItem("closedPosters");
    let closed: Record<string, string> = {};
    try {
      closed = closedRaw ? JSON.parse(closedRaw) : {};
    } catch {}
    closed[id] = today;
    localStorage.setItem("closedPosters", JSON.stringify(closed));
  };

  if (posters.length === 0 || visible.length === 0) return null;

  return (
    <>
      {posters.map(
        poster =>
          visible.includes(poster.id) && (
            <div
              key={poster.id}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
            >
              <div className="relative max-w-lg w-full p-4 bg-white rounded-lg shadow-lg flex flex-col items-center">
                <button
                  className="absolute top-2 left-2 text-red-600 hover:text-red-700 text-2xl font-bold drop-shadow-lg"
                  style={{ textShadow: '2px 2px 6px #fff, 0 0 2px #000' }}
                  onClick={() => handleClose(poster.id)}
                  aria-label="Close poster"
                >
                  ×
                </button>
                <button
                  className="absolute top-2 right-2 text-blue-600 hover:text-blue-700 text-base font-bold drop-shadow-lg px-3 py-1 rounded"
                  style={{ textShadow: '2px 2px 6px #fff, 0 0 2px #000' }}
                  onClick={() => setVisible(v => v.filter(vid => vid !== poster.id))}
                  aria-label="Lewati poster"
                >
                  Lewati
                </button>
                {poster.linkUrl ? (
                  <a href={poster.linkUrl} target="_blank" rel="noopener noreferrer">
                    <img
                      src={poster.imageUrl}
                      alt="Poster"
                      className="max-h-[70vh] w-auto rounded-lg"
                    />
                  </a>
                ) : (
                  <img
                    src={poster.imageUrl}
                    alt="Poster"
                    className="max-h-[70vh] w-auto rounded-lg"
                  />
                )}
              </div>
            </div>
          )
      )}
    </>
  );
};
