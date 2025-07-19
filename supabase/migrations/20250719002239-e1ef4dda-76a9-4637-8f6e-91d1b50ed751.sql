-- Expandir o sistema de auditoria para capturar mais ações
-- Adicionar novos tipos de eventos e mais detalhes

-- Criar tabela para auditoria de visualizações
CREATE TABLE IF NOT EXISTS public.audit_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  view_type TEXT NOT NULL, -- 'aluno_list', 'aluno_detail', 'turma_list', etc.
  resource_id TEXT, -- ID do recurso visualizado
  resource_type TEXT, -- 'aluno', 'turma', 'user', etc.
  metadata JSONB DEFAULT '{}', -- dados adicionais como filtros aplicados, etc.
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS na tabela de visualizações
ALTER TABLE public.audit_views ENABLE ROW LEVEL SECURITY;

-- Política para admins verem todas as visualizações
CREATE POLICY "Admins can view all audit views"
ON public.audit_views
FOR SELECT
USING (is_admin(auth.uid()));

-- Expandir tabela de audit_logs com mais campos
ALTER TABLE public.audit_logs 
ADD COLUMN IF NOT EXISTS ip_address INET,
ADD COLUMN IF NOT EXISTS user_agent TEXT,
ADD COLUMN IF NOT EXISTS resource_type TEXT,
ADD COLUMN IF NOT EXISTS details JSONB DEFAULT '{}';

-- Função para registrar visualizações automaticamente
CREATE OR REPLACE FUNCTION public.log_view_audit(
  p_view_type TEXT,
  p_resource_id TEXT DEFAULT NULL,
  p_resource_type TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}',
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  audit_id UUID;
BEGIN
  INSERT INTO public.audit_views (
    user_id,
    view_type,
    resource_id,
    resource_type,
    metadata,
    ip_address,
    user_agent
  ) VALUES (
    auth.uid(),
    p_view_type,
    p_resource_id,
    p_resource_type,
    p_metadata,
    p_ip_address,
    p_user_agent
  ) RETURNING id INTO audit_id;
  
  RETURN audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para buscar estatísticas de auditoria por usuário
CREATE OR REPLACE FUNCTION public.get_user_audit_stats(target_user_id UUID DEFAULT NULL)
RETURNS TABLE (
  user_id UUID,
  user_name TEXT,
  user_email TEXT,
  total_actions BIGINT,
  alunos_created BIGINT,
  alunos_updated BIGINT,
  alunos_deleted BIGINT,
  users_created BIGINT,
  role_changes BIGINT,
  last_activity TIMESTAMPTZ,
  total_views BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as user_id,
    p.full_name as user_name,
    p.email as user_email,
    COALESCE(al.total_actions, 0) as total_actions,
    COALESCE(al.alunos_created, 0) as alunos_created,
    COALESCE(al.alunos_updated, 0) as alunos_updated,
    COALESCE(al.alunos_deleted, 0) as alunos_deleted,
    COALESCE(al.users_created, 0) as users_created,
    COALESCE(al.role_changes, 0) as role_changes,
    al.last_activity,
    COALESCE(av.total_views, 0) as total_views
  FROM public.profiles p
  LEFT JOIN (
    SELECT 
      a.user_id,
      COUNT(*) as total_actions,
      COUNT(*) FILTER (WHERE a.action = 'INSERT' AND a.table_name = 'alunos') as alunos_created,
      COUNT(*) FILTER (WHERE a.action = 'UPDATE' AND a.table_name = 'alunos') as alunos_updated,
      COUNT(*) FILTER (WHERE a.action = 'DELETE' AND a.table_name = 'alunos') as alunos_deleted,
      COUNT(*) FILTER (WHERE a.action = 'INSERT' AND a.table_name = 'profiles') as users_created,
      COUNT(*) FILTER (WHERE a.table_name = 'user_roles') as role_changes,
      MAX(a.created_at) as last_activity
    FROM public.audit_logs a
    GROUP BY a.user_id
  ) al ON p.id = al.user_id
  LEFT JOIN (
    SELECT 
      av.user_id,
      COUNT(*) as total_views
    FROM public.audit_views av
    GROUP BY av.user_id
  ) av ON p.id = av.user_id
  WHERE (target_user_id IS NULL OR p.id = target_user_id)
  ORDER BY COALESCE(al.total_actions, 0) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;