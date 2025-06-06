import { useEffect } from "react";
import { useLocation } from "wouter";

/**
 * Komponen yang otomatis scroll ke atas setiap kali path berubah (navigasi halaman).
 */
export function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location]);
  return null;
}
