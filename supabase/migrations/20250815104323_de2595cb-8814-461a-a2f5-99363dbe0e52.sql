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

-- Agendar execução a cada 5 dias (necessário habilitar pg_cron nas extensões)
SELECT cron.schedule(
  'manter_projeto_ativo',
  '0 0 */5 * *',
  'SELECT public.manter_bd_ativo();'
);