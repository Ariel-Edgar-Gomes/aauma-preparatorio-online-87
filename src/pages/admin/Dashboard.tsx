import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, GraduationCap, BookOpen, TrendingUp, Clock, MapPin, DollarSign, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { alunosService, turmaPairsService, cursosService, salasService } from "@/services/supabaseService";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { UserEnrollmentStats } from "@/components/admin/UserEnrollmentStats";
interface DashboardStats {
  totalAlunos: number;
  alunosInscritos: number;
  alunosConfirmados: number;
  alunosCancelados: number;
  totalPares: number;
  paresAtivos: number;
  totalCursos: number;
  totalSalas: number;
  receitaTotal: number;
  pagamentoCash: number;
  pagamentoTransferencia: number;
  pagamentoCartao: number;
}
const AdminDashboard = () => {
  const {
    toast
  } = useToast();
  const {
    hasRole
  } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalAlunos: 0,
    alunosInscritos: 0,
    alunosConfirmados: 0,
    alunosCancelados: 0,
    totalPares: 0,
    paresAtivos: 0,
    totalCursos: 0,
    totalSalas: 0,
    receitaTotal: 0,
    pagamentoCash: 0,
    pagamentoTransferencia: 0,
    pagamentoCartao: 0
  });
  const [loading, setLoading] = useState(true);
  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      console.log('[Dashboard] Carregando estatísticas...');

      // Carregar dados em paralelo
      const [alunosStats, turmaPairs, cursos, salas, {
        data: ajustes
      }] = await Promise.all([alunosService.getStatistics(), turmaPairsService.getAll(), cursosService.getAll(), salasService.getAll(), supabase.from('ajustes_financeiros').select('*')]);
      const paresAtivos = turmaPairs.filter(p => p.ativo).length;

      // Calcular receita total igual à página financeira
      // Para o dashboard, vamos usar o valor simples de alunosStats.totalRecebido 
      // mais os ajustes financeiros para ser igual à receita arrecadada
      const totalAjustes = ajustes?.reduce((sum, ajuste) => sum + Number(ajuste.valor), 0) || 0;
      const receitaTotalFinal = alunosStats.totalRecebido + totalAjustes;
      setStats({
        totalAlunos: alunosStats.total,
        alunosInscritos: alunosStats.inscritos,
        alunosConfirmados: alunosStats.confirmados,
        alunosCancelados: alunosStats.cancelados,
        totalPares: turmaPairs.length,
        paresAtivos,
        totalCursos: cursos.length,
        totalSalas: salas.length,
        receitaTotal: receitaTotalFinal,
        pagamentoCash: alunosStats.pagamentoCash,
        pagamentoTransferencia: alunosStats.pagamentoTransferencia,
        pagamentoCartao: alunosStats.pagamentoCartao
      });
      console.log('[Dashboard] Estatísticas carregadas:', alunosStats);
    } catch (error) {
      console.error('[Dashboard] Erro ao carregar estatísticas:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar as estatísticas do dashboard.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadDashboardStats();
  }, []);
  if (loading) {
    return <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-aauma-navy mx-auto mb-4" />
          <p className="text-aauma-dark-gray">Carregando dashboard...</p>
        </div>
      </div>;
  }
  return <div className="p-6">
      {/* Title Section */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-aauma-navy mb-2">Visão Geral do Sistema</h2>
        <p className="text-aauma-dark-gray">Acompanhe todas as métricas importantes do preparatório AAUMA</p>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end mb-6">
        <Button onClick={loadDashboardStats} variant="outline" className="h-9 px-4 text-sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar Dados
        </Button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Alunos */}
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalAlunos}</div>
            <div className="flex gap-2 mt-2">
              <Badge variant="default" className="text-xs">
                {stats.alunosInscritos} Inscritos
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {stats.alunosConfirmados} Confirmados
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Pares de Turmas */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pares de Turmas</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.totalPares}</div>
            <div className="flex gap-2 mt-2">
              <Badge variant="default" className="text-xs bg-green-500">
                {stats.paresAtivos} Ativos
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {stats.totalPares - stats.paresAtivos} Inativos
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Cursos */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cursos Disponíveis</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalCursos}</div>
            <p className="text-xs text-muted-foreground mt-2">
              3 grupos: Engenharias, Saúde, Ciências Sociais
            </p>
          </CardContent>
        </Card>

        {/* Receita - Esconder para usuários inscrição simples */}
        {!hasRole('inscricao_simples') && <Card className="border-l-4 border-l-yellow-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              
              
            </CardHeader>
            <CardContent>
              
              <p className="text-xs text-muted-foreground mt-2">
                De {stats.totalAlunos - stats.alunosCancelados} alunos ativos
              </p>
            </CardContent>
          </Card>}
      </div>

      {/* Secondary Stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Formas de Pagamento */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Formas de Pagamento
            </CardTitle>
            <CardDescription>Distribuição dos métodos de pagamento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Cash</span>
              <Badge variant="outline">{stats.pagamentoCash} alunos</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Transferência</span>
              <Badge variant="outline">{stats.pagamentoTransferencia} alunos</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Cartão</span>
              <Badge variant="outline">{stats.pagamentoCartao} alunos</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Status dos Alunos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5" />
              Status dos Alunos
            </CardTitle>
            <CardDescription>Distribuição por status de inscrição</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Inscritos</span>
              <Badge variant="default">{stats.alunosInscritos}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Confirmados</span>
              <Badge variant="secondary">{stats.alunosConfirmados}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Cancelados</span>
              <Badge variant="destructive">{stats.alunosCancelados}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Recursos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Recursos Disponíveis
            </CardTitle>
            <CardDescription>Infraestrutura do preparatório</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Salas Disponíveis</span>
              <Badge variant="outline">{stats.totalSalas} salas</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Pares Ativos</span>
              <Badge variant="default">{stats.paresAtivos} pares</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Cursos Oferecidos</span>
              <Badge variant="secondary">{stats.totalCursos} cursos</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas por Usuário */}
      <div className="mb-8">
        <UserEnrollmentStats refreshTrigger={loading ? 0 : 1} />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Ações Rápidas
          </CardTitle>
          <CardDescription>Links para as principais funcionalidades do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/admin/turmas">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <Users className="w-6 h-6" />
                <span className="text-sm">Gestão de Turmas</span>
              </Button>
            </Link>
            
            <Link to="/admin/horarios">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <Clock className="w-6 h-6" />
                <span className="text-sm">Horários</span>
              </Button>
            </Link>
            
            {/* Esconder Relatórios Financeiros para inscrição simples */}
            {!hasRole('inscricao_simples') && <Link to="/admin/financeiro">
                <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                  <DollarSign className="w-6 h-6" />
                  <span className="text-sm">Relatórios Financeiros</span>
                </Button>
              </Link>}
            
            <Link to="/inscricao">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <GraduationCap className="w-6 h-6" />
                <span className="text-sm">Nova Inscrição</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>;
};
export default AdminDashboard;