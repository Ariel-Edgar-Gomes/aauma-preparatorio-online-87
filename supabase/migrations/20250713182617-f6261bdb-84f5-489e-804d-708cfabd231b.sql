-- Criação da base de dados completa para o sistema AAUMA

-- Tipos enums para garantir consistência de dados
CREATE TYPE periodo_type AS ENUM ('manha', 'tarde');
CREATE TYPE grupo_cursos_type AS ENUM ('engenharias', 'saude', 'ciencias-sociais-humanas');
CREATE TYPE status_aluno_type AS ENUM ('inscrito', 'confirmado', 'cancelado');
CREATE TYPE forma_pagamento_type AS ENUM ('Cash', 'Transferencia', 'Cartao');

-- Tabela de cursos disponíveis
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

-- Tabela de salas disponíveis
CREATE TABLE public.salas (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo TEXT NOT NULL UNIQUE,
    capacidade INTEGER NOT NULL DEFAULT 30,
    tipo TEXT DEFAULT 'sala',
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de pares de turmas
CREATE TABLE public.turma_pairs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    periodo periodo_type NOT NULL,
    horario_periodo TEXT NOT NULL,
    grupo_cursos grupo_cursos_type NOT NULL,
    cursos TEXT[] NOT NULL DEFAULT '{}',
    disciplinas_comuns TEXT[] NOT NULL DEFAULT '{}',
    horario_semanal JSONB NOT NULL DEFAULT '{}',
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de turmas individuais (A e B)
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

-- Tabela de alunos
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
    duracao TEXT NOT NULL DEFAULT '3 Meses',
    data_inicio DATE NOT NULL,
    forma_pagamento forma_pagamento_type NOT NULL DEFAULT 'Cash',
    valor_pago DECIMAL(10,2) NOT NULL DEFAULT 40000.00,
    status status_aluno_type NOT NULL DEFAULT 'inscrito',
    data_inscricao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    observacoes TEXT,
    -- Arquivos de documentos (URLs)
    foto_url TEXT,
    copia_bi_url TEXT,
    declaracao_certificado_url TEXT,
    comprovativo_pagamento_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de horários detalhados (para flexibilidade futura)
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

-- Inserir dados iniciais das salas
INSERT INTO public.salas (codigo, capacidade, tipo) VALUES
('U107', 30, 'sala'),
('U108', 30, 'sala'),
('U109', 30, 'sala'),
('U110', 30, 'sala'),
('U111', 30, 'sala'),
('U112', 30, 'sala'),
('U113', 30, 'sala'),
('Lab01', 30, 'laboratorio'),
('Lab02', 30, 'laboratorio'),
('Lab03', 30, 'laboratorio'),
('Auditório', 50, 'auditorio'),
('Sala A1', 30, 'sala'),
('Sala A2', 30, 'sala'),
('Sala A3', 30, 'sala');

-- Inserir dados iniciais dos cursos
INSERT INTO public.cursos (codigo, nome, grupo_cursos, disciplinas, horario_semanal) VALUES
-- Cursos de Engenharia
('engenharia-informatica', 'Engenharia Informática', 'engenharias', '{"L.P", "Matemática", "Física"}', '{"segunda": "L.P", "terca": "-", "quarta": "L.P, Mat", "quinta": "Física", "sexta": "Matemática"}'),
('engenharia-civil', 'Engenharia Civil', 'engenharias', '{"L.P", "Matemática", "Física", "Desenho"}', '{"segunda": "L.P", "terca": "-", "quarta": "L.P, Mat", "quinta": "Física, Desenho", "sexta": "Matemática"}'),
('engenharia-mecatronica', 'Engenharia Mecatrónica', 'engenharias', '{"L.P", "Matemática", "Física"}', '{"segunda": "L.P", "terca": "-", "quarta": "L.P, Mat", "quinta": "Física", "sexta": "Matemática"}'),
('engenharia-industrial-sistemas-electricos', 'Eng. Industrial e Sist. Eléctricos', 'engenharias', '{"L.P", "Matemática", "Física"}', '{"segunda": "L.P", "terca": "-", "quarta": "L.P, Mat", "quinta": "Física", "sexta": "Matemática"}'),
('engenharia-agropecuaria', 'Engenharia Agropecuária', 'engenharias', '{"L.P", "Matemática", "Física"}', '{"segunda": "L.P", "terca": "-", "quarta": "L.P, Mat", "quinta": "Física", "sexta": "Matemática"}'),
('arquitectura-urbanismo', 'Arquitectura e Urbanismo', 'engenharias', '{"L.P", "Matemática", "Física", "Desenho"}', '{"segunda": "L.P", "terca": "-", "quarta": "L.P, Mat", "quinta": "Física, Desenho", "sexta": "Matemática"}'),

-- Cursos da Área da Saúde
('medicina', 'Medicina', 'saude', '{"Biologia", "Química", "Matemática"}', '{"segunda": "-", "terca": "Biologia, Química", "quarta": "Matemática", "quinta": "-", "sexta": "Matemática, Biologia"}'),
('analises-clinicas', 'Análises Clínicas e Saúde Pública', 'saude', '{"Biologia", "Química", "Matemática"}', '{"segunda": "-", "terca": "Biologia, Química", "quarta": "Matemática", "quinta": "-", "sexta": "Matemática, Biologia"}'),
('enfermagem', 'Enfermagem', 'saude', '{"Biologia", "Química", "Matemática"}', '{"segunda": "-", "terca": "Biologia, Química", "quarta": "Matemática", "quinta": "-", "sexta": "Matemática, Biologia"}'),
('cardiopneumologia', 'Cardiopneumologia', 'saude', '{"Biologia", "Química", "Matemática"}', '{"segunda": "-", "terca": "Biologia, Química", "quarta": "Matemática", "quinta": "-", "sexta": "Matemática, Biologia"}'),
('fisioterapia', 'Fisioterapia', 'saude', '{"Biologia", "Química", "Matemática"}', '{"segunda": "-", "terca": "Biologia, Química", "quarta": "Matemática", "quinta": "-", "sexta": "Matemática, Biologia"}'),
('psicologia', 'Psicologia', 'saude', '{"Biologia", "Química", "Matemática"}', '{"segunda": "-", "terca": "Biologia, Química", "quarta": "Matemática", "quinta": "-", "sexta": "Matemática, Biologia"}'),

-- Cursos das Ciências Sociais e Humanas
('direito', 'Direito', 'ciencias-sociais-humanas', '{"História", "L.P", "Matemática"}', '{"segunda": "História, L.P", "terca": "-", "quarta": "L.P, Matemática", "quinta": "-", "sexta": "Matemática"}'),
('gestao-administracao', 'Gestão e Administração de Empresas', 'ciencias-sociais-humanas', '{"História", "L.P", "Matemática"}', '{"segunda": "História, L.P", "terca": "-", "quarta": "L.P, Matemática", "quinta": "-", "sexta": "Matemática"}'),
('lingua-portuguesa', 'Língua Portuguesa e Comunicação', 'ciencias-sociais-humanas', '{"História", "L.P", "Matemática"}', '{"segunda": "História, L.P", "terca": "-", "quarta": "L.P, Matemática", "quinta": "-", "sexta": "Matemática"}'),
('economia', 'Economia', 'ciencias-sociais-humanas', '{"História", "L.P", "Matemática"}', '{"segunda": "História, L.P", "terca": "-", "quarta": "L.P, Matemática", "quinta": "-", "sexta": "Matemática"}'),
('turismo-gestao-hoteleira', 'Turismo e Gestão Hoteleira', 'ciencias-sociais-humanas', '{"História", "L.P", "Matemática"}', '{"segunda": "História, L.P", "terca": "-", "quarta": "L.P, Matemática", "quinta": "-", "sexta": "Matemática"}');

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.turma_pairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.turmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.horarios ENABLE ROW LEVEL SECURITY;

-- Políticas RLS (permissivas para permitir acesso público no contexto educacional)
-- Para cursos (leitura pública)
CREATE POLICY "Cursos são visíveis publicamente" ON public.cursos FOR SELECT USING (true);
CREATE POLICY "Admin pode gerenciar cursos" ON public.cursos FOR ALL USING (true);

-- Para salas (leitura pública)
CREATE POLICY "Salas são visíveis publicamente" ON public.salas FOR SELECT USING (true);
CREATE POLICY "Admin pode gerenciar salas" ON public.salas FOR ALL USING (true);

-- Para pares de turmas (leitura pública)
CREATE POLICY "Pares de turmas são visíveis publicamente" ON public.turma_pairs FOR SELECT USING (true);
CREATE POLICY "Admin pode gerenciar pares de turmas" ON public.turma_pairs FOR ALL USING (true);

-- Para turmas (leitura pública)
CREATE POLICY "Turmas são visíveis publicamente" ON public.turmas FOR SELECT USING (true);
CREATE POLICY "Admin pode gerenciar turmas" ON public.turmas FOR ALL USING (true);

-- Para alunos (leitura e escrita pública para inscrições)
CREATE POLICY "Alunos podem ser criados publicamente" ON public.alunos FOR INSERT WITH CHECK (true);
CREATE POLICY "Alunos são visíveis publicamente" ON public.alunos FOR SELECT USING (true);
CREATE POLICY "Admin pode gerenciar alunos" ON public.alunos FOR ALL USING (true);

-- Para horários (leitura pública)
CREATE POLICY "Horários são visíveis publicamente" ON public.horarios FOR SELECT USING (true);
CREATE POLICY "Admin pode gerenciar horários" ON public.horarios FOR ALL USING (true);

-- Triggers para atualizar timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cursos_updated_at BEFORE UPDATE ON public.cursos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_salas_updated_at BEFORE UPDATE ON public.salas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_turma_pairs_updated_at BEFORE UPDATE ON public.turma_pairs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_turmas_updated_at BEFORE UPDATE ON public.turmas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_alunos_updated_at BEFORE UPDATE ON public.alunos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_horarios_updated_at BEFORE UPDATE ON public.horarios FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para gerar número de estudante automático
CREATE OR REPLACE FUNCTION public.generate_numero_estudante()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.numero_estudante IS NULL THEN
        NEW.numero_estudante := 'EST' || LPAD((EXTRACT(year FROM NEW.created_at)::text) || LPAD(NEXTVAL('aluno_sequence')::text, 4, '0'), 8, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS aluno_sequence START 1;
CREATE TRIGGER generate_aluno_numero BEFORE INSERT ON public.alunos FOR EACH ROW EXECUTE FUNCTION public.generate_numero_estudante();

-- Trigger para atualizar contador de alunos inscritos na turma
CREATE OR REPLACE FUNCTION public.update_alunos_inscritos_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.turmas 
        SET alunos_inscritos = alunos_inscritos + 1 
        WHERE id = NEW.turma_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.turmas 
        SET alunos_inscritos = alunos_inscritos - 1 
        WHERE id = OLD.turma_id;
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Se mudou de turma
        IF OLD.turma_id != NEW.turma_id THEN
            UPDATE public.turmas 
            SET alunos_inscritos = alunos_inscritos - 1 
            WHERE id = OLD.turma_id;
            
            UPDATE public.turmas 
            SET alunos_inscritos = alunos_inscritos + 1 
            WHERE id = NEW.turma_id;
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_turma_alunos_count 
    AFTER INSERT OR UPDATE OR DELETE ON public.alunos 
    FOR EACH ROW EXECUTE FUNCTION public.update_alunos_inscritos_count();