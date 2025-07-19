import { useState, useEffect } from 'react';
import { TurmaPair, CreateTurmaPairData, Aluno } from '@/types/turma';
import { toast } from "@/hooks/use-toast";
import { useSupabaseTurmaData } from '@/hooks/useSupabaseTurmaData';
import { turmaPairsService, turmasService, salasService, cursosService } from '@/services/supabaseService';

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
      
      // Criar ou buscar salas (pode ser um código de sala dinâmico)
      let salaAId = null;
      let salaBId = null;

      try {
        const salaA = await salasService.getByCodigo(data.salaA);
        salaAId = salaA.id;
      } catch {
        // Se não encontrar a sala, criar uma nova
        const novaSalaA = await salasService.create({
          codigo: data.salaA,
          capacidade: data.capacidadeA,
          ativo: true,
          tipo: 'sala'
        });
        salaAId = novaSalaA.id;
      }

      try {
        const salaB = await salasService.getByCodigo(data.salaB);
        salaBId = salaB.id;
      } catch {
        // Se não encontrar a sala, criar uma nova
        const novaSalaB = await salasService.create({
          codigo: data.salaB,
          capacidade: data.capacidadeB,
          ativo: true,
          tipo: 'sala'
        });
        salaBId = novaSalaB.id;
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
      
      // Recarregar dados
      await loadTurmaPairs();
      
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
      let turmaA = turmas.find(t => t.tipo === 'A');
      let turmaB = turmas.find(t => t.tipo === 'B');
      
      // Criar turmas se não existirem
      if (!turmaA && updates.turmaA) {
        turmaA = await turmasService.create({
          turma_pair_id: id,
          tipo: 'A',
          sala_id: null,
          capacidade: updates.turmaA.capacidade || 30,
          alunos_inscritos: 0,
          horario_semanal: {}
        });
      }
      
      if (!turmaB && updates.turmaB) {
        turmaB = await turmasService.create({
          turma_pair_id: id,
          tipo: 'B',
          sala_id: null,
          capacidade: updates.turmaB.capacidade || 30,
          alunos_inscritos: 0,
          horario_semanal: {}
        });
      }
      
      // Atualizar turmas individuais se necessário
      if (updates.turmaA && turmaA) {
        const turmaAUpdates: any = {};
        if (updates.turmaA.capacidade !== undefined) {
          turmaAUpdates.capacidade = updates.turmaA.capacidade;
        }
        if (updates.turmaA.sala) {
          try {
            const sala = await salasService.getByCodigo(updates.turmaA.sala);
            turmaAUpdates.sala_id = sala.id;
          } catch (salaError) {
            // Se não encontrar a sala, criar uma nova
            try {
              const novaSala = await salasService.create({
                codigo: updates.turmaA.sala,
                capacidade: updates.turmaA.capacidade || 30,
                ativo: true,
                tipo: 'sala'
              });
              turmaAUpdates.sala_id = novaSala.id;
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
          try {
            const sala = await salasService.getByCodigo(updates.turmaB.sala);
            turmaBUpdates.sala_id = sala.id;
          } catch (salaError) {
            // Se não encontrar a sala, criar uma nova
            try {
              const novaSala = await salasService.create({
                codigo: updates.turmaB.sala,
                capacidade: updates.turmaB.capacidade || 30,
                ativo: true,
                tipo: 'sala'
              });
              turmaBUpdates.sala_id = novaSala.id;
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
      
      // Recarregar dados para garantir consistência
      await loadTurmaPairs();
      
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
      setTurmaPairs(current => current.filter(pair => pair.id !== id));
      await turmaPairsService.delete(id);
      await loadTurmaPairs();
      
      toast({
        title: "Par removido",
        description: "O par de turmas foi removido com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao remover par de turmas:', error);
      await loadTurmaPairs();
      toast({
        title: "Erro",
        description: "Não foi possível remover o par de turmas.",
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
      
      await turmaPairsService.create({
        nome: `Par ${proximoNumero} - ${nomePeriodo}`,
        periodo,
        horario_periodo: horarioPeriodo,
        cursos: cursosDefault,
        disciplinas_comuns: [],
        horario_semanal: {},
        ativo: true
      });
      
      await loadTurmaPairs();
      
      toast({
        title: "Par duplicado",
        description: `Novo par de ${periodo} criado baseado no par existente.`,
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