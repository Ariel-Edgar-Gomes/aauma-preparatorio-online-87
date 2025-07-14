
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Inscricao from "./pages/Inscricao";
import InscricaoSucesso from "./pages/InscricaoSucesso";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminFinanceiro from "./pages/admin/Financeiro";
import AdminHorarios from "./pages/admin/Horarios";
import AdminTurmas from "./pages/admin/Turmas";
import GestaoIndividual from "./pages/admin/GestaoIndividual";
import GestaoUsuarios from "./pages/admin/GestaoUsuarios";
import NotFound from "./pages/NotFound";
import { AdminLayout } from "./components/AdminLayout";
import { AuthProvider } from "./components/AuthProvider";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            <Route path="/inscricao" element={
              <ProtectedRoute requiredPermission="inscricao">
                <Inscricao />
              </ProtectedRoute>
            } />
            <Route path="/inscricao-sucesso" element={
              <ProtectedRoute>
                <InscricaoSucesso />
              </ProtectedRoute>
            } />
            <Route path="/auth" element={<Auth />} />
            
            {/* Admin routes with layout - protected */}
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="financeiro" element={
                <ProtectedRoute requiredPermission="view_financeiro">
                  <AdminFinanceiro />
                </ProtectedRoute>
              } />
              <Route path="horarios" element={<AdminHorarios />} />
              <Route path="turmas" element={<AdminTurmas />} />
              <Route path="gestao-individual" element={<GestaoIndividual />} />
              <Route path="usuarios" element={
                <ProtectedRoute requiredPermission="admin">
                  <GestaoUsuarios />
                </ProtectedRoute>
              } />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
