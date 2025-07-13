import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Schedule, courseNames, disciplinesByDayAndCourse } from "@/types/schedule";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

interface CourseWeeklyTableProps {
  categoryName: string;
  categoryIcon: React.ReactNode;
  courses: string[];
  schedules: Schedule[];
  onEditSchedule: (schedule: Schedule) => void;
  onDeleteSchedule: (id: string) => void;
}

export const CourseWeeklyTable = ({
  categoryName,
  categoryIcon,
  courses,
  schedules,
  onEditSchedule,
  onDeleteSchedule
}: CourseWeeklyTableProps) => {
  // Mapear dias da semana
  const weekDays = [
    { key: 'segunda', label: 'SEGUNDA' },
    { key: 'terca', label: 'TERÇA' },
    { key: 'quarta', label: 'QUARTA' },
    { key: 'quinta', label: 'QUINTA' },
    { key: 'sexta', label: 'SEXTA' },
    { key: 'sabado', label: 'SÁBADO' }
  ];

  // Função para obter as disciplinas de um curso em um dia específico
  const getSubjectsForDay = (course: string, day: string) => {
    // Primeiro tentar dos schedules cadastrados
    const scheduleForDay = schedules.filter(s => s.curso === course && s.diaSemana === day);
    if (scheduleForDay.length > 0) {
      return scheduleForDay;
    }
    
    // Se não houver schedules, usar os dados pré-definidos das imagens
    const predefinedSubjects = disciplinesByDayAndCourse[course]?.[day];
    if (predefinedSubjects && predefinedSubjects.trim()) {
      return predefinedSubjects.split(',').map(subject => subject.trim()).filter(s => s);
    }
    
    return [];
  };

  // Função para renderizar o conteúdo da célula
  const renderCellContent = (course: string, day: string) => {
    const dayData = getSubjectsForDay(course, day);
    
    if (dayData.length === 0) {
      return <span className="text-gray-400">–</span>;
    }

    // Verificar se são schedules reais (objetos) ou strings predefinidas
    const isScheduleObjects = typeof dayData[0] === 'object';

    if (isScheduleObjects) {
      // Renderizar schedules reais
      return (
        <div className="space-y-1">
          {(dayData as Schedule[]).map((schedule) => (
            <Badge 
              key={schedule.id}
              variant="secondary" 
              className="text-xs bg-aauma-navy/10 text-aauma-navy hover:bg-aauma-navy/20"
            >
              {schedule.disciplina}
            </Badge>
          ))}
        </div>
      );
    } else {
      // Renderizar disciplinas predefinidas
      return (
        <div className="space-y-1">
          {(dayData as string[]).map((subject, index) => (
            <Badge 
              key={index}
              variant="outline" 
              className="text-xs border-aauma-navy/20 text-aauma-navy"
            >
              {subject}
            </Badge>
          ))}
        </div>
      );
    }
  };

  return (
    <Card className="border-2 border-aauma-light-gray shadow-lg">
      <CardHeader className="bg-gradient-to-r from-aauma-navy to-aauma-red text-white">
        <CardTitle className="flex items-center gap-3">
          {categoryIcon}
          <div>
            <h3 className="text-xl font-bold">{categoryName}</h3>
            <p className="text-sm opacity-90">Grade Semanal - Preparatório AAUMA</p>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-aauma-light-gray border-b-2 border-aauma-navy/20">
                <TableHead className="font-bold text-aauma-navy text-center py-4 px-6 min-w-[250px] border-r border-gray-200">
                  CURSO
                </TableHead>
                {weekDays.map((day) => (
                  <TableHead key={day.key} className="font-bold text-aauma-navy text-center py-4 px-4 min-w-[160px] border-r border-gray-200 last:border-r-0">
                    {day.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course, index) => (
                <TableRow key={course} className={`hover:bg-gray-50/80 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}>
                  <TableCell className="font-medium text-aauma-navy bg-aauma-light-gray/30 py-6 px-6 border-r border-gray-200 text-center">
                    {courseNames[course]}
                  </TableCell>
                  {weekDays.map((day) => (
                    <TableCell key={`${course}-${day.key}`} className="text-center align-middle py-6 px-4 border-r border-gray-200 last:border-r-0 min-h-[80px]">
                      {renderCellContent(course, day.key)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {courses.every(course => schedules.filter(s => s.curso === course).length === 0) && (
          <div className="text-center py-12 text-gray-500 bg-gray-50/50">
            <p className="text-lg">Nenhum horário cadastrado para esta categoria ainda.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};