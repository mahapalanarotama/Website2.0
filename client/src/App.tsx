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

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <Layout>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/kegiatan" component={ActivitiesPage} />
          <Route path="/pembelajaran" component={LearningPage} />
          <Route path="/kartu-anggota" component={MemberCardPage} />
          <Route path="/pendaftaran" component={PendaftaranPage} />
          <Route component={NotFound} />
        </Switch>
      </Layout>
    </TooltipProvider>
  );
}

export default App;
