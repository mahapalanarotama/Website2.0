import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import BacksoundPlayer from "@/components/BacksoundPlayer";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { CookieConsent } from "./ui/cookie-consent";
import { useToast } from "@/hooks/use-toast";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { toast } = useToast();

  useEffect(() => {
    // Check for third-party cookie support
    checkThirdPartyCookies();
  }, []);

  const checkThirdPartyCookies = async () => {
    try {
      // Test if third-party cookies are blocked
      const testValue = 'test';
      document.cookie = `thirdPartyTest=${testValue}; SameSite=None; Secure`;
      
      // If cookies are blocked, the test cookie won't be set
      const cookies = document.cookie;
      if (!cookies.includes('thirdPartyTest')) {
        // Hanya tampilkan warning non-intrusive, tidak menyebabkan error/blank
        toast({
          title: "Cookie Settings",
          description: "Beberapa fitur mungkin tidak optimal karena cookie pihak ketiga diblokir. Namun, aplikasi tetap dapat digunakan.",
          duration: 7000,
        });
      }
    } catch (error) {
      // Jangan menyebabkan error JS, hanya log
      console.warn('Gagal cek cookie pihak ketiga:', error);
    }
  };

  const location = useLocation();
  // Cek path untuk pengecualian backsound
  const hideBacksound = ["/admin", "/developer", "/offline", "/sejarahAdmin"].some((p) => location.pathname.startsWith(p));
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
      <CookieConsent />
      {!hideBacksound && <BacksoundPlayer />}
    </div>
  );
}
