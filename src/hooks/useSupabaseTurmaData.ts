import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { turmaPairsService, turmasService, alunosService, cursosService, salasService } from "@/services/supabaseService";
import type { TurmaPair, TurmaIndividual, Aluno, CreateTurmaPairData } from "@/types/turma";

// Função para converter dados da DB para o formato da interface atual
const convertDBTurmaPairToInterface = async (dbPair: any): Promise<TurmaPair> => {
  console.log('[convertDBTurmaPairToInterface] Convertendo par:', dbPair.id, dbPair.nome);
  
  // Buscar as turmas A e B
  const turmas = await turmasService.getByTurmaPairId(dbPair.id);
  const turmaA = turmas.find(t => t.tipo === 'A');
  const turmaB = turmas.find(t => t.tipo === 'B');
  
  console.log('[convertDBTurmaPairToInterface] Turmas encontradas:', {
    turmaA: turmaA ? { id: turmaA.id, alunos_inscritos: turmaA.alunos_inscritos } : null,
    turmaB: turmaB ? { id: turmaB.id, alunos_inscritos: turmaB.alunos_inscritos } : null
  });
  
  // Buscar alunos de cada turma
  const alunosTurmaA = turmaA ? await alunosService.getByTurmaId(turmaA.id) : [];
  const alunosTurmaB = turmaB ? await alunosService.getByTurmaId(turmaB.id) : [];
  
  console.log('[convertDBTurmaPairToInterface] Alunos encontrados:', {
    alunosTurmaA: alunosTurmaA.length,
    alunosTurmaB: alunosTurmaB.length
  });
  
  // Verificar e corrigir inconsistências nos contadores
  if (turmaA && alunosTurmaA.length !== turmaA.alunos_inscritos) {
    console.log('[convertDBTurmaPairToInterface] Corrigindo contador Turma A:', turmaA.alunos_inscritos, '->', alunosTurmaA.length);
    await turmasService.update(turmaA.id, { alunos_inscritos: alunosTurmaA.length });
    turmaA.alunos_inscritos = alunosTurmaA.length;
  }
  
  if (turmaB && alunosTurmaB.length !== turmaB.alunos_inscritos) {
    console.log('[convertDBTurmaPairToInterface] Corrigindo contador Turma B:', turmaB.alunos_inscritos, '->', alunosTurmaB.length);
    await turmasService.update(turmaB.id, { alunos_inscritos: alunosTurmaB.length });
    turmaB.alunos_inscritos = alunosTurmaB.length;
  }
  
  // Converter alunos para o formato da interface
  const convertAlunos = (alunosDB: any[]): Aluno[] => {
    return alunosDB.map(a => ({
      id: a.id,
      nome: a.nome,
      email: a.email || "",
      telefone: a.telefone,
      curso: a.curso_codigo,
      numeroEstudante: a.numero_estudante,
      dataInscricao: a.data_inscricao.split('T')[0],
      status: a.status,
      observacoes: a.observacoes,
      numeroBI: a.numero_bi,
      dataNascimento: a.data_nascimento,
      endereco: a.endereco,
      formaPagamento: a.forma_pagamento,
      duracao: a.duracao,
      dataInicio: a.data_inicio,
      turno: a.turno,
      par: a.turma_pair_id,
      turma: a.turma_id
    }));
  };
  
  const turmaAInterface: TurmaIndividual = turmaA ? {
    sala: turmaA.salas?.codigo || "",
    capacidade: turmaA.capacidade,
    alunosInscritos: alunosTurmaA.length, // Usar contagem real dos alunos
    horarioSemanal: turmaA.horario_semanal,
    alunos: convertAlunos(alunosTurmaA)
  } : {
    sala: "",
    capacidade: 0,
    alunosInscritos: 0,
    horarioSemanal: {},
    alunos: []
  };
  
  const turmaBInterface: TurmaIndividual = turmaB ? {
    sala: turmaB.salas?.codigo || "",
    capacidade: turmaB.capacidade,
    alunosInscritos: alunosTurmaB.length, // Usar contagem real dos alunos
    horarioSemanal: turmaB.horario_semanal,
    alunos: convertAlunos(alunosTurmaB)
  } : {
    sala: "",
    capacidade: 0,
    alunosInscritos: 0,
    horarioSemanal: {},
    alunos: []
  };
  
  const result = {
    id: dbPair.id,
    nome: dbPair.nome,
    periodo: dbPair.periodo,
    horarioPeriodo: dbPair.horario_periodo,
    cursos: dbPair.cursos,
    disciplinasComuns: dbPair.disciplinas_comuns,
    horarioSemanal: dbPair.horario_semanal,
    turmaA: turmaAInterface,
    turmaB: turmaBInterface,
    ativo: dbPair.ativo,
    criadoEm: dbPair.created_at.split('T')[0]
  };
  
  console.log('[convertDBTurmaPairToInterface] Par convertido:', {
    id: result.id,
    nome: result.nome,
    turmaA_alunos: result.turmaA.alunosInscritos,
    turmaB_alunos: result.turmaB.alunosInscritos
  });
  
  return result;
};

export const useSupabaseTurmaData = () => {
  const { toast } = useToast();
  const [turmaPairs, setTurmaPairs] = useState<TurmaPair[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar dados da base de dados
  const loadTurmaPairs = async () => {
    try {
      setLoading(true);
      console.log('[useSupabaseTurmaData] Carregando pares de turmas da base de dados...');
      
      const dbPairs = await turmaPairsService.getAll();
      console.log('[useSupabaseTurmaData] Pares encontrados:', dbPairs.length);
      
      // Converter cada par de turma com dados consistentes
      const convertedPairs: TurmaPair[] = [];
      for (const dbPair of dbPairs) {
        const converted = await convertDBTurmaPairToInterface(dbPair);
        convertedPairs.push(converted);
      }
      
      setTurmaPairs(convertedPairs);
      console.log('[useSupabaseTurmaData] Pares convertidos com dados consistentes:', convertedPairs.length);
    } catch (error) {
      console.error('[useSupabaseTurmaData] Erro ao carregar dados:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados das turmas.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTurmaPairs();
  }, []);

  // Criar novo par de turmas
  const handleCreateTurmaPair = async (data: CreateTurmaPairData): Promise<boolean> => {
    try {
      console.log('[useSupabaseTurmaData] Criando novo par de turmas:', data);
      
      // Calcular disciplinas comuns baseado nos cursos
      const cursosData = await Promise.all(
        data.cursos.map(codigo => cursosService.getByCodigo(codigo))
      );
      
      const disciplinasComuns = cursosData.length > 0 
        ? cursosData[0].disciplinas.filter(disciplina =>
            cursosData.every(curso => curso.disciplinas.includes(disciplina))
          )
        : [];
      
      // Gerar horário semanal baseado no primeiro curso
      const horarioSemanal = cursosData.length > 0 
        ? cursosData[0].horario_semanal 
        : {};
      
      // Gerar nome baseado no período
      const paresDoMesmoPeriodo = turmaPairs.filter(par => par.periodo === data.periodo);
      const proximoNumero = paresDoMesmoPeriodo.length + 1;
      const nomePeriodo = data.periodo === 'manha' ? 'Manhã' : 'Tarde';
      const horarioPeriodo = data.periodo === 'manha' ? '08h00 - 12h00' : '13h00 - 17h00';
      
      // Criar o par de turmas
      const novoPar = await turmaPairsService.create({
        nome: `Par ${proximoNumero} - ${nomePeriodo}`,
        periodo: data.periodo,
        horario_periodo: horarioPeriodo,
        
        cursos: data.cursos,
        disciplinas_comuns: disciplinasComuns,
        horario_semanal: horarioSemanal,
        ativo: true
      });
      
      // Buscar as salas
      const salaA = await salasService.getByCodigo(data.salaA);
      const salaB = await salasService.getByCodigo(data.salaB);
      
      // Criar turma A
      await turmasService.create({
        turma_pair_id: novoPar.id,
        tipo: 'A',
        sala_id: salaA.id,
        capacidade: data.capacidadeA,
        alunos_inscritos: 0,
        horario_semanal: horarioSemanal
      });
      
      // Criar turma B (com horário invertido se houver vírgulas)
      const inverterHorarios = (horario: string): string => {
        if (horario === '–' || horario === '-' || !horario.includes(',')) {
          return horario;
        }
        const disciplinas = horario.split(',').map(d => d.trim());
        return disciplinas.reverse().join(', ');
      };
      
      const horarioTurmaB = Object.entries(horarioSemanal).reduce((acc, [dia, horario]) => {
        acc[dia] = inverterHorarios(horario as string);
        return acc;
      }, {} as Record<string, string>);
      
      await turmasService.create({
        turma_pair_id: novoPar.id,
        tipo: 'B',
        sala_id: salaB.id,
        capacidade: data.capacidadeB,
        alunos_inscritos: 0,
        horario_semanal: horarioTurmaB
      });
      
      // Recarregar dados
      await loadTurmaPairs();
      
      toast({
        title: "Par de turmas criado",
        description: "Novo par de turmas adicionado com sucesso.",
      });
      
      return true;
    } catch (error) {
      console.error('[useSupabaseTurmaData] Erro ao criar par de turmas:', error);
      toast({
        title: "Erro ao criar",
        description: "Erro ao criar o par de turmas.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Atualizar par de turmas
  const handleUpdateTurmaPair = async (id: string, updates: Partial<TurmaPair>) => {
    try {
      console.log('[useSupabaseTurmaData] Atualizando par de turmas:', id, updates);
      
      // Atualizar estado local imediatamente para resposta rápida
      setTurmaPairs(current => 
        current.map(pair => 
          pair.id === id ? { ...pair, ...updates } : pair
        )
      );
      
      // Converter updates para formato da DB se necessário
      const dbUpdates: any = {};
      if (updates.nome) dbUpdates.nome = updates.nome;
      if (updates.periodo) dbUpdates.periodo = updates.periodo;
      if (updates.horarioPeriodo) dbUpdates.horario_periodo = updates.horarioPeriodo;
      
      if (updates.cursos) dbUpdates.cursos = updates.cursos;
      if (updates.disciplinasComuns) dbUpdates.disciplinas_comuns = updates.disciplinasComuns;
      if (updates.horarioSemanal) dbUpdates.horario_semanal = updates.horarioSemanal;
      if (updates.ativo !== undefined) dbUpdates.ativo = updates.ativo;
      
      // Atualizar dados das turmas se necessário
      if (updates.turmaA || updates.turmaB) {
        const turmas = await turmasService.getByTurmaPairId(id);
        
        if (updates.turmaA) {
          const turmaA = turmas.find(t => t.tipo === 'A');
          if (turmaA) {
            // Encontrar a sala correspondente se a sala foi alterada
            let salaId = turmaA.sala_id;
            if (updates.turmaA.sala) {
              const salas = await salasService.getAll();
              const salaEncontrada = salas.find(s => s.codigo === updates.turmaA.sala);
              if (salaEncontrada) {
                salaId = salaEncontrada.id;
              } else {
                // Criar nova sala se não existir
                const novaSala = await salasService.create({
                  codigo: updates.turmaA.sala,
                  capacidade: updates.turmaA.capacidade || turmaA.capacidade,
                  tipo: 'sala',
                  ativo: true
                });
                salaId = novaSala.id;
              }
            }
            
            await turmasService.update(turmaA.id, {
              sala_id: salaId,
              capacidade: updates.turmaA.capacidade !== undefined ? updates.turmaA.capacidade : turmaA.capacidade,
              alunos_inscritos: updates.turmaA.alunosInscritos !== undefined ? updates.turmaA.alunosInscritos : turmaA.alunos_inscritos
            });
          }
        }
        
        if (updates.turmaB) {
          const turmaB = turmas.find(t => t.tipo === 'B');
          if (turmaB) {
            // Encontrar a sala correspondente se a sala foi alterada
            let salaId = turmaB.sala_id;
            if (updates.turmaB.sala) {
              const salas = await salasService.getAll();
              const salaEncontrada = salas.find(s => s.codigo === updates.turmaB.sala);
              if (salaEncontrada) {
                salaId = salaEncontrada.id;
              } else {
                // Criar nova sala se não existir
                const novaSala = await salasService.create({
                  codigo: updates.turmaB.sala,
                  capacidade: updates.turmaB.capacidade || turmaB.capacidade,
                  tipo: 'sala',
                  ativo: true
                });
                salaId = novaSala.id;
              }
            }
            
            await turmasService.update(turmaB.id, {
              sala_id: salaId,
              capacidade: updates.turmaB.capacidade !== undefined ? updates.turmaB.capacidade : turmaB.capacidade,
              alunos_inscritos: updates.turmaB.alunosInscritos !== undefined ? updates.turmaB.alunosInscritos : turmaB.alunos_inscritos
            });
          }
        }
      }
      
      await turmaPairsService.update(id, dbUpdates);
      
      // Recarregar dados para garantir sincronização completa
      await loadTurmaPairs();
      
      toast({
        title: "Par de turmas atualizado",
        description: "Alterações salvas com sucesso.",
      });
    } catch (error) {
      console.error('[useSupabaseTurmaData] Erro ao atualizar par de turmas:', error);
      // Reverter mudanças locais em caso de erro
      await loadTurmaPairs();
      toast({
        title: "Erro ao atualizar",
        description: "Erro ao salvar alterações.",
        variant: "destructive"
      });
    }
  };

  // Excluir par de turmas
  const handleDeleteTurmaPair = async (id: string) => {
    try {
      console.log('[useSupabaseTurmaData] Excluindo par de turmas:', id);
      
      // Atualizar estado local imediatamente
      setTurmaPairs(current => current.filter(pair => pair.id !== id));
      
      await turmaPairsService.delete(id);
      
      // Recarregar dados para garantir sincronização
      await loadTurmaPairs();
      
      toast({
        title: "Par de turmas excluído",
        description: "O par de turmas foi removido com sucesso.",
      });
    } catch (error) {
      console.error('[useSupabaseTurmaData] Erro ao excluir par de turmas:', error);
      // Reverter mudanças locais em caso de erro
      await loadTurmaPairs();
      toast({
        title: "Erro ao excluir",
        description: "Erro ao remover o par de turmas.",
        variant: "destructive"
      });
    }
  };

  // Alternar status ativo/inativo
  const handleToggleStatus = async (id: string) => {
    try {
      console.log('[useSupabaseTurmaData] Alternando status do par:', id);
      
      const pair = turmaPairs.find(p => p.id === id);
      if (!pair) return;
      
      const newStatus = !pair.ativo;
      
      // Atualizar estado local imediatamente
      setTurmaPairs(current => 
        current.map(p => 
          p.id === id ? { ...p, ativo: newStatus } : p
        )
      );
      
      await turmaPairsService.update(id, { ativo: newStatus });
      
      // Recarregar dados para garantir sincronização
      await loadTurmaPairs();
      
      toast({
        title: newStatus ? "Par de turmas ativado" : "Par de turmas desativado",
        description: "Status alterado com sucesso.",
      });
    } catch (error) {
      console.error('[useSupabaseTurmaData] Erro ao alterar status:', error);
      // Reverter mudanças locais em caso de erro
      await loadTurmaPairs();
      toast({
        title: "Erro ao alterar status",
        description: "Erro ao alterar o status do par de turmas.",
        variant: "destructive"
      });
    }
  };

  // Duplicar par existente (equivalente ao handleDuplicatePair)
  const handleDuplicatePair = async (periodo: 'manha' | 'tarde') => {
    try {
      console.log('[useSupabaseTurmaData] Duplicando par para período:', periodo);
      
      // Lógica simplificada para criar um novo par baseado no período
      // Poderia ser expandida para duplicar um par específico
      const paresDoMesmoPeriodo = turmaPairs.filter(par => par.periodo === periodo);
      const proximoNumero = paresDoMesmoPeriodo.length + 1;
      const nomePeriodo = periodo === 'manha' ? 'Manhã' : 'Tarde';
      const horarioPeriodo = periodo === 'manha' ? '08h00 - 12h00' : '13h00 - 17h00';
      
      // Buscar todos os cursos ativos para incluir no novo par
      const cursosAtivos = await cursosService.getAll();
      const cursosDefault = cursosAtivos
        .filter(curso => curso.ativo)
        .map(curso => curso.codigo);
      
      const novoPar = await turmaPairsService.create({
        nome: `Par ${proximoNumero} - ${nomePeriodo}`,
        periodo,
        horario_periodo: horarioPeriodo,
        
        cursos: cursosDefault,
        disciplinas_comuns: [],
        horario_semanal: {},
        ativo: true
      });
      
      // Recarregar dados
      await loadTurmaPairs();
      
      toast({
        title: "Par de turmas duplicado",
        description: `Novo par criado para o período da ${nomePeriodo.toLowerCase()}.`,
      });
    } catch (error) {
      console.error('[useSupabaseTurmaData] Erro ao duplicar par:', error);
      toast({
        title: "Erro ao duplicar",
        description: "Erro ao criar novo par de turmas.",
        variant: "destructive"
      });
    }
  };

  // Criar novo aluno
  const handleCreateAluno = async (aluno: Omit<Aluno, 'id' | 'numeroEstudante' | 'dataInscricao'>, turmaPairId: string, turmaType: 'A' | 'B'): Promise<boolean> => {
    try {
      console.log('[useSupabaseTurmaData] Criando novo aluno:', aluno.nome, 'na turma', turmaType);
      
      // Buscar a turma específica
      const turmas = await turmasService.getByTurmaPairId(turmaPairId);
      const turma = turmas.find(t => t.tipo === turmaType);
      
      if (!turma) {
        throw new Error('Turma não encontrada');
      }
      
      // Verificar se há vaga
      if (turma.alunos_inscritos >= turma.capacidade) {
        throw new Error('Turma está lotada');
      }
      
      // Criar aluno na base de dados
      const novoAluno = await alunosService.create({
        nome: aluno.nome,
        email: aluno.email || undefined,
        telefone: aluno.telefone,
        numero_bi: aluno.numeroBI || '',
        data_nascimento: aluno.dataNascimento || undefined,
        endereco: aluno.endereco || undefined,
        curso_codigo: aluno.curso,
        turma_pair_id: turmaPairId,
        turma_id: turma.id,
        turno: aluno.turno,
        duracao: aluno.duracao || '3 Meses',
        data_inicio: aluno.dataInicio || new Date().toISOString().split('T')[0],
        forma_pagamento: aluno.formaPagamento as 'Cash' | 'Transferencia' | 'Cartao',
        valor_pago: 40000.00,
        status: aluno.status as 'inscrito' | 'confirmado' | 'cancelado',
        observacoes: aluno.observacoes || undefined
      });
      
      console.log('[useSupabaseTurmaData] Aluno criado com sucesso:', novoAluno.nome, 'ID:', novoAluno.id);
      
      // Recarregar dados imediatamente para refletir as mudanças
      await loadTurmaPairs();
      
      toast({
        title: "Aluno adicionado",
        description: `${novoAluno.nome} foi adicionado à Turma ${turmaType} com sucesso.`,
      });
      
      return true;
    } catch (error) {
      console.error('[useSupabaseTurmaData] Erro ao criar aluno:', error);
      toast({
        title: "Erro ao adicionar aluno",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
      return false;
    }
  };

  // Atualizar aluno
  const handleUpdateAluno = async (alunoId: string, updates: Partial<Aluno>): Promise<boolean> => {
    try {
      console.log('[useSupabaseTurmaData] Atualizando aluno:', alunoId, updates);
      
      // Converter updates para formato da DB
      const dbUpdates: any = {};
      if (updates.nome) dbUpdates.nome = updates.nome;
      if (updates.email !== undefined) dbUpdates.email = updates.email || null;
      if (updates.telefone) dbUpdates.telefone = updates.telefone;
      if (updates.numeroBI) dbUpdates.numero_bi = updates.numeroBI;
      if (updates.dataNascimento !== undefined) dbUpdates.data_nascimento = updates.dataNascimento || null;
      if (updates.endereco !== undefined) dbUpdates.endereco = updates.endereco || null;
      if (updates.curso) dbUpdates.curso_codigo = updates.curso;
      if (updates.turno) dbUpdates.turno = updates.turno;
      if (updates.duracao) dbUpdates.duracao = updates.duracao;
      if (updates.dataInicio) dbUpdates.data_inicio = updates.dataInicio;
      if (updates.formaPagamento) dbUpdates.forma_pagamento = updates.formaPagamento;
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.observacoes !== undefined) dbUpdates.observacoes = updates.observacoes || null;
      
      await alunosService.update(alunoId, dbUpdates);
      
      // Recarregar dados para garantir consistência
      await loadTurmaPairs();
      
      toast({
        title: "Aluno atualizado",
        description: "As informações do aluno foram salvas com sucesso.",
      });
      
      return true;
    } catch (error) {
      console.error('[useSupabaseTurmaData] Erro ao atualizar aluno:', error);
      toast({
        title: "Erro ao atualizar aluno",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
      return false;
    }
  };

  // Deletar aluno
  const handleDeleteAluno = async (alunoId: string): Promise<boolean> => {
    try {
      console.log('[useSupabaseTurmaData] Deletando aluno:', alunoId);
      
      await alunosService.delete(alunoId);
      
      // Recarregar dados para garantir consistência
      await loadTurmaPairs();
      
      toast({
        title: "Aluno removido",
        description: "O aluno foi removido da turma com sucesso.",
      });
      
      return true;
    } catch (error) {
      console.error('[useSupabaseTurmaData] Erro ao deletar aluno:', error);
      toast({
        title: "Erro ao remover aluno",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
      return false;
    }
  };

  // Atualizar status do aluno
  const handleUpdateAlunoStatus = async (alunoId: string, status: 'inscrito' | 'confirmado' | 'cancelado'): Promise<boolean> => {
    try {
      console.log('[useSupabaseTurmaData] Atualizando status do aluno:', alunoId, status);
      
      await alunosService.updateStatus(alunoId, status);
      
      // Recarregar dados para garantir consistência
      await loadTurmaPairs();
      
      toast({
        title: "Status atualizado",
        description: `Status do aluno alterado para ${status}.`,
      });
      
      return true;
    } catch (error) {
      console.error('[useSupabaseTurmaData] Erro ao atualizar status:', error);
      toast({
        title: "Erro ao atualizar status",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    turmaPairs,
    loading,
    handleCreateTurmaPair: async () => false, // Placeholder - implementar se necessário
    handleUpdateTurmaPair,
    handleDeleteTurmaPair: async () => {}, // Placeholder - implementar se necessário
    handleToggleStatus: async () => {}, // Placeholder - implementar se necessário
    handleDuplicatePair: async () => {}, // Placeholder - implementar se necessário
    loadTurmaPairs,
    handleCreateAluno,
    handleUpdateAluno,
    handleDeleteAluno,
    handleUpdateAlunoStatus
  };
};
