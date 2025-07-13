
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Inscricao from "./pages/Inscricao";
import InscricaoSucesso from "./pages/InscricaoSucesso";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminFinanceiro from "./pages/admin/Financeiro";
import AdminHorarios from "./pages/admin/Horarios";
import AdminTurmas from "./pages/admin/Turmas";
import GestaoIndividual from "./pages/admin/GestaoIndividual";
import NotFound from "./pages/NotFound";
import { AdminLayout } from "./components/AdminLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/inscricao" element={<Inscricao />} />
          <Route path="/inscricao-sucesso" element={<InscricaoSucesso />} />
          
          {/* Admin routes with layout */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="financeiro" element={<AdminFinanceiro />} />
            <Route path="horarios" element={<AdminHorarios />} />
            <Route path="turmas" element={<AdminTurmas />} />
            <Route path="gestao-individual" element={<GestaoIndividual />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
