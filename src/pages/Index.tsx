import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Users, FileText, CreditCard, BookOpen, LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import { MobileNav } from "@/components/MobileNav";
import { useAuth } from "@/components/AuthProvider";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Header Simples */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img 
                src="/lovable-uploads/9e56fb52-9dc2-4075-8e3e-8b20fd589107.png" 
                alt="AAUMA Logo" 
                className="w-8 h-8 object-contain"
              />
              <div>
                <h1 className="text-lg font-bold text-foreground">AAUMA</h1>
                <p className="text-xs text-muted-foreground">Preparatório 2025</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-2">
              <Link to="/inscricao">
                <Button size="sm" className="bg-aauma-navy hover:bg-aauma-navy/90">
                  Inscrever
                </Button>
              </Link>
              {user ? (
                <Link to="/admin">
                  <Button variant="outline" size="sm">Admin</Button>
                </Link>
              ) : (
                <Link to="/auth">
                  <Button variant="outline" size="sm">
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

      <main className="container mx-auto px-4 py-8 space-y-12">
        {/* Hero Section Compacto */}
        <section className="text-center max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-aauma-navy">
            Preparatório Universitário
          </h2>
          <p className="text-muted-foreground mb-6 text-sm md:text-base">
            Prepare-se para o exame de acesso universitário com professores especializados da AAUMA.
          </p>
          
          <div className="inline-flex items-center gap-4 bg-muted rounded-lg p-4 mb-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-aauma-navy">40.000 Kz</p>
              <p className="text-xs text-muted-foreground">Taxa única</p>
            </div>
            <div className="h-8 w-px bg-border"></div>
            <div className="text-center">
              <p className="text-sm font-medium">3 meses</p>
              <p className="text-xs text-muted-foreground">Duração</p>
            </div>
          </div>

          <Link to="/inscricao">
            <Button className="bg-aauma-navy hover:bg-aauma-navy/90">
              Fazer Inscrição
            </Button>
          </Link>
        </section>

        {/* Features Grid Compacto */}
        <section>
          <h3 className="text-xl font-bold text-center text-aauma-navy mb-6">
            O que oferecemos
          </h3>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-aauma-red" />
                  <CardTitle className="text-base">Disciplinas Completas</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground">
                  Matemática, Física, Química, Biologia e Português.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-aauma-red" />
                  <CardTitle className="text-base">Horários Flexíveis</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground">
                  Manhã (08:00-12:00) e tarde (14:00-18:00).
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-aauma-red" />
                  <CardTitle className="text-base">Turmas Reduzidas</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground">
                  Máximo 25 estudantes por turma.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-aauma-red" />
                  <CardTitle className="text-base">Simulados</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground">
                  Simulados semanais e acompanhamento individual.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-aauma-red" />
                  <CardTitle className="text-base">Material Incluído</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground">
                  Apostilas digitais e físicas completas.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-aauma-red" />
                  <CardTitle className="text-base">Pagamento Fácil</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground">
                  Cash, Transferência ou Multicaixa.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer Compacto */}
      <footer className="bg-aauma-navy text-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <img 
              src="/lovable-uploads/9e56fb52-9dc2-4075-8e3e-8b20fd589107.png" 
              alt="AAUMA Logo" 
              className="w-6 h-6 object-contain"
            />
            <span className="font-medium text-sm">AAUMA - Preparatório 2025</span>
          </div>
          <p className="text-xs text-white/70">
            © 2025 Associação Acadêmica da Universidade Metodista de Angola
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
