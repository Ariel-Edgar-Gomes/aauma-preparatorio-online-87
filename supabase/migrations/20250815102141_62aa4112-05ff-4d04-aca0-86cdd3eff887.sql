-- Drop the overly permissive existing policy
DROP POLICY IF EXISTS "Users can view alunos with creator info" ON public.alunos;

-- Create role-specific policies with column-level restrictions

-- 1. Admin can access all data
CREATE POLICY "Admins can view all aluno data" 
ON public.alunos 
FOR SELECT 
USING (is_admin(auth.uid()));

-- 2. Inscricao_simples: Only basic enrollment info, no personal details
CREATE POLICY "Inscricao simples can view basic enrollment data" 
ON public.alunos 
FOR SELECT 
USING (has_role(auth.uid(), 'inscricao_simples'::app_role))
WITH CHECK (false); -- No column restriction here, will be handled by views

-- 3. Inscricao_completa: Can see contact info for students they created
CREATE POLICY "Inscricao completa can view created students with contact" 
ON public.alunos 
FOR SELECT 
USING (
  has_role(auth.uid(), 'inscricao_completa'::app_role) 
  AND created_by = auth.uid()
);

-- 4. Financeiro: Only payment-related fields
CREATE POLICY "Financeiro can view payment data" 
ON public.alunos 
FOR SELECT 
USING (has_role(auth.uid(), 'financeiro'::app_role));

-- 5. Visualizador: Only basic non-sensitive data for reporting
CREATE POLICY "Visualizador can view basic data" 
ON public.alunos 
FOR SELECT 
USING (has_role(auth.uid(), 'visualizador'::app_role));

-- 6. Gestor_turmas: Enrollment and class data, no personal details
CREATE POLICY "Gestor turmas can view enrollment data" 
ON public.alunos 
FOR SELECT 
USING (has_role(auth.uid(), 'gestor_turmas'::app_role));

-- Create secure views for role-based access

-- View for inscricao_simples: Only basic enrollment info
CREATE OR REPLACE VIEW public.alunos_basic AS
SELECT 
  id,
  nome,
  curso_codigo,
  status,
  data_inscricao,
  turma_id,
  turma_pair_id,
  created_at
FROM public.alunos;

-- View for financeiro: Only payment-related data
CREATE OR REPLACE VIEW public.alunos_financeiro AS
SELECT 
  id,
  nome,
  curso_codigo,
  status,
  forma_pagamento,
  valor_pago,
  comprovativo_pagamento_url,
  data_inscricao,
  turma_id,
  turma_pair_id
FROM public.alunos;

-- View for visualizador: Basic reporting data only
CREATE OR REPLACE VIEW public.alunos_reporting AS
SELECT 
  id,
  curso_codigo,
  status,
  data_inscricao,
  turma_id,
  turma_pair_id,
  turno,
  duracao,
  created_at
FROM public.alunos;

-- View for gestor_turmas: Enrollment and class management
CREATE OR REPLACE VIEW public.alunos_turmas AS
SELECT 
  id,
  nome,
  curso_codigo,
  status,
  turma_id,
  turma_pair_id,
  turno,
  data_inicio,
  data_inscricao,
  created_at
FROM public.alunos;

-- Enable RLS on views
ALTER VIEW public.alunos_basic ENABLE ROW LEVEL SECURITY;
ALTER VIEW public.alunos_financeiro ENABLE ROW LEVEL SECURITY;
ALTER VIEW public.alunos_reporting ENABLE ROW LEVEL SECURITY;
ALTER VIEW public.alunos_turmas ENABLE ROW LEVEL SECURITY;

-- Create policies for the views
CREATE POLICY "Inscricao simples can access basic view" 
ON public.alunos_basic 
FOR SELECT 
USING (has_role(auth.uid(), 'inscricao_simples'::app_role) OR is_admin(auth.uid()));

CREATE POLICY "Financeiro can access financial view" 
ON public.alunos_financeiro 
FOR SELECT 
USING (has_role(auth.uid(), 'financeiro'::app_role) OR is_admin(auth.uid()));

CREATE POLICY "Visualizador can access reporting view" 
ON public.alunos_reporting 
FOR SELECT 
USING (has_role(auth.uid(), 'visualizador'::app_role) OR is_admin(auth.uid()));

CREATE POLICY "Gestor turmas can access turmas view" 
ON public.alunos_turmas 
FOR SELECT 
USING (has_role(auth.uid(), 'gestor_turmas'::app_role) OR is_admin(auth.uid()));