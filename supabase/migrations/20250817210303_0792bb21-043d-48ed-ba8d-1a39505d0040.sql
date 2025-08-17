-- Habilitar RLS na tabela bd_ativo
ALTER TABLE public.bd_ativo ENABLE ROW LEVEL SECURITY;

-- Política para permitir que todos vejam os registros (tabela fictícia)
CREATE POLICY "bd_ativo_select_policy" ON public.bd_ativo
FOR SELECT USING (true);

-- Política para permitir inserções (apenas para a função)
CREATE POLICY "bd_ativo_insert_policy" ON public.bd_ativo
FOR INSERT WITH CHECK (true);