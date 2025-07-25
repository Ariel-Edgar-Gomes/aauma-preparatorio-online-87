// Utility para verificar consistência de dados de alunos e turmas
import { courseNames } from "@/types/schedule";

interface ConsistencyCheckResult {
  isConsistent: boolean;
  warnings: string[];
  errors: string[];
}

export const checkStudentDataConsistency = (aluno: any, turmaPairData?: any): ConsistencyCheckResult => {
  const warnings: string[] = [];
  const errors: string[] = [];
  
  const cursoCodigo = aluno.curso_codigo || aluno.curso;
  const nomeCorreto = courseNames[cursoCodigo];
  
  // Verificar se o curso existe no sistema
  if (!nomeCorreto) {
    errors.push(`Curso não encontrado no sistema: ${cursoCodigo}`);
  }
  
  // Verificar consistência entre curso do aluno e par de turmas
  if (turmaPairData && turmaPairData.cursos && cursoCodigo) {
    const cursoEstaNoPar = turmaPairData.cursos.includes(cursoCodigo);
    
    if (!cursoEstaNoPar) {
      warnings.push(
        `INCONSISTÊNCIA: Aluno ${aluno.nome} do curso ${nomeCorreto || cursoCodigo} ` +
        `está associado ao par "${turmaPairData.nome}" que é para cursos: ${turmaPairData.cursos.join(', ')}`
      );
    }
  }
  
  // Verificar se há dados essenciais em falta
  if (!aluno.nome) {
    errors.push('Nome do aluno não informado');
  }
  
  if (!aluno.numero_bi && !aluno.numeroBI) {
    warnings.push('Número de BI não informado');
  }
  
  if (!cursoCodigo) {
    errors.push('Código do curso não informado');
  }
  
  return {
    isConsistent: errors.length === 0 && warnings.length === 0,
    warnings,
    errors
  };
};

export const logConsistencyIssues = (result: ConsistencyCheckResult, context: string) => {
  if (result.errors.length > 0) {
    console.error(`[${context}] ERROS DE DADOS:`, result.errors);
  }
  
  if (result.warnings.length > 0) {
    console.warn(`[${context}] AVISOS DE INCONSISTÊNCIA:`, result.warnings);
  }
  
  if (result.isConsistent) {
    console.log(`[${context}] Dados consistentes ✓`);
  }
};