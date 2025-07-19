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
      setUploadStep('Fazendo upload dos documentos...');
      
      // Upload real dos arquivos para Supabase Storage
      console.log('[useSupabaseInscricao] Iniciando upload dos arquivos...');
      
      const uploadFile = async (file: File, folder: string): Promise<string | undefined> => {
        if (!file) return undefined;
        
        const fileName = `${folder}/${Date.now()}_${user?.id}_${file.name}`;
        console.log(`[useSupabaseInscricao] Fazendo upload: ${fileName}`);
        
        const { data, error } = await supabase.storage
          .from('student-documents')
          .upload(fileName, file);

        if (error) {
          console.error(`[useSupabaseInscricao] Erro no upload de ${fileName}:`, error);
          throw new Error(`Erro no upload do arquivo ${file.name}: ${error.message}`);
        }
        
        console.log(`[useSupabaseInscricao] Upload concluído: ${fileName}`);
        return fileName;
      };

      // Upload dos arquivos (apenas se existirem)
      const foto_url = formData.foto ? await uploadFile(formData.foto, 'fotos') : undefined;
      const copia_bi_url = formData.copiaBI ? await uploadFile(formData.copiaBI, 'bi') : undefined;
      const declaracao_certificado_url = formData.declaracaoCertificado ? await uploadFile(formData.declaracaoCertificado, 'declaracoes') : undefined;
      const comprovativo_pagamento_url = formData.comprovativoPagamento ? await uploadFile(formData.comprovativoPagamento, 'comprovativo') : undefined;

      console.log('[useSupabaseInscricao] Arquivos carregados:', {
        foto_url,
        copia_bi_url,
        declaracao_certificado_url,
        comprovativo_pagamento_url
      });

      setUploadProgress(60);
      setUploadStep('Criando registro de inscrição...');
      
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
      toast({
        title: "Erro na inscrição",
        description: error instanceof Error ? error.message : "Erro desconhecido",
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