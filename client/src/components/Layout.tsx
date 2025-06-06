import React, { useEffect } from "react";
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
        toast({
          title: "Cookie Settings",
          description: "Third-party cookies are blocked. Some features may not work properly. Please adjust your browser settings if needed.",
          duration: 10000,
        });
      }
    } catch (error) {
      console.error('Error checking third-party cookies:', error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
      <CookieConsent />
    </div>
  );
}
