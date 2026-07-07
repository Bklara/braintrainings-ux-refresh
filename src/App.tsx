import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DialogueCoach } from "./pages/DialogueCoach";

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <DialogueCoach />
  </TooltipProvider>
);

export default App;
