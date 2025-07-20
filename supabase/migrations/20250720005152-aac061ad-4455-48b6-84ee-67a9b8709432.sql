-- Adicionar constraint única para número do BI
ALTER TABLE public.alunos 
ADD CONSTRAINT unique_numero_bi UNIQUE (numero_bi);