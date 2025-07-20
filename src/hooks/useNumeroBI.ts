import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseNumeroBIReturn {
  isChecking: boolean;
  isDuplicate: boolean;
  error: string | null;
  checkNumeroBI: (numeroBI: string) => void;
}

export const useNumeroBI = (): UseNumeroBIReturn => {
  const [isChecking, setIsChecking] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkNumeroBI = useCallback(async (numeroBI: string) => {
    // Limpar estados anteriores
    setError(null);
    setIsDuplicate(false);

    // Se o campo estiver vazio, não verificar
    if (!numeroBI.trim()) {
      return;
    }

    // Verificar se o número de BI tem formato mínimo válido
    if (numeroBI.length < 9) {
      return;
    }

    setIsChecking(true);

    try {
      const { data, error } = await supabase
        .from('alunos')
        .select('id, nome')
        .eq('numero_bi', numeroBI.trim())
        .limit(1);

      if (error) {
        console.error('Erro ao verificar número de BI:', error);
        setError('Erro ao verificar número de BI');
        return;
      }

      setIsDuplicate(data && data.length > 0);
    } catch (err) {
      console.error('Erro na verificação:', err);
      setError('Erro na verificação');
    } finally {
      setIsChecking(false);
    }
  }, []);

  return {
    isChecking,
    isDuplicate,
    error,
    checkNumeroBI
  };
};