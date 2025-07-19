import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { alunosService, turmaPairsService, turmasService, cursosService } from "@/services/supabaseService";
import { useAuth } from "@/components/AuthProvider";

interface InscricaoFormData {
  nomeCompleto: string;
  email: string;
  contacto: string;
  dataNascimento: string;
  endereco: string;
  numeroBI: string;
  curso: string;
  par: string;
  turma: string;
  turno: string;
  duracao: string;
  dataInicio: string;
  formaPagamento: string;
  statusPagamento: string;
  foto?: File | null;
  copiaBI?: File | null;
  declaracaoCertificado?: File | null;
  comprovativoPagamento?: File | null;
}

export const useSupabaseInscricao = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const submitInscricao = async (formData: InscricaoFormData): Promise<boolean> => {
    try {
      setSubmitting(true);
      console.log('[useSupabaseInscricao] Iniciando submissão da inscrição:', formData);

      // Validações
      if (!formData.nomeCompleto || !formData.contacto || !formData.numeroBI || 
          !formData.curso || !formData.par || !formData.turma || !formData.turno || 
          !formData.statusPagamento) {
        throw new Error("Todos os campos obrigatórios devem ser preenchidos.");
      }

      // Validar email se fornecido
      if (formData.email && formData.email.trim() !== "") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          throw new Error("Formato de email inválido.");
        }
      }

      // Verificar se o par de turmas existe e está ativo
      const parSelecionado = await turmaPairsService.getById(formData.par);
      if (!parSelecionado || !parSelecionado.ativo) {
        throw new Error("Par de turmas não encontrado ou inativo.");
      }

      // Remover restrição de curso - qualquer curso pode ser inscrito em qualquer turma
      // Validação removida para permitir flexibilidade total

      // Verificar disponibilidade na turma específica
      const turmaId = formData.turma.replace(`${formData.par}_`, '');
      const turmas = await turmasService.getByTurmaPairId(formData.par);
      const turmaSelecionada = turmas.find(t => 
        (turmaId === 'A' && t.tipo === 'A') || (turmaId === 'B' && t.tipo === 'B')
      );

      if (!turmaSelecionada) {
        throw new Error("Turma não encontrada.");
      }

      if (turmaSelecionada.alunos_inscritos >= turmaSelecionada.capacidade) {
        throw new Error("A turma selecionada está lotada.");
      }

      // TODO: Upload de arquivos para Supabase Storage
      // Por enquanto, vamos simular URLs
      const foto_url = formData.foto ? `uploads/fotos/${Date.now()}_${formData.foto.name}` : undefined;
      const copia_bi_url = formData.copiaBI ? `uploads/bi/${Date.now()}_${formData.copiaBI.name}` : undefined;
      const declaracao_certificado_url = formData.declaracaoCertificado ? 
        `uploads/declaracoes/${Date.now()}_${formData.declaracaoCertificado.name}` : undefined;
      const comprovativo_pagamento_url = formData.comprovativoPagamento ? 
        `uploads/comprovativo/${Date.now()}_${formData.comprovativoPagamento.name}` : undefined;

      // Criar o registro do aluno (created_by será definido automaticamente pelo trigger)
      const novoAluno = await alunosService.create({
        nome: formData.nomeCompleto,
        email: formData.email || undefined,
        telefone: formData.contacto,
        numero_bi: formData.numeroBI,
        data_nascimento: formData.dataNascimento || undefined,
        endereco: formData.endereco || undefined,
        curso_codigo: formData.curso,
        turma_pair_id: formData.par,
        turma_id: turmaSelecionada.id,
        turno: formData.turno,
        duracao: formData.duracao,
        data_inicio: formData.dataInicio,
        forma_pagamento: formData.formaPagamento as 'Cash' | 'Transferencia' | 'Cartao',
        valor_pago: formData.statusPagamento === 'confirmado' ? 40000.00 : 0.00,
        status: formData.statusPagamento as 'inscrito' | 'confirmado',
        observacoes: undefined,
        foto_url,
        copia_bi_url,
        declaracao_certificado_url,
        comprovativo_pagamento_url
      });

      console.log('[useSupabaseInscricao] Inscrição criada com sucesso:', novoAluno);

      toast({
        title: "Inscrição realizada com sucesso!",
        description: `Número de estudante: ${novoAluno.numero_estudante}`,
      });

      return true;
    } catch (error) {
      console.error('[useSupabaseInscricao] Erro na inscrição:', error);
      toast({
        title: "Erro na inscrição",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    submitInscricao,
    submitting
  };
};