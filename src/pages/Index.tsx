import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, FileText, CreditCard, BookOpen, LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import { MobileNav } from "@/components/MobileNav";
import { useAuth } from "@/components/AuthProvider";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header Moderno e Acessível */}
      <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90 border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo e Titulo */}
            <div className="flex items-center gap-3">
              <img 
                src="/lovable-uploads/9e56fb52-9dc2-4075-8e3e-8b20fd589107.png" 
                alt="AAUMA Logo" 
                className="w-12 h-12 object-contain"
              />
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-foreground">
                  Preparatório AAUMA
                </h1>
                <p className="text-sm text-muted-foreground">2025 - 2026</p>
              </div>
            </div>

            {/* Navegação Desktop */}
            <nav className="hidden lg:flex items-center gap-2">
              <Link to="/inscricao">
                <Button className="bg-aauma-red hover:bg-aauma-red/90 text-white">
                  Fazer Inscrição
                </Button>
              </Link>
              {user ? (
                <Link to="/admin">
                  <Button variant="outline">
                    <Users className="w-4 h-4 mr-2" />
                    Admin
                  </Button>
                </Link>
              ) : (
                <Link to="/auth">
                  <Button variant="outline">
                    <LogIn className="w-4 h-4 mr-2" />
                    Entrar
                  </Button>
                </Link>
              )}
            </nav>

            {/* Navegação Mobile */}
            <div className="lg:hidden flex items-center gap-2">
              <Link to="/inscricao">
                <Button size="sm" className="bg-aauma-red hover:bg-aauma-red/90 text-white">
                  Inscrever
                </Button>
              </Link>
              {!user && (
                <Link to="/auth">
                  <Button variant="outline" size="sm">
                    <LogIn className="w-4 h-4" />
                  </Button>
                </Link>
              )}
              <MobileNav />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto animate-fade-in">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              <span className="aauma-text-gradient">
                Preparatório Universitário
              </span>
            </h2>
            <p className="text-lg md:text-xl text-aauma-dark-gray mb-8 leading-relaxed">
              Prepare-se para o exame de acesso universitário com o melhor programa preparatório de Angola. 
              Ministrado pela Associação Acadêmica da Universidade Metodista de Angola com professores especializados.
            </p>
            
            {/* Pricing Card */}
            <div className="max-w-md mx-auto mb-12">
              <Card className="border-2 border-aauma-navy/20 hover:border-aauma-navy/40 transition-colors">
                <CardHeader className="text-center">
                  <CardTitle className="text-aauma-navy">Taxa de Inscrição</CardTitle>
                  <CardDescription>Preparatório 2025 - 2026</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-4xl font-bold text-aauma-navy mb-2">
                    40.000 Kz
                  </div>
                  <p className="text-sm text-aauma-dark-gray">Valor único</p>
                </CardContent>
              </Card>
            </div>

            <Link to="/inscricao">
              <Button size="lg" className="bg-aauma-navy hover:bg-aauma-navy/90 text-white px-8 py-3 text-lg">
                Inscrever-se Agora
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl md:text-3xl font-bold text-center text-aauma-navy mb-12">
            O que oferecemos
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow animate-slide-up">
              <CardHeader>
                <BookOpen className="w-8 h-8 text-aauma-red mb-2" />
                <CardTitle className="text-aauma-navy">Disciplinas Completas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-aauma-dark-gray">
                  Matemática, Física, Química, Biologia, Língua Portuguesa e disciplinas específicas por curso.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <CardHeader>
                <Calendar className="w-8 h-8 text-aauma-red mb-2" />
                <CardTitle className="text-aauma-navy">Horários Flexíveis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-aauma-dark-gray">
                  Turnos manhã (08:00-12:00) e tarde (14:00-18:00) para se adequar à sua rotina.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <Users className="w-8 h-8 text-aauma-red mb-2" />
                <CardTitle className="text-aauma-navy">Turmas Reduzidas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-aauma-dark-gray">
                  Máximo 25 estudantes por turma para acompanhamento personalizado e melhor aprendizado.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <CardHeader>
                <Clock className="w-8 h-8 text-aauma-red mb-2" />
                <CardTitle className="text-aauma-navy">Gestão de Tempo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-aauma-dark-gray">
                  3 meses de preparação intensiva com simulados semanais e acompanhamento individual.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <CardHeader>
                <FileText className="w-8 h-8 text-aauma-red mb-2" />
                <CardTitle className="text-aauma-navy">Documentação</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-aauma-dark-gray">
                  Material didático completo, apostilas digitais e físicas incluídas na inscrição.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow animate-slide-up" style={{ animationDelay: '0.5s' }}>
              <CardHeader>
                <CreditCard className="w-8 h-8 text-aauma-red mb-2" />
                <CardTitle className="text-aauma-navy">Pagamento Seguro</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-aauma-dark-gray">
                  Pagamento via Cash, Transferência, Multicaixa ou Cartão com fatura automática.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-aauma-navy text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-4">
            <img 
              src="/lovable-uploads/9e56fb52-9dc2-4075-8e3e-8b20fd589107.png" 
              alt="AAUMA Logo" 
              className="w-12 h-12 object-contain"
            />
            <div>
              <h4 className="font-bold">Associação Acadêmica da Universidade Metodista de Angola</h4>
              <p className="text-aauma-light-gray">Preparatório 2025 - 2026</p>
            </div>
          </div>
          <p className="text-aauma-light-gray">
            © 2025 AAUMA. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
