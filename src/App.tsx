import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { EditModeProvider } from "./contexts/EditModeContext";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import Financial from "./pages/Financial";
import Calendar from "./pages/Calendar";
import Students from "./pages/Students";
import Enrollment from "./pages/Enrollment";
import Teachers from "./pages/Teachers";
import Roles from "./pages/Roles";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <EditModeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Home />} />
              <Route path="/financial" element={<Financial />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/students" element={<Students />} />
              <Route path="/enrollment" element={<Enrollment />} />
              <Route path="/teachers" element={<Teachers />} />
              <Route path="/roles" element={<Roles />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </EditModeProvider>
  </QueryClientProvider>
);

export default App;
