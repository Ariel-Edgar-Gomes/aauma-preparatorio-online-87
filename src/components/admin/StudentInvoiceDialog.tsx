import React, { useEffect, useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InvoiceTemplate } from "@/components/invoice/InvoiceTemplate";
import { Aluno } from "@/types/turma";
import { turmaPairsService } from "@/services/supabaseService";

interface StudentInvoiceDialogProps {
  aluno: any | null; // Changed to any to handle both Aluno and DBAluno types
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const StudentInvoiceDialog: React.FC<StudentInvoiceDialogProps> = ({
  aluno,
  open,
  onOpenChange
}) => {
  // Early return BEFORE any hooks are called
  if (!aluno) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Erro</DialogTitle>
          </DialogHeader>
          <div>Nenhum aluno selecionado</div>
        </DialogContent>
      </Dialog>
    );
  }

  const [turmaPairName, setTurmaPairName] = useState<string>('');

  useEffect(() => {
    const fetchTurmaPairName = async () => {
      // Use turma_pair_id instead of par (database field vs interface field)
      const turmaPairId = aluno?.turma_pair_id || aluno?.par;
      console.log('Buscando nome do par de turma:', { turmaPairId, aluno });
      
      if (turmaPairId) {
        try {
          const turmaPair = await turmaPairsService.getById(turmaPairId);
          console.log('Par de turma encontrado:', turmaPair);
          if (turmaPair) {
            setTurmaPairName(turmaPair.nome);
            console.log('Nome do par definido:', turmaPair.nome);
          } else {
            console.log('Par de turma não encontrado');
            setTurmaPairName('Par não encontrado');
          }
        } catch (error) {
          console.error('Erro ao buscar nome do par de turma:', error);
          setTurmaPairName('Erro ao carregar par');
        }
      } else {
        console.log('ID do par de turma não encontrado');
        setTurmaPairName('Par não especificado');
      }
    };

    if (open && aluno) {
      fetchTurmaPairName();
    }
  }, [open, aluno]);

  const invoiceData = useMemo(() => {
    console.log('Criando invoice data com:', {
      nome: aluno.nome,
      telefone: aluno.telefone,
      par: aluno.par || aluno.turma_pair_id,
      turmaPairName,
      curso: aluno.curso || aluno.curso_codigo
    });

    const data = {
      studentName: aluno.nome,
      course: aluno.curso || aluno.curso_codigo,
      shift: aluno.turno || '',
      email: aluno.email,
      contact: aluno.telefone,
      birthDate: aluno.data_nascimento || aluno.dataNascimento,
      address: aluno.endereco,
      biNumber: aluno.numero_bi || aluno.numeroBI,
      duration: aluno.duracao,
      startDate: aluno.data_inicio || aluno.dataInicio || '',
      paymentMethod: aluno.forma_pagamento || aluno.formaPagamento,
      inscriptionNumber: aluno.numero_estudante || aluno.numeroEstudante || 'N/A',
      inscriptionDate: aluno.data_inscricao || aluno.dataInscricao,
      amount: Number(aluno.valor_pago) || 40000,
      createdBy: aluno.creator?.full_name || aluno.criador?.nome,
      turmaPair: turmaPairName || 'Carregando par de turma...',
      turma: aluno.turma
    };

    console.log('Invoice data final:', data);
    return data;
  }, [aluno, turmaPairName]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-aauma-navy">
            Fatura de Inscrição - {aluno.nome}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <InvoiceTemplate data={invoiceData} />
        </div>
      </DialogContent>
    </Dialog>
  );
};