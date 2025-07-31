import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, FileText, CreditCard, BookOpen, LogIn, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { MobileNav } from "@/components/MobileNav";
import { useAuth } from "@/components/AuthProvider";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-aauma-light-gray/30">
      {/* Header Elegante */}
      <header className="bg-white/80 backdrop-blur border-b border-aauma-light-gray/50 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/lovable-uploads/9e56fb52-9dc2-4075-8e3e-8b20fd589107.png" 
                alt="AAUMA Logo" 
                className="w-10 h-10 object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-aauma-navy">AAUMA</h1>
                <p className="text-xs text-aauma-dark-gray">Preparatório 2025</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-3">
              <Link to="/inscricao">
                <Button className="bg-aauma-navy hover:bg-aauma-navy/90 text-white shadow-md">
                  Fazer Inscrição
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              {user ? (
                <Link to="/admin">
                  <Button variant="outline" className="border-aauma-navy text-aauma-navy hover:bg-aauma-navy hover:text-white">
                    Admin
                  </Button>
                </Link>
              ) : (
                <Link to="/auth">
                  <Button variant="outline" className="border-aauma-dark-gray">
                    <LogIn className="w-4 h-4 mr-1" />
                    Entrar
                  </Button>
                </Link>
              )}
            </nav>

            <div className="md:hidden">
              <MobileNav />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6">

        {/* Features Section Melhorado */}
        <section className="py-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-aauma-navy mb-4">
              Por que escolher nosso preparatório?
            </h3>
            <p className="text-aauma-dark-gray max-w-2xl mx-auto">
              Oferecemos uma preparação completa e eficaz para garantir seu sucesso no exame universitário.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-aauma-light-gray/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-aauma-red/10 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-aauma-red" />
                </div>
                <CardTitle className="text-aauma-navy text-lg">Disciplinas Completas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-aauma-dark-gray text-sm leading-relaxed">
                  Matemática, Física, Química, Biologia, Língua Portuguesa e disciplinas específicas para cada curso.
                </p>
              </CardContent>
            </Card>

            <Card className="border-aauma-light-gray/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-aauma-red/10 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-aauma-red" />
                </div>
                <CardTitle className="text-aauma-navy text-lg">Horários Flexíveis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-aauma-dark-gray text-sm leading-relaxed">
                  Turnos manhã (08:00-12:00) e tarde (14:00-18:00) para se adaptar à sua agenda.
                </p>
              </CardContent>
            </Card>

            <Card className="border-aauma-light-gray/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-aauma-red/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-aauma-red" />
                </div>
                <CardTitle className="text-aauma-navy text-lg">Turmas Reduzidas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-aauma-dark-gray text-sm leading-relaxed">
                  Máximo 25 estudantes por turma para acompanhamento personalizado e melhor aprendizado.
                </p>
              </CardContent>
            </Card>

            <Card className="border-aauma-light-gray/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-aauma-red/10 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-aauma-red" />
                </div>
                <CardTitle className="text-aauma-navy text-lg">Simulados Regulares</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-aauma-dark-gray text-sm leading-relaxed">
                  Simulados semanais e avaliações contínuas para medir seu progresso e identificar áreas de melhoria.
                </p>
              </CardContent>
            </Card>

            <Card className="border-aauma-light-gray/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-aauma-red/10 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-aauma-red" />
                </div>
                <CardTitle className="text-aauma-navy text-lg">Material Completo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-aauma-dark-gray text-sm leading-relaxed">
                  Apostilas digitais e físicas, exercícios práticos e material de apoio incluídos na inscrição.
                </p>
              </CardContent>
            </Card>

            <Card className="border-aauma-light-gray/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-aauma-red/10 rounded-lg flex items-center justify-center mb-4">
                  <CreditCard className="w-6 h-6 text-aauma-red" />
                </div>
                <CardTitle className="text-aauma-navy text-lg">Pagamento Facilitado</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-aauma-dark-gray text-sm leading-relaxed">
                  Aceita Cash, Transferência Bancária, Multicaixa Express com fatura automática.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer Elegante */}
      <footer className="bg-gradient-to-r from-aauma-navy to-aauma-navy/90 text-white py-8 mt-16">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img 
              src="/lovable-uploads/9e56fb52-9dc2-4075-8e3e-8b20fd589107.png" 
              alt="AAUMA Logo" 
              className="w-8 h-8 object-contain bg-white rounded-lg p-1"
            />
            <div className="text-left">
              <h4 className="font-bold text-white">AAUMA</h4>
              <p className="text-white/80 text-sm">Preparatório 2025</p>
            </div>
          </div>
          <p className="text-white/70 text-sm">
            © 2025 Associação Acadêmica da Universidade Metodista de Angola. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
