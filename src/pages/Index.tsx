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
                  <Button className="bg-aauma-navy hover:bg-aauma-navy/90 text-white shadow-md">
                    Fazer Inscrição
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>}
              {user ? <>
                  {(isAdmin() || canAccess("view_data")) && <Link to="/admin">
                      <Button variant="outline" className="border-aauma-navy text-aauma-navy hover:bg-aauma-navy hover:text-white">
                        Admin
                      </Button>
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
            <Badge variant="secondary" className="mb-6 bg-aauma-navy/10 text-aauma-navy border-aauma-navy/20">
              Preparatório 2025 - Inscrições Abertas
            </Badge>
            
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
            <img src="/lovable-uploads/9e56fb52-9dc2-4075-8e3e-8b20fd589107.png" alt="AAUMA Logo" className="w-8 h-8 object-contain bg-white rounded-lg p-1" />
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
    </div>;
};
export default Index;