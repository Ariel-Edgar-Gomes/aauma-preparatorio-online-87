
export interface Schedule {
  id: string;
  curso: string;
  turno: string;
  diaSemana: string;
  horarioInicio: string;
  horarioFim: string;
  disciplina: string;
  professor: string;
  sala: string;
  turma: string;
}

export const courseNames: Record<string, string> = {
  // Medicina
  "medicina": "Medicina",
  
  // Cursos de Engenharia
  "engenharia-informatica": "Engenharia Informática",
  "engenharia-civil": "Engenharia Civil",
  "engenharia-mecatronica": "Engenharia Mecatrónica",
  "engenharia-industrial-sistemas-electricos": "Eng. Industrial e Sist. Eléctricos",
  "engenharia-agropecuaria": "Engenharia Agropecuária",
  "engenharia-ambiente": "Engenharia do Ambiente",
  "arquitectura-urbanismo": "Arquitectura e Urbanismo",
  
  // Cursos da Área da Saúde
  "analises-clinicas": "Análises Clínicas e Saúde Pública",
  "enfermagem": "Enfermagem",
  "cardiopneumologia": "Cardiopneumologia",
  "fisioterapia": "Fisioterapia",
  "psicologia": "Psicologia",
  
  // Cursos das Ciências Sociais e Humanas
  "direito": "Direito",
  "gestao-administracao": "Gestão e Administração de Empresas",
  "lingua-portuguesa": "Língua Portuguesa e Comunicação",
  "economia": "Economia",
  "turismo-gestao-hoteleira": "Turismo e Gestão Hoteleira"
};

export const dayNames: Record<string, string> = {
  "segunda": "Segunda-feira",
  "terca": "Terça-feira",
  "quarta": "Quarta-feira",
  "quinta": "Quinta-feira",
  "sexta": "Sexta-feira",
  "sabado": "Sábado"
};

// Disciplinas por dia e curso baseado nas imagens fornecidas
export const disciplinesByDayAndCourse: Record<string, Record<string, string>> = {
  
  // Cursos de Engenharia - baseado na primeira imagem
  "engenharia-informatica": {
    "segunda": "L.P",
    "terca": "-",
    "quarta": "L.P, Mat",
    "quinta": "Física",
    "sexta": "Matemática"
  },
  "engenharia-civil": {
    "segunda": "L.P",
    "terca": "-",
    "quarta": "L.P, Mat", 
    "quinta": "Física, Desenho",
    "sexta": "Matemática"
  },
  "engenharia-mecatronica": {
    "segunda": "L.P",
    "terca": "-",
    "quarta": "L.P, Mat",
    "quinta": "Física",
    "sexta": "Matemática"
  },
  "engenharia-industrial-sistemas-electricos": {
    "segunda": "L.P",
    "terca": "-",
    "quarta": "L.P, Mat",
    "quinta": "Física",
    "sexta": "Matemática"
  },
  "engenharia-agropecuaria": {
    "segunda": "L.P",
    "terca": "-",
    "quarta": "L.P, Mat",
    "quinta": "Física",
    "sexta": "Matemática"
  },
  "engenharia-ambiente": {
    "segunda": "L.P",
    "terca": "-",
    "quarta": "L.P, Mat",
    "quinta": "Física",
    "sexta": "Matemática"
  },
  "arquitectura-urbanismo": {
    "segunda": "L.P",
    "terca": "-",
    "quarta": "L.P, Mat",
    "quinta": "Física, Desenho",
    "sexta": "Matemática"
  },
  
  // Cursos da Área da Saúde - baseado na segunda imagem
  "analises-clinicas": {
    "segunda": "-",
    "terca": "Biologia, Química",
    "quarta": "Matemática",
    "quinta": "-",
    "sexta": "Matemática, Biologia"
  },
  "enfermagem": {
    "segunda": "-",
    "terca": "Biologia, Química",
    "quarta": "Matemática",
    "quinta": "-",
    "sexta": "Matemática, Biologia"
  },
  "cardiopneumologia": {
    "segunda": "-",
    "terca": "Biologia, Química",
    "quarta": "Matemática",
    "quinta": "-",
    "sexta": "Matemática, Biologia"
  },
  "fisioterapia": {
    "segunda": "-",
    "terca": "Biologia, Química",
    "quarta": "Matemática",
    "quinta": "-",
    "sexta": "Matemática, Biologia"
  },
  "psicologia": {
    "segunda": "-",
    "terca": "Biologia, Química",
    "quarta": "Matemática",
    "quinta": "-",
    "sexta": "Matemática, Biologia"
  },
  
  // Cursos das Ciências Sociais e Humanas - baseado na terceira imagem
  "direito": {
    "segunda": "História, L.P",
    "terca": "-",
    "quarta": "L.P, Matemática",
    "quinta": "-",
    "sexta": "Matemática"
  },
  "gestao-administracao": {
    "segunda": "História, L.P",
    "terca": "-",
    "quarta": "L.P, Matemática",
    "quinta": "-",
    "sexta": "Matemática"
  },
  "lingua-portuguesa": {
    "segunda": "História, L.P",
    "terca": "-",
    "quarta": "L.P, Matemática",
    "quinta": "-",
    "sexta": "Matemática"
  },
  "economia": {
    "segunda": "História, L.P",
    "terca": "-",
    "quarta": "L.P, Matemática",
    "quinta": "-",
    "sexta": "Matemática"
  },
  "turismo-gestao-hoteleira": {
    "segunda": "História, L.P",
    "terca": "-",
    "quarta": "L.P, Matemática",
    "quinta": "-",
    "sexta": "Matemática"
  },

  // Medicina - curso adicional
  "medicina": {
    "segunda": "-",
    "terca": "Biologia, Química",
    "quarta": "Matemática",
    "quinta": "-",
    "sexta": "Matemática, Biologia"
  }
};

// Para compatibilidade com código existente
export const disciplinesByCourse: Record<string, string[]> = {
  // Medicina
  "medicina": ["Biologia, Química", "Matemática", "Matemática, Biologia"],
  
  // Cursos de Engenharia
  "engenharia-informatica": ["L.P", "L.P, Mat", "Física", "Matemática"],
  "engenharia-civil": ["L.P", "L.P, Mat", "Física, Desenho", "Matemática"],
  "engenharia-mecatronica": ["L.P", "L.P, Mat", "Física", "Matemática"],
  "engenharia-industrial-sistemas-electricos": ["L.P", "L.P, Mat", "Física", "Matemática"],
  "engenharia-agropecuaria": ["L.P", "L.P, Mat", "Física", "Matemática"],
  "engenharia-ambiente": ["L.P", "L.P, Mat", "Física", "Matemática"],
  "arquitectura-urbanismo": ["L.P", "L.P, Mat", "Física, Desenho", "Matemática"],
  
  // Cursos da Área da Saúde
  "analises-clinicas": ["Biologia, Química", "Matemática", "Matemática, Biologia"],
  "enfermagem": ["Biologia, Química", "Matemática", "Matemática, Biologia"],
  "cardiopneumologia": ["Biologia, Química", "Matemática", "Matemática, Biologia"],
  "fisioterapia": ["Biologia, Química", "Matemática", "Matemática, Biologia"],
  "psicologia": ["Biologia, Química", "Matemática", "Matemática, Biologia"],
  
  // Cursos das Ciências Sociais e Humanas
  "direito": ["História, L.P", "L.P, Matemática", "Matemática"],
  "gestao-administracao": ["História, L.P", "L.P, Matemática", "Matemática"],
  "lingua-portuguesa": ["História, L.P", "L.P, Matemática", "Matemática"],
  "economia": ["História, L.P", "L.P, Matemática", "Matemática"],
  "turismo-gestao-hoteleira": ["História, L.P", "L.P, Matemática", "Matemática"]
};

export const professors = [
  "Dr. António Silva",
  "Prof. Maria Santos",
  "Dr. João Costa",
  "Prof. Ana Ferreira",
  "Dr. Carlos Gomes",
  "Prof. Fernanda Lima",
  "Dr. Paulo Mendes",
  "Prof. Isabel Torres",
  "Prof. Pedro Ramos",
  "Dr. Sofia Martins",
  "Prof. Ricardo Lopes",
  "Dr. Catarina Neves"
];

export const getAvailableDisciplines = (courseKey: string) => {
  return disciplinesByCourse[courseKey] || [];
};

export const getDisciplineByDay = (courseKey: string, day: string) => {
  return disciplinesByDayAndCourse[courseKey]?.[day] || "";
};
