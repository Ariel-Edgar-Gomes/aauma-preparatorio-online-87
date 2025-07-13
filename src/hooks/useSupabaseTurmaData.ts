import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { turmaPairsService, turmasService, alunosService, cursosService, salasService } from "@/services/supabaseService";
import type { TurmaPair, TurmaIndividual, Aluno, CreateTurmaPairData } from "@/types/turma";

// Função para converter dados da DB para o formato da interface atual
const convertDBTurmaPairToInterface = async (dbPair: any): Promise<TurmaPair> => {
  // Buscar as turmas A e B
  const turmas = await turmasService.getByTurmaPairId(dbPair.id);
  const turmaA = turmas.find(t => t.tipo === 'A');
  const turmaB = turmas.find(t => t.tipo === 'B');
  
  // Buscar alunos de cada turma
  const alunosTurmaA = turmaA ? await alunosService.getByTurmaId(turmaA.id) : [];
  const alunosTurmaB = turmaB ? await alunosService.getByTurmaId(turmaB.id) : [];
  
  // Converter alunos
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
    alunosInscritos: turmaA.alunos_inscritos,
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
    alunosInscritos: turmaB.alunos_inscritos,
    horarioSemanal: turmaB.horario_semanal,
    alunos: convertAlunos(alunosTurmaB)
  } : {
    sala: "",
    capacidade: 0,
    alunosInscritos: 0,
    horarioSemanal: {},
    alunos: []
  };
  
  return {
    id: dbPair.id,
    nome: dbPair.nome,
    periodo: dbPair.periodo,
    horarioPeriodo: dbPair.horario_periodo,
    grupoCursos: dbPair.grupo_cursos,
    cursos: dbPair.cursos,
    disciplinasComuns: dbPair.disciplinas_comuns,
    horarioSemanal: dbPair.horario_semanal,
    turmaA: turmaAInterface,
    turmaB: turmaBInterface,
    ativo: dbPair.ativo,
    criadoEm: dbPair.created_at.split('T')[0]
  };
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
      
      // Converter cada par de turma
      const convertedPairs: TurmaPair[] = [];
      for (const dbPair of dbPairs) {
        const converted = await convertDBTurmaPairToInterface(dbPair);
        convertedPairs.push(converted);
      }
      
      setTurmaPairs(convertedPairs);
      console.log('[useSupabaseTurmaData] Pares convertidos:', convertedPairs.length);
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
        grupo_cursos: data.grupoCursos,
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
      
      // Converter updates para formato da DB se necessário
      const dbUpdates: any = {};
      if (updates.nome) dbUpdates.nome = updates.nome;
      if (updates.periodo) dbUpdates.periodo = updates.periodo;
      if (updates.horarioPeriodo) dbUpdates.horario_periodo = updates.horarioPeriodo;
      if (updates.grupoCursos) dbUpdates.grupo_cursos = updates.grupoCursos;
      if (updates.cursos) dbUpdates.cursos = updates.cursos;
      if (updates.disciplinasComuns) dbUpdates.disciplinas_comuns = updates.disciplinasComuns;
      if (updates.horarioSemanal) dbUpdates.horario_semanal = updates.horarioSemanal;
      if (updates.ativo !== undefined) dbUpdates.ativo = updates.ativo;
      
      await turmaPairsService.update(id, dbUpdates);
      
      // Recarregar dados
      await loadTurmaPairs();
      
      toast({
        title: "Par de turmas atualizado",
        description: "Alterações salvas com sucesso.",
      });
    } catch (error) {
      console.error('[useSupabaseTurmaData] Erro ao atualizar par de turmas:', error);
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
      
      await turmaPairsService.delete(id);
      
      // Recarregar dados
      await loadTurmaPairs();
      
      toast({
        title: "Par de turmas excluído",
        description: "O par de turmas foi removido com sucesso.",
      });
    } catch (error) {
      console.error('[useSupabaseTurmaData] Erro ao excluir par de turmas:', error);
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
      
      await turmaPairsService.toggleStatus(id);
      
      // Recarregar dados
      await loadTurmaPairs();
      
      const turma = turmaPairs.find(t => t.id === id);
      toast({
        title: turma?.ativo ? "Par de turmas desativado" : "Par de turmas ativado",
        description: "Status alterado com sucesso.",
      });
    } catch (error) {
      console.error('[useSupabaseTurmaData] Erro ao alterar status:', error);
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
      
      // Usar configuração padrão baseada no período
      const grupoDefault = periodo === 'manha' ? 'engenharias' : 'saude';
      const cursosDefault = periodo === 'manha' 
        ? ['engenharia-informatica'] 
        : ['medicina'];
      
      const novoPar = await turmaPairsService.create({
        nome: `Par ${proximoNumero} - ${nomePeriodo}`,
        periodo,
        horario_periodo: horarioPeriodo,
        grupo_cursos: grupoDefault,
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

  return {
    turmaPairs,
    loading,
    handleCreateTurmaPair,
    handleUpdateTurmaPair,
    handleDeleteTurmaPair,
    handleToggleStatus,
    handleDuplicatePair,
    loadTurmaPairs
  };
};