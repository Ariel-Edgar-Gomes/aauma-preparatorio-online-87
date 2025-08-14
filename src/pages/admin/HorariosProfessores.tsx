import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Edit, Save, X } from "lucide-react";
import { useScheduleData } from "@/hooks/useScheduleData";
import { courseNames, dayNames } from "@/types/schedule";

const HorariosProfessores = () => {
  const { schedules, loading, handleSaveSchedule } = useScheduleData();
  const [editingSchedule, setEditingSchedule] = useState<string | null>(null);
  const [professorValue, setProfessorValue] = useState("");

  const handleEditProfessor = (scheduleId: string, currentProfessor: string) => {
    setEditingSchedule(scheduleId);
    setProfessorValue(currentProfessor || "");
  };

  const handleSaveProfessor = (schedule: any) => {
    const scheduleData = {
      ...schedule,
      professor: professorValue
    };
    
    const success = handleSaveSchedule(scheduleData, schedule);
    if (success) {
      setEditingSchedule(null);
      setProfessorValue("");
    }
  };

  const handleCancelEdit = () => {
    setEditingSchedule(null);
    setProfessorValue("");
  };

  // Group schedules by course
  const schedulesByCourse = schedules.reduce((acc, schedule) => {
    if (!acc[schedule.curso]) {
      acc[schedule.curso] = [];
    }
    acc[schedule.curso].push(schedule);
    return acc;
  }, {} as Record<string, typeof schedules>);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-8 h-8 animate-spin text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando horários dos professores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Horários dos Professores</h2>
        <p className="text-muted-foreground">Gerir atribuição de professores às disciplinas de cada turma</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Turmas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(schedulesByCourse).length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Horários</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schedules.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Professores Atribuídos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {schedules.filter(s => s.professor && s.professor.trim() !== "").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Tables */}
      {Object.entries(schedulesByCourse).map(([courseKey, courseSchedules]) => (
        <Card key={courseKey} className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">
              {courseNames[courseKey] || courseKey}
            </CardTitle>
            <CardDescription>
              {courseSchedules.length} horário(s) configurado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dia da Semana</TableHead>
                  <TableHead>Horário</TableHead>
                  <TableHead>Disciplina</TableHead>
                  <TableHead>Turno</TableHead>
                  <TableHead>Sala</TableHead>
                  <TableHead>Turma</TableHead>
                  <TableHead>Professor</TableHead>
                  <TableHead className="w-20">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courseSchedules
                  .sort((a, b) => {
                    const dayOrder = ['segunda', 'terca', 'quarta', 'quinta', 'sexta'];
                    const dayCompare = dayOrder.indexOf(a.diaSemana) - dayOrder.indexOf(b.diaSemana);
                    if (dayCompare !== 0) return dayCompare;
                    return a.horarioInicio.localeCompare(b.horarioInicio);
                  })
                  .map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell>
                        <Badge variant="outline">
                          {dayNames[schedule.diaSemana] || schedule.diaSemana}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {schedule.horarioInicio} - {schedule.horarioFim}
                      </TableCell>
                      <TableCell>{schedule.disciplina}</TableCell>
                      <TableCell>
                        <Badge variant={schedule.turno === 'manha' ? 'default' : 'secondary'}>
                          {schedule.turno === 'manha' ? 'Manhã' : 'Tarde'}
                        </Badge>
                      </TableCell>
                      <TableCell>{schedule.sala}</TableCell>
                      <TableCell>{schedule.turma}</TableCell>
                      <TableCell>
                        {editingSchedule === schedule.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={professorValue}
                              onChange={(e) => setProfessorValue(e.target.value)}
                              placeholder="Nome do professor"
                              className="h-8"
                              autoFocus
                            />
                          </div>
                        ) : (
                          <span className={schedule.professor ? "text-foreground" : "text-muted-foreground italic"}>
                            {schedule.professor || "Não atribuído"}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingSchedule === schedule.id ? (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSaveProfessor(schedule)}
                              className="h-8 w-8 p-0"
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleCancelEdit}
                              className="h-8 w-8 p-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditProfessor(schedule.id, schedule.professor)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}

      {Object.keys(schedulesByCourse).length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center py-10">
            <div className="text-center">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum horário encontrado</h3>
              <p className="text-muted-foreground">
                Não existem horários configurados no sistema.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HorariosProfessores;