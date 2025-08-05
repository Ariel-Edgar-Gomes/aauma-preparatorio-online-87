-- Adicionar coluna turma_pair_id para ajustes específicos por par de turma
ALTER TABLE public.ajustes_financeiros 
ADD COLUMN turma_pair_id UUID REFERENCES public.turma_pairs(id);

-- Adicionar índice para melhor performance
CREATE INDEX idx_ajustes_financeiros_turma_pair_id ON public.ajustes_financeiros(turma_pair_id);