
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
import NotFound from "./pages/NotFound";

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
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/financeiro" element={<AdminFinanceiro />} />
          <Route path="/admin/horarios" element={<AdminHorarios />} />
          <Route path="/admin/turmas" element={<AdminTurmas />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
