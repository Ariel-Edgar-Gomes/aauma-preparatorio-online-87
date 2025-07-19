-- Corrigir políticas RLS da tabela salas para permitir todas as operações para admins e gestores de turmas

-- Primeiro, remover todas as políticas existentes para a tabela salas
DROP POLICY IF EXISTS "Authenticated users can view salas" ON public.salas;
DROP POLICY IF EXISTS "Admins can manage salas" ON public.salas;

-- Criar políticas atualizadas para permitir todas as operações
CREATE POLICY "Users can view salas" 
ON public.salas 
FOR SELECT 
USING (true);

CREATE POLICY "Admins and gestor_turmas can manage salas" 
ON public.salas 
FOR ALL 
USING (is_admin(auth.uid()) OR has_role(auth.uid(), 'gestor_turmas'::app_role))
WITH CHECK (is_admin(auth.uid()) OR has_role(auth.uid(), 'gestor_turmas'::app_role));