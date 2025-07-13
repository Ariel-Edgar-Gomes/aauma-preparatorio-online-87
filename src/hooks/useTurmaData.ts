import { useState, useEffect } from 'react';
import { TurmaPair, CreateTurmaPairData } from '@/types/turma';
import { toast } from "@/hooks/use-toast";
import { useSupabaseTurmaData } from '@/hooks/useSupabaseTurmaData';

export const useTurmaData = () => {
  const { 
    turmaPairs: supabaseTurmaPairs, 
    loading: supabaseLoading, 
    handleCreateTurmaPair: createTurmaPair, 
    handleUpdateTurmaPair: updateSupabaseTurmaPair, 
    handleDeleteTurmaPair: deleteSupabaseTurmaPair,
    handleToggleStatus: toggleSupabaseStatus,
    handleDuplicatePair: duplicateSupabasePair
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
      const success = await createTurmaPair(data);
      if (success) {
        toast({
          title: "Par de turmas criado",
          description: "Par de turmas criado com sucesso!",
        });
        return true;
      }
      return false;
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
      await updateSupabaseTurmaPair(id, updates);
      toast({
        title: "Par atualizado",
        description: "As alterações foram salvas com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao atualizar par de turmas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o par de turmas.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTurmaPair = async (id: string) => {
    try {
      await deleteSupabaseTurmaPair(id);
      toast({
        title: "Par removido",
        description: "O par de turmas foi removido com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao remover par de turmas:', error);
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
      const newStatus = !pair?.ativo;
      
      await toggleSupabaseStatus(id);
      toast({
        title: newStatus ? "Par ativado" : "Par desativado",
        description: `O par de turmas foi ${newStatus ? 'ativado' : 'desativado'} com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao alterar status do par de turmas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status do par de turmas.",
        variant: "destructive",
      });
    }
  };

  const handleDuplicatePair = async (periodo: 'manha' | 'tarde') => {
    try {
      // Encontra um par existente do período oposto como base
      const basePair = turmaPairs.find(pair => pair.periodo !== periodo);
      
      if (!basePair) {
        toast({
          title: "Erro",
          description: "Não há pares existentes para usar como modelo.",
          variant: "destructive",
        });
        return;
      }

      // Cria dados para novo par baseado no existente
      const duplicateData: CreateTurmaPairData = {
        periodo,
        grupoCursos: basePair.grupoCursos,
        cursos: basePair.cursos,
        salaA: `${basePair.turmaA.sala}-${periodo.charAt(0).toUpperCase()}`,
        capacidadeA: basePair.turmaA.capacidade,
        salaB: `${basePair.turmaB.sala}-${periodo.charAt(0).toUpperCase()}`,
        capacidadeB: basePair.turmaB.capacidade
      };

      const success = await createTurmaPair(duplicateData);
      if (success) {
        toast({
          title: "Par duplicado",
          description: `Novo par de ${periodo} criado baseado no par existente.`,
        });
      }
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
    handleDuplicatePair
  };
};