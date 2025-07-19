-- Atualizar o valor padrão da coluna duracao na tabela alunos para "1 Mês"
ALTER TABLE public.alunos 
ALTER COLUMN duracao SET DEFAULT '1 Mês';