import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Users, FileText, Download, Printer, UserCheck, AlertCircle, UserX, Filter, Edit, Mail, BarChart3 } from "lucide-react";
import jsPDF from "jspdf";
import { alunosService, turmaPairsService, turmasService } from "@/services/supabaseService";
import AlunoEditDialog from "@/components/admin/AlunoEditDialog";
import { StudentInvoiceDialog } from "@/components/admin/StudentInvoiceDialog";
import { SendFilesDialog } from "@/components/admin/SendFilesDialog";
import { UserReportDialog } from "@/components/admin/UserReportDialog";
import { courseNames } from "@/types/schedule";
import { useToast } from "@/hooks/use-toast";

const GestaoIndividualComUsuarios = () => {
  const { toast } = useToast();
  const [alunosWithCreator, setAlunosWithCreator] = useState<any[]>([]);
  const [turmaPairs, setTurmaPairs] = useState<any[]>([]);
  const [turmas, setTurmas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTurmaPair, setSelectedTurmaPair] = useState<string>("all");
  const [selectedTurma, setSelectedTurma] = useState<string>("all");
  const [selectedAluno, setSelectedAluno] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [selectedAlunoForInvoice, setSelectedAlunoForInvoice] = useState<any>(null);
  const [sendFilesDialogOpen, setSendFilesDialogOpen] = useState(false);
  const [selectedAlunoForFiles, setSelectedAlunoForFiles] = useState<any>(null);
  const [userReportDialogOpen, setUserReportDialogOpen] = useState(false);

  // Carregar dados dos alunos com informações do criador
  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);
        const [alunosData, turmaPairsData, turmasData] = await Promise.all([
          alunosService.getAllWithCreator(),
          turmaPairsService.getAll(),
          turmasService.getByTurmaPairId('') // Buscar todas as turmas
        ]);
        
        setAlunosWithCreator(alunosData);
        setTurmaPairs(turmaPairsData);
        
        // Buscar todas as turmas de todos os pares
        const allTurmas: any[] = [];
        for (const pair of turmaPairsData) {
          const pairTurmas = await turmasService.getByTurmaPairId(pair.id);
          allTurmas.push(...pairTurmas);
        }
        setTurmas(allTurmas);
        
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os dados dos alunos.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  // Filtrar alunos baseado no termo de pesquisa e filtros de turma
  const alunosFiltrados = useMemo(() => {
    let filteredAlunos = alunosWithCreator;

    // Filtro por termo de busca
    if (searchTerm) {
      const termLower = searchTerm.toLowerCase();
      filteredAlunos = filteredAlunos.filter(aluno => 
        aluno.nome.toLowerCase().includes(termLower) ||
        aluno.email?.toLowerCase().includes(termLower) ||
        aluno.telefone.includes(termLower) ||
        aluno.numero_bi.includes(termLower) ||
        aluno.numero_estudante?.toLowerCase().includes(termLower) ||
        courseNames[aluno.curso_codigo]?.toLowerCase().includes(termLower) ||
        aluno.creator?.full_name?.toLowerCase().includes(termLower)
      );
    }

    // Filtro por par de turma
    if (selectedTurmaPair !== "all") {
      filteredAlunos = filteredAlunos.filter(aluno => 
        aluno.turma_pair_id === selectedTurmaPair
      );
    }

    // Filtro por turma específica (A ou B)
    if (selectedTurma !== "all") {
      filteredAlunos = filteredAlunos.filter(aluno => 
        aluno.turma_id === selectedTurma
      );
    }

    return filteredAlunos;
  }, [alunosWithCreator, searchTerm, selectedTurmaPair, selectedTurma]);

  const handleEditAluno = (aluno: any) => {
    setSelectedAluno(aluno);
    setIsEditDialogOpen(true);
  };

  const handleViewInvoice = (aluno: any) => {
    setSelectedAlunoForInvoice(aluno);
    setInvoiceDialogOpen(true);
  };

  const handleSendFiles = (aluno: any) => {
    setSelectedAlunoForFiles(aluno);
    setSendFilesDialogOpen(true);
  };

  const handleExportPDF = async () => {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(16);
    doc.text('Relatório de Alunos com Usuários Responsáveis - AAUMA', 20, 20);
    
    // Data de geração
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-PT')}`, 20, 30);
    doc.text(`Total de alunos: ${alunosFiltrados.length}`, 20, 40);
    
    // Cabeçalho da tabela
    let yPosition = 55;
    doc.setFontSize(8);
    doc.text('Nome', 20, yPosition);
    doc.text('Curso', 70, yPosition);
    doc.text('Telefone', 110, yPosition);
    doc.text('Status', 140, yPosition);
    doc.text('Inscrito por', 160, yPosition);
    
    yPosition += 10;
    
    // Dados dos alunos
    alunosFiltrados.forEach((aluno) => {
      if (yPosition > 280) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.text(aluno.nome.substring(0, 20), 20, yPosition);
      doc.text(courseNames[aluno.curso_codigo]?.substring(0, 12) || aluno.curso_codigo, 70, yPosition);
      doc.text(aluno.telefone, 110, yPosition);
      doc.text(aluno.status, 140, yPosition);
      doc.text(aluno.creator?.full_name?.substring(0, 15) || 'N/A', 160, yPosition);
      
      yPosition += 8;
    });
    
    doc.save(`relatorio-alunos-usuarios-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handlePrint = () => {
    window.print();
  };

  // Estatísticas
  const totalAlunos = alunosFiltrados.length;
  const alunosInscritos = alunosFiltrados.filter(a => a.status === 'inscrito').length;
  const alunosConfirmados = alunosFiltrados.filter(a => a.status === 'confirmado').length;
  const alunosCancelados = alunosFiltrados.filter(a => a.status === 'cancelado').length;

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dados dos alunos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gestão Individual de Alunos</h1>
          <p className="text-muted-foreground">Visualize todos os alunos e quem os inscreveu no sistema</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={() => setUserReportDialogOpen(true)} 
            variant="outline"
            className="bg-blue-50 hover:bg-blue-100 border-blue-200"
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Relatório Individual
          </Button>
          <Button onClick={handleExportPDF} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
          <Button onClick={handlePrint} variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              Total de Alunos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalAlunos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              Inscritos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{alunosInscritos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-green-600" />
              Confirmados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{alunosConfirmados}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <UserX className="w-4 h-4 text-red-600" />
              Cancelados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{alunosCancelados}</div>
          </CardContent>
        </Card>
      </div>

      {/* Busca e Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Buscar e Filtrar Alunos
          </CardTitle>
          <CardDescription>
            Pesquise por nome, email, telefone, BI, número de estudante, curso ou usuário responsável
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Campo de busca */}
            <div className="md:col-span-2">
              <Input
                placeholder="Digite sua busca..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            {/* Filtro por Par de Turma */}
            <div>
              <Select value={selectedTurmaPair} onValueChange={setSelectedTurmaPair}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por Par de Turma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Pares</SelectItem>
                  {turmaPairs.map((pair) => (
                    <SelectItem key={pair.id} value={pair.id}>
                      {pair.nome} ({pair.periodo})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Filtro por Turma Específica */}
            <div>
              <Select value={selectedTurma} onValueChange={setSelectedTurma}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por Turma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Turmas</SelectItem>
                  {turmas
                    .filter(turma => selectedTurmaPair === "all" || turma.turma_pair_id === selectedTurmaPair)
                    .map((turma) => {
                      const pair = turmaPairs.find(p => p.id === turma.turma_pair_id);
                      return (
                        <SelectItem key={turma.id} value={turma.id}>
                          {pair?.nome} - Turma {turma.tipo} (Sala: {turma.salas?.codigo || 'N/A'})
                        </SelectItem>
                      );
                    })}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={() => {
              setSearchTerm("");
              setSelectedTurmaPair("all");
              setSelectedTurma("all");
            }}>
              <Filter className="mr-2 h-4 w-4" />
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Alunos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Lista de Alunos ({alunosFiltrados.length})
          </CardTitle>
          <CardDescription>
            {searchTerm ? `Mostrando resultados para "${searchTerm}"` : "Todos os alunos registrados no sistema"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {alunosFiltrados.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{searchTerm ? "Nenhum aluno encontrado com esses critérios" : "Nenhum aluno registrado"}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Nº Estudante</TableHead>
                  <TableHead>Curso</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Inscrito por</TableHead>
                  <TableHead>Data de Inscrição</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alunosFiltrados.map((aluno) => (
                  <TableRow key={aluno.id}>
                    <TableCell className="font-medium">{aluno.nome}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {aluno.numero_estudante || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[150px]">
                        <span className="text-sm">
                          {courseNames[aluno.curso_codigo] || aluno.curso_codigo}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{aluno.telefone}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          aluno.status === 'confirmado' 
                            ? 'default' 
                            : aluno.status === 'inscrito' 
                            ? 'secondary' 
                            : 'destructive'
                        }
                      >
                        {aluno.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">
                          {aluno.creator?.full_name || 'N/A'}
                        </span>
                        {aluno.creator?.email && (
                          <span className="text-xs text-muted-foreground">
                            {aluno.creator.email}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(aluno.data_inscricao).toLocaleDateString('pt-PT')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditAluno(aluno)}
                          className="text-blue-600 hover:bg-blue-600 hover:text-white"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewInvoice(aluno)}
                          className="text-green-600 hover:bg-green-600 hover:text-white"
                        >
                          <FileText className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSendFiles(aluno)}
                          className="text-purple-600 hover:bg-purple-600 hover:text-white"
                        >
                          <Mail className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Edição */}
      <AlunoEditDialog
        aluno={selectedAluno}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onUpdate={() => {
          // Recarregar dados após atualização
          const loadAlunosWithCreator = async () => {
            try {
              const data = await alunosService.getAllWithCreator();
              setAlunosWithCreator(data);
            } catch (error) {
              console.error('Erro ao recarregar alunos:', error);
            }
          };
          loadAlunosWithCreator();
          setIsEditDialogOpen(false);
        }}
        availableCursos={Object.keys(courseNames)}
      />

      {/* Invoice Dialog */}
      <StudentInvoiceDialog 
        aluno={selectedAlunoForInvoice}
        open={invoiceDialogOpen}
        onOpenChange={setInvoiceDialogOpen}
      />

      {/* Send Files Dialog */}
      <SendFilesDialog 
        aluno={selectedAlunoForFiles}
        open={sendFilesDialogOpen}
        onOpenChange={setSendFilesDialogOpen}
      />

      {/* User Report Dialog */}
      <UserReportDialog 
        open={userReportDialogOpen}
        onOpenChange={setUserReportDialogOpen}
      />
    </div>
  );
};

export default GestaoIndividualComUsuarios;