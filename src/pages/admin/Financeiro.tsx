
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Calendar,
  Search,
  Filter,
  Download,
  Eye,
  CreditCard,
  Banknote,
  Receipt,
  GraduationCap,
  Building2,
  CheckCircle,
  AlertCircle,
  XCircle,
  FileText,
  Calculator
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTurmaData } from "@/hooks/useTurmaData";
import { Aluno, TurmaPair } from "@/types/turma";

interface AlunoFinanceiro extends Aluno {
  valorMensalidade: number;
  valorPago: number;
  valorPendente: number;
  statusPagamento: 'pago' | 'pendente' | 'atrasado';
  dataUltimoPagamento?: string;
  nomeParTurma: string;
  salaTurma: string;
  turmaTipo: 'A' | 'B';
  mesReferencia: string;
  diasDesdeInscricao: number;
}

interface RelatorioFinanceiroPorPar {
  parId: string;
  nomePar: string;
  periodo: string;
  totalAlunos: number;
  alunosPagos: number;
  alunosPendentes: number;
  alunosAtrasados: number;
  receitaArrecadada: number;
  receitaPendente: number;
  receitaPotencial: number;
  taxaPagamento: number;
  turmaA: {
    sala: string;
    capacidade: number;
    alunosInscritos: number;
    receita: number;
    pendente: number;
  };
  turmaB: {
    sala: string;
    capacidade: number;
    alunosInscritos: number;
    receita: number;
    pendente: number;
  };
}

const FinanceiroPage = () => {
  const { turmaPairs, loading } = useTurmaData();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [formaPagamentoFilter, setFormaPagamentoFilter] = useState<string>("todos");
  const [selectedPair, setSelectedPair] = useState<string>("todos");

  // Valor fixo da mensalidade única do preparatório
  const VALOR_MENSALIDADE = 40000; // 400.00 AOA

  // Gerar dados financeiros baseados nos alunos reais
  const gerarDadosFinanceiros = (alunos: Aluno[], parNome: string, turmaInfo: { sala: string, tipo: 'A' | 'B' }): AlunoFinanceiro[] => {
    const mesAtual = new Date().toLocaleDateString('pt-AO', { month: 'long', year: 'numeric' });
    
    return alunos.map(aluno => {
      const dataInscricao = new Date(aluno.dataInscricao);
      const diasDesdeInscricao = Math.floor((Date.now() - dataInscricao.getTime()) / (1000 * 60 * 60 * 24));
      
      let valorPago = 0;
      let valorPendente = VALOR_MENSALIDADE;
      let statusPagamento: 'pago' | 'pendente' | 'atrasado' = 'pendente';
      let dataUltimoPagamento: string | undefined;

      // Lógica baseada no status real do aluno (CONSISTÊNCIA TOTAL)
      if (aluno.status === 'confirmado') {
        // Alunos confirmados já pagaram
        valorPago = VALOR_MENSALIDADE;
        valorPendente = 0;
        statusPagamento = 'pago';
        dataUltimoPagamento = aluno.dataInscricao;
      } else if (aluno.status === 'inscrito') {
        // Alunos inscritos têm pagamento pendente
        valorPago = 0;
        valorPendente = VALOR_MENSALIDADE;
        // Verificar se está atrasado (mais de 5 dias da inscrição)
        if (diasDesdeInscricao > 5) {
          statusPagamento = 'atrasado';
        } else {
          statusPagamento = 'pendente';
        }
      } else if (aluno.status === 'cancelado') {
        // Alunos cancelados não pagaram ou pediram reembolso
        valorPago = 0;
        valorPendente = 0;
        statusPagamento = 'pendente';
      }

      return {
        ...aluno,
        valorMensalidade: VALOR_MENSALIDADE,
        valorPago,
        valorPendente,
        statusPagamento,
        dataUltimoPagamento,
        nomeParTurma: parNome,
        salaTurma: turmaInfo.sala,
        turmaTipo: turmaInfo.tipo,
        mesReferencia: mesAtual,
        diasDesdeInscricao
      };
    });
  };

  // Consolidar todos os dados financeiros dos alunos reais
  const todosAlunosFinanceiros: AlunoFinanceiro[] = turmaPairs.flatMap(pair => [
    ...gerarDadosFinanceiros(pair.turmaA.alunos, pair.nome, { sala: pair.turmaA.sala, tipo: 'A' }),
    ...gerarDadosFinanceiros(pair.turmaB.alunos, pair.nome, { sala: pair.turmaB.sala, tipo: 'B' })
  ]);

  // Gerar relatório por par de turmas
  const relatoriosPorPar: RelatorioFinanceiroPorPar[] = turmaPairs.map(pair => {
    const alunosTurmaA = gerarDadosFinanceiros(pair.turmaA.alunos, pair.nome, { sala: pair.turmaA.sala, tipo: 'A' });
    const alunosTurmaB = gerarDadosFinanceiros(pair.turmaB.alunos, pair.nome, { sala: pair.turmaB.sala, tipo: 'B' });
    const todosAlunosPar = [...alunosTurmaA, ...alunosTurmaB];

    const alunosPagos = todosAlunosPar.filter(a => a.statusPagamento === 'pago').length;
    const alunosPendentes = todosAlunosPar.filter(a => a.statusPagamento === 'pendente').length;
    const alunosAtrasados = todosAlunosPar.filter(a => a.statusPagamento === 'atrasado').length;
    const receitaArrecadada = todosAlunosPar.reduce((sum, a) => sum + a.valorPago, 0);
    const receitaPendente = todosAlunosPar.reduce((sum, a) => sum + a.valorPendente, 0);
    const receitaPotencial = todosAlunosPar.length * VALOR_MENSALIDADE;

    return {
      parId: pair.id,
      nomePar: pair.nome,
      periodo: pair.periodo === 'manha' ? 'Manhã' : 'Tarde',
      
      totalAlunos: todosAlunosPar.length,
      alunosPagos,
      alunosPendentes,
      alunosAtrasados,
      receitaArrecadada,
      receitaPendente,
      receitaPotencial,
      taxaPagamento: todosAlunosPar.length > 0 ? (alunosPagos / todosAlunosPar.length) * 100 : 0,
      turmaA: {
        sala: pair.turmaA.sala,
        capacidade: pair.turmaA.capacidade,
        alunosInscritos: pair.turmaA.alunosInscritos,
        receita: alunosTurmaA.reduce((sum, a) => sum + a.valorPago, 0),
        pendente: alunosTurmaA.reduce((sum, a) => sum + a.valorPendente, 0)
      },
      turmaB: {
        sala: pair.turmaB.sala,
        capacidade: pair.turmaB.capacidade,
        alunosInscritos: pair.turmaB.alunosInscritos,
        receita: alunosTurmaB.reduce((sum, a) => sum + a.valorPago, 0),
        pendente: alunosTurmaB.reduce((sum, a) => sum + a.valorPendente, 0)
      }
    };
  });

  // Filtrar alunos
  const alunosFiltrados = todosAlunosFinanceiros.filter(aluno => {
    const matchesSearch = searchTerm === "" || 
      aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      aluno.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      aluno.numeroEstudante?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "todos" || aluno.statusPagamento === statusFilter;
    const matchesFormaPagamento = formaPagamentoFilter === "todos" || aluno.formaPagamento === formaPagamentoFilter;
    const matchesPair = selectedPair === "todos" || aluno.nomeParTurma.includes(selectedPair);

    return matchesSearch && matchesStatus && matchesFormaPagamento && matchesPair;
  });

  // Calcular estatísticas gerais
  const totalRecebido = todosAlunosFinanceiros.reduce((sum, aluno) => sum + aluno.valorPago, 0);
  const totalPendente = todosAlunosFinanceiros.reduce((sum, aluno) => sum + aluno.valorPendente, 0);
  const totalPotencial = todosAlunosFinanceiros.length * VALOR_MENSALIDADE;
  const alunosPagos = todosAlunosFinanceiros.filter(a => a.statusPagamento === 'pago').length;
  const alunosPendentes = todosAlunosFinanceiros.filter(a => a.statusPagamento === 'pendente').length;
  const alunosAtrasados = todosAlunosFinanceiros.filter(a => a.statusPagamento === 'atrasado').length;
  const taxaPagamento = todosAlunosFinanceiros.length > 0 ? ((alunosPagos / todosAlunosFinanceiros.length) * 100).toFixed(1) : '0.0';

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 2
    }).format(value / 100);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pago': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'atrasado': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago': return 'bg-green-100 text-green-800';
      case 'atrasado': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getGrupoCursosLabel = (grupo: string) => {
    switch (grupo) {
      case 'engenharias': return 'Engenharias';
      case 'saude': return 'Saúde';
      case 'ciencias-sociais-humanas': return 'Ciências Sociais e Humanas';
      default: return grupo;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando dados financeiros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Relatório Financeiro</h2>
          <p className="text-muted-foreground mt-1">Dados financeiros do preparatório - Pagamento único de {formatCurrency(VALOR_MENSALIDADE)}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Arrecadada</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalRecebido)}</div>
            <p className="text-xs text-muted-foreground">
              Taxa: {taxaPagamento}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valores Pendentes</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalPendente)}</div>
            <p className="text-xs text-muted-foreground">
              {alunosPendentes + alunosAtrasados} pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todosAlunosFinanceiros.length}</div>
            <p className="text-xs text-muted-foreground">
              {alunosPagos} pagos • {alunosPendentes} pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Potencial</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalPotencial)}</div>
            <p className="text-xs text-muted-foreground">
              Se todos pagarem
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="resumo" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="resumo">Resumo por Par</TabsTrigger>
          <TabsTrigger value="detalhado">Alunos Detalhado</TabsTrigger>
          <TabsTrigger value="estatisticas">Estatísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="resumo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Relatório Financeiro por Par de Turmas
              </CardTitle>
              <CardDescription>
                Resumo detalhado da situação financeira de cada par de turmas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {relatoriosPorPar.map(relatorio => (
                  <Card key={relatorio.parId} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{relatorio.nomePar}</CardTitle>
                          <div className="flex gap-4 text-sm text-gray-600 mt-1">
                            <span>Período: {relatorio.periodo}</span>
                            <span>•</span>
                            
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {relatorio.taxaPagamento.toFixed(1)}% pago
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Resumo Geral */}
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm text-gray-700">Resumo Geral</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Total Alunos:</span>
                              <span className="font-medium">{relatorio.totalAlunos}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Pagos:</span>
                              <span className="font-medium text-green-600">{relatorio.alunosPagos}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Pendentes:</span>
                              <span className="font-medium text-yellow-600">{relatorio.alunosPendentes}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Atrasados:</span>
                              <span className="font-medium text-red-600">{relatorio.alunosAtrasados}</span>
                            </div>
                          </div>
                        </div>

                        {/* Turma A */}
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm text-gray-700">Turma A - {relatorio.turmaA.sala}</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Capacidade:</span>
                              <span className="font-medium">{relatorio.turmaA.capacidade}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Inscritos:</span>
                              <span className="font-medium">{relatorio.turmaA.alunosInscritos}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Receita:</span>
                              <span className="font-medium text-green-600">{formatCurrency(relatorio.turmaA.receita)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Pendente:</span>
                              <span className="font-medium text-red-600">{formatCurrency(relatorio.turmaA.pendente)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Turma B */}
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm text-gray-700">Turma B - {relatorio.turmaB.sala}</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Capacidade:</span>
                              <span className="font-medium">{relatorio.turmaB.capacidade}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Inscritos:</span>
                              <span className="font-medium">{relatorio.turmaB.alunosInscritos}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Receita:</span>
                              <span className="font-medium text-green-600">{formatCurrency(relatorio.turmaB.receita)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Pendente:</span>
                              <span className="font-medium text-red-600">{formatCurrency(relatorio.turmaB.pendente)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Totais do Par */}
                      <div className="mt-4 pt-4 border-t">
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-sm text-gray-600">Receita Arrecadada</div>
                            <div className="text-lg font-bold text-green-600">{formatCurrency(relatorio.receitaArrecadada)}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Receita Pendente</div>
                            <div className="text-lg font-bold text-red-600">{formatCurrency(relatorio.receitaPendente)}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Receita Potencial</div>
                            <div className="text-lg font-bold text-blue-600">{formatCurrency(relatorio.receitaPotencial)}</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detalhado" className="space-y-6">
          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filtros e Pesquisa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-gray-500" />
                  <Input
                    placeholder="Buscar alunos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status Pagamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Status</SelectItem>
                    <SelectItem value="pago">Pago</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="atrasado">Atrasado</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={formaPagamentoFilter} onValueChange={setFormaPagamentoFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Forma Pagamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas as Formas</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Transferencia">Transferência</SelectItem>
                    <SelectItem value="Cartao">Cartão</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedPair} onValueChange={setSelectedPair}>
                  <SelectTrigger>
                    <SelectValue placeholder="Par de Turmas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Pares</SelectItem>
                    {turmaPairs.map(pair => (
                      <SelectItem key={pair.id} value={pair.nome.split(' - ')[1]}>
                        {pair.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Tabela Detalhada */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Detalhes Financeiros por Aluno
              </CardTitle>
              <CardDescription>
                Lista completa de todos os alunos com seus dados de pagamento ({alunosFiltrados.length} de {todosAlunosFinanceiros.length} alunos)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Aluno</TableHead>
                      <TableHead>Par/Turma</TableHead>
                      <TableHead>Curso</TableHead>
                      <TableHead>Status Inscrição</TableHead>
                      <TableHead>Status Pagamento</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Valor Pago</TableHead>
                      <TableHead>Valor Pendente</TableHead>
                      <TableHead>Forma Pagamento</TableHead>
                      <TableHead>Data do Pagamento</TableHead>
                      <TableHead>Dias desde Inscrição</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {alunosFiltrados.map(aluno => (
                      <TableRow key={aluno.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{aluno.nome}</div>
                            <div className="text-sm text-gray-500">{aluno.numeroEstudante}</div>
                            <div className="text-xs text-gray-400">{aluno.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge variant="outline" className="text-xs">
                              {aluno.nomeParTurma}
                            </Badge>
                            <div className="text-sm text-gray-500">
                              Turma {aluno.turmaTipo} - {aluno.salaTurma}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {aluno.curso.replace(/[-_]/g, ' ').toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={aluno.status === 'confirmado' ? 'default' : aluno.status === 'inscrito' ? 'secondary' : 'destructive'} className="text-xs">
                            {aluno.status.charAt(0).toUpperCase() + aluno.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(aluno.statusPagamento)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(aluno.statusPagamento)}
                              {aluno.statusPagamento.charAt(0).toUpperCase() + aluno.statusPagamento.slice(1)}
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(aluno.valorMensalidade)}
                        </TableCell>
                        <TableCell className="font-medium text-green-600">
                          {formatCurrency(aluno.valorPago)}
                        </TableCell>
                        <TableCell className="font-medium text-red-600">
                          {formatCurrency(aluno.valorPendente)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {aluno.formaPagamento || 'Cash'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {aluno.dataUltimoPagamento ? (
                            <div className="text-sm">
                              {new Date(aluno.dataUltimoPagamento).toLocaleDateString('pt-PT')}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">Não pago</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {aluno.diasDesdeInscricao} dias
                            {aluno.diasDesdeInscricao > 5 && aluno.statusPagamento !== 'pago' && (
                              <div className="text-xs text-red-600">⚠️ Atraso</div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {alunosFiltrados.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Receipt className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>Nenhum aluno encontrado com os filtros aplicados.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="estatisticas" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Estatísticas por Grupo de Cursos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Estatísticas por Área de Curso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['engenharias', 'saude', 'ciencias-sociais-humanas'].map(grupo => {
                    const alunosGrupo = todosAlunosFinanceiros.filter(aluno => {
                      // Simular grupo baseado no nome do par
                      return grupo === 'engenharias'; // Temporário até reorganizar dados
                    });
                    
                    const pagosGrupo = alunosGrupo.filter(a => a.statusPagamento === 'pago').length;
                    const receitaGrupo = alunosGrupo.reduce((sum, a) => sum + a.valorPago, 0);
                    const taxaGrupo = alunosGrupo.length > 0 ? (pagosGrupo / alunosGrupo.length) * 100 : 0;

                    return (
                      <div key={grupo} className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">{getGrupoCursosLabel(grupo)}</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-gray-600">Total Alunos</div>
                            <div className="font-bold">{alunosGrupo.length}</div>
                          </div>
                          <div>
                            <div className="text-gray-600">Alunos Pagos</div>
                            <div className="font-bold text-green-600">{pagosGrupo}</div>
                          </div>
                          <div>
                            <div className="text-gray-600">Receita</div>
                            <div className="font-bold text-green-600">{formatCurrency(receitaGrupo)}</div>
                          </div>
                          <div>
                            <div className="text-gray-600">Taxa Pagamento</div>
                            <div className="font-bold">{taxaGrupo.toFixed(1)}%</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Estatísticas por Período */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Estatísticas por Período</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['manha', 'tarde'].map(periodo => {
                    const alunosPeriodo = todosAlunosFinanceiros.filter(aluno => {
                      const parCorrespondente = turmaPairs.find(pair => 
                        pair.nome === aluno.nomeParTurma
                      );
                      return parCorrespondente?.periodo === periodo;
                    });
                    
                    const pagosPeriodo = alunosPeriodo.filter(a => a.statusPagamento === 'pago').length;
                    const receitaPeriodo = alunosPeriodo.reduce((sum, a) => sum + a.valorPago, 0);
                    const taxaPeriodo = alunosPeriodo.length > 0 ? (pagosPeriodo / alunosPeriodo.length) * 100 : 0;

                    return (
                      <div key={periodo} className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">{periodo === 'manha' ? 'Manhã' : 'Tarde'}</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-gray-600">Total Alunos</div>
                            <div className="font-bold">{alunosPeriodo.length}</div>
                          </div>
                          <div>
                            <div className="text-gray-600">Alunos Pagos</div>
                            <div className="font-bold text-green-600">{pagosPeriodo}</div>
                          </div>
                          <div>
                            <div className="text-gray-600">Receita</div>
                            <div className="font-bold text-green-600">{formatCurrency(receitaPeriodo)}</div>
                          </div>
                          <div>
                            <div className="text-gray-600">Taxa Pagamento</div>
                            <div className="font-bold">{taxaPeriodo.toFixed(1)}%</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Informações do Sistema */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg text-blue-800">Informações do Sistema de Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  <div>
                    <span className="font-medium">Valor da Mensalidade:</span>
                    <p className="text-blue-700 font-bold">{formatCurrency(VALOR_MENSALIDADE)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <div>
                    <span className="font-medium">Duração do Preparatório:</span>
                    <p className="text-blue-700">1 Mês (pagamento único)</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-blue-600" />
                  <div>
                    <span className="font-medium">Momento do Pagamento:</span>
                    <p className="text-blue-700">No ato da inscrição</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinanceiroPage;
