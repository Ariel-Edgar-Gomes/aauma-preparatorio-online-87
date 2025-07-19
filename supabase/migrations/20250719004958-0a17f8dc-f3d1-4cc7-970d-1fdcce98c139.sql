-- Permitir que usuários vejam quem criou os alunos
-- Adicionar campo created_by à política de visualização de alunos

-- Primeiro, vamos garantir que o campo created_by está sendo populado corretamente
-- quando novos alunos são criados via trigger

CREATE OR REPLACE FUNCTION public.set_created_by()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.created_by IS NULL THEN
    NEW.created_by = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para preencher automaticamente o created_by
DROP TRIGGER IF EXISTS set_created_by_trigger ON public.alunos;
CREATE TRIGGER set_created_by_trigger
  BEFORE INSERT ON public.alunos
  FOR EACH ROW
  EXECUTE FUNCTION public.set_created_by();

-- Atualizar registros existentes que não têm created_by
-- (definir como NULL para registros antigos, representando "Sistema")
-- Não modificamos os que já têm valores

-- Atualizar política para permitir que usuários vejam informações sobre quem criou
-- Isso é necessário para a funcionalidade de ver "quem inscreveu cada aluno"
DROP POLICY IF EXISTS "Users can view alunos based on role" ON public.alunos;

CREATE POLICY "Users can view alunos with creator info"
ON public.alunos
FOR SELECT
USING (
  is_admin(auth.uid()) OR 
  has_role(auth.uid(), 'inscricao_simples'::app_role) OR 
  has_role(auth.uid(), 'inscricao_completa'::app_role) OR 
  has_role(auth.uid(), 'visualizador'::app_role) OR 
  has_role(auth.uid(), 'financeiro'::app_role) OR
  has_role(auth.uid(), 'gestor_turmas'::app_role)
);

-- Garantir que profiles podem ser acessados para mostrar informações do criador
-- Criar política mais específica para leitura de profiles quando necessário para auditoria
CREATE POLICY "Users can view creator profiles"
ON public.profiles
FOR SELECT
USING (
  is_admin(auth.uid()) OR
  has_role(auth.uid(), 'inscricao_simples'::app_role) OR 
  has_role(auth.uid(), 'inscricao_completa'::app_role) OR 
  has_role(auth.uid(), 'visualizador'::app_role) OR 
  has_role(auth.uid(), 'financeiro'::app_role) OR
  has_role(auth.uid(), 'gestor_turmas'::app_role)
);