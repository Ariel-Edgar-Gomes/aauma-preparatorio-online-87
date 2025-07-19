import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Edit, 
  Users, 
  MapPin, 
  Clock, 
  BookOpen, 
  Calendar,
  Settings,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight
} from "lucide-react";
import { TurmaPair } from "@/types/turma";
import { useToast } from "@/hooks/use-toast";

interface TurmaManagementAreaProps {
  turmaPairs: TurmaPair[];
  onUpdateTurmaPair: (id: string, updates: Partial<TurmaPair>) => void;
  onDeleteTurmaPair: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export const TurmaManagementArea = ({ 
  turmaPairs, 
  onUpdateTurmaPair,
  onDeleteTurmaPair,
  onToggleStatus 
}: TurmaManagementAreaProps) => {
  const { toast } = useToast();
  const [selectedPair, setSelectedPair] = useState<TurmaPair | null>(null);
  const [editingPair, setEditingPair] = useState<TurmaPair | null>(null);
  const [editingTurma, setEditingTurma] = useState<'A' | 'B' | null>(null);

  const handleSavePairChanges = () => {
    if (!editingPair) return;
    
    onUpdateTurmaPair(editingPair.id, editingPair);
    setEditingPair(null);
    toast({
      title: "Par atualizado",
      description: "As alterações foram salvas com sucesso.",
    });
  };

  const handleSaveTurmaChanges = () => {
    if (!editingPair || !editingTurma) return;
    
    onUpdateTurmaPair(editingPair.id, editingPair);
    setEditingTurma(null);
    toast({
      title: `Turma ${editingTurma} atualizada`,
      description: "As alterações foram salvas com sucesso.",
    });
  };

  const updateTurmaData = (turma: 'A' | 'B', field: string, value: any) => {
    if (!editingPair) return;
    
    setEditingPair({
      ...editingPair,
      [turma === 'A' ? 'turmaA' : 'turmaB']: {
        ...editingPair[turma === 'A' ? 'turmaA' : 'turmaB'],
        [field]: value
      }
    });
  };

  const renderPairOverview = (pair: TurmaPair) => (
    <Card key={pair.id} className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            {pair.nome}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={pair.periodo === 'manha' ? 'default' : 'secondary'}>
              <Clock className="w-3 h-3 mr-1" />
              {pair.horarioPeriodo}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleStatus(pair.id)}
              className={pair.ativo ? 'text-green-600' : 'text-gray-400'}
            >
              {pair.ativo ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
              {pair.ativo ? 'Ativo' : 'Inativo'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Informações Gerais */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Informações Gerais</h4>
            <div className="space-y-1 text-sm">
              
              <p><strong>Total Cursos:</strong> {pair.cursos.length}</p>
              <p><strong>Disciplinas Comuns:</strong> {pair.disciplinasComuns.length}</p>
              <p><strong>Criado em:</strong> {new Date(pair.criadoEm).toLocaleDateString('pt-PT')}</p>
            </div>
          </div>

          {/* Turma A */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-blue-600">Turma A</h4>
            <div className="space-y-1 text-sm">
              <p><MapPin className="w-3 h-3 inline mr-1" /><strong>Sala:</strong> {pair.turmaA.sala}</p>
              <p><Users className="w-3 h-3 inline mr-1" /><strong>Alunos:</strong> {pair.turmaA.alunosInscritos}/{pair.turmaA.capacidade}</p>
              <p><strong>Ocupação:</strong> {Math.round((pair.turmaA.alunosInscritos / pair.turmaA.capacidade) * 100)}%</p>
            </div>
          </div>

          {/* Turma B */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-red-600">Turma B</h4>
            <div className="space-y-1 text-sm">
              <p><MapPin className="w-3 h-3 inline mr-1" /><strong>Sala:</strong> {pair.turmaB.sala}</p>
              <p><Users className="w-3 h-3 inline mr-1" /><strong>Alunos:</strong> {pair.turmaB.alunosInscritos}/{pair.turmaB.capacidade}</p>
              <p><strong>Ocupação:</strong> {Math.round((pair.turmaB.alunosInscritos / pair.turmaB.capacidade) * 100)}%</p>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => setSelectedPair(pair)}>
                  <BookOpen className="w-4 h-4 mr-2" />
                  Ver Detalhes
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Gestão Completa - {pair.nome}</DialogTitle>
                </DialogHeader>
                {selectedPair && <TurmaDetailManagement pair={selectedPair} />}
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => setEditingPair(pair)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Editar Par de Turmas</DialogTitle>
                </DialogHeader>
                {editingPair && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="nome">Nome do Par</Label>
                      <Input
                        id="nome"
                        value={editingPair.nome}
                        onChange={(e) => setEditingPair({...editingPair, nome: e.target.value})}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Número da Sala Turma A</Label>
                        <Input
                          type="text"
                          placeholder="Digite o número da sala (ex: 101, A1)"
                          value={editingPair.turmaA.sala}
                          onChange={(e) => updateTurmaData('A', 'sala', e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <Label>Número da Sala Turma B</Label>
                        <Input
                          type="text"
                          placeholder="Digite o número da sala (ex: 102, B1)"
                          value={editingPair.turmaB.sala}
                          onChange={(e) => updateTurmaData('B', 'sala', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Capacidade Turma A</Label>
                        <Input
                          type="number"
                          value={editingPair.turmaA.capacidade}
                          onChange={(e) => updateTurmaData('A', 'capacidade', parseInt(e.target.value))}
                        />
                      </div>
                      
                      <div>
                        <Label>Capacidade Turma B</Label>
                        <Input
                          type="number"
                          value={editingPair.turmaB.capacidade}
                          onChange={(e) => updateTurmaData('B', 'capacidade', parseInt(e.target.value))}
                        />
                      </div>
                    </div>


                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setEditingPair(null)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleSavePairChanges}>
                        Salvar Alterações
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onDeleteTurmaPair(pair.id)}
            className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Remover
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // Estatísticas gerais
  const totalStudents = turmaPairs.reduce((sum, pair) => 
    sum + pair.turmaA.alunosInscritos + pair.turmaB.alunosInscritos, 0
  );
  const totalCapacity = turmaPairs.reduce((sum, pair) => 
    sum + pair.turmaA.capacidade + pair.turmaB.capacidade, 0
  );
  const activePairs = turmaPairs.filter(pair => pair.ativo).length;
  const occupancyRate = totalCapacity > 0 ? (totalStudents / totalCapacity * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Estatísticas Gerais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Área de Gestão de Turmas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{turmaPairs.length}</div>
              <div className="text-sm text-blue-800">Pares de Turmas</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{activePairs}</div>
              <div className="text-sm text-green-800">Pares Ativos</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{totalStudents}</div>
              <div className="text-sm text-purple-800">Total de Alunos</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{occupancyRate.toFixed(1)}%</div>
              <div className="text-sm text-orange-800">Taxa de Ocupação</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Pares */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Todos os Pares de Turmas</h3>
        {turmaPairs.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Nenhum par de turmas criado
            </h3>
            <p className="text-gray-500">
              Use os botões de criação para adicionar o primeiro par.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {turmaPairs.map(renderPairOverview)}
          </div>
        )}
      </div>
    </div>
  );
};

// Componente para gestão detalhada de um par específico
const TurmaDetailManagement = ({ pair }: { pair: TurmaPair }) => {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Visão Geral</TabsTrigger>
        <TabsTrigger value="turmaA">Turma A</TabsTrigger>
        <TabsTrigger value="turmaB">Turma B</TabsTrigger>
        <TabsTrigger value="schedules">Horários</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações do Par</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>Nome:</strong> {pair.nome}</p>
              <p><strong>Período:</strong> {pair.periodo === 'manha' ? 'Manhã' : 'Tarde'}</p>
              <p><strong>Horário:</strong> {pair.horarioPeriodo}</p>
              
              <p><strong>Status:</strong> {pair.ativo ? 'Ativo' : 'Inativo'}</p>
              <p><strong>Criado em:</strong> {new Date(pair.criadoEm).toLocaleDateString('pt-PT')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cursos Incluídos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {pair.cursos.map((curso, index) => (
                  <Badge key={index} variant="outline" className="mr-2 mb-2">
                    {curso.replace('-', ' ').toUpperCase()}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Disciplinas Comuns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {pair.disciplinasComuns.map((disciplina, index) => (
                <Badge key={index} className="bg-primary text-primary-foreground">
                  {disciplina}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="turmaA" className="space-y-4">
        <TurmaDetails turma="A" data={pair.turmaA} />
      </TabsContent>

      <TabsContent value="turmaB" className="space-y-4">
        <TurmaDetails turma="B" data={pair.turmaB} />
      </TabsContent>

      <TabsContent value="schedules" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ScheduleDisplay title="Horário Turma A" schedule={pair.turmaA.horarioSemanal} />
          <ScheduleDisplay title="Horário Turma B" schedule={pair.turmaB.horarioSemanal} />
        </div>
      </TabsContent>
    </Tabs>
  );
};

// Componente para detalhes de uma turma específica
const TurmaDetails = ({ turma, data }: { turma: 'A' | 'B', data: any }) => {
  const occupancyRate = (data.alunosInscritos / data.capacidade * 100).toFixed(1);
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className={`text-lg ${turma === 'A' ? 'text-blue-600' : 'text-red-600'}`}>
            Turma {turma} - Detalhes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-600" />
              <div className="text-xl font-bold">{data.sala}</div>
              <div className="text-sm text-gray-600">Sala</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Users className="w-8 h-8 mx-auto mb-2 text-gray-600" />
              <div className="text-xl font-bold">{data.alunosInscritos}/{data.capacidade}</div>
              <div className="text-sm text-gray-600">Alunos</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-600" />
              <div className="text-xl font-bold">{occupancyRate}%</div>
              <div className="text-sm text-gray-600">Ocupação</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <ScheduleDisplay 
        title={`Horário Semanal - Turma ${turma}`} 
        schedule={data.horarioSemanal} 
      />
    </div>
  );
};

// Componente para exibir horários
const ScheduleDisplay = ({ title, schedule }: { title: string, schedule: Record<string, string> }) => {
  const daysMap = {
    segunda: 'Segunda',
    terca: 'Terça',
    quarta: 'Quarta',
    quinta: 'Quinta',
    sexta: 'Sexta'
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {Object.entries(schedule).map(([day, subjects]) => (
            <div key={day} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="font-medium">{daysMap[day as keyof typeof daysMap]}:</span>
              <div className="flex gap-1">
                {subjects && subjects !== '-' ? (
                  subjects.split(',').map((subject, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {subject.trim()}
                    </Badge>
                  ))
                ) : (
                  <span className="text-gray-400 text-sm">–</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};