
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  User, 
  Mail, 
  Phone, 
  BookOpen, 
  Calendar,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  UserCheck,
  UserX,
  GraduationCap,
  AlertCircle,
  CheckCircle,
  XCircle,
  MapPin,
  Clock,
  CreditCard
} from "lucide-react";
import { TurmaPair, Aluno } from "@/types/turma";
import { useToast } from "@/hooks/use-toast";
import { AlunosStatistics } from "./AlunosStatistics";
import { alunosService } from "@/services/supabaseService";

interface TurmaIndividualManagementProps {
  turmaPairs: TurmaPair[];
  onUpdateTurmaPair: (id: string, updates: Partial<TurmaPair>) => void;
  onCreateAluno: (aluno: Omit<Aluno, 'id' | 'numeroEstudante' | 'dataInscricao'>, turmaPairId: string, turmaType: 'A' | 'B') => Promise<boolean>;
  onUpdateAluno: (alunoId: string, updates: Partial<Aluno>) => Promise<boolean>;
  onDeleteAluno: (alunoId: string) => Promise<boolean>;
  onUpdateAlunoStatus: (alunoId: string, status: 'inscrito' | 'confirmado' | 'cancelado') => Promise<boolean>;
}

export const TurmaIndividualManagement = ({ 
  turmaPairs, 
  onUpdateTurmaPair,
  onCreateAluno,
  onUpdateAluno,
  onDeleteAluno,
  onUpdateAlunoStatus
}: TurmaIndividualManagementProps) => {
  const { toast } = useToast();
  const [selectedPair, setSelectedPair] = useState<TurmaPair | null>(null);
  const [selectedTurma, setSelectedTurma] = useState<'A' | 'B' | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [cursoFilter, setCursoFilter] = useState<string>("todos");
  const [editingAluno, setEditingAluno] = useState<Aluno | null>(null);
  const [addingAluno, setAddingAluno] = useState(false);

  // Novo aluno template
  const novoAlunoTemplate: Aluno = {
    id: '',
    nome: '',
    email: '',
    telefone: '',
    curso: '',
    numeroEstudante: '',
    dataInscricao: new Date().toISOString().split('T')[0],
    status: 'inscrito',
    observacoes: '',
    // Dados pessoais adicionais
    numeroBI: '',
    dataNascimento: '',
    endereco: '',
    formaPagamento: 'Cash',
    duracao: '3 Meses',
    dataInicio: '2025-02-15',
    turno: '',
    par: '',
    turma: ''
  };

  const [newAluno, setNewAluno] = useState<Aluno>(novoAlunoTemplate);

  const handleAddAluno = async () => {
    if (!selectedPair || !selectedTurma) return;

    const success = await onCreateAluno(newAluno, selectedPair.id, selectedTurma);
    if (success) {
      setNewAluno(novoAlunoTemplate);
      setAddingAluno(false);
    }
  };

  const handleEditAluno = async (aluno: Aluno) => {
    const success = await onUpdateAluno(aluno.id, aluno);
    if (success) {
      setEditingAluno(null);
    }
  };

  const handleDeleteAlunoLocal = async (alunoId: string) => {
    const success = await onDeleteAluno(alunoId);
    // Os dados serão atualizados automaticamente através do hook
  };

  const getTurmaData = () => {
    if (!selectedPair || !selectedTurma) return null;
    return selectedPair[selectedTurma === 'A' ? 'turmaA' : 'turmaB'];
  };

  const getFilteredAlunos = () => {
    const turmaData = getTurmaData();
    if (!turmaData) return [];

    let filtered = turmaData.alunos;

    // Filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(aluno => 
        aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        aluno.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        aluno.numeroEstudante?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por status
    if (statusFilter !== "todos") {
      filtered = filtered.filter(aluno => aluno.status === statusFilter);
    }

    // Filtro por curso
    if (cursoFilter !== "todos") {
      filtered = filtered.filter(aluno => aluno.curso === cursoFilter);
    }

    return filtered;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmado': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'cancelado': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmado': return 'bg-green-100 text-green-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas Gerais */}
      <AlunosStatistics turmaPairs={turmaPairs} />
      
      {/* Seleção de Par e Turma */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            Gestão Individual de Turmas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Selecionar Par de Turmas</Label>
              <Select
                value={selectedPair?.id || ""}
                onValueChange={(value) => {
                  const pair = turmaPairs.find(p => p.id === value);
                  setSelectedPair(pair || null);
                  setSelectedTurma(null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um par de turmas" />
                </SelectTrigger>
                <SelectContent>
                  {turmaPairs.map(pair => (
                    <SelectItem key={pair.id} value={pair.id}>
                      {pair.nome} - {pair.periodo === 'manha' ? 'Manhã' : 'Tarde'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedPair && (
              <div>
                <Label>Selecionar Turma</Label>
                <Select
                  value={selectedTurma || ""}
                  onValueChange={(value) => setSelectedTurma(value as 'A' | 'B')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha uma turma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">
                      Turma A - {selectedPair.turmaA.sala} ({selectedPair.turmaA.alunosInscritos}/{selectedPair.turmaA.capacidade})
                    </SelectItem>
                    <SelectItem value="B">
                      Turma B - {selectedPair.turmaB.sala} ({selectedPair.turmaB.alunosInscritos}/{selectedPair.turmaB.capacidade})
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detalhes da Turma Selecionada */}
      {selectedPair && selectedTurma && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Turma {selectedTurma} - {selectedPair.nome}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const turmaData = getTurmaData();
              if (!turmaData) return null;

              return (
                <div className="space-y-4">
                   {/* Informações da Turma */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="font-semibold text-blue-900">Sala</div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" className="p-0 h-auto text-blue-700 hover:text-blue-800">
                              {turmaData.sala}
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Editar Sala - Turma {selectedTurma}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Número da Sala</Label>
                                <Input
                                  value={turmaData.sala}
                                  onChange={(e) => {
                                    const updatedPair = {
                                      ...selectedPair,
                                      [selectedTurma === 'A' ? 'turmaA' : 'turmaB']: {
                                        ...turmaData,
                                        sala: e.target.value
                                      }
                                    };
                                    setSelectedPair(updatedPair);
                                  }}
                                  placeholder="Ex: U107, Sala A1, etc."
                                />
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setSelectedPair(selectedPair)}>
                                  Cancelar
                                </Button>
                                <Button onClick={() => {
                                  if (selectedPair) {
                                    onUpdateTurmaPair(selectedPair.id, selectedPair);
                                    toast({
                                      title: "Sala atualizada",
                                      description: `Sala da Turma ${selectedTurma} alterada para ${turmaData.sala}`,
                                    });
                                  }
                                }}>
                                  Salvar
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                      <Users className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="font-semibold text-green-900">Inscritos</div>
                        <div className="text-green-700">{turmaData.alunosInscritos}/{turmaData.capacidade}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                      <Clock className="w-5 h-5 text-purple-600" />
                      <div>
                        <div className="font-semibold text-purple-900">Período</div>
                        <div className="text-purple-700">{selectedPair.horarioPeriodo}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
                      <BookOpen className="w-5 h-5 text-orange-600" />
                      <div>
                        <div className="font-semibold text-orange-900">Ocupação</div>
                        <div className="text-orange-700">
                          {Math.round((turmaData.alunosInscritos / turmaData.capacidade) * 100)}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Filtros */}
                  <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4 text-gray-500" />
                      <Input
                        placeholder="Buscar alunos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-64"
                      />
                    </div>
                    
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos os Status</SelectItem>
                        <SelectItem value="inscrito">Inscrito</SelectItem>
                        <SelectItem value="confirmado">Confirmado</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>

                     <Select value={cursoFilter} onValueChange={setCursoFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos os Cursos</SelectItem>
                        {selectedPair.cursos.map(curso => (
                          <SelectItem key={curso} value={curso}>
                            {curso.replace(/[-_]/g, ' ').toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Lista de Alunos */}
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>BI</TableHead>
                          <TableHead>Curso</TableHead>
                          <TableHead>Contacto</TableHead>
                          <TableHead>Endereço</TableHead>
                          <TableHead>Nº Estudante</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Data Inscrição</TableHead>
                           <TableHead>Pagamento</TableHead>
                           <TableHead>Valor Pago</TableHead>
                           <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getFilteredAlunos().map(aluno => (
                          <TableRow key={aluno.id}>
                            <TableCell className="font-medium">{aluno.nome}</TableCell>
                            <TableCell className="text-sm">
                              {aluno.numeroBI || 'Não informado'}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {aluno.curso.replace('-', ' ').toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 text-sm">
                                  <Mail className="w-3 h-3" />
                                  {aluno.email}
                                </div>
                                <div className="flex items-center gap-1 text-sm">
                                  <Phone className="w-3 h-3" />
                                  {aluno.telefone}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm max-w-32 truncate">
                              {aluno.endereco || 'Não informado'}
                            </TableCell>
                            <TableCell>{aluno.numeroEstudante}</TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(aluno.status)}>
                                <div className="flex items-center gap-1">
                                  {getStatusIcon(aluno.status)}
                                  {aluno.status.charAt(0).toUpperCase() + aluno.status.slice(1)}
                                </div>
                              </Badge>
                            </TableCell>
                            <TableCell>{new Date(aluno.dataInscricao).toLocaleDateString('pt-PT')}</TableCell>
                             <TableCell>
                               <Badge variant="secondary" className="text-xs">
                                 {aluno.formaPagamento || 'Cash'}
                               </Badge>
                             </TableCell>
                             <TableCell>
                               <div className="text-sm">
                                 <div className="font-medium">
                                   40.000,00 Kz
                                 </div>
                                 <div className={`text-xs ${
                                   aluno.status === 'confirmado' ? 'text-green-600' : 'text-red-600'
                                 }`}>
                                   {aluno.status === 'confirmado' ? 'Pago' : 'Pendente'}
                                 </div>
                               </div>
                             </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" onClick={() => setEditingAluno(aluno)}>
                                      <Edit className="w-3 h-3" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Editar Aluno</DialogTitle>
                                    </DialogHeader>
                                     {editingAluno && (
                                       <div className="space-y-4 max-h-96 overflow-y-auto">
                                         <Tabs defaultValue="pessoais" className="w-full">
                                           <TabsList className="grid w-full grid-cols-3">
                                             <TabsTrigger value="pessoais">Dados Pessoais</TabsTrigger>
                                             <TabsTrigger value="academicos">Dados Acadêmicos</TabsTrigger>
                                             <TabsTrigger value="pagamento">Pagamento</TabsTrigger>
                                           </TabsList>
                                           
                                           <TabsContent value="pessoais" className="space-y-4">
                                             <div className="grid grid-cols-2 gap-4">
                                               <div>
                                                 <Label>Nome Completo</Label>
                                                 <Input
                                                   value={editingAluno.nome}
                                                   onChange={(e) => setEditingAluno({...editingAluno, nome: e.target.value})}
                                                 />
                                               </div>
                                               <div>
                                                 <Label>Número do BI</Label>
                                                 <Input
                                                   value={editingAluno.numeroBI || ''}
                                                   onChange={(e) => setEditingAluno({...editingAluno, numeroBI: e.target.value})}
                                                   placeholder="000000000LA000"
                                                 />
                                               </div>
                                             </div>

                                             <div className="grid grid-cols-2 gap-4">
                                               <div>
                                                 <Label>E-mail</Label>
                                                 <Input
                                                   type="email"
                                                   value={editingAluno.email}
                                                   onChange={(e) => setEditingAluno({...editingAluno, email: e.target.value})}
                                                 />
                                               </div>
                                               <div>
                                                 <Label>Telefone</Label>
                                                 <Input
                                                   value={editingAluno.telefone}
                                                   onChange={(e) => setEditingAluno({...editingAluno, telefone: e.target.value})}
                                                 />
                                               </div>
                                             </div>

                                             <div className="grid grid-cols-2 gap-4">
                                               <div>
                                                 <Label>Data de Nascimento</Label>
                                                 <Input
                                                   type="date"
                                                   value={editingAluno.dataNascimento || ''}
                                                   onChange={(e) => setEditingAluno({...editingAluno, dataNascimento: e.target.value})}
                                                 />
                                               </div>
                                               <div>
                                                 <Label>Endereço</Label>
                                                 <Input
                                                   value={editingAluno.endereco || ''}
                                                   onChange={(e) => setEditingAluno({...editingAluno, endereco: e.target.value})}
                                                   placeholder="Endereço completo"
                                                 />
                                               </div>
                                             </div>
                                           </TabsContent>

                                           <TabsContent value="academicos" className="space-y-4">
                                             <div className="grid grid-cols-2 gap-4">
                                               <div>
                                                 <Label>Curso</Label>
                                                 <Select
                                                   value={editingAluno.curso}
                                                   onValueChange={(value) => setEditingAluno({...editingAluno, curso: value})}
                                                 >
                                                   <SelectTrigger>
                                                     <SelectValue />
                                                   </SelectTrigger>
                                                   <SelectContent>
                                                     {selectedPair?.cursos.map(curso => (
                                                       <SelectItem key={curso} value={curso}>
                                                         {curso.replace(/[-_]/g, ' ').toUpperCase()}
                                                       </SelectItem>
                                                     ))}
                                                   </SelectContent>
                                                 </Select>
                                               </div>
                                               <div>
                                                 <Label>Número do Estudante</Label>
                                                 <Input
                                                   value={editingAluno.numeroEstudante || ''}
                                                   onChange={(e) => setEditingAluno({...editingAluno, numeroEstudante: e.target.value})}
                                                   placeholder="EST00000000"
                                                 />
                                               </div>
                                             </div>

                                             <div className="grid grid-cols-2 gap-4">
                                               <div>
                                                 <Label>Status</Label>
                                                 <Select
                                                   value={editingAluno.status}
                                                   onValueChange={(value) => setEditingAluno({...editingAluno, status: value as any})}
                                                 >
                                                   <SelectTrigger>
                                                     <SelectValue />
                                                   </SelectTrigger>
                                                   <SelectContent>
                                                     <SelectItem value="inscrito">Inscrito</SelectItem>
                                                     <SelectItem value="confirmado">Confirmado</SelectItem>
                                                     <SelectItem value="cancelado">Cancelado</SelectItem>
                                                   </SelectContent>
                                                 </Select>
                                               </div>
                                               <div>
                                                 <Label>Data de Inscrição</Label>
                                                 <Input
                                                   type="date"
                                                   value={editingAluno.dataInscricao}
                                                   onChange={(e) => setEditingAluno({...editingAluno, dataInscricao: e.target.value})}
                                                 />
                                               </div>
                                             </div>

                                             <div className="grid grid-cols-2 gap-4">
                                               <div>
                                                 <Label>Duração do Curso</Label>
                                                 <Input
                                                   value={editingAluno.duracao || '3 Meses'}
                                                   onChange={(e) => setEditingAluno({...editingAluno, duracao: e.target.value})}
                                                 />
                                               </div>
                                               <div>
                                                 <Label>Data de Início</Label>
                                                 <Input
                                                   type="date"
                                                   value={editingAluno.dataInicio || '2025-02-15'}
                                                   onChange={(e) => setEditingAluno({...editingAluno, dataInicio: e.target.value})}
                                                 />
                                               </div>
                                             </div>
                                           </TabsContent>

                                            <TabsContent value="pagamento" className="space-y-4">
                                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                                <div className="flex items-center gap-2 text-blue-800 mb-2">
                                                  <CreditCard className="w-5 h-5" />
                                                  <span className="font-semibold">Valor do Preparatório</span>
                                                </div>
                                                <div className="text-2xl font-bold text-blue-900">
                                                  40.000,00 Kz
                                                </div>
                                                <p className="text-sm text-blue-700 mt-1">
                                                  Pagamento único do curso preparatório
                                                </p>
                                              </div>

                                              <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                  <Label>Forma de Pagamento</Label>
                                                  <Select
                                                    value={editingAluno.formaPagamento || 'Cash'}
                                                    onValueChange={(value) => setEditingAluno({...editingAluno, formaPagamento: value as any})}
                                                  >
                                                    <SelectTrigger>
                                                      <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                      <SelectItem value="Cash">
                                                        <div className="flex items-center gap-2">
                                                          <span>💵</span>
                                                          <span>Dinheiro (Cash)</span>
                                                        </div>
                                                      </SelectItem>
                                                      <SelectItem value="Transferencia">
                                                        <div className="flex items-center gap-2">
                                                          <span>🏦</span>
                                                          <span>Transferência Bancária</span>
                                                        </div>
                                                      </SelectItem>
                                                      <SelectItem value="Cartao">
                                                        <div className="flex items-center gap-2">
                                                          <span>💳</span>
                                                          <span>Cartão</span>
                                                        </div>
                                                      </SelectItem>
                                                    </SelectContent>
                                                  </Select>
                                                </div>
                                                <div>
                                                  <Label>Status do Pagamento</Label>
                                                  <Select
                                                    value={editingAluno.status}
                                                    onValueChange={(value) => setEditingAluno({...editingAluno, status: value as any})}
                                                  >
                                                    <SelectTrigger>
                                                      <SelectValue />
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
                                                      <SelectItem value="cancelado">
                                                        <div className="flex items-center gap-2">
                                                          <XCircle className="w-4 h-4 text-red-600" />
                                                          <span>Cancelado</span>
                                                        </div>
                                                      </SelectItem>
                                                    </SelectContent>
                                                  </Select>
                                                </div>
                                              </div>

                                              <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                  <Label>Turno</Label>
                                                  <Input
                                                    value={editingAluno.turno || ''}
                                                    onChange={(e) => setEditingAluno({...editingAluno, turno: e.target.value})}
                                                    placeholder="Ex: 08h00 - 12h00"
                                                  />
                                                </div>
                                                <div>
                                                  <Label>Valor Pago</Label>
                                                  <Input
                                                    value={editingAluno.status === 'confirmado' ? '40.000,00 Kz' : '0,00 Kz'}
                                                    readOnly
                                                    className="bg-gray-100"
                                                  />
                                                </div>
                                              </div>

                                              <div>
                                                <Label>Observações</Label>
                                                <Textarea
                                                  value={editingAluno.observacoes || ''}
                                                  onChange={(e) => setEditingAluno({...editingAluno, observacoes: e.target.value})}
                                                  placeholder="Observações adicionais sobre o aluno ou pagamento"
                                                  rows={3}
                                                />
                                              </div>
                                            </TabsContent>
                                         </Tabs>

                                         <div className="flex justify-end gap-2 pt-4 border-t">
                                           <Button variant="outline" onClick={() => setEditingAluno(null)}>
                                             Cancelar
                                           </Button>
                                           <Button onClick={() => handleEditAluno(editingAluno)}>
                                             Salvar Alterações
                                           </Button>
                                         </div>
                                       </div>
                                     )}
                                  </DialogContent>
                                </Dialog>
                                
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleDeleteAlunoLocal(aluno.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    {getFilteredAlunos().length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p>Nenhum aluno encontrado com os filtros aplicados.</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* Dialog para adicionar aluno - mantido para funcionalidade futura */}
      <Dialog open={addingAluno} onOpenChange={setAddingAluno}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Aluno - Turma {selectedTurma}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Tabs defaultValue="pessoais" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pessoais">Dados Pessoais</TabsTrigger>
                <TabsTrigger value="academicos">Dados Acadêmicos</TabsTrigger>
                <TabsTrigger value="pagamento">Pagamento</TabsTrigger>
              </TabsList>
              
              <TabsContent value="pessoais" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nome Completo *</Label>
                    <Input
                      value={newAluno.nome}
                      onChange={(e) => setNewAluno({...newAluno, nome: e.target.value})}
                      placeholder="Nome completo do aluno"
                    />
                  </div>
                  <div>
                    <Label>Número do BI *</Label>
                    <Input
                      value={newAluno.numeroBI || ''}
                      onChange={(e) => setNewAluno({...newAluno, numeroBI: e.target.value})}
                      placeholder="000000000LA000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>E-mail *</Label>
                    <Input
                      type="email"
                      value={newAluno.email}
                      onChange={(e) => setNewAluno({...newAluno, email: e.target.value})}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                  <div>
                    <Label>Telefone *</Label>
                    <Input
                      value={newAluno.telefone}
                      onChange={(e) => setNewAluno({...newAluno, telefone: e.target.value})}
                      placeholder="912345678"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Data de Nascimento</Label>
                    <Input
                      type="date"
                      value={newAluno.dataNascimento || ''}
                      onChange={(e) => setNewAluno({...newAluno, dataNascimento: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Endereço</Label>
                    <Input
                      value={newAluno.endereco || ''}
                      onChange={(e) => setNewAluno({...newAluno, endereco: e.target.value})}
                      placeholder="Endereço completo"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="academicos" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Curso *</Label>
                    <Select
                      value={newAluno.curso}
                      onValueChange={(value) => setNewAluno({...newAluno, curso: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar curso" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedPair?.cursos.map(curso => (
                          <SelectItem key={curso} value={curso}>
                            {curso.replace(/[-_]/g, ' ').toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Data de Inscrição</Label>
                    <Input
                      type="date"
                      value={newAluno.dataInscricao}
                      onChange={(e) => setNewAluno({...newAluno, dataInscricao: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Duração do Curso</Label>
                    <Input
                      value={newAluno.duracao || '3 Meses'}
                      onChange={(e) => setNewAluno({...newAluno, duracao: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Data de Início</Label>
                    <Input
                      type="date"
                      value={newAluno.dataInicio || '2025-02-15'}
                      onChange={(e) => setNewAluno({...newAluno, dataInicio: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <Label>Turno</Label>
                  <Input
                    value={newAluno.turno || ''}
                    onChange={(e) => setNewAluno({...newAluno, turno: e.target.value})}
                    placeholder="Ex: 08h00 - 12h00"
                  />
                </div>
              </TabsContent>

              <TabsContent value="pagamento" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Forma de Pagamento</Label>
                    <Select
                      value={newAluno.formaPagamento || 'Cash'}
                      onValueChange={(value) => setNewAluno({...newAluno, formaPagamento: value as any})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Transferencia">Transferência</SelectItem>
                        <SelectItem value="Cartao">Cartão</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select
                      value={newAluno.status}
                      onValueChange={(value) => setNewAluno({...newAluno, status: value as any})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inscrito">Inscrito</SelectItem>
                        <SelectItem value="confirmado">Confirmado</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Observações</Label>
                  <Textarea
                    value={newAluno.observacoes || ''}
                    onChange={(e) => setNewAluno({...newAluno, observacoes: e.target.value})}
                    placeholder="Observações adicionais sobre o aluno"
                    rows={3}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setAddingAluno(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleAddAluno} 
                disabled={!newAluno.nome || !newAluno.email || !newAluno.curso || !newAluno.telefone}
              >
                Adicionar Aluno
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
