import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { TimerProvider } from "@/contexts/TimerContext";
import Login from "./pages/Login";
import Index from "./pages/Index";
import Tarefas from "./pages/Tarefas";
import Missoes from "./pages/Missoes";
import Resumos from "./pages/Resumos";
import Amigos from "./pages/Amigos";
import Perfil from "./pages/Perfil";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const P = ({ children }: { children: JSX.Element }) => <ProtectedRoute>{children}</ProtectedRoute>;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TimerProvider><TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/home" element={<P><Index /></P>} />
            <Route path="/tarefas" element={<P><Tarefas /></P>} />
            <Route path="/missoes" element={<P><Missoes /></P>} />
            <Route path="/resumos" element={<P><Resumos /></P>} />
            <Route path="/amigos" element={<P><Amigos /></P>} />
            <Route path="/perfil" element={<P><Perfil /></P>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider></TimerProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
