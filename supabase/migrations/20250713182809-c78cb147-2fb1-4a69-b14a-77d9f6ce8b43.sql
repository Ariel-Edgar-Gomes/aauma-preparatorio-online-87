-- Inserir dados iniciais dos pares de turmas baseados na estrutura existente

-- Primeiro, obter os IDs das salas para referências
WITH sala_ids AS (
  SELECT codigo, id FROM public.salas
)

-- Inserir os pares de turmas
INSERT INTO public.turma_pairs (nome, periodo, horario_periodo, grupo_cursos, cursos, disciplinas_comuns, horario_semanal) VALUES

-- Engenharias - Manhã
('Par 1 - Manhã', 'manha', '08h00 - 12h00', 'engenharias', 
 '{"engenharia-informatica", "engenharia-civil", "engenharia-mecatronica"}',
 '{"L.P", "Matemática", "Física"}',
 '{"segunda": "L.P", "terca": "-", "quarta": "L.P, Mat", "quinta": "Física", "sexta": "Matemática"}'),

-- Engenharias - Tarde
('Par 1 - Tarde', 'tarde', '13h00 - 17h00', 'engenharias', 
 '{"engenharia-industrial-sistemas-electricos", "engenharia-agropecuaria", "arquitectura-urbanismo"}',
 '{"L.P", "Matemática", "Física"}',
 '{"segunda": "L.P", "terca": "-", "quarta": "L.P, Mat", "quinta": "Física", "sexta": "Matemática"}'),

-- Saúde - Manhã
('Par 2 - Manhã', 'manha', '08h00 - 12h00', 'saude', 
 '{"medicina", "analises-clinicas", "enfermagem"}',
 '{"Biologia", "Química", "Matemática"}',
 '{"segunda": "-", "terca": "Biologia, Química", "quarta": "Matemática", "quinta": "-", "sexta": "Matemática, Biologia"}'),

-- Saúde - Tarde  
('Par 2 - Tarde', 'tarde', '13h00 - 17h00', 'saude', 
 '{"cardiopneumologia", "fisioterapia", "psicologia"}',
 '{"Biologia", "Química", "Matemática"}',
 '{"segunda": "-", "terca": "Biologia, Química", "quarta": "Matemática", "quinta": "-", "sexta": "Matemática, Biologia"}'),

-- Ciências Sociais e Humanas - Manhã
('Par 3 - Manhã', 'manha', '08h00 - 12h00', 'ciencias-sociais-humanas', 
 '{"direito", "gestao-administracao", "lingua-portuguesa"}',
 '{"História", "L.P", "Matemática"}',
 '{"segunda": "História, L.P", "terca": "-", "quarta": "L.P, Matemática", "quinta": "-", "sexta": "Matemática"}'),

-- Ciências Sociais e Humanas - Tarde
('Par 3 - Tarde', 'tarde', '13h00 - 17h00', 'ciencias-sociais-humanas', 
 '{"economia", "turismo-gestao-hoteleira"}',
 '{"História", "L.P", "Matemática"}',
 '{"segunda": "História, L.P", "terca": "-", "quarta": "L.P, Matemática", "quinta": "-", "sexta": "Matemática"}');

-- Agora inserir as turmas individuais (A e B) para cada par
-- Engenharias Manhã (Par 1)
INSERT INTO public.turmas (turma_pair_id, tipo, sala_id, capacidade, horario_semanal)
SELECT tp.id, 'A', s.id, 30, 
  '{"segunda": "L.P", "terca": "-", "quarta": "L.P, Mat", "quinta": "Física", "sexta": "Matemática"}'
FROM public.turma_pairs tp, public.salas s 
WHERE tp.nome = 'Par 1 - Manhã' AND s.codigo = 'U107';

INSERT INTO public.turmas (turma_pair_id, tipo, sala_id, capacidade, horario_semanal)
SELECT tp.id, 'B', s.id, 30, 
  '{"segunda": "L.P", "terca": "-", "quarta": "Mat, L.P", "quinta": "Física", "sexta": "Matemática"}'
FROM public.turma_pairs tp, public.salas s 
WHERE tp.nome = 'Par 1 - Manhã' AND s.codigo = 'U108';

-- Engenharias Tarde (Par 1)
INSERT INTO public.turmas (turma_pair_id, tipo, sala_id, capacidade, horario_semanal)
SELECT tp.id, 'A', s.id, 30, 
  '{"segunda": "L.P", "terca": "-", "quarta": "L.P, Mat", "quinta": "Física", "sexta": "Matemática"}'
FROM public.turma_pairs tp, public.salas s 
WHERE tp.nome = 'Par 1 - Tarde' AND s.codigo = 'U109';

INSERT INTO public.turmas (turma_pair_id, tipo, sala_id, capacidade, horario_semanal)
SELECT tp.id, 'B', s.id, 30, 
  '{"segunda": "L.P", "terca": "-", "quarta": "Mat, L.P", "quinta": "Física", "sexta": "Matemática"}'
FROM public.turma_pairs tp, public.salas s 
WHERE tp.nome = 'Par 1 - Tarde' AND s.codigo = 'U110';

-- Saúde Manhã (Par 2)
INSERT INTO public.turmas (turma_pair_id, tipo, sala_id, capacidade, horario_semanal)
SELECT tp.id, 'A', s.id, 30, 
  '{"segunda": "-", "terca": "Biologia, Química", "quarta": "Matemática", "quinta": "-", "sexta": "Matemática, Biologia"}'
FROM public.turma_pairs tp, public.salas s 
WHERE tp.nome = 'Par 2 - Manhã' AND s.codigo = 'U111';

INSERT INTO public.turmas (turma_pair_id, tipo, sala_id, capacidade, horario_semanal)
SELECT tp.id, 'B', s.id, 30, 
  '{"segunda": "-", "terca": "Química, Biologia", "quarta": "Matemática", "quinta": "-", "sexta": "Biologia, Matemática"}'
FROM public.turma_pairs tp, public.salas s 
WHERE tp.nome = 'Par 2 - Manhã' AND s.codigo = 'U112';

-- Saúde Tarde (Par 2)
INSERT INTO public.turmas (turma_pair_id, tipo, sala_id, capacidade, horario_semanal)
SELECT tp.id, 'A', s.id, 30, 
  '{"segunda": "-", "terca": "Biologia, Química", "quarta": "Matemática", "quinta": "-", "sexta": "Matemática, Biologia"}'
FROM public.turma_pairs tp, public.salas s 
WHERE tp.nome = 'Par 2 - Tarde' AND s.codigo = 'U113';

INSERT INTO public.turmas (turma_pair_id, tipo, sala_id, capacidade, horario_semanal)
SELECT tp.id, 'B', s.id, 30, 
  '{"segunda": "-", "terca": "Química, Biologia", "quarta": "Matemática", "quinta": "-", "sexta": "Biologia, Matemática"}'
FROM public.turma_pairs tp, public.salas s 
WHERE tp.nome = 'Par 2 - Tarde' AND s.codigo = 'Lab01';

-- Ciências Sociais Manhã (Par 3)
INSERT INTO public.turmas (turma_pair_id, tipo, sala_id, capacidade, horario_semanal)
SELECT tp.id, 'A', s.id, 30, 
  '{"segunda": "História, L.P", "terca": "-", "quarta": "L.P, Matemática", "quinta": "-", "sexta": "Matemática"}'
FROM public.turma_pairs tp, public.salas s 
WHERE tp.nome = 'Par 3 - Manhã' AND s.codigo = 'Lab02';

INSERT INTO public.turmas (turma_pair_id, tipo, sala_id, capacidade, horario_semanal)
SELECT tp.id, 'B', s.id, 30, 
  '{"segunda": "L.P, História", "terca": "-", "quarta": "Matemática, L.P", "quinta": "-", "sexta": "Matemática"}'
FROM public.turma_pairs tp, public.salas s 
WHERE tp.nome = 'Par 3 - Manhã' AND s.codigo = 'Lab03';

-- Ciências Sociais Tarde (Par 3)
INSERT INTO public.turmas (turma_pair_id, tipo, sala_id, capacidade, horario_semanal)
SELECT tp.id, 'A', s.id, 30, 
  '{"segunda": "História, L.P", "terca": "-", "quarta": "L.P, Matemática", "quinta": "-", "sexta": "Matemática"}'
FROM public.turma_pairs tp, public.salas s 
WHERE tp.nome = 'Par 3 - Tarde' AND s.codigo = 'Auditório';

INSERT INTO public.turmas (turma_pair_id, tipo, sala_id, capacidade, horario_semanal)
SELECT tp.id, 'B', s.id, 30, 
  '{"segunda": "L.P, História", "terca": "-", "quarta": "Matemática, L.P", "quinta": "-", "sexta": "Matemática"}'
FROM public.turma_pairs tp, public.salas s 
WHERE tp.nome = 'Par 3 - Tarde' AND s.codigo = 'Sala A1';