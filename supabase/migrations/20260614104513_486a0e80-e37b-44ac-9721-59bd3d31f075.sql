CREATE INDEX IF NOT EXISTS idx_alunos_turma_id ON public.alunos (turma_id);
CREATE INDEX IF NOT EXISTS idx_alunos_turma_pair_id ON public.alunos (turma_pair_id);
CREATE INDEX IF NOT EXISTS idx_alunos_created_by ON public.alunos (created_by);
CREATE INDEX IF NOT EXISTS idx_turmas_turma_pair_id ON public.turmas (turma_pair_id);