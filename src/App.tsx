import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext"; // Garanta que AuthProvider está aqui
import { EditModeProvider } from "./contexts/EditModeContext";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/auth/ProtectedRoute"; // Importe o ProtectedRoute
import Home from "./pages/Home";
import Financial from "./pages/Financial";
import Calendar from "./pages/Calendar";
import Students from "./pages/Students";
import Enrollment from "./pages/Enrollment";
import Teachers from "./pages/Teachers";
import Roles from "./pages/Roles";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import NotFound from "./pages/NotFound";
import Employees from "./pages/Employees";
import Modalities from "./pages/Modalities";
import NewStudent from "./pages/NewStudent";
import NewEvent from "./pages/NewEvent";
import InauguralClass from "./pages/InauguralClass";
import InauguralSignUp from "./pages/InauguralSignUp";
import GuardianInauguralDashboard from "./pages/GuardianInauguralDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider> {/* AuthProvider deve envolver a aplicação */}
        <EditModeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Layout>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/inaugural-signup" element={<InauguralSignUp />} />
                <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                <Route path="/financial" element={<ProtectedRoute><Financial /></ProtectedRoute>} />
                <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
                <Route path="/students" element={<ProtectedRoute><Students /></ProtectedRoute>} />
                <Route path="/enrollment" element={<ProtectedRoute><Enrollment /></ProtectedRoute>} />
                <Route path="/teachers" element={<ProtectedRoute><Teachers /></ProtectedRoute>} />
                <Route path="/roles" element={<ProtectedRoute><Roles /></ProtectedRoute>} />
                <Route path="/employees" element={<ProtectedRoute><Employees /></ProtectedRoute>} />
                <Route path="/modalities" element={<ProtectedRoute><Modalities /></ProtectedRoute>} />
                <Route path="/students/new" element={<ProtectedRoute><NewStudent /></ProtectedRoute>} />
                <Route path="/events/new" element={<ProtectedRoute><NewEvent /></ProtectedRoute>} />
                <Route path="/inaugural-class" element={<ProtectedRoute><InauguralClass /></ProtectedRoute>} />
                <Route path="/inaugural-dashboard" element={<ProtectedRoute><GuardianInauguralDashboard /></ProtectedRoute>} />
                <Route path="*" element={<ProtectedRoute><NotFound /></ProtectedRoute>} />
              </Routes>
            </Layout>
          </TooltipProvider>
        </EditModeProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
