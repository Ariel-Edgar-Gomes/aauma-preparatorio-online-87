import { useState, useEffect } from 'react';
import { TurmaPair, CreateTurmaPairData, Aluno } from '@/types/turma';
import { toast } from "@/hooks/use-toast";
import { useSupabaseTurmaData } from '@/hooks/useSupabaseTurmaData';
import { turmaPairsService, turmasService, salasService, cursosService } from '@/services/supabaseService';
import { supabase } from '@/integrations/supabase/client';

export const useTurmaData = () => {
  const {
    turmaPairs: supabaseTurmaPairs,
    loading: supabaseLoading,
    loadTurmaPairs,
    handleCreateAluno: createAluno,
    handleUpdateAluno: updateAluno,
    handleDeleteAluno: deleteAluno,
    handleUpdateAlunoStatus: updateAlunoStatus
  } = useSupabaseTurmaData();
  
  const [turmaPairs, setTurmaPairs] = useState<TurmaPair[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Sincroniza com dados do Supabase
  useEffect(() => {
    if (!supabaseLoading) {
      setTurmaPairs(supabaseTurmaPairs);
      setLoading(false);
    }
  }, [supabaseTurmaPairs, supabaseLoading]);

  // Realtime subscriptions para atualizações instantâneas
  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Escuta INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'turma_pairs'
        },
        () => {
          console.log('Mudança detectada em turma_pairs - recarregando dados...');
          loadTurmaPairs();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'turmas'
        },
        () => {
          console.log('Mudança detectada em turmas - recarregando dados...');
          loadTurmaPairs();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'alunos'
        },
        () => {
          console.log('Mudança detectada em alunos - recarregando dados...');
          loadTurmaPairs();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'salas'
        },
        () => {
          console.log('Mudança detectada em salas - recarregando dados...');
          loadTurmaPairs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadTurmaPairs]);

  const handleCreateTurmaPair = async (data: CreateTurmaPairData): Promise<boolean> => {
    try {
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
      
      // Criar ou buscar salas dinamicamente
      let salaAId = null;
      let salaBId = null;

      console.log('[useTurmaData] Processando salas:', { salaA: data.salaA, salaB: data.salaB });

      try {
        const salaA = await salasService.getByCodigo(data.salaA);
        salaAId = salaA.id;
        console.log('[useTurmaData] Sala A encontrada:', salaA);
      } catch {
        // Se não encontrar a sala, criar uma nova
        console.log('[useTurmaData] Criando nova sala A:', data.salaA);
        const novaSalaA = await salasService.create({
          codigo: data.salaA,
          capacidade: data.capacidadeA,
          ativo: true,
          tipo: 'sala'
        });
        salaAId = novaSalaA.id;
        console.log('[useTurmaData] Sala A criada:', novaSalaA);
      }

      try {
        const salaB = await salasService.getByCodigo(data.salaB);
        salaBId = salaB.id;
        console.log('[useTurmaData] Sala B encontrada:', salaB);
      } catch {
        // Se não encontrar a sala, criar uma nova
        console.log('[useTurmaData] Criando nova sala B:', data.salaB);
        const novaSalaB = await salasService.create({
          codigo: data.salaB,
          capacidade: data.capacidadeB,
          ativo: true,
          tipo: 'sala'
        });
        salaBId = novaSalaB.id;
        console.log('[useTurmaData] Sala B criada:', novaSalaB);
      }
      
      // Criar turma A
      await turmasService.create({
        turma_pair_id: novoPar.id,
        tipo: 'A',
        sala_id: salaAId,
        capacidade: data.capacidadeA,
        alunos_inscritos: 0,
        horario_semanal: horarioSemanal
      });
      
      // Criar turma B 
      await turmasService.create({
        turma_pair_id: novoPar.id,
        tipo: 'B',
        sala_id: salaBId,
        capacidade: data.capacidadeB,
        alunos_inscritos: 0,
        horario_semanal: horarioSemanal
      });
      
      // O realtime cuidará da atualização automática
      
      toast({
        title: "Par de turmas criado",
        description: "Par de turmas criado com sucesso!",
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao criar par de turmas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o par de turmas.",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleUpdateTurmaPair = async (id: string, updates: Partial<TurmaPair>) => {
    try {
      console.log('[useTurmaData] Iniciando atualização do par:', { id, updates });
      
      // Buscar as turmas associadas primeiro
      const turmas = await turmasService.getByTurmaPairId(id);
      const turmaA = turmas.find(t => t.tipo === 'A');
      const turmaB = turmas.find(t => t.tipo === 'B');
      
      // Atualizar turmas individuais se necessário
      if (updates.turmaA && turmaA) {
        const turmaAUpdates: any = {};
        if (updates.turmaA.capacidade !== undefined) {
          turmaAUpdates.capacidade = updates.turmaA.capacidade;
        }
        if (updates.turmaA.sala) {
          console.log('[useTurmaData] Atualizando sala da Turma A para:', updates.turmaA.sala);
          try {
            const sala = await salasService.getByCodigo(updates.turmaA.sala);
            turmaAUpdates.sala_id = sala.id;
            console.log('[useTurmaData] Sala A encontrada:', sala);
          } catch (salaError) {
            // Se não encontrar a sala, criar uma nova
            try {
              console.log('[useTurmaData] Criando nova sala A:', updates.turmaA.sala);
              const novaSala = await salasService.create({
                codigo: updates.turmaA.sala,
                capacidade: updates.turmaA.capacidade || 30,
                ativo: true,
                tipo: 'sala'
              });
              turmaAUpdates.sala_id = novaSala.id;
              console.log('[useTurmaData] Nova sala A criada:', novaSala);
            } catch (createError) {
              console.error('[useTurmaData] Erro ao criar sala A:', createError);
              toast({
                title: "Erro",
                description: `Não foi possível criar/encontrar a sala ${updates.turmaA.sala}.`,
                variant: "destructive",
              });
              return;
            }
          }
        }
        
        if (Object.keys(turmaAUpdates).length > 0) {
          console.log('[useTurmaData] Atualizando Turma A:', turmaAUpdates);
          await turmasService.update(turmaA.id, turmaAUpdates);
        }
      }
      
      if (updates.turmaB && turmaB) {
        const turmaBUpdates: any = {};
        if (updates.turmaB.capacidade !== undefined) {
          turmaBUpdates.capacidade = updates.turmaB.capacidade;
        }
        if (updates.turmaB.sala) {
          console.log('[useTurmaData] Atualizando sala da Turma B para:', updates.turmaB.sala);
          try {
            const sala = await salasService.getByCodigo(updates.turmaB.sala);
            turmaBUpdates.sala_id = sala.id;
            console.log('[useTurmaData] Sala B encontrada:', sala);
          } catch (salaError) {
            // Se não encontrar a sala, criar uma nova
            try {
              console.log('[useTurmaData] Criando nova sala B:', updates.turmaB.sala);
              const novaSala = await salasService.create({
                codigo: updates.turmaB.sala,
                capacidade: updates.turmaB.capacidade || 30,
                ativo: true,
                tipo: 'sala'
              });
              turmaBUpdates.sala_id = novaSala.id;
              console.log('[useTurmaData] Nova sala B criada:', novaSala);
            } catch (createError) {
              console.error('[useTurmaData] Erro ao criar sala B:', createError);
              toast({
                title: "Erro",
                description: `Não foi possível criar/encontrar a sala ${updates.turmaB.sala}.`,
                variant: "destructive",
              });
              return;
            }
          }
        }
        
        if (Object.keys(turmaBUpdates).length > 0) {
          console.log('[useTurmaData] Atualizando Turma B:', turmaBUpdates);
          await turmasService.update(turmaB.id, turmaBUpdates);
        }
      }
      
      // Atualizar dados do par de turmas
      const dbUpdates: any = {};
      if (updates.nome) dbUpdates.nome = updates.nome;
      if (updates.periodo) dbUpdates.periodo = updates.periodo;
      if (updates.horarioPeriodo) dbUpdates.horario_periodo = updates.horarioPeriodo;
      if (updates.cursos) dbUpdates.cursos = updates.cursos;
      if (updates.disciplinasComuns) dbUpdates.disciplinas_comuns = updates.disciplinasComuns;
      if (updates.horarioSemanal) dbUpdates.horario_semanal = updates.horarioSemanal;
      if (updates.ativo !== undefined) dbUpdates.ativo = updates.ativo;
      
      if (Object.keys(dbUpdates).length > 0) {
        console.log('[useTurmaData] Atualizando par de turmas:', dbUpdates);
        await turmaPairsService.update(id, dbUpdates);
      }
      
      // O realtime cuidará da atualização automática
      
      toast({
        title: "Par atualizado",
        description: "As alterações foram salvas com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao atualizar par de turmas:', error);
      await loadTurmaPairs();
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o par de turmas.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTurmaPair = async (id: string) => {
    try {
      // Verificar se há alunos associados ao par
      const { data: alunosAssociados, error: alunosError } = await supabase
        .from('alunos')
        .select('id, nome')
        .eq('turma_pair_id', id);

      if (alunosError) {
        throw new Error('Erro ao verificar alunos associados');
      }

      // Se há alunos associados, mostrar confirmação
      if (alunosAssociados && alunosAssociados.length > 0) {
        const confirmacao = window.confirm(
          `Este par de turmas possui ${alunosAssociados.length} aluno(s) associado(s). ` +
          `Todos os alunos serão removidos junto com o par. Deseja continuar?`
        );
        
        if (!confirmacao) {
          return;
        }

        // Remover todos os alunos associados primeiro
        const { error: deleteAlunosError } = await supabase
          .from('alunos')
          .delete()
          .eq('turma_pair_id', id);

        if (deleteAlunosError) {
          throw new Error('Erro ao remover alunos associados');
        }
      }

      // Remover as turmas individuais (A e B) associadas ao par
      const { error: deleteTurmasError } = await supabase
        .from('turmas')
        .delete()
        .eq('turma_pair_id', id);

      if (deleteTurmasError) {
        throw new Error('Erro ao remover turmas individuais');
      }

      // Agora remover o par de turmas
      setTurmaPairs(current => current.filter(pair => pair.id !== id));
      await turmaPairsService.delete(id);
      // O realtime cuidará da atualização automática
      
      toast({
        title: "Par removido",
        description: "O par de turmas foi removido com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao remover par de turmas:', error);
      await loadTurmaPairs();
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível remover o par de turmas.",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
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
      
      toast({
        title: newStatus ? "Par ativado" : "Par desativado",
        description: `O par de turmas foi ${newStatus ? 'ativado' : 'desativado'} com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao alterar status do par de turmas:', error);
      await loadTurmaPairs();
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status do par de turmas.",
        variant: "destructive",
      });
    }
  };

  const handleDuplicatePair = async (periodo: 'manha' | 'tarde') => {
    try {
      // Buscar todos os cursos ativos para incluir no novo par
      const cursosAtivos = await cursosService.getAll();
      const cursosDefault = cursosAtivos
        .filter(curso => curso.ativo)
        .map(curso => curso.codigo);
      
      const paresDoMesmoPeriodo = turmaPairs.filter(par => par.periodo === periodo);
      const proximoNumero = paresDoMesmoPeriodo.length + 1;
      const nomePeriodo = periodo === 'manha' ? 'Manhã' : 'Tarde';
      const horarioPeriodo = periodo === 'manha' ? '08h00 - 12h00' : '13h00 - 17h00';
      
      // Criar o par de turmas
      const novoPar = await turmaPairsService.create({
        nome: `Par ${proximoNumero} - ${nomePeriodo}`,
        periodo,
        horario_periodo: horarioPeriodo,
        cursos: cursosDefault,
        disciplinas_comuns: [],
        horario_semanal: {},
        ativo: true
      });

      // Criar salas padrão se não existirem
      const codigoSalaA = `${proximoNumero}A-${periodo}`;
      const codigoSalaB = `${proximoNumero}B-${periodo}`;
      
      let salaA, salaB;
      
      try {
        salaA = await salasService.getByCodigo(codigoSalaA);
      } catch {
        salaA = await salasService.create({
          codigo: codigoSalaA,
          capacidade: 30,
          tipo: 'sala',
          ativo: true
        });
      }
      
      try {
        salaB = await salasService.getByCodigo(codigoSalaB);
      } catch {
        salaB = await salasService.create({
          codigo: codigoSalaB,
          capacidade: 30,
          tipo: 'sala',
          ativo: true
        });
      }

      // Criar as turmas A e B
      await turmasService.create({
        turma_pair_id: novoPar.id,
        tipo: 'A',
        sala_id: salaA.id,
        capacidade: 30,
        alunos_inscritos: 0,
        horario_semanal: {}
      });

      await turmasService.create({
        turma_pair_id: novoPar.id,
        tipo: 'B',
        sala_id: salaB.id,
        capacidade: 30,
        alunos_inscritos: 0,
        horario_semanal: {}
      });
      
      // O realtime cuidará da atualização automática
      
      toast({
        title: "Par criado",
        description: `Novo par de ${nomePeriodo.toLowerCase()} criado com sucesso com Turma A e B.`,
      });
    } catch (error) {
      console.error('Erro ao duplicar par:', error);
      toast({
        title: "Erro",
        description: "Não foi possível duplicar o par de turmas.",
        variant: "destructive",
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
    handleCreateAluno: createAluno,
    handleUpdateAluno: updateAluno,
    handleDeleteAluno: deleteAluno,
    handleUpdateAlunoStatus: updateAlunoStatus
  };
};