import DeveloperPage from "@/pages/DeveloperPage";
import React from "react";
import { getMeta, MetaData } from "@/lib/meta";
import { Switch, Route } from "wouter";
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
import { ScrollToTop } from "@/components/ScrollToTop";
import { useLeafCursor } from "@/components/CursorLeafTrail";
import OfflineSurvivalApp from "@/pages/OfflineSurvivalApp";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import SejarahPage from "@/pages/SejarahPage";

function App() {
  useLeafCursor();

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
        <Layout>
          <Switch>
            <Route path="/offline" component={OfflineSurvivalApp} />
            <Route path="/" component={HomePage} />
            <Route path="/kegiatan" component={ActivitiesPage} />
            <Route path="/pembelajaran" component={LearningPage} />
            <Route path="/kartu-anggota" component={MemberCardPage} />
            <Route path="/pendaftaran" component={PendaftaranPage} />
            <Route path="/galeri" component={GalleryPage} />
            <Route path="/admin" component={AdminPage} />
            <Route path="/kegiatan/:id" component={DetailActivityPage} />
            <Route path="/developer" component={DeveloperPage} />
            <Route path="/kartu-anggota-detail" component={MemberCardDetailPage} />
            <Route path="/member-card-3d" component={MemberCard3DPage} />
            <Route path="/sejarah" component={SejarahPage} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </TooltipProvider>
    </ErrorBoundary>
  );
}

export default App;
