-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM (
  'admin',
  'inscricao_simples', 
  'inscricao_completa',
  'visualizador',
  'financeiro',
  'gestor_turmas'
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user has any admin role
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'admin'
  )
$$;

-- Create policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all user roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));

-- Create profiles table for additional user info
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage all profiles"
ON public.profiles
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));

-- Function to handle new user signup (create profile)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Update alunos table policies to be role-based
DROP POLICY IF EXISTS "Admin pode gerenciar alunos" ON public.alunos;
DROP POLICY IF EXISTS "Alunos podem ser criados publicamente" ON public.alunos;
DROP POLICY IF EXISTS "Alunos são visíveis publicamente" ON public.alunos;

CREATE POLICY "Admins can manage all alunos"
ON public.alunos
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Inscricao users can create alunos"
ON public.alunos
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'inscricao_simples') OR 
  public.has_role(auth.uid(), 'inscricao_completa') OR
  public.is_admin(auth.uid())
);

CREATE POLICY "Users can view alunos based on role"
ON public.alunos
FOR SELECT
TO authenticated
USING (
  public.is_admin(auth.uid()) OR
  public.has_role(auth.uid(), 'inscricao_simples') OR
  public.has_role(auth.uid(), 'inscricao_completa') OR
  public.has_role(auth.uid(), 'visualizador') OR
  public.has_role(auth.uid(), 'financeiro')
);

CREATE POLICY "Inscricao_completa can update alunos"
ON public.alunos
FOR UPDATE
TO authenticated
USING (
  public.is_admin(auth.uid()) OR
  public.has_role(auth.uid(), 'inscricao_completa')
);

-- Add created_by field to alunos to track who created each student
ALTER TABLE public.alunos ADD COLUMN created_by UUID REFERENCES auth.users(id);

-- Update other tables policies
DROP POLICY IF EXISTS "Admin pode gerenciar cursos" ON public.cursos;
DROP POLICY IF EXISTS "Cursos são visíveis publicamente" ON public.cursos;

CREATE POLICY "Authenticated users can view cursos"
ON public.cursos
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage cursos"
ON public.cursos
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));

-- Similar updates for other tables
DROP POLICY IF EXISTS "Admin pode gerenciar salas" ON public.salas;
DROP POLICY IF EXISTS "Salas são visíveis publicamente" ON public.salas;

CREATE POLICY "Authenticated users can view salas"
ON public.salas
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage salas"
ON public.salas
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admin pode gerenciar turmas" ON public.turmas;
DROP POLICY IF EXISTS "Turmas são visíveis publicamente" ON public.turmas;

CREATE POLICY "Authenticated users can view turmas"
ON public.turmas
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins and gestor_turmas can manage turmas"
ON public.turmas
FOR ALL
TO authenticated
USING (
  public.is_admin(auth.uid()) OR
  public.has_role(auth.uid(), 'gestor_turmas')
);

DROP POLICY IF EXISTS "Admin pode gerenciar pares de turmas" ON public.turma_pairs;
DROP POLICY IF EXISTS "Pares de turmas são visíveis publicamente" ON public.turma_pairs;

CREATE POLICY "Authenticated users can view turma_pairs"
ON public.turma_pairs
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins and gestor_turmas can manage turma_pairs"
ON public.turma_pairs
FOR ALL
TO authenticated
USING (
  public.is_admin(auth.uid()) OR
  public.has_role(auth.uid(), 'gestor_turmas')
);

DROP POLICY IF EXISTS "Admin pode gerenciar horários" ON public.horarios;
DROP POLICY IF EXISTS "Horários são visíveis publicamente" ON public.horarios;

CREATE POLICY "Authenticated users can view horarios"
ON public.horarios
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage horarios"
ON public.horarios
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));