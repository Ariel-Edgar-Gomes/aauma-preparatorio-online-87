import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { alunosService, turmaPairsService, turmasService, cursosService } from "@/services/supabaseService";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";

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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStep, setUploadStep] = useState('');

  const submitInscricao = async (formData: InscricaoFormData): Promise<boolean> => {
    try {
      setSubmitting(true);
      setUploadProgress(0);
      setUploadStep('Iniciando validações...');
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

      setUploadProgress(10);
      setUploadStep('Verificando par de turmas...');
      
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

      setUploadProgress(20);
      setUploadStep('Preparando documentos...');

      // Converter os ficheiros para Base64 (NÃO são guardados no Cloud — apenas enviados por email)
      console.log('[useSupabaseInscricao] Convertendo ficheiros para Base64...');

      const fileToEmailAttachment = async (
        file: File | null | undefined
      ): Promise<{ content: string; filename: string; type: string } | undefined> => {
        if (!file) return undefined;

        const base64: string = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result as string;
            // Remover o prefixo data:...;base64,
            resolve(result.split(',')[1] || '');
          };
          reader.onerror = () => reject(new Error(`Erro ao ler o ficheiro ${file.name}`));
          reader.readAsDataURL(file);
        });

        return {
          content: base64,
          filename: file.name,
          type: file.type || 'application/octet-stream',
        };
      };

      const fotoAttachment = await fileToEmailAttachment(formData.foto);
      const copiaBIAttachment = await fileToEmailAttachment(formData.copiaBI);
      const declaracaoAttachment = await fileToEmailAttachment(formData.declaracaoCertificado);
      const comprovativoAttachment = await fileToEmailAttachment(formData.comprovativoPagamento);

      setUploadProgress(60);
      setUploadStep('Criando registro de inscrição...');
      
      // Criar o registro do aluno SEM guardar ficheiros (created_by definido automaticamente pelo trigger)
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
        foto_url: undefined,
        copia_bi_url: undefined,
        declaracao_certificado_url: undefined,
        comprovativo_pagamento_url: undefined
      });

      console.log('[useSupabaseInscricao] Inscrição criada com sucesso:', novoAluno);

      setUploadProgress(80);
      setUploadStep('Enviando documentos por email...');
      
      // Enviar email com os documentos
      try {
        console.log('[useSupabaseInscricao] Enviando email com documentos...');
        
        const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-student-documents', {
          body: {
            studentData: {
              nome: formData.nomeCompleto,
              email: formData.email,
              telefone: formData.contacto,
              numeroBI: formData.numeroBI,
              dataNascimento: formData.dataNascimento,
              endereco: formData.endereco,
              curso: formData.curso,
              turno: formData.turno,
              par: parSelecionado.nome, // Usando o nome do par
              turma: formData.turma.endsWith('_A') ? 'Turma A' : 'Turma B',
              numeroEstudante: novoAluno.numero_estudante,
              dataInscricao: novoAluno.data_inscricao
            },
            files: {
              foto: foto_url,
              copiaBI: copia_bi_url,
              declaracaoCertificado: declaracao_certificado_url,
              comprovativoPagamento: comprovativo_pagamento_url
            }
          }
        });

        if (emailError) {
          console.error('[useSupabaseInscricao] Erro ao enviar email:', emailError);
        } else {
          console.log('[useSupabaseInscricao] Email enviado com sucesso:', emailResult);
        }
      } catch (emailError) {
        console.error('[useSupabaseInscricao] Erro ao chamar função de email:', emailError);
        // Não falha a inscrição por causa do email
      }

      setUploadProgress(100);
      setUploadStep('Inscrição concluída com sucesso!');

      toast({
        title: "Inscrição realizada com sucesso!",
        description: `Número de estudante: ${novoAluno.numero_estudante}`,
      });

      return true;
    } catch (error) {
      console.error('[useSupabaseInscricao] Erro na inscrição:', error);
      
      let errorMessage = "Erro desconhecido";
      if (error instanceof Error) {
        // Verificar se é erro de duplicação de número de BI
        if (error.message.includes('unique_numero_bi') || error.message.includes('duplicate key')) {
          errorMessage = "Já existe um aluno registrado com este número de BI. Por favor, verifique o número inserido.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Erro na inscrição",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
      setUploadStep('');
    }
  };

  return {
    submitInscricao,
    submitting,
    uploadProgress,
    uploadStep
  };
};