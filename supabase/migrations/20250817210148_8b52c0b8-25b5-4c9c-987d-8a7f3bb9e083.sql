-- Criar tabela fictícia para manter bd ativo
CREATE TABLE public.bd_ativo (
  id SERIAL PRIMARY KEY,
  num INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar função para manter bd ativo
CREATE OR REPLACE FUNCTION public.manter_bd_ativo()
RETURNS void AS $$
BEGIN
  INSERT INTO public.bd_ativo (num) VALUES (1);
  PERFORM pg_sleep(5);
  INSERT INTO public.bd_ativo (num) VALUES (1);
  PERFORM pg_sleep(5);
  INSERT INTO public.bd_ativo (num) VALUES (1);
END;
$$ LANGUAGE plpgsql;