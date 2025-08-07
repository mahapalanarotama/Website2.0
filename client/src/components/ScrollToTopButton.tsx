import { useEffect, useState } from "react";

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 200);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className={`fixed bottom-6 right-6 z-50 p-3 rounded-full shadow-lg transition-opacity duration-300
        bg-gradient-to-br from-green-600 via-green-400 to-green-700 text-white font-bold
        hover:scale-125 hover:shadow-2xl hover:bg-green-500 active:scale-95
        ${visible ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.2)", transition: "transform 0.3s cubic-bezier(.68,-0.55,.27,1.55), box-shadow 0.3s" }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="inline-block align-middle" style={{transform: "rotate(0deg)", transition: "transform 0.3s"}}>
        <path d="M18 15l-6-6-6 6" />
      </svg>
    </button>
  );
}
