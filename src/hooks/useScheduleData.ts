import { useState, useEffect } from "react";
import { Schedule } from "@/types/schedule";
import { useToast } from "@/hooks/use-toast";

export const useScheduleData = () => {
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockSchedules: Schedule[] = [
      // === MEDICINA ===
      // Segunda: Matemática
      {
        id: "1",
        curso: "medicina",
        turno: "manha",
        diaSemana: "segunda",
        horarioInicio: "08:00",
        horarioFim: "10:00",
        disciplina: "Matemática",
        professor: "Dr. António Silva",
        sala: "U107",
        turma: "A"
      },
      // Terça: Física
      {
        id: "2",
        curso: "medicina",
        turno: "manha",
        diaSemana: "terca",
        horarioInicio: "08:00",
        horarioFim: "10:00",
        disciplina: "Física",
        professor: "Prof. Maria Santos",
        sala: "U107",
        turma: "A"
      },
      // Quarta: Química
      {
        id: "3",
        curso: "medicina",
        turno: "manha",
        diaSemana: "quarta",
        horarioInicio: "08:00",
        horarioFim: "10:00",
        disciplina: "Química",
        professor: "Dr. João Costa",
        sala: "U107",
        turma: "A"
      },
      // Quinta: Biologia
      {
        id: "4",
        curso: "medicina",
        turno: "manha",
        diaSemana: "quinta",
        horarioInicio: "08:00",
        horarioFim: "10:00",
        disciplina: "Biologia",
        professor: "Prof. Ana Ferreira",
        sala: "U107",
        turma: "A"
      },
      // Sexta: Matemática
      {
        id: "5",
        curso: "medicina",
        turno: "manha",
        diaSemana: "sexta",
        horarioInicio: "08:00",
        horarioFim: "10:00",
        disciplina: "Matemática",
        professor: "Dr. António Silva",
        sala: "U107",
        turma: "A"
      },

      // === ENGENHARIA CIVIL ===
      // Segunda: L.P
      {
        id: "6",
        curso: "engenharia-civil",
        turno: "manha",
        diaSemana: "segunda",
        horarioInicio: "08:00",
        horarioFim: "10:00",
        disciplina: "L.P",
        professor: "Prof. Isabel Torres",
        sala: "U108",
        turma: "A"
      },
      // Quarta: L.P, Mat
      {
        id: "7",
        curso: "engenharia-civil",
        turno: "manha",
        diaSemana: "quarta",
        horarioInicio: "08:00",
        horarioFim: "10:00",
        disciplina: "L.P, Mat",
        professor: "Prof. Pedro Ramos",
        sala: "U108",
        turma: "A"
      },
      // Quinta: Física, Desenho
      {
        id: "8",
        curso: "engenharia-civil",
        turno: "manha",
        diaSemana: "quinta",
        horarioInicio: "08:00",
        horarioFim: "10:00",
        disciplina: "Física, Desenho",
        professor: "Dr. Sofia Martins",
        sala: "U108",
        turma: "A"
      },
      // Sexta: Matemática
      {
        id: "9",
        curso: "engenharia-civil",
        turno: "manha",
        diaSemana: "sexta",
        horarioInicio: "08:00",
        horarioFim: "10:00",
        disciplina: "Matemática",
        professor: "Dr. António Silva",
        sala: "U108",
        turma: "A"
      },

      // === ENGENHARIA INFORMÁTICA ===
      // Segunda: L.P
      {
        id: "10",
        curso: "engenharia-informatica",
        turno: "tarde",
        diaSemana: "segunda",
        horarioInicio: "14:00",
        horarioFim: "16:00",
        disciplina: "L.P",
        professor: "Prof. Isabel Torres",
        sala: "U109",
        turma: "A"
      },
      // Quarta: L.P, Mat
      {
        id: "11",
        curso: "engenharia-informatica",
        turno: "tarde",
        diaSemana: "quarta",
        horarioInicio: "14:00",
        horarioFim: "16:00",
        disciplina: "L.P, Mat",
        professor: "Prof. Pedro Ramos",
        sala: "U109",
        turma: "A"
      },
      // Quinta: Física
      {
        id: "12",
        curso: "engenharia-informatica",
        turno: "tarde",
        diaSemana: "quinta",
        horarioInicio: "14:00",
        horarioFim: "16:00",
        disciplina: "Física",
        professor: "Dr. Paulo Mendes",
        sala: "U109",
        turma: "A"
      },
      // Sexta: Matemática
      {
        id: "13",
        curso: "engenharia-informatica",
        turno: "tarde",
        diaSemana: "sexta",
        horarioInicio: "14:00",
        horarioFim: "16:00",
        disciplina: "Matemática",
        professor: "Dr. António Silva",
        sala: "U109",
        turma: "A"
      },

      // === ENFERMAGEM ===
      // Terça: Biologia, Química
      {
        id: "14",
        curso: "enfermagem",
        turno: "manha",
        diaSemana: "terca",
        horarioInicio: "08:00",
        horarioFim: "10:00",
        disciplina: "Biologia, Química",
        professor: "Dr. Carlos Gomes",
        sala: "U110",
        turma: "A"
      },
      // Quarta: Matemática
      {
        id: "15",
        curso: "enfermagem",
        turno: "manha",
        diaSemana: "quarta",
        horarioInicio: "08:00",
        horarioFim: "10:00",
        disciplina: "Matemática",
        professor: "Dr. António Silva",
        sala: "U110",
        turma: "A"
      },
      // Sexta: Matemática, Biologia
      {
        id: "16",
        curso: "enfermagem",
        turno: "manha",
        diaSemana: "sexta",
        horarioInicio: "08:00",
        horarioFim: "10:00",
        disciplina: "Matemática, Biologia",
        professor: "Prof. Fernanda Lima",
        sala: "U110",
        turma: "A"
      },

      // === PSICOLOGIA ===
      // Terça: Biologia, Química
      {
        id: "17",
        curso: "psicologia",
        turno: "tarde",
        diaSemana: "terca",
        horarioInicio: "14:00",
        horarioFim: "16:00",
        disciplina: "Biologia, Química",
        professor: "Dr. Sofia Martins",
        sala: "U111",
        turma: "A"
      },
      // Quarta: Matemática
      {
        id: "18",
        curso: "psicologia",
        turno: "tarde",
        diaSemana: "quarta",
        horarioInicio: "14:00",
        horarioFim: "16:00",
        disciplina: "Matemática",
        professor: "Prof. Pedro Ramos",
        sala: "U111",
        turma: "A"
      },
      // Sexta: Matemática, Biologia
      {
        id: "19",
        curso: "psicologia",
        turno: "tarde",
        diaSemana: "sexta",
        horarioInicio: "14:00",
        horarioFim: "16:00",
        disciplina: "Matemática, Biologia",
        professor: "Prof. Ana Ferreira",
        sala: "U111",
        turma: "A"
      },

      // === DIREITO ===
      // Segunda: História, L.P
      {
        id: "20",
        curso: "direito",
        turno: "manha",
        diaSemana: "segunda",
        horarioInicio: "08:00",
        horarioFim: "10:00",
        disciplina: "História, L.P",
        professor: "Prof. Ricardo Lopes",
        sala: "U112",
        turma: "A"
      },
      // Quarta: L.P, Matemática
      {
        id: "21",
        curso: "direito",
        turno: "manha",
        diaSemana: "quarta",
        horarioInicio: "08:00",
        horarioFim: "10:00",
        disciplina: "L.P, Matemática",
        professor: "Dr. Catarina Neves",
        sala: "U112",
        turma: "A"
      },
      // Sexta: Matemática
      {
        id: "22",
        curso: "direito",
        turno: "manha",
        diaSemana: "sexta",
        horarioInicio: "08:00",
        horarioFim: "10:00",
        disciplina: "Matemática",
        professor: "Dr. António Silva",
        sala: "U112",
        turma: "A"
      },

      // === ECONOMIA ===
      // Segunda: História, L.P
      {
        id: "23",
        curso: "economia",
        turno: "tarde",
        diaSemana: "segunda",
        horarioInicio: "14:00",
        horarioFim: "16:00",
        disciplina: "História, L.P",
        professor: "Prof. Ricardo Lopes",
        sala: "U113",
        turma: "A"
      },
      // Quarta: L.P, Matemática
      {
        id: "24",
        curso: "economia",
        turno: "tarde",
        diaSemana: "quarta",
        horarioInicio: "14:00",
        horarioFim: "16:00",
        disciplina: "L.P, Matemática",
        professor: "Dr. Catarina Neves",
        sala: "U113",
        turma: "A"
      },
      // Sexta: Matemática
      {
        id: "25",
        curso: "economia",
        turno: "tarde",
        diaSemana: "sexta",
        horarioInicio: "14:00",
        horarioFim: "16:00",
        disciplina: "Matemática",
        professor: "Prof. Fernanda Lima",
        sala: "U113",
        turma: "A"
      }
    ];

    setTimeout(() => {
      setSchedules(mockSchedules);
      setLoading(false);
    }, 1000);

    console.log('[useScheduleData] Mock schedules loaded:', mockSchedules.length);
  }, []);

  const handleSaveSchedule = (scheduleData: Omit<Schedule, 'id'>, editingSchedule?: Schedule) => {
    try {
      // Validate required fields
      const requiredFields = ['curso', 'turno', 'diaSemana', 'horarioInicio', 'horarioFim', 'disciplina', 'professor', 'sala', 'turma'];
      const missingFields = requiredFields.filter(field => !scheduleData[field as keyof typeof scheduleData]);
      
      if (missingFields.length > 0) {
        throw new Error(`Campos obrigatórios: ${missingFields.join(', ')}`);
      }

      if (editingSchedule) {
        // Update existing schedule
        const updatedSchedule = { ...editingSchedule, ...scheduleData };
        setSchedules(prev => prev.map(s => s.id === editingSchedule.id ? updatedSchedule : s));
        toast({
          title: "Horário atualizado",
          description: "As alterações foram salvas com sucesso.",
        });
      } else {
        // Add new schedule
        const newId = (schedules.length + 1).toString();
        setSchedules(prev => [...prev, { ...scheduleData, id: newId }]);
        toast({
          title: "Horário criado",
          description: "Novo horário adicionado com sucesso.",
        });
      }

      console.log('[useScheduleData] Schedule saved successfully');
      return true;
    } catch (error) {
      console.error('[useScheduleData] Error saving schedule:', error);
      toast({
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
      return false;
    }
  };

  const handleDeleteSchedule = (id: string) => {
    setSchedules(prev => prev.filter(s => s.id !== id));
    toast({
      title: "Horário excluído",
      description: "O horário foi removido com sucesso.",
    });
    console.log('[useScheduleData] Schedule deleted:', id);
  };

  const getSchedulesByDayAndCourse = (day: string, course: string) => {
    return schedules
      .filter(s => s.diaSemana === day && s.curso === course)
      .sort((a, b) => a.horarioInicio.localeCompare(b.horarioInicio));
  };

  return {
    schedules,
    loading,
    handleSaveSchedule,
    handleDeleteSchedule,
    getSchedulesByDayAndCourse
  };
};
