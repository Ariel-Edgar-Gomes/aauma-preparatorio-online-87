
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Clock, MapPin, User } from "lucide-react";
import { Schedule, dayNames } from "@/types/schedule";

interface ScheduleShiftSectionProps {
  shift: 'manha' | 'tarde';
  course: string;
  schedules: Schedule[];
  onEdit: (schedule: Schedule) => void;
  onDelete: (id: string) => void;
}

// Cores por disciplina para melhor identificação visual
const disciplineColors: Record<string, string> = {
  "Matemática": "bg-blue-100 border-blue-300 text-blue-800",
  "Física": "bg-purple-100 border-purple-300 text-purple-800",
  "Química": "bg-green-100 border-green-300 text-green-800",
  "Biologia": "bg-red-100 border-red-300 text-red-800",
  "História": "bg-pink-100 border-pink-300 text-pink-800",
  "L.P": "bg-cyan-100 border-cyan-300 text-cyan-800",
  "Língua Portuguesa": "bg-cyan-100 border-cyan-300 text-cyan-800",
  "Desenho": "bg-orange-100 border-orange-300 text-orange-800",
  "L.P, Mat": "bg-indigo-100 border-indigo-300 text-indigo-800",
  "História, L.P": "bg-teal-100 border-teal-300 text-teal-800",
  "L.P, Matemática": "bg-violet-100 border-violet-300 text-violet-800",
  "Biologia, Química": "bg-emerald-100 border-emerald-300 text-emerald-800",
  "Matemática, Biologia": "bg-rose-100 border-rose-300 text-rose-800",
  "Física, Desenho": "bg-amber-100 border-amber-300 text-amber-800"
};

const getDisciplineColor = (disciplina: string) => {
  return disciplineColors[disciplina] || "bg-gray-100 border-gray-300 text-gray-800";
};

export const ScheduleShiftSection = ({ 
  shift, 
  course, 
  schedules, 
  onEdit, 
  onDelete 
}: ScheduleShiftSectionProps) => {
  const shiftTitle = shift === 'manha' ? 'Turno Manhã (08:00 - 12:00)' : 'Turno Tarde (13:00 - 17:00)';
  const shiftIcon = shift === 'manha' ? '🌅' : '🌇';
  
  // Obter turmas e salas dinamicamente baseado nos horários
  const getShiftData = () => {
    const shiftSchedules = schedules.filter(s => 
      s.curso === course && s.turno === shift
    );
    
    // Agrupar por turma e sala
    const turmasSalas = new Map<string, string>();
    shiftSchedules.forEach(schedule => {
      turmasSalas.set(schedule.turma, schedule.sala);
    });
    
    return Array.from(turmasSalas.entries()).map(([turma, sala]) => ({ turma, sala }));
  };

  const getSchedulesByDayAndShift = (day: string, turma: string) => {
    return schedules
      .filter(s => s.diaSemana === day && s.curso === course && s.turno === shift && s.turma === turma)
      .sort((a, b) => a.horarioInicio.localeCompare(b.horarioInicio));
  };

  const renderTurma = (turma: string, sala: string) => (
    <div key={`${turma}-${sala}`} className="bg-white rounded-lg border-2 border-aauma-light-gray p-4">
      <div className="flex items-center gap-2 mb-4">
        <Badge className="bg-aauma-navy text-white">
          <User className="w-3 h-3 mr-1" />
          Turma {turma}
        </Badge>
        <Badge variant="outline" className="border-aauma-red text-aauma-red">
          <MapPin className="w-3 h-3 mr-1" />
          Sala {sala}
        </Badge>
      </div>
      
      {/* Grade por dias da semana */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {Object.keys(dayNames).map((day) => {
          const daySchedules = getSchedulesByDayAndShift(day, turma);
          
          return (
            <div key={day} className="border rounded-lg p-3 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-semibold text-sm text-aauma-navy flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {dayNames[day]}
                </h5>
                {daySchedules.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {daySchedules.length} aula{daySchedules.length > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
              
              {daySchedules.length > 0 ? (
                <div className="space-y-2">
                  {daySchedules.map((schedule) => (
                    <div 
                      key={schedule.id} 
                      className={`p-3 rounded-lg border-2 ${getDisciplineColor(schedule.disciplina)} transition-all hover:shadow-md`}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h6 className="font-bold text-sm truncate">{schedule.disciplina}</h6>
                            <Badge variant="outline" className="text-xs whitespace-nowrap">
                              {schedule.horarioInicio} - {schedule.horarioFim}
                            </Badge>
                          </div>
                          <p className="text-xs opacity-80 truncate">{schedule.professor}</p>
                        </div>
                        
                        <div className="flex gap-1 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onEdit(schedule)}
                            className="h-7 w-7 p-0 hover:bg-white/50"
                            title="Editar horário"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onDelete(schedule.id)}
                            className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Excluir horário"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-xs text-aauma-dark-gray">Sem aulas programadas</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const shiftData = getShiftData();
  
  return (
    <div className={shift === 'manha' ? 'mb-8' : ''}>
      <div className="flex items-center gap-3 mb-6 p-4 bg-gradient-to-r from-aauma-light-gray to-white rounded-lg border">
        <span className="text-2xl">{shiftIcon}</span>
        <div>
          <h4 className="font-bold text-aauma-navy text-lg">{shiftTitle}</h4>
          <p className="text-sm text-aauma-dark-gray">
            {shiftData.length > 0 
              ? `${shiftData.length} turma${shiftData.length > 1 ? 's' : ''} com horários definidos`
              : 'Nenhuma turma com horários definidos'
            }
          </p>
        </div>
      </div>
      
      {shiftData.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {shiftData.map(({ turma, sala }) => renderTurma(turma, sala))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Nenhum horário para o {shift === 'manha' ? 'turno da manhã' : 'turno da tarde'}
          </h3>
          <p className="text-gray-500">
            Use o botão "Novo Horário" para adicionar aulas para este turno.
          </p>
        </div>
      )}
    </div>
  );
};
