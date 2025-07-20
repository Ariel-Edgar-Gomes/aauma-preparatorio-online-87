-- Habilitar realtime para as tabelas principais
ALTER TABLE public.turma_pairs REPLICA IDENTITY FULL;
ALTER TABLE public.turmas REPLICA IDENTITY FULL;
ALTER TABLE public.alunos REPLICA IDENTITY FULL;
ALTER TABLE public.salas REPLICA IDENTITY FULL;

-- Adicionar as tabelas ao publication do realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.turma_pairs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.turmas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alunos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.salas;