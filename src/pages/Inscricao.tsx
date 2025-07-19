
// Formulário de Inscrição AAUMA - Versão Atualizada
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, User, Phone, Mail, GraduationCap, Clock, CreditCard, Calendar, AlertCircle, CheckCircle, Banknote, Download, Printer } from "lucide-react";
import jsPDF from "jspdf";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { courseNames, disciplinesByDayAndCourse } from "@/types/schedule";
import { useTurmaData } from "@/hooks/useTurmaData";
import { useSupabaseInscricao } from "@/hooks/useSupabaseInscricao";
import { UploadProgress } from "@/components/ui/upload-progress";


const Inscricao = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { turmaPairs, loading: turmaLoading } = useTurmaData(); // Usando exatamente os mesmos dados do admin
  const { submitInscricao, submitting, uploadProgress, uploadStep } = useSupabaseInscricao();
  const [formData, setFormData] = useState({
    nomeCompleto: "",
    email: "",
    contacto: "",
    dataNascimento: "",
    endereco: "",
    numeroBI: "",
    curso: "",
    par: "",
    turma: "",
    turno: "",
    duracao: "1 Mês",
    dataInicio: "2025-08-11",
    formaPagamento: "Transferencia",
    statusPagamento: "inscrito",
    foto: null as File | null,
    copiaBI: null as File | null,
    declaracaoCertificado: null as File | null,
    comprovativoPagamento: null as File | null
  });

  // Fixed price of 40,000 Kz
  const price = 40000;

  // Todos os cursos estão disponíveis para qualquer turma - sem restrições
  const cursosDisponiveis = useMemo(() => {
    // Retornar TODOS os cursos disponíveis no sistema, sem filtros
    return courseNames;
  }, []);

  // Filtrar pares disponíveis baseados no turno selecionado (TODOS os pares ativos do período)
  const paresDisponiveis = useMemo(() => {
    if (!formData.turno) return [];
    
    console.log('[AcademicInfoForm] Filtering pares for turno:', formData.turno);
    
    const periodo = formData.turno === '08h00 - 12h00' ? 'manha' : 'tarde';
    
    // Mostrar TODOS os pares ativos do período selecionado
    const paresValidos = turmaPairs.filter(par => 
      par.ativo &&  // IMPORTANTE: só mostrar pares ativos
      par.periodo === periodo
    );
    
    console.log('[AcademicInfoForm] Pares válidos (ativos) do período:', paresValidos);
    return paresValidos;
  }, [formData.turno, turmaPairs]);

  // Informações das turmas do par selecionado
  const turmasDoParSelecionado = useMemo(() => {
    if (!formData.par) return [];
    
    const parSelecionado = turmaPairs.find(par => par.id === formData.par);
    if (!parSelecionado) return [];
    
    return [
      {
        id: `${parSelecionado.id}_A`,
        nome: `${parSelecionado.nome} - Turma A`,
        sala: parSelecionado.turmaA.sala,
        capacidade: parSelecionado.turmaA.capacidade,
        alunosInscritos: parSelecionado.turmaA.alunosInscritos,
        vagasDisponiveis: parSelecionado.turmaA.capacidade - parSelecionado.turmaA.alunosInscritos,
        turmaCheia: (parSelecionado.turmaA.capacidade - parSelecionado.turmaA.alunosInscritos) <= 0
      },
      {
        id: `${parSelecionado.id}_B`,
        nome: `${parSelecionado.nome} - Turma B`,
        sala: parSelecionado.turmaB.sala,
        capacidade: parSelecionado.turmaB.capacidade,
        alunosInscritos: parSelecionado.turmaB.alunosInscritos,
        vagasDisponiveis: parSelecionado.turmaB.capacidade - parSelecionado.turmaB.alunosInscritos,
        turmaCheia: (parSelecionado.turmaB.capacidade - parSelecionado.turmaB.alunosInscritos) <= 0
      }
    ];
  }, [formData.par, turmaPairs]);

  // Função para inverter ordem das disciplinas em dias com duas matérias (mesma lógica do TurmaPairGrid)
  const inverterHorarios = (horario: string): string => {
    if (horario === '–' || horario === '-' || !horario.includes(',')) {
      return horario; // Retorna inalterado se não tem vírgula (uma ou nenhuma disciplina)
    }
    
    // Inverte a ordem das disciplinas separadas por vírgula
    const disciplinas = horario.split(',').map(d => d.trim());
    return disciplinas.reverse().join(', ');
  };

  // Horário da turma específica selecionada (A ou B) baseado no CURSO selecionado
  const horarioTurmaEspecifica = useMemo(() => {
    console.log('[Inscricao] Computing horarioTurmaEspecifica with:', {
      turma: formData.turma,
      par: formData.par,
      curso: formData.curso,
      turmaPairsLength: turmaPairs.length
    });
    
    if (!formData.turma || !formData.par || !formData.curso) {
      console.log('[Inscricao] horarioTurmaEspecifica: returning null - missing turma, par or curso');
      return null;
    }
    
    const parSelecionado = turmaPairs.find(p => p.id === formData.par);
    if (!parSelecionado) {
      console.log('[Inscricao] horarioTurmaEspecifica: returning null - par not found');
      return null;
    }

    // LÓGICA BASEADA NO ADMIN/TURMAS: Usar horário específico do curso com aplicação correta da diferenciação A/B
    const horarioDoCurso = disciplinesByDayAndCourse[formData.curso];
    if (horarioDoCurso) {
      // Determinar se é turma A ou B baseado no ID da turma
      const isTurmaA = formData.turma.endsWith('_A');
      
      let horarioFinal = { ...horarioDoCurso };
      
      if (!isTurmaA) {
        // Turma B: aplicar a MESMA lógica do TurmaPairGrid - inverter disciplinas nos dias com vírgula
        horarioFinal = {
          segunda: inverterHorarios(horarioFinal.segunda || '-'),
          terca: inverterHorarios(horarioFinal.terca || '-'),
          quarta: inverterHorarios(horarioFinal.quarta || '-'),
          quinta: inverterHorarios(horarioFinal.quinta || '-'),
          sexta: inverterHorarios(horarioFinal.sexta || '-')
        };
      }
      
      console.log('[Inscricao] horarioTurmaEspecifica: usando horário ESPECÍFICO do curso:', 
        formData.curso, isTurmaA ? 'Turma A (original)' : 'Turma B (invertido)', horarioFinal);
      
      return horarioFinal;
    }
    
    // Fallback: usar o horário do par como antes
    const isTurmaA = formData.turma.endsWith('_A');
    const horarioEspecifico = isTurmaA 
      ? parSelecionado.turmaA.horarioSemanal 
      : parSelecionado.turmaB.horarioSemanal;
    
    console.log('[Inscricao] horarioTurmaEspecifica: usando horário do par (fallback):', 
      isTurmaA ? 'A' : 'B', 'do par:', parSelecionado.nome, horarioEspecifico);
    
    return horarioEspecifico || null;
  }, [formData.turma, formData.par, formData.curso, turmaPairs]);

  console.log('[Inscricao] Component mounted, fixed price:', price);
  console.log('[Inscricao] Cursos disponíveis:', cursosDisponiveis);
  console.log('[Inscricao] Pares disponíveis:', paresDisponiveis);
  console.log('[Inscricao] Turmas do par selecionado:', turmasDoParSelecionado);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Se mudou o curso, resetar tudo
      if (field === 'curso') {
        newData.turno = "";
        newData.par = "";
        newData.turma = "";
      }
      
      // Se mudou o turno, resetar par e turma
      if (field === 'turno') {
        newData.par = "";
        newData.turma = "";
      }
      
      // Se mudou o par, resetar turma
      if (field === 'par') {
        newData.turma = "";
      }
      
      return newData;
    });
    console.log('[Inscricao] Form field updated:', field, value);
  };

  const handleFileUpload = (field: string, file: File | null) => {
    console.log('[Inscricao] handleFileUpload called with field:', field, 'file:', file);
    
    if (file) {
      console.log('[Inscricao] File details:', {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      });
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        console.log('[Inscricao] File too large:', file.size);
        toast({
          title: "Arquivo muito grande",
          description: "O arquivo deve ter no máximo 5MB.",
          variant: "destructive"
        });
        return;
      }

      // REMOVED FILE TYPE VALIDATION - Accept all file types
      console.log('[Inscricao] File accepted for field:', field);
    } else {
      console.log('[Inscricao] No file selected for field:', field);
    }

    setFormData(prev => {
      const updatedData = { ...prev, [field]: file };
      console.log('[Inscricao] Updated formData with field:', field, 'File object:', file ? { name: file.name, type: file.type } : null);
      return updatedData;
    });
  };

  const handleExportPDF = () => {
    const pdf = new jsPDF();
    
    // Cabeçalho
    pdf.setFontSize(16);
    pdf.text('Formulário de Inscrição - Preparatório AAUMA', 20, 20);
    
    // Data
    pdf.setFontSize(10);
    pdf.text(`Data: ${new Date().toLocaleDateString('pt-AO')}`, 20, 30);
    
    // Dados pessoais
    pdf.setFontSize(12);
    let yPos = 50;
    pdf.text('=== DADOS PESSOAIS ===', 20, yPos);
    yPos += 15;
    
    pdf.setFontSize(10);
    pdf.text(`Nome Completo: ${formData.nomeCompleto}`, 20, yPos);
    yPos += 10;
    pdf.text(`Número BI: ${formData.numeroBI}`, 20, yPos);
    yPos += 10;
    pdf.text(`Email: ${formData.email || 'Não informado'}`, 20, yPos);
    yPos += 10;
    pdf.text(`Contacto: ${formData.contacto}`, 20, yPos);
    yPos += 10;
    pdf.text(`Data Nascimento: ${formData.dataNascimento || 'Não informado'}`, 20, yPos);
    yPos += 10;
    pdf.text(`Endereço: ${formData.endereco || 'Não informado'}`, 20, yPos);
    yPos += 20;
    
    // Dados académicos
    pdf.setFontSize(12);
    pdf.text('=== DADOS ACADÉMICOS ===', 20, yPos);
    yPos += 15;
    
    pdf.setFontSize(10);
    pdf.text(`Curso: ${courseNames[formData.curso] || formData.curso}`, 20, yPos);
    yPos += 10;
    pdf.text(`Turno: ${formData.turno}`, 20, yPos);
    yPos += 10;
    pdf.text(`Par de Turmas: ${formData.par}`, 20, yPos);
    yPos += 10;
    pdf.text(`Turma: ${formData.turma}`, 20, yPos);
    yPos += 10;
    pdf.text(`Duração: ${formData.duracao}`, 20, yPos);
    yPos += 10;
    pdf.text(`Data Início: ${formData.dataInicio}`, 20, yPos);
    yPos += 20;
    
    // Dados financeiros
    pdf.setFontSize(12);
    pdf.text('=== DADOS FINANCEIROS ===', 20, yPos);
    yPos += 15;
    
    pdf.setFontSize(10);
    pdf.text(`Forma de Pagamento: ${formData.formaPagamento}`, 20, yPos);
    yPos += 10;
    pdf.text(`Status Pagamento: ${formData.statusPagamento}`, 20, yPos);
    yPos += 10;
    pdf.text(`Valor: ${price.toLocaleString()} Kz`, 20, yPos);
    
    pdf.save('formulario-inscricao-aauma.pdf');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[Inscricao] Form submission started', formData);

    try {
      // Usar o hook do Supabase para submeter a inscrição
      const success = await submitInscricao(formData);
      
      if (success) {
        console.log('[Inscricao] Form submission successful');
        
        // Redirect to success page with inscription data
        navigate("/inscricao-sucesso", { state: { inscricaoData: formData } });
      }

    } catch (error) {
      console.error('[Inscricao] Form submission error:', error);
      toast({
        title: "Erro na inscrição",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    }
  };

  const FileUploadCard = ({ 
    title, 
    field, 
    required = false, 
    accept = "image/*,.pdf",
    description 
  }: { 
    title: string; 
    field: string; 
    required?: boolean; 
    accept?: string;
    description?: string;
  }) => (
    <Card className="border-2 border-dashed border-[#003366]/20 hover:border-[#003366]/40 transition-colors">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-[#003366] flex items-center gap-2">
          <Upload className="w-4 h-4" />
          {title}
          {required && <Badge variant="destructive" className="text-xs bg-[#d32f2f] hover:bg-[#d32f2f]/90">Obrigatório</Badge>}
        </CardTitle>
        {description && (
          <CardDescription className="text-xs">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <Input
          type="file"
          accept={accept}
          onChange={(e) => handleFileUpload(field, e.target.files?.[0] || null)}
          className="file:bg-[#d32f2f] file:text-white file:border-0 file:rounded-md file:px-3 file:py-1 file:hover:bg-[#d32f2f]/90"
        />
        {formData[field as keyof typeof formData] && (
          <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
            <FileText className="w-3 h-3" />
            Arquivo carregado: {formData[field as keyof typeof formData] instanceof File 
              ? (formData[field as keyof typeof formData] as File).name 
              : 'Arquivo selecionado'}
          </p>
        )}
      </CardContent>
    </Card>
  );

  // Mostrar loading enquanto carrega os dados das turmas (igual na página admin)
  if (turmaLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 animate-spin text-[#003366] mx-auto mb-4">
            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <p className="text-[#003366]">Carregando dados das turmas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header - Matching PDF colors */}
      <header className="bg-white shadow-lg border-b-4 border-[#d32f2f]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img 
                src="/lovable-uploads/9e56fb52-9dc2-4075-8e3e-8b20fd589107.png" 
                alt="AAUMA Logo" 
                className="w-12 h-12 object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-[#003366]">Preparatório AAUMA</h1>
                <p className="text-sm text-gray-600">Formulário de Inscrição</p>
              </div>
            </Link>
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-[#003366] hover:text-[#d32f2f] transition-colors">
                Início
              </Link>
              <Link to="/admin" className="text-[#003366] hover:text-[#d32f2f] transition-colors">
                Admin
              </Link>
            </nav>
            
            {/* Price Badge */}
            <div className="text-right">
              <div className="text-2xl font-bold text-[#003366]">
                {price.toLocaleString()} Kz
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <Card className="animate-fade-in border-[#003366]/20 shadow-lg">
              <CardHeader className="bg-gray-50 border-b border-[#003366]/10">
                <CardTitle className="flex items-center gap-2 text-[#003366]">
                  <User className="w-5 h-5" />
                  Dados Pessoais
                </CardTitle>
                <CardDescription>
                  Preencha seus dados pessoais corretamente (conforme aparecem no BI)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nomeCompleto" className="text-[#003366] font-medium">Nome Completo *</Label>
                    <Input
                      id="nomeCompleto"
                      value={formData.nomeCompleto}
                      onChange={(e) => handleInputChange('nomeCompleto', e.target.value)}
                      placeholder="Digite seu nome completo conforme no BI"
                      className="border-gray-300 focus:border-[#003366] focus:ring-[#003366]/20"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="numeroBI" className="text-[#003366] font-medium">Número do BI *</Label>
                    <Input
                      id="numeroBI"
                      value={formData.numeroBI}
                      onChange={(e) => handleInputChange('numeroBI', e.target.value)}
                      placeholder="000000000LA000"
                      className="border-gray-300 focus:border-[#003366] focus:ring-[#003366]/20"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email" className="flex items-center gap-1 text-[#003366] font-medium">
                      <Mail className="w-4 h-4" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="seu.email@exemplo.com (opcional)"
                      className="border-gray-300 focus:border-[#003366] focus:ring-[#003366]/20"
                    />
                  </div>

                  <div>
                    <Label htmlFor="contacto" className="flex items-center gap-1 text-[#003366] font-medium">
                      <Phone className="w-4 h-4" />
                      Contacto *
                    </Label>
                    <Input
                      id="contacto"
                      value={formData.contacto}
                      onChange={(e) => handleInputChange('contacto', e.target.value)}
                      placeholder="+244 900 000 000"
                      className="border-gray-300 focus:border-[#003366] focus:ring-[#003366]/20"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dataNascimento" className="flex items-center gap-1 text-[#003366] font-medium">
                      <Calendar className="w-4 h-4" />
                      Data de Nascimento
                    </Label>
                    <Input
                      id="dataNascimento"
                      type="date"
                      value={formData.dataNascimento}
                      onChange={(e) => handleInputChange('dataNascimento', e.target.value)}
                      className="border-gray-300 focus:border-[#003366] focus:ring-[#003366]/20"
                    />
                  </div>

                  <div>
                    <Label htmlFor="endereco" className="text-[#003366] font-medium">Endereço</Label>
                    <Input
                      id="endereco"
                      value={formData.endereco}
                      onChange={(e) => handleInputChange('endereco', e.target.value)}
                      placeholder="Rua, Bairro, Município"
                      className="border-gray-300 focus:border-[#003366] focus:ring-[#003366]/20"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Academic Information */}
            <Card className="animate-fade-in border-[#003366]/20 shadow-lg" style={{ animationDelay: '0.1s' }}>
              <CardHeader className="bg-gray-50 border-b border-[#003366]/10">
                <CardTitle className="flex items-center gap-2 text-[#003366]">
                  <GraduationCap className="w-5 h-5" />
                  Informações Acadêmicas
                </CardTitle>
                <CardDescription>
                  Selecione o curso e turno desejados (conforme horário das aulas)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="curso" className="text-[#003366] font-medium">Curso Pretendido *</Label>
                    <Select value={formData.curso} onValueChange={(value) => handleInputChange('curso', value)}>
                      <SelectTrigger className="border-gray-300 focus:border-[#003366] focus:ring-[#003366]/20">
                        <SelectValue placeholder="Selecione o curso" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60 overflow-y-auto">
                        {Object.entries(cursosDisponiveis).map(([key, name]) => (
                          <SelectItem key={key} value={key}>{name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="turno" className="flex items-center gap-1 text-[#003366] font-medium">
                      <Clock className="w-4 h-4" />
                      Turno *
                    </Label>
                    <Select 
                      value={formData.turno} 
                      onValueChange={(value) => handleInputChange('turno', value)}
                      disabled={!formData.curso}
                    >
                      <SelectTrigger className="border-gray-300 focus:border-[#003366] focus:ring-[#003366]/20">
                        <SelectValue placeholder={formData.curso ? "Selecione o turno" : "Selecione primeiro o curso"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="08h00 - 12h00">
                          <div className="flex items-center gap-2">
                            <span>🌅</span>
                            <span>Manhã (08h00 - 12h00)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="13h00 - 17h00">
                          <div className="flex items-center gap-2">
                            <span>🌇</span>
                            <span>Tarde (13h00 - 17h00)</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="par" className="text-[#003366] font-medium">Par de Turmas *</Label>
                    <Select 
                      value={formData.par} 
                      onValueChange={(value) => handleInputChange('par', value)}
                      disabled={!formData.turno}
                    >
                      <SelectTrigger className="border-gray-300 focus:border-[#003366] focus:ring-[#003366]/20">
                        <SelectValue placeholder={formData.turno ? "Selecione o par" : "Selecione primeiro o turno"} />
                      </SelectTrigger>
                      <SelectContent className="max-h-60 overflow-y-auto">
                        {paresDisponiveis.length === 0 ? (
                          <div className="px-4 py-6 text-center text-gray-500">
                            <GraduationCap className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Nenhum par disponível</p>
                            <p className="text-xs mt-1">Tente outro turno</p>
                          </div>
                        ) : (
                          paresDisponiveis.map((par) => {
                            const capacidadeTotal = par.turmaA.capacidade + par.turmaB.capacidade;
                            const alunosTotal = par.turmaA.alunosInscritos + par.turmaB.alunosInscritos;
                            const vagasDisponiveis = capacidadeTotal - alunosTotal;
                            const parCheio = vagasDisponiveis <= 0;
                            
                            return (
                              <SelectItem 
                                key={par.id} 
                                value={par.id}
                                disabled={parCheio}
                                className={parCheio ? "opacity-50 cursor-not-allowed" : ""}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">
                                      {par.turmaA.sala} / {par.turmaB.sala}
                                    </span>
                                    <span>{par.nome}</span>
                                  </div>
                                  <span className={`text-xs ml-2 px-2 py-1 rounded-full ${
                                    parCheio 
                                      ? 'bg-red-100 text-red-700 border border-red-200' 
                                      : vagasDisponiveis <= 5 
                                        ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                                        : 'bg-green-100 text-green-700 border border-green-200'
                                  }`}>
                                    {parCheio ? 'Lotado' : `${vagasDisponiveis} vagas`}
                                  </span>
                                </div>
                              </SelectItem>
                            );
                          })
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="turma" className="text-[#003366] font-medium">Turma Específica *</Label>
                    <Select 
                      value={formData.turma} 
                      onValueChange={(value) => handleInputChange('turma', value)}
                      disabled={!formData.par}
                    >
                      <SelectTrigger className="border-gray-300 focus:border-[#003366] focus:ring-[#003366]/20">
                        <SelectValue placeholder={formData.par ? "Selecione a turma" : "Selecione primeiro o par"} />
                      </SelectTrigger>
                      <SelectContent>
                        {turmasDoParSelecionado.length === 0 ? (
                          <div className="px-4 py-6 text-center text-gray-500">
                            <GraduationCap className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Selecione um par primeiro</p>
                          </div>
                        ) : (
                          turmasDoParSelecionado.map((turma) => (
                            <SelectItem 
                              key={turma.id} 
                              value={turma.id}
                              disabled={turma.turmaCheia}
                              className={turma.turmaCheia ? "opacity-50 cursor-not-allowed" : ""}
                            >
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500">
                                    {turma.sala}
                                  </span>
                                  <span>{turma.nome}</span>
                                </div>
                                <span className={`text-xs ml-2 px-2 py-1 rounded-full ${
                                  turma.turmaCheia 
                                    ? 'bg-red-100 text-red-700 border border-red-200' 
                                    : turma.vagasDisponiveis <= 5 
                                      ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                                      : 'bg-green-100 text-green-700 border border-green-200'
                                }`}>
                                  {turma.turmaCheia ? 'Lotada' : `${turma.vagasDisponiveis} vagas`}
                                </span>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Course Schedule Preview - só aparece após selecionar turma específica */}
                <div className="bg-gray-50 p-4 rounded-lg border border-[#003366]/10">
                  <h4 className="text-sm font-semibold text-[#003366] mb-2">
                    {horarioTurmaEspecifica ? 'Horário das Aulas da Turma Selecionada' : 'Selecione uma turma específica para ver o horário'}
                  </h4>
                  {horarioTurmaEspecifica ? (
                    <>
                      <div className="grid grid-cols-5 gap-2 text-xs">
                        <div className="text-center font-medium text-[#003366]">Seg</div>
                        <div className="text-center font-medium text-[#003366]">Ter</div>
                        <div className="text-center font-medium text-[#003366]">Qua</div>
                        <div className="text-center font-medium text-[#003366]">Qui</div>
                        <div className="text-center font-medium text-[#003366]">Sex</div>
                        <div className="text-center p-1 bg-white rounded text-xs">
                          {horarioTurmaEspecifica.segunda || "-"}
                        </div>
                        <div className="text-center p-1 bg-white rounded text-xs">
                          {horarioTurmaEspecifica.terca || "-"}
                        </div>
                        <div className="text-center p-1 bg-white rounded text-xs">
                          {horarioTurmaEspecifica.quarta || "-"}
                        </div>
                        <div className="text-center p-1 bg-white rounded text-xs">
                          {horarioTurmaEspecifica.quinta || "-"}
                        </div>
                        <div className="text-center p-1 bg-white rounded text-xs">
                          {horarioTurmaEspecifica.sexta || "-"}
                        </div>
                      </div>
                       <div className="mt-3 animate-fade-in">
                         <h5 className="text-xs font-medium text-[#003366] mb-2">Informações da Seleção:</h5>
                         <div className="text-xs text-gray-600 space-y-2">
                           {formData.par && (() => {
                             const parInfo = turmaPairs.find(t => t.id === formData.par);
                             if (!parInfo) return null;
                             
                             return (
                               <>
                                 <div className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                                   <span><strong>Par:</strong> {parInfo.nome}</span>
                                   <Badge variant="outline" className="text-xs">
                                     {parInfo.periodo === 'manha' ? 'Manhã' : 'Tarde'}
                                   </Badge>
                                 </div>
                                 <div className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                                   <span><strong>Período:</strong> {formData.turno}</span>
                                   <Clock className="w-3 h-3 text-[#003366]" />
                                 </div>
                                  <div className="p-2 bg-white rounded border border-gray-200">
                                    <div className="flex items-center justify-between mb-1">
                                      <span><strong>Sala{formData.turma ? ' da Turma Selecionada' : 's do Par'}:</strong></span>
                                    </div>
                                    {formData.turma ? (() => {
                                      // Mostrar apenas a sala da turma específica selecionada
                                      const isTurmaA = formData.turma.endsWith('_A');
                                      const salaInfo = isTurmaA ? parInfo.turmaA : parInfo.turmaB;
                                      const turmaNome = isTurmaA ? 'A' : 'B';
                                      
                                      return (
                                        <div className="text-xs">
                                          <div className="bg-blue-50 p-2 rounded text-center border border-blue-200">
                                            <strong>Turma {turmaNome}:</strong> {salaInfo.sala}
                                            <br />
                                            <span className="text-gray-600">({salaInfo.alunosInscritos}/{salaInfo.capacidade} alunos)</span>
                                          </div>
                                        </div>
                                      );
                                    })() : (
                                      // Mostrar ambas as salas quando nenhuma turma específica foi selecionada
                                      <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="bg-gray-50 p-1 rounded text-center">
                                          <strong>Turma A:</strong> {parInfo.turmaA.sala}
                                          <br />
                                          <span className="text-gray-500">({parInfo.turmaA.alunosInscritos}/{parInfo.turmaA.capacidade})</span>
                                        </div>
                                        <div className="bg-gray-50 p-1 rounded text-center">
                                          <strong>Turma B:</strong> {parInfo.turmaB.sala}
                                          <br />
                                          <span className="text-gray-500">({parInfo.turmaB.alunosInscritos}/{parInfo.turmaB.capacidade})</span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                 {formData.turma && (() => {
                                   const turmaEspecifica = turmasDoParSelecionado.find(t => t.id === formData.turma);
                                   if (!turmaEspecifica) return null;
                                   
                                   return (
                                     <div className="p-2 bg-white rounded border border-gray-200 border-green-300">
                                       <div className="flex items-center justify-between mb-1">
                                         <span><strong>Turma Selecionada:</strong> {turmaEspecifica.nome}</span>
                                         <span className={`text-xs px-2 py-1 rounded-full ${
                                           turmaEspecifica.turmaCheia 
                                             ? 'bg-red-100 text-red-700' 
                                             : turmaEspecifica.vagasDisponiveis <= 5 
                                               ? 'bg-yellow-100 text-yellow-700'
                                               : 'bg-green-100 text-green-700'
                                         }`}>
                                           {turmaEspecifica.turmaCheia ? 'Lotada' : `${turmaEspecifica.vagasDisponiveis} vagas`}
                                         </span>
                                       </div>
                                       <div className="text-center">
                                         <span className="text-gray-500">Sala: {turmaEspecifica.sala}</span>
                                       </div>
                                     </div>
                                   );
                                 })()}
                               </>
                             );
                           })()}
                         </div>
                       </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Selecione uma turma específica para ver o horário</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Course Configuration */}
            <Card className="animate-fade-in border-[#003366]/20 shadow-lg" style={{ animationDelay: '0.15s' }}>
              <CardHeader className="bg-gray-50 border-b border-[#003366]/10">
                <CardTitle className="flex items-center gap-2 text-[#003366]">
                  <Clock className="w-5 h-5" />
                  Configuração do Curso
                </CardTitle>
                <CardDescription>
                  Configure a duração, data de início, forma de pagamento e status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                   <div>
                     <Label htmlFor="duracao" className="text-[#003366] font-medium">Duração</Label>
                     <Input
                       id="duracao"
                       value={formData.duracao}
                       readOnly
                       className="border-gray-300 bg-gray-50 text-gray-600 cursor-not-allowed"
                     />
                     <p className="text-xs text-gray-500 mt-1">Duração padrão do curso</p>
                   </div>

                   <div>
                     <Label htmlFor="dataInicio" className="flex items-center gap-1 text-[#003366] font-medium">
                       <Calendar className="w-4 h-4" />
                       Data de Início
                     </Label>
                     <Input
                       id="dataInicio"
                       type="date"
                       value={formData.dataInicio}
                       onChange={(e) => handleInputChange('dataInicio', e.target.value)}
                       className="border-gray-300 focus:border-[#003366] focus:ring-[#003366]/20"
                     />
                   </div>

                  <div>
                    <Label htmlFor="formaPagamento" className="flex items-center gap-1 text-[#003366] font-medium">
                      <CreditCard className="w-4 h-4" />
                      Forma de Pagamento *
                    </Label>
                    <Select value={formData.formaPagamento} onValueChange={(value) => handleInputChange('formaPagamento', value)}>
                      <SelectTrigger className="border-gray-300 focus:border-[#003366] focus:ring-[#003366]/20">
                        <SelectValue placeholder="Selecione a forma" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cash">
                          <div className="flex items-center gap-2">
                            <Banknote className="w-4 h-4" />
                            <span>Dinheiro (Cash)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Transferencia">
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            <span>Transferência Bancária</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Cartao">
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            <span>Cartão</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="statusPagamento" className="flex items-center gap-1 text-[#003366] font-medium">
                      <CheckCircle className="w-4 h-4" />
                      Status do Pagamento *
                    </Label>
                    <Select value={formData.statusPagamento} onValueChange={(value) => handleInputChange('statusPagamento', value)}>
                      <SelectTrigger className="border-gray-300 focus:border-[#003366] focus:ring-[#003366]/20">
                        <SelectValue placeholder="Definir status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inscrito">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-yellow-600" />
                            <span>Inscrito (Pendente)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="confirmado">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span>Confirmado (Pago)</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-600 mt-1">
                      Define o status inicial no sistema
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Document Upload */}
            <Card className="animate-fade-in border-[#003366]/20 shadow-lg" style={{ animationDelay: '0.2s' }}>
              <CardHeader className="bg-gray-50 border-b border-[#003366]/10">
                <CardTitle className="flex items-center gap-2 text-[#003366]">
                  <FileText className="w-5 h-5" />
                  Upload de Documentos
                </CardTitle>
                <CardDescription>
                  Carregue os documentos necessários (máximo 5MB por arquivo) - ACEITA IMAGENS E PDFs - todos os documentos são opcionais
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <FileUploadCard
                    title="Foto Tipo Passe"
                    field="foto"
                    accept="image/*,.pdf"
                    description="Foto recente, fundo branco (opcional)"
                  />
                  
                  <FileUploadCard
                    title="Cópia do BI"
                    field="copiaBI"
                    accept="image/*,.pdf"
                    description="Cópia legível do BI (opcional)"
                  />
                  
                  <FileUploadCard
                    title="Declaração/Certificado"
                    field="declaracaoCertificado"
                    accept="image/*,.pdf"
                    description="Ensino Médio (opcional)"
                  />

                  <FileUploadCard
                    title="Comprovativo de Pagamento"
                    field="comprovativoPagamento"
                    accept="image/*,.pdf"
                    description="Comprovativo do pagamento (opcional)"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Summary and Submit */}
            <Card className="animate-fade-in border-[#003366]/20 shadow-lg" style={{ animationDelay: '0.3s' }}>
              <CardHeader className="bg-gray-50 border-b border-[#003366]/10">
                <CardTitle className="flex items-center gap-2 text-[#003366]">
                  <CreditCard className="w-5 h-5" />
                  Resumo do Pagamento
                </CardTitle>
                <CardDescription>
                  Valor inclui taxa de inscrição + aulas preparatórias
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-[#003366]/10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-[#003366]">Taxa de Inscrição + Aulas Preparatórias:</span>
                    <span className="text-xl font-bold text-[#d32f2f]">
                      {price.toLocaleString()} Kz
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">
                    <p>• Duração: {formData.duracao}</p>
                    <p>• Início: {new Date(formData.dataInicio).toLocaleDateString('pt-AO')}</p>
                    <p>• Forma de Pagamento: {formData.formaPagamento}</p>
                    <p>• Status: {formData.statusPagamento === 'confirmado' ? 'Pagamento Confirmado' : 'Pagamento Pendente'}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button 
                    type="submit" 
                    className="w-full bg-[#003366] hover:bg-[#003366]/90 text-white py-3 text-lg shadow-lg"
                    disabled={submitting}
                  >
                    {submitting ? "Processando..." : "Confirmar Inscrição e Gerar Fatura"}
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={handleExportPDF}
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Exportar PDF
                    </Button>
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={handlePrint}
                      className="flex-1"
                    >
                      <Printer className="w-4 h-4 mr-2" />
                      Imprimir
                    </Button>
                  </div>
                </div>
                
                <p className="text-xs text-gray-600 text-center mt-3">
                  Ao confirmar, você aceita os termos e condições do preparatório e sua fatura será gerada automaticamente.
                </p>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>

      {/* Upload Progress Modal */}
      <UploadProgress 
        isUploading={submitting}
        currentStep={uploadStep}
        progress={uploadProgress}
      />
    </div>
  );
};

export default Inscricao;
