import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, FileText, CreditCard, BookOpen, LogIn, ArrowRight, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { MobileNav } from "@/components/MobileNav";
import { useAuth } from "@/components/AuthProvider";
const Index = () => {
  const {
    user,
    signOut,
    canAccess,
    isAdmin
  } = useAuth();
  return <div className="min-h-screen bg-gradient-to-br from-white to-aauma-light-gray/30">
      {/* Header Simples */}
      <header className="bg-white/80 backdrop-blur border-b border-aauma-light-gray/50 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <nav className="hidden md:flex items-center gap-3">
              {canAccess("inscricao") && <Link to="/inscricao">
                  
                </Link>}
              {user ? <>
                  {(isAdmin() || canAccess("view_data")) && <Link to="/admin">
                      
                    </Link>}
                  <Button variant="outline" onClick={signOut} className="border-aauma-red text-aauma-red hover:bg-aauma-red hover:text-white">
                    <LogOut className="w-4 h-4 mr-1" />
                    Sair
                  </Button>
                </> : <Link to="/auth">
                  <Button variant="outline" className="border-aauma-dark-gray">
                    <LogIn className="w-4 h-4 mr-1" />
                    Entrar
                  </Button>
                </Link>}
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6">
        {/* Hero Section Moderno */}
        <section className="py-16 text-center">
          <div className="max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6 bg-aauma-navy/10 text-aauma-navy border-aauma-navy/20">Preparatório 2025-2026 - Inscrições Abertas</Badge>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-aauma-navy leading-tight">
              Preparatório 
              <span className="block text-aauma-red">Universitário</span>
            </h2>
            
            <p className="text-lg text-aauma-dark-gray mb-8 max-w-2xl mx-auto leading-relaxed">
              Prepare-se para o exame de acesso universitário com os melhores professores de Angola. 
              Programa completo da Associação Acadêmica da Universidade Metodista.
            </p>

            {/* Destaque do Preço */}
            <div className="bg-white rounded-2xl shadow-lg border border-aauma-light-gray/50 p-8 mb-8 max-w-md mx-auto">
              <div className="text-center">
                <p className="text-sm text-aauma-dark-gray mb-2">Taxa de Inscrição</p>
                <p className="text-4xl font-bold text-aauma-navy mb-2">40.000 Kz</p>
                <p className="text-sm text-aauma-dark-gray">Pagamento único • 1 meses de curso</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {canAccess("inscricao") && <Link to="/inscricao">
                  <Button size="lg" className="bg-aauma-navy hover:bg-aauma-navy/90 text-white px-8 py-3 shadow-lg">
                    Inscrever-se Agora
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>}
              {canAccess("view_data") && <Link to="/inscricoes">
                  <Button size="lg" variant="outline" className="border-aauma-navy text-aauma-navy hover:bg-aauma-navy hover:text-white px-8 py-3">
                    Ver Inscrições
                  </Button>
                </Link>}
            </div>
          </div>
        </section>

        {/* Features Section Melhorado */}
        
      </main>

      {/* Footer Elegante */}
      <footer className="bg-gradient-to-r from-aauma-navy to-aauma-navy/90 text-white py-8 mt-16">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src="/lovable-uploads/9e56fb52-9dc2-4075-8e3e-8b20fd589107.png" alt="AAUMA Logo" className="w-8 h-8 object-contain bg-white rounded-lg p-1" />
            <div className="text-left">
              <h4 className="font-bold text-white">AAUMA</h4>
              <p className="text-white/80 text-sm">Preparatório 2025</p>
            </div>
          </div>
          <p className="text-white/70 text-sm">© 2025 Associação Acadêmica da Universidade Metodista de Angola. Todos os direitos reservados. Desenvolvido por 
"Argom Tech"</p>
        </div>
      </footer>
    </div>;
};
export default Index;