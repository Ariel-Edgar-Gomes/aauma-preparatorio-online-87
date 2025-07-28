
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
import PesquisaGlobal from "./pages/admin/PesquisaGlobal";
import Auditoria from "./pages/admin/Auditoria";
import Inscricoes from "./pages/Inscricoes";
import NotFound from "./pages/NotFound";
import { AdminLayout } from "./components/AdminLayout";
import { MainLayout } from "./components/MainLayout";
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
            <Route path="/auth" element={<Auth />} />
            
            {/* Todas as outras rotas com MainLayout */}
            <Route path="/" element={
              <ProtectedRoute>
                <MainLayout>
                  <Index />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/inscricoes" element={
              <ProtectedRoute>
                <MainLayout>
                  <Inscricoes />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/inscricao" element={
              <ProtectedRoute requiredPermission="inscricao">
                <MainLayout>
                  <Inscricao />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/inscricao-sucesso" element={
              <ProtectedRoute>
                <MainLayout>
                  <InscricaoSucesso />
                </MainLayout>
              </ProtectedRoute>
            } />
            
            {/* Admin routes with MainLayout - protected */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute>
                <MainLayout>
                  <AdminDashboard />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/financeiro" element={
              <ProtectedRoute requiredPermission="view_financeiro">
                <MainLayout>
                  <AdminFinanceiro />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/horarios" element={
              <ProtectedRoute>
                <MainLayout>
                  <AdminHorarios />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/turmas" element={
              <ProtectedRoute>
                <MainLayout>
                  <AdminTurmas />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/gestao-individual" element={
              <ProtectedRoute>
                <MainLayout>
                  <GestaoIndividual />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/pesquisa-global" element={
              <ProtectedRoute>
                <MainLayout>
                  <PesquisaGlobal />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/usuarios" element={
              <ProtectedRoute requiredPermission="admin">
                <MainLayout>
                  <GestaoUsuarios />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/auditoria" element={
              <ProtectedRoute requiredPermission="admin">
                <MainLayout>
                  <Auditoria />
                </MainLayout>
              </ProtectedRoute>
            } />
            
            {/* Redirect /admin to /admin/dashboard */}
            <Route path="/admin" element={
              <ProtectedRoute>
                <MainLayout>
                  <AdminDashboard />
                </MainLayout>
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={
              <MainLayout>
                <NotFound />
              </MainLayout>
            } />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
