
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, BookOpen, Users, MapPin } from "lucide-react";
import { Schedule, courseNames, getAvailableDisciplines } from "@/types/schedule";
import { ScheduleShiftSection } from "./ScheduleShiftSection";

interface CourseScheduleViewProps {
  course: string;
  schedules: Schedule[];
  onEditSchedule: (schedule: Schedule) => void;
  onDeleteSchedule: (id: string) => void;
}

export const CourseScheduleView = ({ 
  course, 
  schedules, 
  onEditSchedule, 
  onDeleteSchedule 
}: CourseScheduleViewProps) => {
  const courseSchedules = schedules.filter(s => s.curso === course);
  const totalSchedules = courseSchedules.length;
  const morningSchedules = courseSchedules.filter(s => s.turno === 'manha').length;
  const afternoonSchedules = courseSchedules.filter(s => s.turno === 'tarde').length;
  
  // Obter salas únicas para este curso
  const uniqueRooms = [...new Set(courseSchedules.map(s => s.sala))];
  const uniqueProfessors = [...new Set(courseSchedules.map(s => s.professor))];

  return (
    <Card className="border-2 border-aauma-light-gray">
      <CardHeader className="bg-gradient-to-r from-aauma-navy to-aauma-red text-white">
        <CardTitle className="flex items-center gap-3">
          <Calendar className="w-6 h-6" />
          <div>
            <h3 className="text-xl font-bold">{courseNames[course]}</h3>
            <p className="text-sm opacity-90">Grade Semanal - Preparatório AAUMA</p>
          </div>
        </CardTitle>
        <CardDescription className="text-white/80 flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            <span>Disciplinas: {getAvailableDisciplines(course).join(", ")}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>Salas: {uniqueRooms.join(", ") || "Não definidas"}</span>
          </div>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6">
        {/* Estatísticas detalhadas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-blue-600 font-medium">Total de Aulas</p>
                <p className="text-2xl font-bold text-blue-800">{totalSchedules}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-600" />
              <div>
                <p className="text-sm text-amber-600 font-medium">Turno Manhã</p>
                <p className="text-2xl font-bold text-amber-800">{morningSchedules}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-purple-600 font-medium">Turno Tarde</p>
                <p className="text-2xl font-bold text-purple-800">{afternoonSchedules}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-green-600 font-medium">Professores</p>
                <p className="text-2xl font-bold text-green-800">{uniqueProfessors.length}</p>
              </div>
            </div>
          </div>
        </div>

        {totalSchedules === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Nenhum horário cadastrado
            </h3>
            <p className="text-gray-500 mb-4">
              Este curso ainda não possui horários definidos.
            </p>
            <p className="text-sm text-gray-400">
              Use o botão "Novo Horário" para adicionar aulas para {courseNames[course]}.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <ScheduleShiftSection
              shift="manha"
              course={course}
              schedules={schedules}
              onEdit={onEditSchedule}
              onDelete={onDeleteSchedule}
            />
            
            <ScheduleShiftSection
              shift="tarde"
              course={course}
              schedules={schedules}
              onEdit={onEditSchedule}
              onDelete={onDeleteSchedule}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
