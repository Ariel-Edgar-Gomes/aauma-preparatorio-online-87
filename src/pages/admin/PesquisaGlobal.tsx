import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, FileText, Users, Download, Printer } from "lucide-react";
import { alunosService, turmaPairsService, turmasService } from "@/services/supabaseService";
import { StudentInvoiceDialog } from "@/components/admin/StudentInvoiceDialog";
import { courseNames } from "@/types/schedule";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";

const PesquisaGlobal = () => {
  const { toast } = useToast();
  const [alunos, setAlunos] = useState<any[]>([]);
  const [turmaPairs, setTurmaPairs] = useState<any[]>([]);
  const [turmas, setTurmas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAlunoForInvoice, setSelectedAlunoForInvoice] = useState<any>(null);
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);

  // Carregar todos os dados
  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);
        console.log('[PesquisaGlobal] Carregando dados...');
        
        const [alunosData, turmaPairsData] = await Promise.all([
          alunosService.getAllWithCreator(),
          turmaPairsService.getAll()
        ]);
        
        console.log('[PesquisaGlobal] Alunos carregados:', alunosData.length);
        console.log('[PesquisaGlobal] Pares carregados:', turmaPairsData.length);
        
        setAlunos(alunosData);
        setTurmaPairs(turmaPairsData);
        
        // Buscar todas as turmas
        const allTurmas: any[] = [];
        for (const pair of turmaPairsData) {
          const pairTurmas = await turmasService.getByTurmaPairId(pair.id);
          allTurmas.push(...pairTurmas);
        }
        setTurmas(allTurmas);
        
        console.log('[PesquisaGlobal] Turmas carregadas:', allTurmas.length);
        
      } catch (error) {
        console.error('[PesquisaGlobal] Erro ao carregar dados:', error);
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

  // Filtrar alunos baseado no termo de pesquisa
  const alunosFiltrados = useMemo(() => {
    if (!searchTerm) return alunos;
    
    const termLower = searchTerm.toLowerCase();
    return alunos.filter(aluno => 
      aluno.nome.toLowerCase().includes(termLower) ||
      aluno.email?.toLowerCase().includes(termLower) ||
      aluno.telefone?.includes(termLower) ||
      aluno.numero_bi?.toLowerCase().includes(termLower) ||
      aluno.numero_estudante?.toLowerCase().includes(termLower) ||
      courseNames[aluno.curso_codigo]?.toLowerCase().includes(termLower) ||
      aluno.status?.toLowerCase().includes(termLower)
    );
  }, [alunos, searchTerm]);

  // Função para obter nome do par de turma
  const getTurmaPairName = (turmaPairId: string) => {
    const pair = turmaPairs.find(p => p.id === turmaPairId);
    return pair?.nome || 'Par não encontrado';
  };

  // Função para obter detalhes da turma
  const getTurmaDetails = (turmaId: string) => {
    const turma = turmas.find(t => t.id === turmaId);
    if (!turma) return 'Turma não encontrada';
    
    const sala = turma.salas?.codigo || 'Sala não definida';
    const tipo = turma.tipo === 'A' ? 'Turma A' : 'Turma B';
    return `${tipo} - ${sala}`;
  };

  // Função para gerar relatório PDF
  const handleDownloadReport = () => {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(18);
    doc.text('Relatório Completo de Alunos', 20, 20);
    
    // Data
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-AO')}`, 20, 30);
    doc.text(`Total de alunos: ${alunosFiltrados.length}`, 20, 35);
    
    // Cabeçalhos
    doc.setFontSize(8);
    let yPosition = 50;
    doc.text('Nome', 20, yPosition);
    doc.text('Curso', 70, yPosition);
    doc.text('Par de Turma', 120, yPosition);
    doc.text('Turma', 160, yPosition);
    doc.text('Status', 180, yPosition);
    
    yPosition += 10;
    
    // Dados dos alunos
    alunosFiltrados.forEach((aluno, index) => {
      if (yPosition > 280) {
        doc.addPage();
        yPosition = 20;
      }
      
      const nomeCompleto = aluno.nome.substring(0, 25);
      const curso = courseNames[aluno.curso_codigo]?.substring(0, 20) || aluno.curso_codigo;
      const parNome = getTurmaPairName(aluno.turma_pair_id).substring(0, 15);
      const turmaDet = getTurmaDetails(aluno.turma_id).substring(0, 12);
      
      doc.text(nomeCompleto, 20, yPosition);
      doc.text(curso, 70, yPosition);
      doc.text(parNome, 120, yPosition);
      doc.text(turmaDet, 160, yPosition);
      doc.text(aluno.status, 180, yPosition);
      
      yPosition += 6;
    });
    
    doc.save(`relatorio-completo-alunos-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Função para abrir fatura
  const handleOpenInvoice = (aluno: any) => {
    console.log('[PesquisaGlobal] Abrindo fatura para:', aluno);
    setSelectedAlunoForInvoice(aluno);
    setInvoiceDialogOpen(true);
  };

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
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-aauma-navy">Pesquisa Global de Alunos</h1>
            <p className="text-muted-foreground">Pesquise e visualize todos os dados de qualquer aluno no sistema</p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleDownloadReport} 
              variant="outline"
              className="bg-green-50 hover:bg-green-100 border-green-200"
            >
              <Download className="mr-2 h-4 w-4" />
              Baixar Relatório
            </Button>
          </div>
        </div>

        {/* Campo de Pesquisa */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-aauma-navy">
              <Search className="w-5 h-5" />
              Pesquisar Alunos
            </CardTitle>
            <CardDescription>
              Digite nome, email, telefone, BI, número de estudante, curso ou status para pesquisar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Digite aqui para pesquisar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-base h-12"
              />
            </div>
            {searchTerm && (
              <p className="text-sm text-muted-foreground mt-2">
                Encontrados {alunosFiltrados.length} de {alunos.length} alunos
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Alunos</p>
                <p className="text-2xl font-bold text-aauma-navy">{alunosFiltrados.length}</p>
              </div>
              <Users className="h-8 w-8 text-aauma-navy/60" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Inscritos</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {alunosFiltrados.filter(a => a.status === 'inscrito').length}
                </p>
              </div>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">Pendente</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Confirmados</p>
                <p className="text-2xl font-bold text-green-600">
                  {alunosFiltrados.filter(a => a.status === 'confirmado').length}
                </p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-700">Pago</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cancelados</p>
                <p className="text-2xl font-bold text-red-600">
                  {alunosFiltrados.filter(a => a.status === 'cancelado').length}
                </p>
              </div>
              <Badge variant="destructive">Cancelado</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Resultados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-aauma-navy">
            <FileText className="w-5 h-5" />
            Resultados da Pesquisa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Nº Estudante</TableHead>
                  <TableHead>Curso</TableHead>
                  <TableHead>Par de Turma</TableHead>
                  <TableHead>Turma</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado por</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alunosFiltrados.map((aluno) => (
                  <TableRow key={aluno.id}>
                    <TableCell className="font-medium">{aluno.nome}</TableCell>
                    <TableCell>{aluno.numero_estudante}</TableCell>
                    <TableCell>{courseNames[aluno.curso_codigo] || aluno.curso_codigo}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {getTurmaPairName(aluno.turma_pair_id)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        {getTurmaDetails(aluno.turma_id)}
                      </Badge>
                    </TableCell>
                    <TableCell>{aluno.telefone}</TableCell>
                    <TableCell>{aluno.email || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={aluno.status === 'confirmado' ? 'default' : 
                                aluno.status === 'inscrito' ? 'secondary' : 'destructive'}
                        className={
                          aluno.status === 'confirmado' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                          aluno.status === 'inscrito' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' :
                          'bg-red-100 text-red-700 hover:bg-red-100'
                        }
                      >
                        {aluno.status === 'confirmado' ? 'Confirmado' :
                         aluno.status === 'inscrito' ? 'Inscrito' : 'Cancelado'}
                      </Badge>
                    </TableCell>
                    <TableCell>{aluno.creator?.full_name || 'N/A'}</TableCell>
                    <TableCell>
                      <Button
                        onClick={() => handleOpenInvoice(aluno)}
                        size="sm"
                        variant="outline"
                        className="bg-aauma-navy/5 hover:bg-aauma-navy/10 border-aauma-navy/20"
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        Fatura
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {alunosFiltrados.length === 0 && searchTerm && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum aluno encontrado com o termo "{searchTerm}"</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Fatura */}
      <StudentInvoiceDialog 
        aluno={selectedAlunoForInvoice}
        open={invoiceDialogOpen}
        onOpenChange={setInvoiceDialogOpen}
      />
    </div>
  );
};

export default PesquisaGlobal;