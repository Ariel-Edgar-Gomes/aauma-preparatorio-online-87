-- Remover política atual que permite gestores de turmas gerenciarem tudo
DROP POLICY IF EXISTS "Admins and gestor_turmas can manage turma_pairs" ON public.turma_pairs;

-- Criar políticas específicas: apenas admin pode inserir e deletar
CREATE POLICY "Only admins can insert turma_pairs" 
ON public.turma_pairs 
FOR INSERT 
TO authenticated
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Only admins can delete turma_pairs" 
ON public.turma_pairs 
FOR DELETE 
TO authenticated
USING (is_admin(auth.uid()));

-- Gestores de turmas podem apenas visualizar e atualizar (editar)
CREATE POLICY "Admins and gestor_turmas can update turma_pairs" 
ON public.turma_pairs 
FOR UPDATE 
TO authenticated
USING (is_admin(auth.uid()) OR has_role(auth.uid(), 'gestor_turmas'::app_role))
WITH CHECK (is_admin(auth.uid()) OR has_role(auth.uid(), 'gestor_turmas'::app_role));