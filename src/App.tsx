import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import { Overview } from "./pages/Overview";
import { Audit } from "./pages/Audit";
import { Roadmap } from "./pages/Roadmap";
import { IA } from "./pages/IA";
import { Hero } from "./pages/Hero";
import { Segments } from "./pages/Segments";
import { Demo } from "./pages/Demo";
import { PrototypeHome } from "./pages/PrototypeHome";
import { PrototypeSegment } from "./pages/PrototypeSegment";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Overview />} />
            <Route path="/audit" element={<Audit />} />
            <Route path="/roadmap" element={<Roadmap />} />
            <Route path="/ia" element={<IA />} />
            <Route path="/hero" element={<Hero />} />
            <Route path="/segments" element={<Segments />} />
            <Route path="/demo" element={<Demo />} />
            <Route path="/prototype/home" element={<PrototypeHome />} />
            <Route path="/prototype/segment" element={<PrototypeSegment />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
