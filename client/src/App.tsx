import React from "react";
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

function App() {
  useLeafCursor();

  React.useEffect(() => {
    // Register service worker untuk PWA offline
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js');
    }
  }, []);

  return (
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
          <Route path="/kartu-anggota-detail" component={MemberCardDetailPage} />
          <Route path="/member-card-3d" component={MemberCard3DPage} />
          <Route component={NotFound} />
        </Switch>
      </Layout>
    </TooltipProvider>
  );
}

export default App;
