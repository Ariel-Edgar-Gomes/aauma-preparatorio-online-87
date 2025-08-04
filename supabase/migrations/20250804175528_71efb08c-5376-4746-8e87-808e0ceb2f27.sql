-- Criar tabela para ajustes financeiros
CREATE TABLE public.ajustes_financeiros (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  valor NUMERIC NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('aumentar', 'diminuir')),
  descricao TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ajustes_financeiros ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can view all ajustes financeiros" 
ON public.ajustes_financeiros 
FOR SELECT 
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can create ajustes financeiros" 
ON public.ajustes_financeiros 
FOR INSERT 
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update ajustes financeiros" 
ON public.ajustes_financeiros 
FOR UPDATE 
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete ajustes financeiros" 
ON public.ajustes_financeiros 
FOR DELETE 
USING (is_admin(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_ajustes_financeiros_updated_at
BEFORE UPDATE ON public.ajustes_financeiros
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create audit trigger
CREATE TRIGGER audit_ajustes_financeiros
AFTER INSERT OR UPDATE OR DELETE ON public.ajustes_financeiros
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();