import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InvoiceTemplate } from "@/components/invoice/InvoiceTemplate";
import { Aluno } from "@/types/turma";

interface StudentInvoiceDialogProps {
  aluno: Aluno | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const StudentInvoiceDialog: React.FC<StudentInvoiceDialogProps> = ({
  aluno,
  open,
  onOpenChange
}) => {
  if (!aluno) return null;

  const invoiceData = {
    studentName: aluno.nome,
    course: aluno.curso,
    shift: aluno.turno || '',
    email: aluno.email,
    contact: aluno.telefone,
    birthDate: aluno.dataNascimento,
    address: aluno.endereco,
    biNumber: aluno.numeroBI,
    duration: aluno.duracao,
    startDate: aluno.dataInicio || '',
    paymentMethod: aluno.formaPagamento,
    inscriptionNumber: aluno.numeroEstudante || 'N/A',
    inscriptionDate: aluno.dataInscricao,
    amount: Number(aluno.valor_pago) || 40000,
    createdBy: aluno.criador?.nome,
    turmaPair: aluno.par,
    turma: aluno.turma
  };

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