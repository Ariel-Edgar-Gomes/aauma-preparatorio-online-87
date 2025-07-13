
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, MapPin, Users } from "lucide-react";
import { Schedule, courseNames, dayNames } from "@/types/schedule";

interface ScheduleListProps {
  schedules: Schedule[];
  onEditSchedule: (schedule: Schedule) => void;
  onDeleteSchedule: (id: string) => void;
}

export const ScheduleList = ({ schedules, onEditSchedule, onDeleteSchedule }: ScheduleListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-aauma-navy">Todos os Horários</CardTitle>
        <CardDescription>
          Lista completa de horários cadastrados ({schedules.length} total) - {Object.keys(courseNames).length} cursos disponíveis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Curso</TableHead>
                <TableHead>Dia</TableHead>
                <TableHead>Horário</TableHead>
                <TableHead>Disciplina</TableHead>
                <TableHead>Professor</TableHead>
                <TableHead>Sala/Turma</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{courseNames[schedule.curso]}</p>
                      <Badge variant="secondary" className="text-xs">
                        {schedule.turno === 'manha' ? 'Manhã' : 'Tarde'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>{dayNames[schedule.diaSemana]}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {schedule.horarioInicio} - {schedule.horarioFim}
                  </TableCell>
                  <TableCell className="font-medium">{schedule.disciplina}</TableCell>
                  <TableCell className="text-sm">{schedule.professor}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        <MapPin className="w-3 h-3 mr-1" />
                        {schedule.sala}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Users className="w-3 h-3 mr-1" />
                        {schedule.turma}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEditSchedule(schedule)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDeleteSchedule(schedule.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
