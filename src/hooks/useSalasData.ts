import { useState, useEffect } from 'react';
import { salasService, DBSala } from '@/services/supabaseService';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useSalasData = () => {
  const [salas, setSalas] = useState<DBSala[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadSalas = async () => {
    try {
      setLoading(true);
      console.log('[useSalasData] Carregando salas...');
      const data = await salasService.getAll();
      setSalas(data || []);
      console.log('[useSalasData] Salas carregadas:', data?.length || 0, data);
    } catch (error) {
      console.error('[useSalasData] Erro ao carregar salas:', error);
      toast({
        title: "Erro",
        description: `Erro ao carregar salas: ${error.message}`,
        variant: "destructive",
      });
      setSalas([]);
    } finally {
      setLoading(false);
    }
  };

  const createSala = async (salaData: Omit<DBSala, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('[useSalasData] Criando sala:', salaData);
      const newSala = await salasService.create(salaData);
      console.log('[useSalasData] Sala criada:', newSala);
      
      // O realtime cuidará da atualização automática
      
      toast({
        title: "Sucesso",
        description: "Sala criada com sucesso",
      });
      
      return newSala;
    } catch (error) {
      console.error('[useSalasData] Erro ao criar sala:', error);
      toast({
        title: "Erro",
        description: `Erro ao criar sala: ${error.message}`,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateSala = async (id: string, updates: Partial<DBSala>) => {
    try {
      console.log('[useSalasData] Atualizando sala:', { id, updates });
      const updatedSala = await salasService.update(id, updates);
      console.log('[useSalasData] Sala atualizada:', updatedSala);
      
      // O realtime cuidará da atualização automática
      
      toast({
        title: "Sucesso",
        description: "Sala atualizada com sucesso",
      });
      
      return updatedSala;
    } catch (error) {
      console.error('[useSalasData] Erro ao atualizar sala:', error);
      toast({
        title: "Erro",
        description: `Erro ao atualizar sala: ${error.message}`,
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteSala = async (id: string) => {
    try {
      console.log('[useSalasData] Deletando sala:', id);
      await salasService.delete(id);
      
      // O realtime cuidará da atualização automática
      
      toast({
        title: "Sucesso",
        description: "Sala deletada com sucesso",
      });
    } catch (error) {
      console.error('[useSalasData] Erro ao deletar sala:', error);
      toast({
        title: "Erro",
        description: `Erro ao deletar sala: ${error.message}`,
        variant: "destructive",
      });
      throw error;
    }
  };

  const getSalaByCodigo = async (codigo: string) => {
    try {
      return await salasService.getByCodigo(codigo);
    } catch (error) {
      console.error('[useSalasData] Erro ao buscar sala por código:', error);
      return null;
    }
  };

  useEffect(() => {
    loadSalas();
  }, []);

  // Realtime subscription para atualizações instantâneas
  useEffect(() => {
    const channel = supabase
      .channel('salas-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'salas'
        },
        (payload) => {
          console.log('[useSalasData] Mudança detectada:', payload);
          // Recarregar dados quando há mudanças externas
          loadSalas();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    salas,
    loading,
    loadSalas,
    createSala,
    updateSala,
    deleteSala,
    getSalaByCodigo
  };
};