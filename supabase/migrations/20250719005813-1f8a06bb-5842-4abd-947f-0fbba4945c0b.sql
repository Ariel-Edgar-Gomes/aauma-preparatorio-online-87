-- Atualizar o campo created_by nos registros existentes baseado nos logs de auditoria
-- Isso vai preencher quem realmente criou cada aluno

UPDATE public.alunos 
SET created_by = audit_logs.user_id
FROM public.audit_logs
WHERE public.alunos.id::text = audit_logs.record_id
  AND audit_logs.action = 'INSERT' 
  AND audit_logs.table_name = 'alunos'
  AND public.alunos.created_by IS NULL;

-- Verificar se há mais registros antigos sem auditoria
-- Para estes, vamos definir um usuário padrão se necessário
-- (pode ser ajustado depois se soubermos quem criou)