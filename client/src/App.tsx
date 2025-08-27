import DeveloperPage from "@/pages/DeveloperPage";
import React, { useEffect } from "react";
import { getMeta, MetaData } from "@/lib/meta";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Layout } from "@/components/Layout";
import HomePage from "@/pages/HomePage";
import ActivitiesPage from "@/pages/ActivitiesPage";
import LearningPage from "@/pages/LearningPage";
import MemberCardPage from "@/pages/MemberCardPage";
import PendaftaranPage from "@/pages/PendaftaranPage";
import GalleryPage from "@/pages/GalleryPage";
import AdminPage from "@/pages/AdminPage";
import DetailActivityPage from "@/pages/DetailActivityPage";
import MemberCardDetailPage from "@/pages/MemberCardDetailPage";
import MemberCard3DPage from "@/pages/MemberCard3DPage";
import MemberCardScanPage from "@/pages/MemberCardScanPage";
import { ScrollToTop } from "@/components/ScrollToTop";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import { useLeafCursor } from "@/components/CursorLeafTrail";
import OfflinePage from "@/pages/OfflinePage";
import UrlShortenerPage from "@/pages/url-shortener";
import ShortRedirectPage from "@/pages/s/[shortcode]";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import SejarahPage from "@/pages/SejarahPage";
import SejarahAdminPage from "@/pages/SejarahAdminPage";
import { EduHubPage } from "@/eduhub";
import GithubOAuthCallback from "@/pages/GithubOAuthCallback";

function App() {
  useLeafCursor();

  // Blokir klik kanan
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);
    // Blokir shortcut DevTools
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && e.key === 'U')
      ) {
        e.preventDefault();
        return false;
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Dynamic meta state
  const [meta, setMeta] = React.useState<MetaData | null>(null);

  React.useEffect(() => {
    getMeta().then((data) => {
      if (data) setMeta(data);
    });
  }, []);

  React.useEffect(() => {
    if (meta) {
      document.title = meta.title;
      // Update meta tags
      const setTag = (selector: string, attr: string, value: string) => {
        let el = document.querySelector(selector);
        if (!el) return;
        el.setAttribute(attr, value);
      };
      setTag('meta[name="description"]', 'content', meta.description);
      setTag('meta[name="keywords"]', 'content', meta.keywords);
      setTag('meta[property="og:title"]', 'content', meta.title);
      setTag('meta[property="og:description"]', 'content', meta.description);
      setTag('meta[property="og:image"]', 'content', meta.image);
      setTag('meta[name="twitter:title"]', 'content', meta.title);
      setTag('meta[name="twitter:description"]', 'content', meta.description);
      setTag('meta[name="twitter:image"]', 'content', meta.image);
      // Favicon
      const favicon = document.querySelector('link[rel="icon"][type="image/x-icon"]');
      if (favicon) favicon.setAttribute('href', meta.favicon);
      const faviconFallback = document.querySelectorAll('link[rel="icon"][type="image/x-icon"]')[1];
      if (faviconFallback) faviconFallback.setAttribute('href', meta.faviconFallback);
      const faviconPng = document.querySelector('link[rel="icon"][type="image/png"]');
      if (faviconPng) faviconPng.setAttribute('href', meta.faviconPng);
    }
  }, [meta]);

  React.useEffect(() => {
    // Register service worker untuk PWA offline
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js').then(reg => {
        // Reload otomatis jika service worker update
        reg.onupdatefound = () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.onstatechange = () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Versi baru tersedia, reload otomatis
                window.location.reload();
              }
            };
          }
        };
      });
    }
  }, []);

  return (
    <ErrorBoundary>
      <TooltipProvider>
        <Toaster />
        <ScrollToTop />
        <ScrollToTopButton />
        <Layout>
        <Routes>
          <Route path="/github-oauth-callback" element={<GithubOAuthCallback />} />
          <Route path="/offline" element={<OfflinePage />} />
          <Route path="/url-shortener" element={<UrlShortenerPage />} />
          <Route path="/s/:shortcode" element={<ShortRedirectPage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/kegiatan" element={<ActivitiesPage />} />
          <Route path="/pembelajaran" element={<LearningPage />} />
          <Route path="/kartu-anggota" element={<MemberCardPage />} />
          <Route path="/pendaftaran" element={<PendaftaranPage />} />
          <Route path="/galeri" element={<GalleryPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/kegiatan/:id" element={<DetailActivityPage />} />
          <Route path="/developer" element={<DeveloperPage />} />
          <Route path="/kartu-anggota-detail" element={<MemberCardDetailPage />} />
          <Route path="/member-card-3d" element={<MemberCard3DPage />} />
          <Route path="/sejarah" element={<SejarahPage />} />
          <Route path="/sejarahAdmin" element={<SejarahAdminPage />} />
          <Route path="/scan-anggota" element={<MemberCardScanPage />} />
          <Route path="/eduhub" element={<EduHubPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
      </TooltipProvider>
    </ErrorBoundary>
  );
}

export default App;
