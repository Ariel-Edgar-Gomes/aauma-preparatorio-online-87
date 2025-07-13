
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { Schedule, courseNames, dayNames, professors, getAvailableDisciplines, getDisciplineByDay } from "@/types/schedule";

interface ScheduleFormProps {
  editingSchedule?: Schedule | null;
  onSave: (scheduleData: Omit<Schedule, 'id'>, editingSchedule?: Schedule) => boolean;
  onClose: () => void;
}

export const ScheduleForm = ({ editingSchedule, onSave, onClose }: ScheduleFormProps) => {
  const [formData, setFormData] = useState<Omit<Schedule, 'id'>>({
    curso: editingSchedule?.curso || "",
    turno: editingSchedule?.turno || "",
    diaSemana: editingSchedule?.diaSemana || "",
    horarioInicio: editingSchedule?.horarioInicio || "",
    horarioFim: editingSchedule?.horarioFim || "",
    disciplina: editingSchedule?.disciplina || "",
    professor: editingSchedule?.professor || "",
    sala: editingSchedule?.sala || "",
    turma: editingSchedule?.turma || ""
  });

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    const success = onSave(formData, editingSchedule || undefined);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Curso</Label>
          <Select 
            value={formData.curso} 
            onValueChange={(value) => {
              handleInputChange('curso', value);
              // Reset discipline when course changes
              handleInputChange('disciplina', '');
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent className="max-h-60 overflow-y-auto">
              {Object.entries(courseNames).map(([key, name]) => (
                <SelectItem key={key} value={key}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Turno</Label>
          <Select 
            value={formData.turno} 
            onValueChange={(value) => handleInputChange('turno', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manha">Manhã</SelectItem>
              <SelectItem value="tarde">Tarde</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Dia da Semana</Label>
        <Select 
          value={formData.diaSemana} 
          onValueChange={(value) => handleInputChange('diaSemana', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(dayNames).map(([key, name]) => (
              <SelectItem key={key} value={key}>{name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Hora Início</Label>
          <Input
            type="time"
            value={formData.horarioInicio}
            onChange={(e) => handleInputChange('horarioInicio', e.target.value)}
          />
        </div>

        <div>
          <Label>Hora Fim</Label>
          <Input
            type="time"
            value={formData.horarioFim}
            onChange={(e) => handleInputChange('horarioFim', e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label>Disciplina</Label>
        <Select 
          value={formData.disciplina} 
          onValueChange={(value) => handleInputChange('disciplina', value)}
          disabled={!formData.curso}
        >
          <SelectTrigger>
            <SelectValue placeholder={formData.curso ? "Selecione" : "Escolha um curso primeiro"} />
          </SelectTrigger>
          <SelectContent>
            {/* Mostrar disciplina específica do dia se disponível */}
            {formData.curso && formData.diaSemana && getDisciplineByDay(formData.curso, formData.diaSemana) && (
              <SelectItem value={getDisciplineByDay(formData.curso, formData.diaSemana)}>
                {getDisciplineByDay(formData.curso, formData.diaSemana)} (📅 Programada para {dayNames[formData.diaSemana]})
              </SelectItem>
            )}
            {/* Mostrar todas as disciplinas do curso como opções extras */}
            {formData.curso && getAvailableDisciplines(formData.curso).map((discipline) => (
              <SelectItem key={discipline} value={discipline}>{discipline}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {/* Sugestão da disciplina do dia */}
        {formData.curso && formData.diaSemana && getDisciplineByDay(formData.curso, formData.diaSemana) && (
          <p className="text-xs text-muted-foreground mt-1">
            📅 Disciplina programada para <strong>{dayNames[formData.diaSemana]}</strong>: <strong>{getDisciplineByDay(formData.curso, formData.diaSemana)}</strong>
          </p>
        )}
        {/* Mostrar quando não há disciplina programada para o dia */}
        {formData.curso && formData.diaSemana && !getDisciplineByDay(formData.curso, formData.diaSemana) && (
          <p className="text-xs text-orange-600 mt-1">
            ⚠️ Nenhuma disciplina programada para <strong>{dayNames[formData.diaSemana]}</strong> neste curso
          </p>
        )}
      </div>

      <div>
        <Label>Professor</Label>
        <Select 
          value={formData.professor} 
          onValueChange={(value) => handleInputChange('professor', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent className="max-h-60 overflow-y-auto">
            {professors.map((professor) => (
              <SelectItem key={professor} value={professor}>{professor}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Sala</Label>
          <Select 
            value={formData.sala} 
            onValueChange={(value) => handleInputChange('sala', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione ou digite nova sala" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="U107">U107</SelectItem>
              <SelectItem value="U108">U108</SelectItem>
              <SelectItem value="U109">U109</SelectItem>
              <SelectItem value="U110">U110</SelectItem>
              <SelectItem value="U111">U111</SelectItem>
              <SelectItem value="U112">U112</SelectItem>
              <SelectItem value="Lab01">Lab01</SelectItem>
              <SelectItem value="Lab02">Lab02</SelectItem>
              <SelectItem value="Auditório">Auditório</SelectItem>
            </SelectContent>
          </Select>
          <Input
            className="mt-2"
            placeholder="Ou digite nova sala (ex: U113, Lab03)"
            value={formData.sala}
            onChange={(e) => handleInputChange('sala', e.target.value)}
          />
        </div>

        <div>
          <Label>Turma</Label>
          <Select 
            value={formData.turma} 
            onValueChange={(value) => handleInputChange('turma', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A">Turma A</SelectItem>
              <SelectItem value="B">Turma B</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button onClick={handleSubmit} className="w-full bg-aauma-navy hover:bg-aauma-navy/90">
        <Save className="w-4 h-4 mr-2" />
        {editingSchedule ? 'Atualizar' : 'Criar'} Horário
      </Button>
    </div>
  );
};
