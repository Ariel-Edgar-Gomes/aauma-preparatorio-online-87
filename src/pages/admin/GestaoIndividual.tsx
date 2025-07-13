import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Users, FileText, Download, Printer } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useSupabaseTurmaData } from "@/hooks/useSupabaseTurmaData";
import AlunoEditDialog from "@/components/admin/AlunoEditDialog";
import { courseNames } from "@/types/schedule";

const GestaoIndividual = () => {
  const { turmaPairs, loading } = useSupabaseTurmaData();
  
  // Extrair todos os alunos de todos os pares de turmas
  const alunos = turmaPairs.flatMap(par => [...par.turmaA.alunos, ...par.turmaB.alunos]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAluno, setSelectedAluno] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Filtrar alunos baseado no termo de busca
  const alunosFiltrados = useMemo(() => {
    if (!searchTerm) return alunos;
    
    const termo = searchTerm.toLowerCase();
    return alunos.filter(aluno => 
      aluno.nome.toLowerCase().includes(termo) ||
      aluno.numeroEstudante?.toLowerCase().includes(termo) ||
      aluno.numeroBI.toLowerCase().includes(termo) ||
      aluno.telefone.toLowerCase().includes(termo) ||
      aluno.email?.toLowerCase().includes(termo) ||
      courseNames[aluno.curso]?.toLowerCase().includes(termo)
    );
  }, [alunos, searchTerm]);

  const handleEditAluno = (aluno: any) => {
    setSelectedAluno(aluno);
    setIsEditDialogOpen(true);
  };

  const handleExportPDF = async () => {
    const pdf = new jsPDF();
    
    // Título do relatório
    pdf.setFontSize(16);
    pdf.text('Relatório de Gestão Individual de Alunos', 20, 20);
    
    // Data do relatório
    pdf.setFontSize(10);
    pdf.text(`Gerado em: ${new Date().toLocaleDateString('pt-AO')}`, 20, 30);
    
    // Estatísticas
    pdf.setFontSize(12);
    pdf.text(`Total de Alunos: ${alunos.length}`, 20, 50);
    pdf.text(`Alunos Confirmados: ${alunos.filter(a => a.status === 'confirmado').length}`, 20, 60);
    pdf.text(`Resultados da Busca: ${alunosFiltrados.length}`, 20, 70);
    
    // Lista de alunos
    let yPosition = 90;
    pdf.setFontSize(10);
    
    alunosFiltrados.forEach((aluno, index) => {
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.text(`${index + 1}. ${aluno.nome}`, 20, yPosition);
      pdf.text(`   Nº Estudante: ${aluno.numeroEstudante || 'N/A'}`, 20, yPosition + 10);
      pdf.text(`   Curso: ${courseNames[aluno.curso] || aluno.curso}`, 20, yPosition + 20);
      pdf.text(`   Status: ${aluno.status === 'confirmado' ? 'Confirmado' : 'Inscrito'}`, 20, yPosition + 30);
      pdf.text(`   Valor Pago: 40000 Kz`, 20, yPosition + 40);
      
      yPosition += 60;
    });
    
    pdf.save('relatorio-gestao-individual-alunos.pdf');
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 animate-spin text-muted-foreground mx-auto mb-4">
            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <p className="text-muted-foreground">Carregando dados dos alunos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Gestão Individual de Alunos</h2>
        <p className="text-muted-foreground">Gerencie os dados individuais de cada aluno do sistema</p>
      </div>

      {/* Actions Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar por nome, número de estudante, BI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Export Actions */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alunos.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alunos Confirmados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {alunos.filter(a => a.status === 'confirmado').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resultados da Busca</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alunosFiltrados.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Students List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Alunos</CardTitle>
          <CardDescription>
            {alunosFiltrados.length} aluno(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alunosFiltrados.map((aluno) => (
              <div
                key={aluno.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">{aluno.nome}</h3>
                    <Badge variant={aluno.status === 'confirmado' ? 'default' : 'secondary'}>
                      {aluno.status === 'confirmado' ? 'Confirmado' : 'Inscrito'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">Nº Estudante:</span> {aluno.numeroEstudante || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Curso:</span> {courseNames[aluno.curso] || aluno.curso}
                    </div>
                    <div>
                      <span className="font-medium">Contacto:</span> {aluno.telefone}
                    </div>
                    <div>
                      <span className="font-medium">Valor Pago:</span> 40.000 Kz
                    </div>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleEditAluno(aluno)}
                >
                  Editar
                </Button>
              </div>
            ))}
            
            {alunosFiltrados.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum aluno encontrado com os critérios de busca.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {selectedAluno && (
        <AlunoEditDialog
          aluno={selectedAluno}
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setSelectedAluno(null);
          }}
          onUpdate={() => {
            // Atualizar a lista quando aluno for editado
            setIsEditDialogOpen(false);
            setSelectedAluno(null);
          }}
          availableCursos={Object.keys(courseNames)}
        />
      )}
    </div>
  );
};

export default GestaoIndividual;