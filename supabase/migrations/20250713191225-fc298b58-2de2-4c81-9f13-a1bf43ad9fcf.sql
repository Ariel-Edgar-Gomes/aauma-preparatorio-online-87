-- Remove a coluna grupo_cursos da tabela turma_pairs
ALTER TABLE public.turma_pairs DROP COLUMN IF EXISTS grupo_cursos;