import { supabase } from "@/integrations/supabase/client";

// Interface para os dados da base de dados
export interface DBTurmaPair {
  id: string;
  nome: string;
  periodo: 'manha' | 'tarde';
  horario_periodo: string;
  cursos: string[];
  disciplinas_comuns: string[];
  horario_semanal: Record<string, string>;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface DBTurma {
  id: string;
  turma_pair_id: string;
  tipo: 'A' | 'B';
  sala_id: string;
  capacidade: number;
  alunos_inscritos: number;
  horario_semanal: Record<string, string>;
  created_at: string;
  updated_at: string;
  salas?: {
    codigo: string;
    capacidade: number;
    tipo: string;
  };
}

export interface DBAluno {
  id: string;
  nome: string;
  email?: string;
  telefone: string;
  numero_bi: string;
  data_nascimento?: string;
  endereco?: string;
  numero_estudante: string;
  curso_codigo: string;
  turma_pair_id: string;
  turma_id: string;
  turno: string;
  duracao: string;
  data_inicio: string;
  forma_pagamento: 'Cash' | 'Transferencia' | 'Cartao';
  valor_pago: number;
  status: 'inscrito' | 'confirmado' | 'cancelado';
  data_inscricao: string;
  observacoes?: string;
  foto_url?: string;
  copia_bi_url?: string;
  declaracao_certificado_url?: string;
  comprovativo_pagamento_url?: string;
  created_at: string;
  updated_at: string;
}

export interface DBCurso {
  id: string;
  codigo: string;
  nome: string;
  grupo_cursos: 'engenharias' | 'saude' | 'ciencias-sociais-humanas';
  disciplinas: string[];
  horario_semanal: Record<string, string>;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface DBSala {
  id: string;
  codigo: string;
  capacidade: number;
  tipo: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

// Serviços para Cursos
export const cursosService = {
  async getAll() {
    const { data, error } = await supabase
      .from('cursos')
      .select('*')
      .eq('ativo', true)
      .order('nome');
    
    if (error) throw error;
    return data as DBCurso[];
  },

  async getByGrupo(grupo: 'engenharias' | 'saude' | 'ciencias-sociais-humanas') {
    const { data, error } = await supabase
      .from('cursos')
      .select('*')
      .eq('grupo_cursos', grupo)
      .eq('ativo', true)
      .order('nome');
    
    if (error) throw error;
    return data as DBCurso[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('cursos')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as DBCurso;
  },

  async getByCodigo(codigo: string) {
    const { data, error } = await supabase
      .from('cursos')
      .select('*')
      .eq('codigo', codigo)
      .single();
    
    if (error) throw error;
    return data as DBCurso;
  }
};

// Serviços para Salas
export const salasService = {
  async getAll() {
    const { data, error } = await supabase
      .from('salas')
      .select('*')
      .eq('ativo', true)
      .order('codigo');
    
    if (error) throw error;
    return data as DBSala[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('salas')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as DBSala;
  },

  async getByCodigo(codigo: string) {
    const { data, error } = await supabase
      .from('salas')
      .select('*')
      .eq('codigo', codigo)
      .single();
    
    if (error) throw error;
    return data as DBSala;
  },

  async create(sala: Omit<DBSala, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('salas')
      .insert(sala)
      .select()
      .single();
    
    if (error) throw error;
    return data as DBSala;
  }
};

// Serviços para Pares de Turmas
export const turmaPairsService = {
  async getAll() {
    const { data, error } = await supabase
      .from('turma_pairs')
      .select('*')
      .order('created_at');
    
    if (error) throw error;
    return data as DBTurmaPair[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('turma_pairs')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as DBTurmaPair;
  },

  async getByPeriodo(periodo: 'manha' | 'tarde') {
    const { data, error } = await supabase
      .from('turma_pairs')
      .select('*')
      .eq('periodo', periodo)
      .eq('ativo', true)
      .order('nome');
    
    if (error) throw error;
    return data as DBTurmaPair[];
  },

  async create(turmaPair: Omit<DBTurmaPair, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('turma_pairs')
      .insert(turmaPair)
      .select()
      .single();
    
    if (error) throw error;
    return data as DBTurmaPair;
  },

  async update(id: string, updates: Partial<DBTurmaPair>) {
    const { data, error } = await supabase
      .from('turma_pairs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as DBTurmaPair;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('turma_pairs')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async toggleStatus(id: string) {
    // Primeiro obter o status atual
    const current = await this.getById(id);
    const { data, error } = await supabase
      .from('turma_pairs')
      .update({ ativo: !current.ativo })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as DBTurmaPair;
  }
};

// Serviços para Turmas Individuais
export const turmasService = {
  async getByTurmaPairId(turmaPairId: string) {
    const { data, error } = await supabase
      .from('turmas')
      .select(`
        *,
        salas (
          codigo,
          capacidade,
          tipo
        )
      `)
      .eq('turma_pair_id', turmaPairId)
      .order('tipo');
    
    if (error) throw error;
    return data as DBTurma[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('turmas')
      .select(`
        *,
        salas (
          codigo,
          capacidade,
          tipo
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as DBTurma;
  },

  async create(turma: Omit<DBTurma, 'id' | 'created_at' | 'updated_at' | 'salas'>) {
    const { data, error } = await supabase
      .from('turmas')
      .insert(turma)
      .select(`
        *,
        salas (
          codigo,
          capacidade,
          tipo
        )
      `)
      .single();
    
    if (error) throw error;
    return data as DBTurma;
  },

  async update(id: string, updates: Partial<Omit<DBTurma, 'salas'>>) {
    const { data, error } = await supabase
      .from('turmas')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        salas (
          codigo,
          capacidade,
          tipo
        )
      `)
      .single();
    
    if (error) throw error;
    return data as DBTurma;
  }
};

// Serviços para Alunos
export const alunosService = {
  async getAll() {
    const { data, error } = await supabase
      .from('alunos')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as DBAluno[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('alunos')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as DBAluno;
  },

  async getByTurmaId(turmaId: string) {
    const { data, error } = await supabase
      .from('alunos')
      .select('*')
      .eq('turma_id', turmaId)
      .order('nome');
    
    if (error) throw error;
    return data as DBAluno[];
  },

  async getByTurmaPairId(turmaPairId: string) {
    const { data, error } = await supabase
      .from('alunos')
      .select('*')
      .eq('turma_pair_id', turmaPairId)
      .order('nome');
    
    if (error) throw error;
    return data as DBAluno[];
  },

  async create(aluno: Omit<DBAluno, 'id' | 'numero_estudante' | 'data_inscricao' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('alunos')
      .insert({
        ...aluno,
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as DBAluno;
  },

  async update(id: string, updates: Partial<DBAluno>) {
    const { data, error } = await supabase
      .from('alunos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as DBAluno;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('alunos')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async updateStatus(id: string, status: 'inscrito' | 'confirmado' | 'cancelado') {
    const { data, error } = await supabase
      .from('alunos')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as DBAluno;
  },

  // Estatísticas
  async getStatistics() {
    const { data, error } = await supabase
      .from('alunos')
      .select('status, forma_pagamento, valor_pago');
    
    if (error) throw error;
    
    const stats = {
      total: data.length,
      inscritos: data.filter(a => a.status === 'inscrito').length,
      confirmados: data.filter(a => a.status === 'confirmado').length,
      cancelados: data.filter(a => a.status === 'cancelado').length,
      totalRecebido: data
        .filter(a => a.status !== 'cancelado')
        .reduce((sum, a) => sum + parseFloat(a.valor_pago.toString()), 0),
      pagamentoCash: data.filter(a => a.forma_pagamento === 'Cash').length,
      pagamentoTransferencia: data.filter(a => a.forma_pagamento === 'Transferencia').length,
      pagamentoCartao: data.filter(a => a.forma_pagamento === 'Cartao').length,
    };
    
    return stats;
  },

  // Estatísticas por usuário
  async getStatisticsByUser() {
    // Buscar alunos com created_by
    const { data: alunos, error: alunosError } = await supabase
      .from('alunos')
      .select('created_by, status')
      .not('created_by', 'is', null);
    
    if (alunosError) throw alunosError;
    
    // Buscar perfis dos usuários únicos
    const userIds = [...new Set(alunos.map(a => a.created_by))];
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', userIds);
    
    if (profilesError) throw profilesError;
    
    const profilesMap = profiles.reduce((acc, profile) => {
      acc[profile.id] = profile;
      return acc;
    }, {} as Record<string, any>);
    
    const userStats = alunos.reduce((acc, aluno) => {
      const userId = aluno.created_by;
      if (!userId) return acc;
      
      if (!acc[userId]) {
        const profile = profilesMap[userId];
        acc[userId] = {
          userId,
          userName: profile?.full_name || 'Usuário Desconhecido',
          userEmail: profile?.email || '',
          totalInscricoes: 0,
          inscritos: 0,
          confirmados: 0,
          cancelados: 0
        };
      }
      
      acc[userId].totalInscricoes++;
      if (aluno.status === 'inscrito') acc[userId].inscritos++;
      if (aluno.status === 'confirmado') acc[userId].confirmados++;
      if (aluno.status === 'cancelado') acc[userId].cancelados++;
      
      return acc;
    }, {} as Record<string, {
      userId: string;
      userName: string;
      userEmail: string;
      totalInscricoes: number;
      inscritos: number;
      confirmados: number;
      cancelados: number;
    }>);
    
    return Object.values(userStats);
  },

  async getAllWithCreator() {
    // Buscar alunos
    const { data: alunos, error: alunosError } = await supabase
      .from('alunos')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (alunosError) throw alunosError;
    
    // Buscar perfis dos criadores únicos
    const userIds = [...new Set(alunos.map(a => a.created_by).filter(Boolean))];
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', userIds);
    
    if (profilesError) throw profilesError;
    
    const profilesMap = profiles.reduce((acc, profile) => {
      acc[profile.id] = profile;
      return acc;
    }, {} as Record<string, any>);
    
    // Adicionar informações do criador aos alunos
    return alunos.map(aluno => ({
      ...aluno,
      creator: aluno.created_by ? profilesMap[aluno.created_by] : null
    }));
  }
};