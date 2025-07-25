import React, { useEffect, useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InvoiceTemplate } from "@/components/invoice/InvoiceTemplate";
import { Aluno } from "@/types/turma";
import { turmaPairsService } from "@/services/supabaseService";
import { disciplinesByDayAndCourse, courseNames } from "@/types/schedule";

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
  const [turmaPairSchedule, setTurmaPairSchedule] = useState<string>('');

  useEffect(() => {
    const fetchTurmaPairData = async () => {
      // Use turma_pair_id instead of par (database field vs interface field)
      const turmaPairId = aluno?.turma_pair_id || aluno?.par;
      console.log('Buscando dados do par de turma:', { turmaPairId, aluno });
      
      if (turmaPairId) {
        try {
          const turmaPair = await turmaPairsService.getById(turmaPairId);
          console.log('Par de turma encontrado:', turmaPair);
          if (turmaPair) {
            setTurmaPairName(turmaPair.nome);
            setTurmaPairSchedule(turmaPair.horario_periodo);
            console.log('Dados do par definidos:', { nome: turmaPair.nome, horario: turmaPair.horario_periodo });
          } else {
            console.log('Par de turma não encontrado');
            setTurmaPairName('Par não encontrado');
            setTurmaPairSchedule('');
          }
        } catch (error) {
          console.error('Erro ao buscar dados do par de turma:', error);
          setTurmaPairName('Erro ao carregar par');
          setTurmaPairSchedule('');
        }
      } else {
        console.log('ID do par de turma não encontrado');
        setTurmaPairName('Par não especificado');
        setTurmaPairSchedule('');
      }
    };

    if (open && aluno) {
      fetchTurmaPairData();
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

    // Obter código do curso
    const cursoCodigo = aluno.curso_codigo || aluno.curso;
    
    // Buscar nome correto do curso
    const nomeCorreto = courseNames[cursoCodigo] || cursoCodigo;
    
    // Buscar horário específico do curso
    const horarioEspecificoCurso = disciplinesByDayAndCourse[cursoCodigo];
    let horarioFormatado = turmaPairSchedule; // fallback para horário genérico
    
    if (horarioEspecificoCurso) {
      // Converter o horário específico em uma string formatada
      const dias = ['segunda', 'terca', 'quarta', 'quinta', 'sexta'];
      const diasNomes = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
      
      horarioFormatado = dias
        .map((dia, index) => {
          const disciplina = horarioEspecificoCurso[dia];
          if (disciplina && disciplina !== '-') {
            return `${diasNomes[index]}: ${disciplina}`;
          }
          return null;
        })
        .filter(Boolean)
        .join(' | ');
        
      console.log('Horário específico do curso encontrado:', horarioFormatado);
    } else {
      console.log('Horário específico não encontrado, usando horário genérico:', turmaPairSchedule);
    }

    const data = {
      studentName: aluno.nome,
      course: nomeCorreto, // Usar nome correto do curso
      shift: aluno.turno || '',
      realSchedule: horarioFormatado, // Usar horário específico do curso
      email: aluno.email,
      contact: aluno.telefone,
      birthDate: aluno.data_nascimento || aluno.dataNascimento,
      address: aluno.endereco,
      biNumber: aluno.numero_bi || aluno.numeroBI,
      duration: aluno.duracao,
      startDate: aluno.data_inicio || aluno.dataInicio || '',
      paymentMethod: aluno.forma_pagamento || aluno.formaPagamento,
      paymentStatus: aluno.status,
      inscriptionNumber: aluno.numero_estudante || aluno.numeroEstudante || 'N/A',
      inscriptionDate: aluno.data_inscricao || aluno.dataInscricao,
      amount: Number(aluno.valor_pago) || 40000,
      createdBy: aluno.creator?.full_name || aluno.criador?.nome,
      turmaPair: turmaPairName || 'Carregando par de turma...',
      turma: aluno.turma
    };

    console.log('Invoice data final:', data);
    return data;
  }, [aluno, turmaPairName, turmaPairSchedule]);

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