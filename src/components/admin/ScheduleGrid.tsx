
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Schedule, courseNames } from "@/types/schedule";
import { CourseScheduleView } from "./CourseScheduleView";
import { CourseWeeklyTable } from "./CourseWeeklyTable";
import { BookOpen, Users, GraduationCap, Briefcase } from "lucide-react";

interface ScheduleGridProps {
  schedules: Schedule[];
  onEditSchedule: (schedule: Schedule) => void;
  onDeleteSchedule: (id: string) => void;
}

export const ScheduleGrid = ({ schedules, onEditSchedule, onDeleteSchedule }: ScheduleGridProps) => {
  // Mostrar TODOS os cursos disponíveis
  const allCourses = Object.keys(courseNames);

  const getScheduleCount = (course: string) => {
    return schedules.filter(s => s.curso === course).length;
  };

  const courseCategories = [
    {
      name: "Engenharias",
      icon: <BookOpen className="w-4 h-4" />,
      courses: ["engenharia-civil", "engenharia-informatica", "engenharia-mecatronica", "engenharia-industrial-sistemas-electricos", "engenharia-agropecuaria", "engenharia-ambiente", "arquitectura-urbanismo"],
      color: "bg-blue-100 border-blue-300"
    },
    {
      name: "Saúde",
      icon: <Users className="w-4 h-4" />,
      courses: ["enfermagem", "analises-clinicas", "cardiopneumologia", "fisioterapia", "psicologia"],
      color: "bg-green-100 border-green-300"
    },
    {
      name: "Sociais e Humanas",
      icon: <Briefcase className="w-4 h-4" />,
      courses: ["direito", "economia", "gestao-administracao", "lingua-portuguesa", "turismo-gestao-hoteleira"],
      color: "bg-purple-100 border-purple-300"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header com informações gerais */}
      <div className="bg-gradient-to-r from-aauma-navy to-aauma-red text-white p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-2">Grade de Horários - AAUMA 2025-2026</h2>
        <p className="opacity-90">
          Visualize e gerencie os horários de todas as turmas organizados por curso e turno
        </p>
        <div className="flex gap-4 mt-4 flex-wrap">
          <Badge className="bg-white/20 text-white">
            {schedules.length} horários cadastrados
          </Badge>
          <Badge className="bg-white/20 text-white">
            {allCourses.length} cursos disponíveis
          </Badge>
          <Badge className="bg-white/20 text-white">
            {courseCategories.length} áreas de estudo
          </Badge>
        </div>
      </div>

      {/* Tabelas por categoria conforme as imagens */}
      <div className="space-y-8">
        {courseCategories.map((category) => (
          <CourseWeeklyTable
            key={category.name}
            categoryName={category.name}
            categoryIcon={category.icon}
            courses={category.courses}
            schedules={schedules}
            onEditSchedule={onEditSchedule}
            onDeleteSchedule={onDeleteSchedule}
          />
        ))}
      </div>
    </div>
  );
};
