
export interface Aluno {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  curso: string;
  numeroEstudante?: string;
  dataInscricao: string;
  status: 'inscrito' | 'confirmado' | 'cancelado';
  observacoes?: string;
  // Dados pessoais adicionais do formulário de inscrição
  numeroBI?: string;
  dataNascimento?: string;
  endereco?: string;
  formaPagamento?: 'Cash' | 'Transferencia' | 'Cartao';
  duracao?: string;
  dataInicio?: string;
  turno?: string;
  par?: string;
  turma?: string;
}

export interface TurmaIndividual {
  sala: string;
  capacidade: number;
  alunosInscritos: number;
  horarioSemanal: Record<string, string>;
  alunos: Aluno[];
}

export interface TurmaPair {
  id: string;
  nome: string;
  periodo: 'manha' | 'tarde';
  horarioPeriodo: string;
  grupoCursos: 'engenharias' | 'saude' | 'ciencias-sociais-humanas';
  cursos: string[];
  disciplinasComuns: string[];
  horarioSemanal: Record<string, string>; // horário base (ainda mantido para compatibilidade)
  turmaA: TurmaIndividual;
  turmaB: TurmaIndividual;
  ativo: boolean;
  criadoEm: string;
}

export interface CreateTurmaPairData {
  periodo: 'manha' | 'tarde';
  grupoCursos: 'engenharias' | 'saude' | 'ciencias-sociais-humanas';
  cursos: string[];
  salaA: string;
  capacidadeA: number;
  salaB: string;
  capacidadeB: number;
}

export const salas = [
  "U107", "U108", "U109", "U110", "U111", "U112", "U113",
  "Lab01", "Lab02", "Lab03",
  "Auditório", "Sala A1", "Sala A2", "Sala A3"
];

export const gruposCursos = {
  'engenharias': {
    nome: 'Cursos de Engenharia',
    cursos: [
      'engenharia-informatica',
      'engenharia-civil', 
      'engenharia-mecatronica',
      'engenharia-industrial-sistemas-electricos',
      'engenharia-agropecuaria',
      'arquitectura-urbanismo'
    ]
  },
  'saude': {
    nome: 'Cursos da Área da Saúde',
    cursos: [
      'medicina',
      'analises-clinicas',
      'enfermagem',
      'cardiopneumologia',
      'fisioterapia',
      'psicologia'
    ]
  },
  'ciencias-sociais-humanas': {
    nome: 'Cursos das Ciências Sociais e Humanas',
    cursos: [
      'direito',
      'gestao-administracao',
      'lingua-portuguesa',
      'economia',
      'turismo-gestao-hoteleira'
    ]
  }
};
