
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Users, MapPin, Clock, ChevronDown, ChevronUp, Edit } from "lucide-react";
import { TurmaPair } from "@/types/turma";
import { AlunosList } from "./AlunosList";


interface TurmaPairGridProps {
  turmaPairs: TurmaPair[];
  onDeleteTurmaPair: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onEditTurmaPair: (turmaPair: TurmaPair) => void;
}

export const TurmaPairGrid = ({ 
  turmaPairs, 
  onDeleteTurmaPair,
  onToggleStatus,
  onEditTurmaPair
}: TurmaPairGridProps) => {
  const [expandedTurma, setExpandedTurma] = useState<string | null>(null);
  const [selectedTurma, setSelectedTurma] = useState<'A' | 'B'>('A');
  
  console.log('[TurmaPairGrid] Renderizando com', turmaPairs.length, 'pares de turmas:', turmaPairs);

  // Função para inverter ordem das disciplinas em dias com duas matérias
  const inverterHorarios = (horario: string): string => {
    if (horario === '–' || !horario.includes(',')) {
      return horario; // Retorna inalterado se não tem vírgula (uma ou nenhuma disciplina)
    }
    
    // Inverte a ordem das disciplinas separadas por vírgula
    const disciplinas = horario.split(',').map(d => d.trim());
    return disciplinas.reverse().join(', ');
  };

  // Função para aplicar horários específicos por turma
  const aplicarHorarioTurma = (curso: any, turma: 'A' | 'B') => {
    if (turma === 'A') {
      return curso; // Turma A mantém horário original
    }
    
    // Turma B tem horário inverso para dias com duas disciplinas
    return {
      ...curso,
      segunda: inverterHorarios(curso.segunda),
      terca: inverterHorarios(curso.terca),
      quarta: inverterHorarios(curso.quarta),
      quinta: inverterHorarios(curso.quinta),
      sexta: inverterHorarios(curso.sexta)
    };
  };

  // Dados dos horários baseados nas imagens fornecidas - TODOS OS CURSOS
  const todosOsCursos = [
    // Cursos de Engenharia
    { curso: 'ENGENHARIA INFORMÁTICA', segunda: 'L.P', terca: '–', quarta: 'L.P, Mat', quinta: 'Física', sexta: 'Matemática' },
    { curso: 'ENGENHARIA CIVIL', segunda: 'L.P', terca: '–', quarta: 'L.P, Mat', quinta: 'Física, Desenho', sexta: 'Matemática' },
    { curso: 'ENGENHARIA MECATRÓNICA', segunda: 'L.P', terca: '–', quarta: 'L.P, Mat', quinta: 'Física', sexta: 'Matemática' },
    { curso: 'ENG. INDUSTRIAL E SIST. ELÉCTRICOS', segunda: 'L.P', terca: '–', quarta: 'L.P, Mat', quinta: 'Física', sexta: 'Matemática' },
    { curso: 'ENGENHARIA AGROPECUÁRIA', segunda: 'L.P', terca: '–', quarta: 'L.P, Mat', quinta: 'Física', sexta: 'Matemática' },
    { curso: 'ARQUITECTURA E URBANISMO', segunda: 'L.P', terca: '–', quarta: 'L.P, Mat', quinta: 'Física, Desenho', sexta: 'Matemática' },
    
    // Cursos da Área da Saúde
    { curso: 'MEDICINA', segunda: '–', terca: 'Biologia, Química', quarta: 'Matemática', quinta: '–', sexta: 'Matemática, Biologia' },
    { curso: 'ANÁLISES CLÍNICAS E SAÚDE PÚBLICA', segunda: '–', terca: 'Biologia, Química', quarta: 'Matemática', quinta: '–', sexta: 'Matemática, Biologia' },
    { curso: 'ENFERMAGEM', segunda: '–', terca: 'Biologia, Química', quarta: 'Matemática', quinta: '–', sexta: 'Matemática, Biologia' },
    { curso: 'CARDIOPNEUMOLOGIA', segunda: '–', terca: 'Biologia, Química', quarta: 'Matemática', quinta: '–', sexta: 'Matemática, Biologia' },
    { curso: 'FISIOTERAPIA', segunda: '–', terca: 'Biologia, Química', quarta: 'Matemática', quinta: '–', sexta: 'Matemática, Biologia' },
    { curso: 'PSICOLOGIA', segunda: '–', terca: 'Biologia, Química', quarta: 'Matemática', quinta: '–', sexta: 'Matemática, Biologia' },
    
    // Cursos de Ciências Sociais e Humanas
    { curso: 'DIREITO', segunda: 'História, L.P', terca: '–', quarta: 'L.P, Matemática', quinta: '–', sexta: 'Matemática' },
    { curso: 'GESTÃO E ADMINISTRAÇÃO DE EMPRESAS', segunda: 'História, L.P', terca: '–', quarta: 'L.P, Matemática', quinta: '–', sexta: 'Matemática' },
    { curso: 'LÍNGUA PORTUGUESA E COMUNICAÇÃO', segunda: 'História, L.P', terca: '–', quarta: 'L.P, Matemática', quinta: '–', sexta: 'Matemática' },
    { curso: 'ECONOMIA', segunda: 'História, L.P', terca: '–', quarta: 'L.P, Matemática', quinta: '–', sexta: 'Matemática' },
    { curso: 'TURISMO E GESTÃO HOTELEIRA', segunda: 'História, L.P', terca: '–', quarta: 'L.P, Matemática', quinta: '–', sexta: 'Matemática' }
  ];

  const toggleTurmaExpansion = (turmaId: string) => {
    setExpandedTurma(expandedTurma === turmaId ? null : turmaId);
  };

  if (turmaPairs.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">
          Nenhum par de turmas criado
        </h3>
        <p className="text-gray-500">
          Use o botão "Novo Par de Turmas" para criar o primeiro par.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {turmaPairs.map((turmaPair) => {
        console.log('[TurmaPairGrid] Renderizando par:', turmaPair.nome);
        const isExpanded = expandedTurma === turmaPair.id;
        
        return (
          <Card 
            key={turmaPair.id} 
            className={`border transition-all ${
              turmaPair.ativo 
                ? 'border-primary/30 shadow-sm' 
                : 'border-muted bg-muted/30 opacity-75'
            }`}
          >
            <CardHeader className="pb-1 px-3 pt-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-primary flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {turmaPair.nome}
                </CardTitle>
                <div className="flex items-center gap-1">
                  <Badge 
                    className={`text-xs px-1 py-0 ${
                      turmaPair.periodo === 'manha' 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}
                  >
                    <Clock className="w-2 h-2 mr-1" />
                    {turmaPair.horarioPeriodo}
                  </Badge>
                  <Badge 
                    variant={turmaPair.ativo ? "default" : "secondary"}
                    className={`text-xs px-1 py-0 ${turmaPair.ativo ? 'bg-green-100 text-green-800' : ''}`}
                  >
                    {turmaPair.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-3 space-y-2">
              {/* Resumo das Turmas - Ultra Compacto */}
              <div className="grid grid-cols-2 gap-2">
                <div 
                  className={`p-1.5 rounded text-center cursor-pointer transition-all ${
                    selectedTurma === 'A' && isExpanded
                      ? 'bg-blue-100 border-2 border-blue-400 shadow-md'
                      : 'bg-blue-50 border border-blue-200 hover:bg-blue-100'
                  }`}
                  onClick={() => {
                    setSelectedTurma('A');
                    if (!isExpanded) toggleTurmaExpansion(turmaPair.id);
                  }}
                >
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <Users className="w-2 h-2 text-blue-600" />
                    <span className="font-medium text-blue-800 text-xs">Turma A</span>
                  </div>
                  <div className="text-[10px] text-blue-600">
                    <p className="font-medium">{turmaPair.turmaA.sala}</p>
                    <p>{turmaPair.turmaA.alunosInscritos}/{turmaPair.turmaA.capacidade}</p>
                  </div>
                  {selectedTurma === 'A' && isExpanded && (
                    <div className="mt-1 text-[8px] font-medium text-blue-700">
                      ← Horário Original
                    </div>
                  )}
                </div>
                <div 
                  className={`p-1.5 rounded text-center cursor-pointer transition-all ${
                    selectedTurma === 'B' && isExpanded
                      ? 'bg-red-100 border-2 border-red-400 shadow-md'
                      : 'bg-red-50 border border-red-200 hover:bg-red-100'
                  }`}
                  onClick={() => {
                    setSelectedTurma('B');
                    if (!isExpanded) toggleTurmaExpansion(turmaPair.id);
                  }}
                >
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <Users className="w-2 h-2 text-red-600" />
                    <span className="font-medium text-red-800 text-xs">Turma B</span>
                  </div>
                  <div className="text-[10px] text-red-600">
                    <p className="font-medium">{turmaPair.turmaB.sala}</p>
                    <p>{turmaPair.turmaB.alunosInscritos}/{turmaPair.turmaB.capacidade}</p>
                  </div>
                  {selectedTurma === 'B' && isExpanded && (
                    <div className="mt-1 text-[8px] font-medium text-red-700">
                      ← Horário Inverso
                    </div>
                  )}
                </div>
              </div>

              {/* Toggle para Horários */}
              <div className="border-t pt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleTurmaExpansion(turmaPair.id)}
                  className="w-full justify-between text-xs h-6 px-2"
                >
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-primary" />
                    <span className="font-medium text-primary">Horários</span>
                  </div>
                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </Button>
                
                {isExpanded && (
                  <div className="mt-1 bg-white rounded border shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-[10px]">
                        <thead>
                          <tr className="bg-primary text-primary-foreground">
                            <th className="p-1 text-left font-medium">CURSO</th>
                            <th className="p-1 text-center font-medium min-w-[80px]">SEG</th>
                            <th className="p-1 text-center font-medium min-w-[80px]">TER</th>
                            <th className="p-1 text-center font-medium min-w-[80px]">QUA</th>
                            <th className="p-1 text-center font-medium min-w-[80px]">QUI</th>
                            <th className="p-1 text-center font-medium min-w-[80px]">SEX</th>
                          </tr>
                        </thead>
                        <tbody>
                          {todosOsCursos.map((curso, index) => {
                            const cursoComHorario = aplicarHorarioTurma(curso, selectedTurma);
                            return (
                              <tr key={index} className={`${index % 2 === 0 ? 'bg-muted/30' : 'bg-background'} hover:bg-muted/50 transition-colors`}>
                                <td className="p-1 font-medium bg-muted/50 border-r">
                                  <div className="max-w-[120px] text-[9px]">{cursoComHorario.curso}</div>
                                </td>
                                <td className="p-0.5 text-center border-r border-muted">
                                  {cursoComHorario.segunda !== '–' ? (
                                    <div className="space-y-0.5">
                                      {cursoComHorario.segunda.split(',').map((materia, i) => (
                                        <Badge key={i} variant="outline" className="text-[8px] px-0.5 py-0 bg-blue-50 text-blue-700 border-blue-200 h-3">
                                          {materia.trim()}
                                        </Badge>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground">–</span>
                                  )}
                                </td>
                                <td className="p-0.5 text-center border-r border-muted">
                                  {cursoComHorario.terca !== '–' ? (
                                    <div className="space-y-0.5">
                                      {cursoComHorario.terca.split(',').map((materia, i) => (
                                        <Badge key={i} variant="outline" className="text-[8px] px-0.5 py-0 bg-green-50 text-green-700 border-green-200 h-3">
                                          {materia.trim()}
                                        </Badge>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground">–</span>
                                  )}
                                </td>
                                <td className="p-0.5 text-center border-r border-muted">
                                  {cursoComHorario.quarta !== '–' ? (
                                    <div className="space-y-0.5">
                                      {cursoComHorario.quarta.split(',').map((materia, i) => (
                                        <Badge key={i} variant="outline" className="text-[8px] px-0.5 py-0 bg-purple-50 text-purple-700 border-purple-200 h-3">
                                          {materia.trim()}
                                        </Badge>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground">–</span>
                                  )}
                                </td>
                                <td className="p-0.5 text-center border-r border-muted">
                                  {cursoComHorario.quinta !== '–' ? (
                                    <div className="space-y-0.5">
                                      {cursoComHorario.quinta.split(',').map((materia, i) => (
                                        <Badge key={i} variant="outline" className="text-[8px] px-0.5 py-0 bg-orange-50 text-orange-700 border-orange-200 h-3">
                                          {materia.trim()}
                                        </Badge>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground">–</span>
                                  )}
                                </td>
                                <td className="p-0.5 text-center">
                                  {cursoComHorario.sexta !== '–' ? (
                                    <div className="space-y-0.5">
                                      {cursoComHorario.sexta.split(',').map((materia, i) => (
                                        <Badge key={i} variant="outline" className="text-[8px] px-0.5 py-0 bg-red-50 text-red-700 border-red-200 h-3">
                                          {materia.trim()}
                                        </Badge>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground">–</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Lista de Alunos */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <AlunosList 
                  alunos={turmaPair.turmaA.alunos} 
                  turmaLabel="Turma A" 
                  turmaColor="blue"
                />
                <AlunosList 
                  alunos={turmaPair.turmaB.alunos} 
                  turmaLabel="Turma B" 
                  turmaColor="red"
                />
              </div>

              {/* Actions - Ultra Compacto */}
              <div className="flex justify-between items-center pt-1 border-t">
                <div className="text-[10px] text-muted-foreground">
                  {new Date(turmaPair.criadoEm).toLocaleDateString('pt-PT')}
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEditTurmaPair(turmaPair)}
                    className="text-primary hover:text-primary-foreground hover:bg-primary h-5 px-1 text-[10px]"
                  >
                    <Edit className="w-2 h-2 mr-0.5" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDeleteTurmaPair(turmaPair.id)}
                    className="text-destructive hover:text-destructive-foreground hover:bg-destructive h-5 px-1 text-[10px]"
                  >
                    <Trash2 className="w-2 h-2 mr-0.5" />
                    Remover
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
