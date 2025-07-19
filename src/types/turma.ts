
// Types for Turma management system

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
  // Campos de arquivos
  foto_url?: string;
  copia_bi_url?: string;
  declaracao_certificado_url?: string;
  comprovativo_pagamento_url?: string;
  valor_pago?: number;
  // Informações do criador
  criador?: {
    nome: string;
    email: string;
  } | null;
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
  cursos: string[];
  salaA: string;
  capacidadeA: number;
  salaB: string;
  capacidadeB: number;
}

// Salas are now managed dynamically through the database

