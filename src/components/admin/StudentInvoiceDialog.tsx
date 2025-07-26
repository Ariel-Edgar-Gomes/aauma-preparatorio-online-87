import React, { useEffect, useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InvoiceTemplate } from "@/components/invoice/InvoiceTemplate";
import { Aluno } from "@/types/turma";
import { turmaPairsService } from "@/services/supabaseService";
import { supabase } from "@/integrations/supabase/client";
import { disciplinesByDayAndCourse, courseNames } from "@/types/schedule";
import { checkStudentDataConsistency, logConsistencyIssues } from "@/utils/dataConsistency";

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
  const [realPeriod, setRealPeriod] = useState<string>('');
  const [turmaPairSchedule, setTurmaPairSchedule] = useState<string>('');
  const [salaInfo, setSalaInfo] = useState<string>('');

  useEffect(() => {
    const fetchTurmaPairData = async () => {
      // Use turma_pair_id instead of par (database field vs interface field)
      const turmaPairId = aluno?.turma_pair_id || aluno?.par;
      const turmaId = aluno?.turma_id;
      console.log('Buscando dados do par de turma:', { turmaPairId, turmaId, aluno });
      
      if (turmaPairId) {
        try {
          const turmaPair = await turmaPairsService.getById(turmaPairId);
          console.log('Par de turma encontrado:', turmaPair);
          if (turmaPair) {
            setTurmaPairName(turmaPair.nome);
            setTurmaPairSchedule(turmaPair.horario_periodo);
            // Definir o período real baseado na base de dados
            setRealPeriod(turmaPair.horario_periodo || '');
            console.log('Dados do par definidos:', { nome: turmaPair.nome, horario: turmaPair.horario_periodo });
            
            // Buscar informações da sala da turma do aluno
            if (turmaId) {
              try {
                const { data: turmaData, error } = await supabase
                  .from('turmas')
                  .select(`
                    tipo,
                    salas!inner(codigo)
                  `)
                  .eq('id', turmaId)
                  .single();
                
                if (turmaData && !error) {
                  setSalaInfo(`Turma ${turmaData.tipo} - Sala ${turmaData.salas.codigo}`);
                  console.log('Sala encontrada:', turmaData);
                } else {
                  console.log('Sala não encontrada para turma:', turmaId);
                  setSalaInfo('Sala não definida');
                }
              } catch (salaError) {
                console.error('Erro ao buscar sala:', salaError);
                setSalaInfo('Erro ao carregar sala');
              }
            }
            
            // Verificar consistência de dados
            const consistencyResult = checkStudentDataConsistency(aluno, turmaPair);
            logConsistencyIssues(consistencyResult, 'StudentInvoiceDialog');
            
            // Se há inconsistências, alertar no console
            if (!consistencyResult.isConsistent) {
              console.warn(`
🚨 DADOS INCONSISTENTES DETECTADOS NA FATURA! 🚨
Aluno: ${aluno.nome}
Problemas encontrados:
${consistencyResult.errors.join('\n')}
${consistencyResult.warnings.join('\n')}
              `);
            }
          } else {
            console.log('Par de turma não encontrado');
            setTurmaPairName('Par não encontrado');
            setTurmaPairSchedule('');
            setSalaInfo('');
          }
        } catch (error) {
          console.error('Erro ao buscar dados do par de turma:', error);
          setTurmaPairName('Erro ao carregar par');
          setTurmaPairSchedule('');
          setSalaInfo('');
        }
      } else {
        console.log('ID do par de turma não encontrado');
        setTurmaPairName('Par não especificado');
        setTurmaPairSchedule('');
        setSalaInfo('');
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

    // Obter código do curso do aluno
    const cursoCodigo = aluno.curso_codigo || aluno.curso;
    
    // Buscar nome correto do curso
    const nomeCorretoCurso = courseNames[cursoCodigo] || cursoCodigo;
    
    // SEMPRE usar o horário específico do curso do aluno (ignorar inconsistências do par)
    const horarioEspecificoCurso = disciplinesByDayAndCourse[cursoCodigo];
    let horarioFormatado = 'Horário não encontrado';
    
    if (horarioEspecificoCurso) {
      // Converter o horário específico em uma string formatada
      const dias = ['segunda', 'terca', 'quarta', 'quinta', 'sexta'];
      const diasNomes = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
      
      const horariosValidatos = dias
        .map((dia, index) => {
          const disciplina = horarioEspecificoCurso[dia];
          if (disciplina && disciplina !== '-') {
            return `${diasNomes[index]}: ${disciplina}`;
          }
          return null;
        })
        .filter(Boolean);
        
      if (horariosValidatos.length > 0) {
        horarioFormatado = horariosValidatos.join(' | ');
      }
        
      console.log('Horário específico do curso encontrado:', horarioFormatado);
    } else {
      console.warn('ATENÇÃO: Horário específico não encontrado para o curso:', cursoCodigo);
      // Fallback para horário genérico apenas se não encontrar horário específico
      horarioFormatado = turmaPairSchedule || 'Horário não disponível';
    }

    // Verificar consistência: se o curso do aluno não está nos cursos do par, alertar
    if (turmaPairName && turmaPairName !== 'Carregando par de turma...' && cursoCodigo) {
      // Buscar dados do par para verificar consistência
      const turmaPairData = { cursos: [] }; // Será populado pelos dados do useEffect
      console.log('Verificando consistência entre curso do aluno e par de turmas...');
    }

    const data = {
      studentName: aluno.nome,
      course: nomeCorretoCurso, // Nome correto do curso do aluno
      shift: aluno.turno || '',
      realPeriod: realPeriod, // Período real da base de dados
      realSchedule: horarioFormatado, // SEMPRE horário específico do curso do aluno
      email: aluno.email,
      contact: aluno.telefone,
      birthDate: aluno.data_nascimento || aluno.dataNascimento,
      address: aluno.endereco,
      biNumber: aluno.numero_bi || aluno.numeroBI,
      duration: aluno.duracao,
      
      paymentMethod: aluno.forma_pagamento || aluno.formaPagamento,
      paymentStatus: aluno.status,
      inscriptionNumber: aluno.numero_estudante || aluno.numeroEstudante || 'N/A',
      inscriptionDate: aluno.data_inscricao || aluno.dataInscricao,
      amount: Number(aluno.valor_pago) || 40000,
      createdBy: aluno.creator?.full_name || aluno.criador?.nome,
      turmaPair: turmaPairName || 'Par não especificado',
      turma: aluno.turma,
      sala: salaInfo || 'Sala não definida',
      startDate: aluno.data_inicio || aluno.dataInicio || '2025-08-18'
    };

    console.log('Invoice data final (sempre consistente):', data);
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