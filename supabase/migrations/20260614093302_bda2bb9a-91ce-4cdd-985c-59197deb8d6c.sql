
-- ===== ENUMS =====
CREATE TYPE public.periodo_type AS ENUM ('manha', 'tarde');
CREATE TYPE public.grupo_cursos_type AS ENUM ('engenharias', 'saude', 'ciencias-sociais-humanas');
CREATE TYPE public.status_aluno_type AS ENUM ('inscrito', 'confirmado', 'cancelado');
CREATE TYPE public.forma_pagamento_type AS ENUM ('Cash', 'Transferencia', 'Cartao');
CREATE TYPE public.app_role AS ENUM ('admin', 'inscricao_simples', 'inscricao_completa', 'visualizador', 'financeiro', 'gestor_turmas');

-- ===== COMMON FUNCTIONS =====
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ===== TABLES =====
CREATE TABLE public.cursos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  grupo_cursos grupo_cursos_type NOT NULL,
  disciplinas TEXT[] NOT NULL DEFAULT '{}',
  horario_semanal JSONB NOT NULL DEFAULT '{}',
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.salas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo TEXT NOT NULL UNIQUE,
  capacidade INTEGER NOT NULL DEFAULT 30,
  tipo TEXT DEFAULT 'sala',
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.turma_pairs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  periodo periodo_type NOT NULL,
  horario_periodo TEXT NOT NULL,
  cursos TEXT[] NOT NULL DEFAULT '{}',
  disciplinas_comuns TEXT[] NOT NULL DEFAULT '{}',
  horario_semanal JSONB NOT NULL DEFAULT '{}',
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.turmas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  turma_pair_id UUID NOT NULL REFERENCES public.turma_pairs(id) ON DELETE CASCADE,
  tipo CHAR(1) NOT NULL CHECK (tipo IN ('A', 'B')),
  sala_id UUID NOT NULL REFERENCES public.salas(id),
  capacidade INTEGER NOT NULL DEFAULT 30,
  alunos_inscritos INTEGER NOT NULL DEFAULT 0,
  horario_semanal JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(turma_pair_id, tipo)
);

CREATE TABLE public.alunos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT,
  telefone TEXT NOT NULL,
  numero_bi TEXT NOT NULL,
  data_nascimento DATE,
  endereco TEXT,
  numero_estudante TEXT UNIQUE,
  curso_codigo TEXT NOT NULL,
  turma_pair_id UUID NOT NULL REFERENCES public.turma_pairs(id),
  turma_id UUID NOT NULL REFERENCES public.turmas(id),
  turno TEXT NOT NULL,
  duracao TEXT NOT NULL DEFAULT '1 Mês',
  data_inicio DATE NOT NULL,
  forma_pagamento forma_pagamento_type NOT NULL DEFAULT 'Cash',
  valor_pago DECIMAL(10,2) NOT NULL DEFAULT 40000.00,
  status status_aluno_type NOT NULL DEFAULT 'inscrito',
  data_inscricao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  observacoes TEXT,
  foto_url TEXT,
  copia_bi_url TEXT,
  declaracao_certificado_url TEXT,
  comprovativo_pagamento_url TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_numero_bi UNIQUE (numero_bi)
);

CREATE TABLE public.horarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  curso_codigo TEXT NOT NULL,
  dia_semana TEXT NOT NULL,
  periodo periodo_type NOT NULL,
  disciplina TEXT NOT NULL,
  horario_inicio TIME NOT NULL,
  horario_fim TIME NOT NULL,
  professor TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE (user_id, role)
);

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  resource_type TEXT,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.audit_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  view_type TEXT NOT NULL,
  resource_id TEXT,
  resource_type TEXT,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.bd_ativo (
  id SERIAL PRIMARY KEY,
  num INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== GRANTS =====
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cursos TO authenticated;
GRANT ALL ON public.cursos TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.salas TO authenticated;
GRANT ALL ON public.salas TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.turma_pairs TO authenticated;
GRANT ALL ON public.turma_pairs TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.turmas TO authenticated;
GRANT ALL ON public.turmas TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.alunos TO authenticated;
GRANT ALL ON public.alunos TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.horarios TO authenticated;
GRANT ALL ON public.horarios TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.audit_views TO authenticated;
GRANT ALL ON public.audit_views TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bd_ativo TO authenticated;
GRANT ALL ON public.bd_ativo TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.bd_ativo_id_seq TO authenticated, service_role;

-- ===== ROLE FUNCTIONS =====
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'admin')
$$;

-- ===== OTHER FUNCTIONS =====
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.audit_trigger()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_values)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, OLD.id::TEXT, to_jsonb(OLD));
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_values, new_values)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id::TEXT, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, new_values)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id::TEXT, to_jsonb(NEW));
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.log_view_audit(
  p_view_type TEXT,
  p_resource_id TEXT DEFAULT NULL,
  p_resource_type TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}',
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  audit_id UUID;
BEGIN
  INSERT INTO public.audit_views (user_id, view_type, resource_id, resource_type, metadata, ip_address, user_agent)
  VALUES (auth.uid(), p_view_type, p_resource_id, p_resource_type, p_metadata, p_ip_address, p_user_agent)
  RETURNING id INTO audit_id;
  RETURN audit_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_audit_stats(target_user_id UUID DEFAULT NULL)
RETURNS TABLE (
  user_id UUID, user_name TEXT, user_email TEXT, total_actions BIGINT,
  alunos_created BIGINT, alunos_updated BIGINT, alunos_deleted BIGINT,
  users_created BIGINT, role_changes BIGINT, last_activity TIMESTAMPTZ, total_views BIGINT
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.full_name, p.email,
    COALESCE(al.total_actions, 0), COALESCE(al.alunos_created, 0),
    COALESCE(al.alunos_updated, 0), COALESCE(al.alunos_deleted, 0),
    COALESCE(al.users_created, 0), COALESCE(al.role_changes, 0),
    al.last_activity, COALESCE(av.total_views, 0)
  FROM public.profiles p
  LEFT JOIN (
    SELECT a.user_id,
      COUNT(*) as total_actions,
      COUNT(*) FILTER (WHERE a.action = 'INSERT' AND a.table_name = 'alunos') as alunos_created,
      COUNT(*) FILTER (WHERE a.action = 'UPDATE' AND a.table_name = 'alunos') as alunos_updated,
      COUNT(*) FILTER (WHERE a.action = 'DELETE' AND a.table_name = 'alunos') as alunos_deleted,
      COUNT(*) FILTER (WHERE a.action = 'INSERT' AND a.table_name = 'profiles') as users_created,
      COUNT(*) FILTER (WHERE a.table_name = 'user_roles') as role_changes,
      MAX(a.created_at) as last_activity
    FROM public.audit_logs a GROUP BY a.user_id
  ) al ON p.id = al.user_id
  LEFT JOIN (
    SELECT av.user_id, COUNT(*) as total_views FROM public.audit_views av GROUP BY av.user_id
  ) av ON p.id = av.user_id
  WHERE (target_user_id IS NULL OR p.id = target_user_id)
  ORDER BY COALESCE(al.total_actions, 0) DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_created_by()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.created_by IS NULL THEN
    NEW.created_by = auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

CREATE SEQUENCE IF NOT EXISTS public.aluno_sequence START 1;

CREATE OR REPLACE FUNCTION public.generate_numero_estudante()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.numero_estudante IS NULL THEN
    NEW.numero_estudante := 'EST' || LPAD((EXTRACT(year FROM NEW.created_at)::text) || LPAD(NEXTVAL('public.aluno_sequence')::text, 4, '0'), 8, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION public.update_alunos_inscritos_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.turmas SET alunos_inscritos = alunos_inscritos + 1 WHERE id = NEW.turma_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.turmas SET alunos_inscritos = alunos_inscritos - 1 WHERE id = OLD.turma_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.turma_id != NEW.turma_id THEN
      UPDATE public.turmas SET alunos_inscritos = alunos_inscritos - 1 WHERE id = OLD.turma_id;
      UPDATE public.turmas SET alunos_inscritos = alunos_inscritos + 1 WHERE id = NEW.turma_id;
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION public.manter_bd_ativo()
RETURNS void LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  INSERT INTO public.bd_ativo (num) VALUES (1);
  PERFORM pg_sleep(5);
  INSERT INTO public.bd_ativo (num) VALUES (1);
  PERFORM pg_sleep(5);
  INSERT INTO public.bd_ativo (num) VALUES (1);
END;
$$;

-- ===== TRIGGERS =====
CREATE TRIGGER update_cursos_updated_at BEFORE UPDATE ON public.cursos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_salas_updated_at BEFORE UPDATE ON public.salas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_turma_pairs_updated_at BEFORE UPDATE ON public.turma_pairs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_turmas_updated_at BEFORE UPDATE ON public.turmas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_alunos_updated_at BEFORE UPDATE ON public.alunos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_horarios_updated_at BEFORE UPDATE ON public.horarios FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER generate_aluno_numero BEFORE INSERT ON public.alunos FOR EACH ROW EXECUTE FUNCTION public.generate_numero_estudante();
CREATE TRIGGER set_created_by_trigger BEFORE INSERT ON public.alunos FOR EACH ROW EXECUTE FUNCTION public.set_created_by();
CREATE TRIGGER update_turma_alunos_count AFTER INSERT OR UPDATE OR DELETE ON public.alunos FOR EACH ROW EXECUTE FUNCTION public.update_alunos_inscritos_count();

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

CREATE TRIGGER audit_alunos_trigger AFTER INSERT OR UPDATE OR DELETE ON public.alunos FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();
CREATE TRIGGER audit_turmas_trigger AFTER INSERT OR UPDATE OR DELETE ON public.turmas FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();
CREATE TRIGGER audit_turma_pairs_trigger AFTER INSERT OR UPDATE OR DELETE ON public.turma_pairs FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();
CREATE TRIGGER audit_cursos_trigger AFTER INSERT OR UPDATE OR DELETE ON public.cursos FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();
CREATE TRIGGER audit_horarios_trigger AFTER INSERT OR UPDATE OR DELETE ON public.horarios FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();
CREATE TRIGGER audit_profiles_trigger AFTER INSERT OR UPDATE OR DELETE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();
CREATE TRIGGER audit_user_roles_trigger AFTER INSERT OR UPDATE OR DELETE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();
CREATE TRIGGER audit_salas_trigger AFTER INSERT OR UPDATE OR DELETE ON public.salas FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

-- ===== RLS =====
ALTER TABLE public.cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.turma_pairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.turmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.horarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bd_ativo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can manage all user roles" ON public.user_roles FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage all profiles" ON public.profiles FOR ALL TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Users can view creator profiles" ON public.profiles FOR SELECT TO authenticated USING (
  public.is_admin(auth.uid()) OR
  public.has_role(auth.uid(), 'inscricao_simples') OR
  public.has_role(auth.uid(), 'inscricao_completa') OR
  public.has_role(auth.uid(), 'visualizador') OR
  public.has_role(auth.uid(), 'financeiro') OR
  public.has_role(auth.uid(), 'gestor_turmas')
);

CREATE POLICY "Authenticated users can view cursos" ON public.cursos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage cursos" ON public.cursos FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can view salas" ON public.salas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and gestor_turmas can manage salas" ON public.salas FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()) OR public.has_role(auth.uid(), 'gestor_turmas'))
  WITH CHECK (public.is_admin(auth.uid()) OR public.has_role(auth.uid(), 'gestor_turmas'));

CREATE POLICY "Authenticated users can view turmas" ON public.turmas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and gestor_turmas can manage turmas" ON public.turmas FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()) OR public.has_role(auth.uid(), 'gestor_turmas'));

CREATE POLICY "Authenticated users can view turma_pairs" ON public.turma_pairs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Only admins can insert turma_pairs" ON public.turma_pairs FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Only admins can delete turma_pairs" ON public.turma_pairs FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins and gestor_turmas can update turma_pairs" ON public.turma_pairs FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()) OR public.has_role(auth.uid(), 'gestor_turmas'))
  WITH CHECK (public.is_admin(auth.uid()) OR public.has_role(auth.uid(), 'gestor_turmas'));

CREATE POLICY "Authenticated users can view horarios" ON public.horarios FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage horarios" ON public.horarios FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage all alunos" ON public.alunos FOR ALL TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Inscricao users can create alunos" ON public.alunos FOR INSERT TO authenticated WITH CHECK (
  public.has_role(auth.uid(), 'inscricao_simples') OR
  public.has_role(auth.uid(), 'inscricao_completa') OR
  public.is_admin(auth.uid())
);
CREATE POLICY "Inscricao_completa can update alunos" ON public.alunos FOR UPDATE TO authenticated USING (
  public.is_admin(auth.uid()) OR public.has_role(auth.uid(), 'inscricao_completa')
);
CREATE POLICY "Admins can view all aluno data" ON public.alunos FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Inscricao simples can view basic enrollment data" ON public.alunos FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'inscricao_simples'));
CREATE POLICY "Inscricao completa can view created students with contact" ON public.alunos FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(), 'inscricao_completa') AND created_by = auth.uid()
);
CREATE POLICY "Financeiro can view payment data" ON public.alunos FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'financeiro'));
CREATE POLICY "Visualizador can view basic data" ON public.alunos FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'visualizador'));
CREATE POLICY "Gestor turmas can view enrollment data" ON public.alunos FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'gestor_turmas'));

CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can view all audit views" ON public.audit_views FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "bd_ativo_select_policy" ON public.bd_ativo FOR SELECT USING (true);
CREATE POLICY "bd_ativo_insert_policy" ON public.bd_ativo FOR INSERT WITH CHECK (true);

-- ===== REALTIME =====
ALTER TABLE public.turma_pairs REPLICA IDENTITY FULL;
ALTER TABLE public.turmas REPLICA IDENTITY FULL;
ALTER TABLE public.alunos REPLICA IDENTITY FULL;
ALTER TABLE public.salas REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.turma_pairs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.turmas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alunos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.salas;

-- ===== SEED DATA =====
INSERT INTO public.salas (codigo, capacidade, tipo) VALUES
('U107', 30, 'sala'), ('U108', 30, 'sala'), ('U109', 30, 'sala'), ('U110', 30, 'sala'),
('U111', 30, 'sala'), ('U112', 30, 'sala'), ('U113', 30, 'sala'),
('Lab01', 30, 'laboratorio'), ('Lab02', 30, 'laboratorio'), ('Lab03', 30, 'laboratorio'),
('Auditório', 50, 'auditorio'), ('Sala A1', 30, 'sala'), ('Sala A2', 30, 'sala'), ('Sala A3', 30, 'sala');

INSERT INTO public.cursos (codigo, nome, grupo_cursos, disciplinas, horario_semanal) VALUES
('engenharia-informatica', 'Engenharia Informática', 'engenharias', '{"L.P", "Matemática", "Física"}', '{"segunda": "L.P", "terca": "-", "quarta": "L.P, Mat", "quinta": "Física", "sexta": "Matemática"}'),
('engenharia-civil', 'Engenharia Civil', 'engenharias', '{"L.P", "Matemática", "Física", "Desenho"}', '{"segunda": "L.P", "terca": "-", "quarta": "L.P, Mat", "quinta": "Física, Desenho", "sexta": "Matemática"}'),
('engenharia-mecatronica', 'Engenharia Mecatrónica', 'engenharias', '{"L.P", "Matemática", "Física"}', '{"segunda": "L.P", "terca": "-", "quarta": "L.P, Mat", "quinta": "Física", "sexta": "Matemática"}'),
('engenharia-industrial-sistemas-electricos', 'Eng. Industrial e Sist. Eléctricos', 'engenharias', '{"L.P", "Matemática", "Física"}', '{"segunda": "L.P", "terca": "-", "quarta": "L.P, Mat", "quinta": "Física", "sexta": "Matemática"}'),
('engenharia-agropecuaria', 'Engenharia Agropecuária', 'engenharias', '{"L.P", "Matemática", "Física"}', '{"segunda": "L.P", "terca": "-", "quarta": "L.P, Mat", "quinta": "Física", "sexta": "Matemática"}'),
('arquitectura-urbanismo', 'Arquitectura e Urbanismo', 'engenharias', '{"L.P", "Matemática", "Física", "Desenho"}', '{"segunda": "L.P", "terca": "-", "quarta": "L.P, Mat", "quinta": "Física, Desenho", "sexta": "Matemática"}'),
('medicina', 'Medicina', 'saude', '{"Biologia", "Química", "Matemática"}', '{"segunda": "-", "terca": "Biologia, Química", "quarta": "Matemática", "quinta": "-", "sexta": "Matemática, Biologia"}'),
('analises-clinicas', 'Análises Clínicas e Saúde Pública', 'saude', '{"Biologia", "Química", "Matemática"}', '{"segunda": "-", "terca": "Biologia, Química", "quarta": "Matemática", "quinta": "-", "sexta": "Matemática, Biologia"}'),
('enfermagem', 'Enfermagem', 'saude', '{"Biologia", "Química", "Matemática"}', '{"segunda": "-", "terca": "Biologia, Química", "quarta": "Matemática", "quinta": "-", "sexta": "Matemática, Biologia"}'),
('cardiopneumologia', 'Cardiopneumologia', 'saude', '{"Biologia", "Química", "Matemática"}', '{"segunda": "-", "terca": "Biologia, Química", "quarta": "Matemática", "quinta": "-", "sexta": "Matemática, Biologia"}'),
('fisioterapia', 'Fisioterapia', 'saude', '{"Biologia", "Química", "Matemática"}', '{"segunda": "-", "terca": "Biologia, Química", "quarta": "Matemática", "quinta": "-", "sexta": "Matemática, Biologia"}'),
('psicologia', 'Psicologia', 'saude', '{"Biologia", "Química", "Matemática"}', '{"segunda": "-", "terca": "Biologia, Química", "quarta": "Matemática", "quinta": "-", "sexta": "Matemática, Biologia"}'),
('direito', 'Direito', 'ciencias-sociais-humanas', '{"História", "L.P", "Matemática"}', '{"segunda": "História, L.P", "terca": "-", "quarta": "L.P, Matemática", "quinta": "-", "sexta": "Matemática"}'),
('gestao-administracao', 'Gestão e Administração de Empresas', 'ciencias-sociais-humanas', '{"História", "L.P", "Matemática"}', '{"segunda": "História, L.P", "terca": "-", "quarta": "L.P, Matemática", "quinta": "-", "sexta": "Matemática"}'),
('lingua-portuguesa', 'Língua Portuguesa e Comunicação', 'ciencias-sociais-humanas', '{"História", "L.P", "Matemática"}', '{"segunda": "História, L.P", "terca": "-", "quarta": "L.P, Matemática", "quinta": "-", "sexta": "Matemática"}'),
('economia', 'Economia', 'ciencias-sociais-humanas', '{"História", "L.P", "Matemática"}', '{"segunda": "História, L.P", "terca": "-", "quarta": "L.P, Matemática", "quinta": "-", "sexta": "Matemática"}'),
('turismo-gestao-hoteleira', 'Turismo e Gestão Hoteleira', 'ciencias-sociais-humanas', '{"História", "L.P", "Matemática"}', '{"segunda": "História, L.P", "terca": "-", "quarta": "L.P, Matemática", "quinta": "-", "sexta": "Matemática"}');

INSERT INTO public.turma_pairs (nome, periodo, horario_periodo, cursos, disciplinas_comuns, horario_semanal) VALUES
('Par 1 - Manhã', 'manha', '08h00 - 12h00', '{"engenharia-informatica", "engenharia-civil", "engenharia-mecatronica"}', '{"L.P", "Matemática", "Física"}', '{"segunda": "L.P", "terca": "-", "quarta": "L.P, Mat", "quinta": "Física", "sexta": "Matemática"}'),
('Par 1 - Tarde', 'tarde', '13h00 - 17h00', '{"engenharia-industrial-sistemas-electricos", "engenharia-agropecuaria", "arquitectura-urbanismo"}', '{"L.P", "Matemática", "Física"}', '{"segunda": "L.P", "terca": "-", "quarta": "L.P, Mat", "quinta": "Física", "sexta": "Matemática"}'),
('Par 2 - Manhã', 'manha', '08h00 - 12h00', '{"medicina", "analises-clinicas", "enfermagem"}', '{"Biologia", "Química", "Matemática"}', '{"segunda": "-", "terca": "Biologia, Química", "quarta": "Matemática", "quinta": "-", "sexta": "Matemática, Biologia"}'),
('Par 2 - Tarde', 'tarde', '13h00 - 17h00', '{"cardiopneumologia", "fisioterapia", "psicologia"}', '{"Biologia", "Química", "Matemática"}', '{"segunda": "-", "terca": "Biologia, Química", "quarta": "Matemática", "quinta": "-", "sexta": "Matemática, Biologia"}'),
('Par 3 - Manhã', 'manha', '08h00 - 12h00', '{"direito", "gestao-administracao", "lingua-portuguesa"}', '{"História", "L.P", "Matemática"}', '{"segunda": "História, L.P", "terca": "-", "quarta": "L.P, Matemática", "quinta": "-", "sexta": "Matemática"}'),
('Par 3 - Tarde', 'tarde', '13h00 - 17h00', '{"economia", "turismo-gestao-hoteleira"}', '{"História", "L.P", "Matemática"}', '{"segunda": "História, L.P", "terca": "-", "quarta": "L.P, Matemática", "quinta": "-", "sexta": "Matemática"}');

INSERT INTO public.turmas (turma_pair_id, tipo, sala_id, capacidade, horario_semanal)
SELECT tp.id, v.tipo, s.id, 30, v.horario::jsonb
FROM (VALUES
  ('Par 1 - Manhã', 'A', 'U107', '{"segunda": "L.P", "terca": "-", "quarta": "L.P, Mat", "quinta": "Física", "sexta": "Matemática"}'),
  ('Par 1 - Manhã', 'B', 'U108', '{"segunda": "L.P", "terca": "-", "quarta": "Mat, L.P", "quinta": "Física", "sexta": "Matemática"}'),
  ('Par 1 - Tarde', 'A', 'U109', '{"segunda": "L.P", "terca": "-", "quarta": "L.P, Mat", "quinta": "Física", "sexta": "Matemática"}'),
  ('Par 1 - Tarde', 'B', 'U110', '{"segunda": "L.P", "terca": "-", "quarta": "Mat, L.P", "quinta": "Física", "sexta": "Matemática"}'),
  ('Par 2 - Manhã', 'A', 'U111', '{"segunda": "-", "terca": "Biologia, Química", "quarta": "Matemática", "quinta": "-", "sexta": "Matemática, Biologia"}'),
  ('Par 2 - Manhã', 'B', 'U112', '{"segunda": "-", "terca": "Química, Biologia", "quarta": "Matemática", "quinta": "-", "sexta": "Biologia, Matemática"}'),
  ('Par 2 - Tarde', 'A', 'U113', '{"segunda": "-", "terca": "Biologia, Química", "quarta": "Matemática", "quinta": "-", "sexta": "Matemática, Biologia"}'),
  ('Par 2 - Tarde', 'B', 'Lab01', '{"segunda": "-", "terca": "Química, Biologia", "quarta": "Matemática", "quinta": "-", "sexta": "Biologia, Matemática"}'),
  ('Par 3 - Manhã', 'A', 'Lab02', '{"segunda": "História, L.P", "terca": "-", "quarta": "L.P, Matemática", "quinta": "-", "sexta": "Matemática"}'),
  ('Par 3 - Manhã', 'B', 'Lab03', '{"segunda": "L.P, História", "terca": "-", "quarta": "Matemática, L.P", "quinta": "-", "sexta": "Matemática"}'),
  ('Par 3 - Tarde', 'A', 'Auditório', '{"segunda": "História, L.P", "terca": "-", "quarta": "L.P, Matemática", "quinta": "-", "sexta": "Matemática"}'),
  ('Par 3 - Tarde', 'B', 'Sala A1', '{"segunda": "L.P, História", "terca": "-", "quarta": "Matemática, L.P", "quinta": "-", "sexta": "Matemática"}')
) AS v(par_nome, tipo, sala_codigo, horario)
JOIN public.turma_pairs tp ON tp.nome = v.par_nome
JOIN public.salas s ON s.codigo = v.sala_codigo;
