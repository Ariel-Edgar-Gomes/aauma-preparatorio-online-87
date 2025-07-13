import { useState, useEffect } from "react";
import { TurmaPair, CreateTurmaPairData, salas, Aluno } from "@/types/turma";
import { useToast } from "@/hooks/use-toast";
import { disciplinesByDayAndCourse } from "@/types/schedule";
import { useSupabaseTurmaData } from "@/hooks/useSupabaseTurmaData";

// Função para gerar alunos mock
const gerarAlunosMock = (quantidade: number, cursos: string[]): Aluno[] => {
  const nomes = [
    "João Silva", "Maria Santos", "Pedro Costa", "Ana Ferreira", "Carlos Oliveira",
    "Sofia Martins", "Miguel Torres", "Inês Pereira", "Tiago Rodrigues", "Catarina Lopes",
    "Ricardo Sousa", "Joana Alves", "André Gomes", "Beatriz Lima", "Nuno Cardoso",
    "Francisca Reis", "Diogo Fernandes", "Mariana Pinto", "Bruno Correia", "Patrícia Mendes",
    "Rui Castro", "Helena Barbosa", "Luís Marques", "Cristina Moreira", "Paulo Neves",
    "Isabel Campos", "Fernando Ramos", "Teresa Duarte", "António Macedo", "Susana Vieira"
  ];
  
  const emails = [
    "joao.silva@email.com", "maria.santos@email.com", "pedro.costa@email.com", 
    "ana.ferreira@email.com", "carlos.oliveira@email.com", "sofia.martins@email.com",
    "miguel.torres@email.com", "ines.pereira@email.com", "tiago.rodrigues@email.com",
    "catarina.lopes@email.com", "ricardo.sousa@email.com", "joana.alves@email.com",
    "andre.gomes@email.com", "beatriz.lima@email.com", "nuno.cardoso@email.com",
    "francisca.reis@email.com", "diogo.fernandes@email.com", "mariana.pinto@email.com",
    "bruno.correia@email.com", "patricia.mendes@email.com", "rui.castro@email.com",
    "helena.barbosa@email.com", "luis.marques@email.com", "cristina.moreira@email.com",
    "paulo.neves@email.com", "isabel.campos@email.com", "fernando.ramos@email.com",
    "teresa.duarte@email.com", "antonio.macedo@email.com", "susana.vieira@email.com"
  ];

  const telefones = [
    "912345678", "923456789", "934567890", "945678901", "956789012",
    "967890123", "978901234", "989012345", "990123456", "901234567",
    "912345670", "923456781", "934567892", "945678903", "956789014",
    "967890125", "978901236", "989012347", "990123458", "901234569",
    "912345671", "923456782", "934567893", "945678904", "956789015",
    "967890126", "978901237", "989012348", "990123459", "901234560"
  ];

  const status: ('inscrito' | 'confirmado' | 'cancelado')[] = ['inscrito', 'confirmado', 'cancelado'];
  
  return Array.from({ length: quantidade }, (_, index) => ({
    id: `aluno-${Date.now()}-${index}`,
    nome: nomes[index % nomes.length],
    email: emails[index % emails.length],
    telefone: telefones[index % telefones.length],
    curso: cursos[Math.floor(Math.random() * cursos.length)],
    numeroEstudante: `EST${String(20250000 + index).padStart(8, '0')}`,
    dataInscricao: new Date(2025, 0, Math.floor(Math.random() * 15) + 1).toISOString().split('T')[0],
    status: status[Math.floor(Math.random() * 3)],
    observacoes: Math.random() > 0.7 ? "Observação adicional" : undefined
  }));
};

// Funções auxiliares
const calcularDisciplinasComuns = (cursos: string[]): string[] => {
  if (cursos.length === 0) return [];
  
  const todasDisciplinas = cursos.map(curso => {
    const horarios = disciplinesByDayAndCourse[curso] || {};
    return Object.values(horarios).filter(d => d && d !== "-").flatMap(d => d.split(", "));
  });
  
  if (todasDisciplinas.length === 0) return [];
  
  return todasDisciplinas[0].filter(disciplina => 
    todasDisciplinas.every(cursoDisciplinas => cursoDisciplinas.includes(disciplina))
  );
};

const gerarHorarioSemanal = (cursos: string[]): Record<string, string> => {
  const horarioSemanal: Record<string, string> = {
    "segunda": "-",
    "terca": "-", 
    "quarta": "-",
    "quinta": "-",
    "sexta": "-"
  };

  if (cursos.length === 0) return horarioSemanal;

  // Usar o primeiro curso como base para o horário
  const cursoBase = cursos[0];
  const disciplinasDoCurso = disciplinesByDayAndCourse[cursoBase];
  
  if (disciplinasDoCurso) {
    Object.keys(horarioSemanal).forEach(dia => {
      const disciplinas = disciplinasDoCurso[dia];
      if (disciplinas && disciplinas !== "-") {
        horarioSemanal[dia] = disciplinas;
      }
    });
  }

  console.log('[useTurmaData] Horário gerado:', horarioSemanal, 'para cursos:', cursos);
  return horarioSemanal;
};

// Gerar horários específicos para Turma A (manhã mais cedo / tarde mais cedo)
const gerarHorarioTurmaA = (cursos: string[], cursoEspecifico?: string): Record<string, string> => {
  // Se um curso específico foi fornecido, usar apenas seu horário
  if (cursoEspecifico && disciplinesByDayAndCourse[cursoEspecifico]) {
    const horarioCursoEspecifico = { ...disciplinesByDayAndCourse[cursoEspecifico] };
    console.log('[useTurmaData] Horário Turma A gerado para curso específico:', cursoEspecifico, horarioCursoEspecifico);
    return horarioCursoEspecifico;
  }
  
  // Caso contrário, usar o primeiro curso como base
  const horarioBase = gerarHorarioSemanal(cursos);
  return horarioBase;
};

// Função para inverter ordem das disciplinas em dias com duas matérias (MESMA LÓGICA DO TURMAPAIRGRID)
const inverterHorarios = (horario: string): string => {
  if (horario === '–' || horario === '-' || !horario.includes(',')) {
    return horario; // Retorna inalterado se não tem vírgula (uma ou nenhuma disciplina)
  }
  
  // Inverte a ordem das disciplinas separadas por vírgula
  const disciplinas = horario.split(',').map(d => d.trim());
  return disciplinas.reverse().join(', ');
};

// Gerar horários específicos para Turma B (manhã mais tarde / tarde mais tarde)
const gerarHorarioTurmaB = (cursos: string[], cursoEspecifico?: string): Record<string, string> => {
  // Se um curso específico foi fornecido, usar seu horário com inversão correta
  if (cursoEspecifico && disciplinesByDayAndCourse[cursoEspecifico]) {
    const horarioBase = { ...disciplinesByDayAndCourse[cursoEspecifico] };
    
    // Aplicar a MESMA lógica do TurmaPairGrid - inverter disciplinas nos dias com vírgula
    const horarioTurmaB = {
      segunda: inverterHorarios(horarioBase.segunda || '-'),
      terca: inverterHorarios(horarioBase.terca || '-'),
      quarta: inverterHorarios(horarioBase.quarta || '-'),
      quinta: inverterHorarios(horarioBase.quinta || '-'),
      sexta: inverterHorarios(horarioBase.sexta || '-')
    };
    
    console.log('[useTurmaData] Horário Turma B gerado para curso específico:', cursoEspecifico, 'INVERTIDO:', horarioTurmaB, 'baseado em:', horarioBase);
    return horarioTurmaB;
  }
  
  // Caso contrário, usar o horário base com inversão
  const horarioBase = gerarHorarioSemanal(cursos);
  const horarioTurmaB = {
    segunda: inverterHorarios(horarioBase.segunda || '-'),
    terca: inverterHorarios(horarioBase.terca || '-'),
    quarta: inverterHorarios(horarioBase.quarta || '-'),
    quinta: inverterHorarios(horarioBase.quinta || '-'),
    sexta: inverterHorarios(horarioBase.sexta || '-')
  };
  
  console.log('[useTurmaData] Horário Turma B gerado COM INVERSÃO:', horarioTurmaB, 'baseado em:', horarioBase);
  return horarioTurmaB;
};

export const useTurmaData = () => {
  // Usar dados do Supabase por padrão, com fallback para mock data
  const USE_SUPABASE = true; // Configuração para alternar entre Supabase e mock
  
  const supabaseData = useSupabaseTurmaData();
  const { toast } = useToast();
  const [turmaPairs, setTurmaPairs] = useState<TurmaPair[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Se usar Supabase, retornar os dados do Supabase
  if (USE_SUPABASE) {
    return supabaseData;
  }

  useEffect(() => {
    // Mock data com todos os cursos organizados por grupos
    const mockTurmaPairs: TurmaPair[] = [
      // Engenharias - Manhã
      {
        id: "1",
        nome: "Par 1 - Manhã",
        periodo: "manha",
        horarioPeriodo: "08h00 - 12h00",
        grupoCursos: "engenharias",
        cursos: ["engenharia-informatica", "engenharia-civil", "engenharia-mecatronica"],
        disciplinasComuns: ["L.P", "Matemática", "Física"],
        horarioSemanal: {
          "segunda": "L.P",
          "terca": "-",
          "quarta": "L.P, Mat",
          "quinta": "Física",
          "sexta": "Matemática"
        },
        turmaA: {
          sala: "U107",
          capacidade: 30,
          alunosInscritos: 25,
          horarioSemanal: gerarHorarioTurmaA(["engenharia-informatica", "engenharia-civil", "engenharia-mecatronica"]),
          alunos: gerarAlunosMock(25, ["engenharia-informatica", "engenharia-civil", "engenharia-mecatronica"])
        },
        turmaB: {
          sala: "U108", 
          capacidade: 30,
          alunosInscritos: 28,
          horarioSemanal: gerarHorarioTurmaB(["engenharia-informatica", "engenharia-civil", "engenharia-mecatronica"]),
          alunos: gerarAlunosMock(28, ["engenharia-informatica", "engenharia-civil", "engenharia-mecatronica"])
        },
        ativo: true,
        criadoEm: "2025-01-15"
      },
      // Engenharias - Tarde (demais cursos)
      {
        id: "2",
        nome: "Par 1 - Tarde",
        periodo: "tarde",
        horarioPeriodo: "13h00 - 17h00",
        grupoCursos: "engenharias",
        cursos: ["engenharia-industrial-sistemas-electricos", "engenharia-agropecuaria", "arquitectura-urbanismo"],
        disciplinasComuns: ["L.P", "Matemática", "Física"],
        horarioSemanal: {
          "segunda": "L.P",
          "terca": "-",
          "quarta": "L.P, Mat",
          "quinta": "Física",
          "sexta": "Matemática"
        },
        turmaA: {
          sala: "U109",
          capacidade: 30,
          alunosInscritos: 15,
          horarioSemanal: gerarHorarioTurmaA(["engenharia-industrial-sistemas-electricos", "engenharia-agropecuaria", "arquitectura-urbanismo"]),
          alunos: gerarAlunosMock(15, ["engenharia-industrial-sistemas-electricos", "engenharia-agropecuaria", "arquitectura-urbanismo"])
        },
        turmaB: {
          sala: "U110",
          capacidade: 30,
          alunosInscritos: 18,
          horarioSemanal: gerarHorarioTurmaB(["engenharia-industrial-sistemas-electricos", "engenharia-agropecuaria", "arquitectura-urbanismo"]),
          alunos: gerarAlunosMock(18, ["engenharia-industrial-sistemas-electricos", "engenharia-agropecuaria", "arquitectura-urbanismo"])
        },
        ativo: true,
        criadoEm: "2025-01-15"
      },
      // Saúde - Manhã (incluindo medicina)
      {
        id: "3",
        nome: "Par 2 - Manhã",
        periodo: "manha",
        horarioPeriodo: "08h00 - 12h00",
        grupoCursos: "saude",
        cursos: ["medicina", "analises-clinicas", "enfermagem"],
        disciplinasComuns: ["Biologia", "Química", "Matemática"],
        horarioSemanal: {
          "segunda": "-",
          "terca": "Biologia, Química",
          "quarta": "Matemática",
          "quinta": "-",
          "sexta": "Matemática, Biologia"
        },
        turmaA: {
          sala: "U111",
          capacidade: 30,
          alunosInscritos: 28,
          horarioSemanal: gerarHorarioTurmaA(["medicina", "analises-clinicas", "enfermagem"]),
          alunos: gerarAlunosMock(28, ["medicina", "analises-clinicas", "enfermagem"])
        },
        turmaB: {
          sala: "U112",
          capacidade: 30,
          alunosInscritos: 25,
          horarioSemanal: gerarHorarioTurmaB(["medicina", "analises-clinicas", "enfermagem"]),
          alunos: gerarAlunosMock(25, ["medicina", "analises-clinicas", "enfermagem"])
        },
        ativo: true,
        criadoEm: "2025-01-15"
      },
      // Saúde - Tarde (demais cursos)
      {
        id: "4",
        nome: "Par 2 - Tarde",
        periodo: "tarde",
        horarioPeriodo: "13h00 - 17h00",
        grupoCursos: "saude",
        cursos: ["cardiopneumologia", "fisioterapia", "psicologia"],
        disciplinasComuns: ["Biologia", "Química", "Matemática"],
        horarioSemanal: {
          "segunda": "-",
          "terca": "Biologia, Química",
          "quarta": "Matemática",
          "quinta": "-",
          "sexta": "Matemática, Biologia"
        },
        turmaA: {
          sala: "U113",
          capacidade: 30,
          alunosInscritos: 22,
          horarioSemanal: gerarHorarioTurmaA(["cardiopneumologia", "fisioterapia", "psicologia"]),
          alunos: gerarAlunosMock(22, ["cardiopneumologia", "fisioterapia", "psicologia"])
        },
        turmaB: {
          sala: "Lab01",
          capacidade: 30,
          alunosInscritos: 26,
          horarioSemanal: gerarHorarioTurmaB(["cardiopneumologia", "fisioterapia", "psicologia"]),
          alunos: gerarAlunosMock(26, ["cardiopneumologia", "fisioterapia", "psicologia"])
        },
        ativo: true,
        criadoEm: "2025-01-15"
      },
      // Ciências Sociais e Humanas - Manhã
      {
        id: "5",
        nome: "Par 3 - Manhã",
        periodo: "manha",
        horarioPeriodo: "08h00 - 12h00",
        grupoCursos: "ciencias-sociais-humanas",
        cursos: ["direito", "gestao-administracao", "lingua-portuguesa"],
        disciplinasComuns: ["História", "L.P", "Matemática"],
        horarioSemanal: {
          "segunda": "História, L.P",
          "terca": "-",
          "quarta": "L.P, Matemática",
          "quinta": "-",
          "sexta": "Matemática"
        },
        turmaA: {
          sala: "Lab02",
          capacidade: 30,
          alunosInscritos: 20,
          horarioSemanal: gerarHorarioTurmaA(["direito", "gestao-administracao", "lingua-portuguesa"]),
          alunos: gerarAlunosMock(20, ["direito", "gestao-administracao", "lingua-portuguesa"])
        },
        turmaB: {
          sala: "Lab03",
          capacidade: 30,
          alunosInscritos: 24,
          horarioSemanal: gerarHorarioTurmaB(["direito", "gestao-administracao", "lingua-portuguesa"]),
          alunos: gerarAlunosMock(24, ["direito", "gestao-administracao", "lingua-portuguesa"])
        },
        ativo: true,
        criadoEm: "2025-01-15"
      },
      // Ciências Sociais e Humanas - Tarde
      {
        id: "6",
        nome: "Par 3 - Tarde",
        periodo: "tarde",
        horarioPeriodo: "13h00 - 17h00",
        grupoCursos: "ciencias-sociais-humanas",
        cursos: ["economia", "turismo-gestao-hoteleira"],
        disciplinasComuns: ["História", "L.P", "Matemática"],
        horarioSemanal: {
          "segunda": "História, L.P",
          "terca": "-",
          "quarta": "L.P, Matemática",
          "quinta": "-",
          "sexta": "Matemática"
        },
        turmaA: {
          sala: "Auditório",
          capacidade: 30,
          alunosInscritos: 12,
          horarioSemanal: gerarHorarioTurmaA(["economia", "turismo-gestao-hoteleira"]),
          alunos: gerarAlunosMock(12, ["economia", "turismo-gestao-hoteleira"])
        },
        turmaB: {
          sala: "Sala A1",
          capacidade: 30,
          alunosInscritos: 16,
          horarioSemanal: gerarHorarioTurmaB(["economia", "turismo-gestao-hoteleira"]),
          alunos: gerarAlunosMock(16, ["economia", "turismo-gestao-hoteleira"])
        },
        ativo: true,
        criadoEm: "2025-01-15"
      }
    ];

    setTimeout(() => {
      setTurmaPairs(mockTurmaPairs);
      setLoading(false);
      console.log('[useTurmaData] Turma pairs carregados:', mockTurmaPairs);
    }, 1000);
  }, []);

  const handleCreateTurmaPair = (data: CreateTurmaPairData) => {
    try {
      // Calcular disciplinas comuns baseado nos cursos selecionados
      const disciplinasComuns = calcularDisciplinasComuns(data.cursos);
      const horarioSemanal = gerarHorarioSemanal(data.cursos);
      
      // Gerar nome numérico baseado no período
      const paresDoMesmoPeriodo = turmaPairs.filter(par => par.periodo === data.periodo);
      const proximoNumero = paresDoMesmoPeriodo.length + 1;
      const nomePeriodo = data.periodo === 'manha' ? 'Manhã' : 'Tarde';
      
      const horarioPeriodo = data.periodo === 'manha' ? '08h00 - 12h00' : '13h00 - 17h00';
      
      const newTurmaPair: TurmaPair = {
        id: (turmaPairs.length + 1).toString(),
        nome: `Par ${proximoNumero} - ${nomePeriodo}`,
        periodo: data.periodo,
        horarioPeriodo,
        grupoCursos: data.grupoCursos,
        cursos: data.cursos,
        disciplinasComuns,
        horarioSemanal,
        turmaA: {
          sala: data.salaA,
          capacidade: data.capacidadeA,
          alunosInscritos: 0,
          horarioSemanal: gerarHorarioTurmaA(data.cursos),
          alunos: []
        },
        turmaB: {
          sala: data.salaB,
          capacidade: data.capacidadeB,
          alunosInscritos: 0,
          horarioSemanal: gerarHorarioTurmaB(data.cursos),
          alunos: []
        },
        ativo: true,
        criadoEm: new Date().toISOString().split('T')[0]
      };

      setTurmaPairs(prev => [...prev, newTurmaPair]);
      
      toast({
        title: "Par de turmas criado",
        description: "Novo par de turmas adicionado com sucesso.",
      });

      console.log('[useTurmaData] Turma pair created successfully');
      return true;
    } catch (error) {
      console.error('[useTurmaData] Error creating turma pair:', error);
      toast({
        title: "Erro ao criar",
        description: "Erro ao criar o par de turmas.",
        variant: "destructive"
      });
      return false;
    }
  };

  const handleDeleteTurmaPair = (id: string) => {
    setTurmaPairs(prev => prev.filter(t => t.id !== id));
    toast({
      title: "Par de turmas excluído",
      description: "O par de turmas foi removido com sucesso.",
    });
    console.log('[useTurmaData] Turma pair deleted:', id);
  };

  const handleToggleStatus = (id: string) => {
    setTurmaPairs(prev => prev.map(t => 
      t.id === id ? { ...t, ativo: !t.ativo } : t
    ));
    
    const turma = turmaPairs.find(t => t.id === id);
    toast({
      title: turma?.ativo ? "Par de turmas desativado" : "Par de turmas ativado",
      description: `Status alterado com sucesso.`,
    });
  };

  const handleDuplicatePair = (periodo: 'manha' | 'tarde') => {
    // Encontrar um par existente do período especificado para usar como template
    const templatePair = turmaPairs.find(pair => pair.periodo === periodo);
    
    if (!templatePair) {
      toast({
        title: "Erro ao duplicar",
        description: `Não foi encontrado nenhum par de ${periodo === 'manha' ? 'manhã' : 'tarde'} para duplicar.`,
        variant: "destructive"
      });
      return false;
    }

    // Calcular próximo número sequencial para o período
    const paresDoMesmoPeriodo = turmaPairs.filter(pair => pair.periodo === periodo);
    const proximoNumero = paresDoMesmoPeriodo.length + 1;
    const nomePeriodo = periodo === 'manha' ? 'Manhã' : 'Tarde';
    
    // Encontrar salas disponíveis (não utilizadas)
    const salasUtilizadas = turmaPairs.flatMap(pair => [pair.turmaA.sala, pair.turmaB.sala]);
    const salasDisponiveis = salas.filter(sala => !salasUtilizadas.includes(sala));
    
    if (salasDisponiveis.length < 2) {
      toast({
        title: "Erro ao duplicar",
        description: "Não há salas suficientes disponíveis para criar um novo par.",
        variant: "destructive"
      });
      return false;
    }

    const newTurmaPair: TurmaPair = {
      id: (turmaPairs.length + 1).toString(),
      nome: `Par ${proximoNumero} - ${nomePeriodo}`,
      periodo: templatePair.periodo,
      horarioPeriodo: templatePair.horarioPeriodo,
      grupoCursos: templatePair.grupoCursos,
      cursos: [...templatePair.cursos], // cópia dos cursos
      disciplinasComuns: [...templatePair.disciplinasComuns], // cópia das disciplinas
      horarioSemanal: { ...templatePair.horarioSemanal }, // cópia do horário
      turmaA: {
        sala: salasDisponiveis[0], // primeira sala disponível
        capacidade: templatePair.turmaA.capacidade,
        alunosInscritos: 0,
        horarioSemanal: gerarHorarioTurmaA(templatePair.cursos),
        alunos: []
      },
      turmaB: {
        sala: salasDisponiveis[1], // segunda sala disponível
        capacidade: templatePair.turmaB.capacidade,
        alunosInscritos: 0,
        horarioSemanal: gerarHorarioTurmaB(templatePair.cursos),
        alunos: []
      },
      ativo: true,
      criadoEm: new Date().toISOString().split('T')[0]
    };

    setTurmaPairs(prev => [...prev, newTurmaPair]);
    
    toast({
      title: "Par de turmas duplicado",
      description: `${newTurmaPair.nome} criado com base no template existente.`,
    });

    console.log('[useTurmaData] Turma pair duplicated:', newTurmaPair);
    return true;
  };

  const handleUpdateTurmaPair = (id: string, updates: Partial<TurmaPair>) => {
    setTurmaPairs(prev => prev.map(pair => 
      pair.id === id ? { ...pair, ...updates } : pair
    ));
    
    toast({
      title: "Par atualizado",
      description: "As alterações foram salvas com sucesso.",
    });
    console.log('[useTurmaData] Turma pair updated:', id, updates);
  };

  return {
    turmaPairs,
    loading,
    handleCreateTurmaPair,
    handleUpdateTurmaPair,
    handleDeleteTurmaPair,
    handleToggleStatus,
    handleDuplicatePair
  };
};
