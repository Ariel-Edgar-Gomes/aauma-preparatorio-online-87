import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Home } from "lucide-react";
import { InvoiceTemplate } from "@/components/invoice/InvoiceTemplate";
import { turmaPairsService } from "@/services/supabaseService";
import { supabase } from "@/integrations/supabase/client";
import { disciplinesByDayAndCourse, courseNames } from "@/types/schedule";

const InscricaoSucesso = () => {
  const location = useLocation();
  const inscricaoData = location.state?.inscricaoData;
  
  // Estados para buscar dados reais da base de dados (igual ao StudentInvoiceDialog)
  const [turmaPairName, setTurmaPairName] = useState<string>('');
  const [realPeriod, setRealPeriod] = useState<string>('');
  const [turmaPairSchedule, setTurmaPairSchedule] = useState<string>('');
  const [salaInfo, setSalaInfo] = useState<string>('');

  // Generate sequential inscription number
  const generateSequentialNumber = () => {
    const currentYear = new Date().getFullYear();
    let counter = localStorage.getItem(`inscricao_counter_${currentYear}`);
    
    if (!counter) {
      counter = '1';
    } else {
      counter = (parseInt(counter) + 1).toString();
    }
    
    localStorage.setItem(`inscricao_counter_${currentYear}`, counter);
    
    // Format: YYYY-XXXX (e.g., 2024-0001)
    return `${currentYear}-${counter.padStart(4, '0')}`;
  };

  // Buscar dados reais da base de dados (igual ao StudentInvoiceDialog)
  useEffect(() => {
    const fetchTurmaPairData = async () => {
      console.log('🔍 [InscricaoSucesso] Dados recebidos:', inscricaoData);
      
      const turmaPairId = inscricaoData?.par;
      const turmaId = inscricaoData?.turma;
      
      console.log('🔍 [InscricaoSucesso] IDs para busca:', { turmaPairId, turmaId });
      
      if (turmaPairId) {
        try {
          const turmaPair = await turmaPairsService.getById(turmaPairId);
          if (turmaPair) {
            setTurmaPairName(turmaPair.nome);
            setTurmaPairSchedule(turmaPair.horario_periodo);
            setRealPeriod(turmaPair.horario_periodo || '');
            
            // Buscar informações da sala da turma
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
                } else {
                  setSalaInfo('Sala não definida');
                }
              } catch (salaError) {
                console.error('Erro ao buscar sala:', salaError);
                setSalaInfo('Erro ao carregar sala');
              }
            }
          } else {
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
        setTurmaPairName('Par não especificado');
        setTurmaPairSchedule('');
        setSalaInfo('');
      }
    };

    if (inscricaoData) {
      fetchTurmaPairData();
    }
  }, [inscricaoData]);

  // Generate invoice data usando EXATA estrutura do StudentInvoiceDialog
  const invoiceData = useMemo(() => {
    if (!inscricaoData) return null;

    console.log('🔍 [InscricaoSucesso] Dados para invoice:', {
      turmaTipo: inscricaoData.turmaTipo,
      sala: inscricaoData.sala,
      parNome: inscricaoData.parNome,
      turma: inscricaoData.turma
    });

    // Obter código do curso do aluno
    const cursoCodigo = inscricaoData.curso;
    
    // Buscar nome correto do curso
    const nomeCorretoCurso = courseNames[cursoCodigo] || cursoCodigo;
    
    // SEMPRE usar o horário específico do curso do aluno (igual ao StudentInvoiceDialog)
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
    } else {
      // Fallback para horário genérico apenas se não encontrar horário específico
      horarioFormatado = turmaPairSchedule || 'Horário não disponível';
    }

    return {
      studentName: inscricaoData.nomeCompleto,
      course: nomeCorretoCurso, // Nome correto do curso
      shift: inscricaoData.turno || '',
      realPeriod: inscricaoData.realPeriod || realPeriod, // Usar dados passados ou buscados
      realSchedule: horarioFormatado, // SEMPRE horário específico do curso
      email: inscricaoData.email,
      contact: inscricaoData.contacto,
      birthDate: inscricaoData.dataNascimento,
      address: inscricaoData.endereco,
      biNumber: inscricaoData.numeroBI,
      duration: inscricaoData.duracao,
      startDate: '2025-08-18', // Data fixa do início do preparatório
      paymentMethod: inscricaoData.formaPagamento,
      paymentStatus: inscricaoData.status || 'inscrito',
      inscriptionNumber: generateSequentialNumber(),
      inscriptionDate: new Date().toISOString(),
      amount: Number(inscricaoData.valorPago) || 40000,
      createdBy: null,
      turmaPair: inscricaoData.parNome || turmaPairName || 'Par não especificado',
      turma: inscricaoData.turmaTipo ? `Turma ${inscricaoData.turmaTipo}` : (
        inscricaoData.turma ? (
          inscricaoData.turma.includes('_A') ? 'Turma A' : 
          inscricaoData.turma.includes('_B') ? 'Turma B' : 
          inscricaoData.turma
        ) : 'Turma não especificada'
      ),
      sala: inscricaoData.sala || salaInfo || 'Sala não definida'
    };
  }, [inscricaoData, turmaPairName, turmaPairSchedule, realPeriod, salaInfo]);

  if (!inscricaoData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-aauma-light-gray via-white to-aauma-light-gray flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-aauma-navy">Dados não encontrados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-aauma-dark-gray mb-4">
              Não foi possível encontrar os dados da inscrição.
            </p>
            <Link to="/">
              <Button className="bg-aauma-navy hover:bg-aauma-navy/90">
                <Home className="w-4 h-4 mr-2" />
                Voltar ao Início
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-aauma-light-gray via-white to-aauma-light-gray p-6">
      <div className="container mx-auto px-4 py-8">
        {/* Success Message */}
        <Card className="max-w-2xl mx-auto mb-8 animate-fade-in">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl text-aauma-navy">
              Inscrição realizada com sucesso!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-aauma-dark-gray mb-6">
              Parabéns <strong>{inscricaoData.nomeCompleto}</strong>! 
              Sua inscrição no curso de <strong>{inscricaoData.curso}</strong> foi registrada com sucesso.
            </p>
            <div className="bg-aauma-light-gray p-4 rounded-lg mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Nº Inscrição:</span>
                  <p className="text-aauma-navy font-bold">{invoiceData?.inscriptionNumber}</p>
                </div>
                <div>
                  <span className="font-medium">Curso:</span>
                  <p className="text-aauma-navy">{inscricaoData.curso}</p>
                </div>
                <div>
                  <span className="font-medium">Turno:</span>
                  <p className="text-aauma-navy">
                    {inscricaoData.turno === 'manha' ? 'Manhã (08:00 - 12:00)' : 'Tarde (14:00 - 18:00)'}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Duração:</span>
                  <p className="text-aauma-navy">{inscricaoData.duracao}</p>
                </div>
                <div>
                  <span className="font-medium">Data de Início:</span>
                  <p className="text-aauma-navy">{new Date(inscricaoData.dataInicio).toLocaleDateString('pt-AO')}</p>
                </div>
                <div>
                  <span className="font-medium">Email:</span>
                  <p className="text-aauma-navy">{inscricaoData.email || 'Não informado'}</p>
                </div>
                <div>
                  <span className="font-medium">Contacto:</span>
                  <p className="text-aauma-navy">{inscricaoData.contacto}</p>
                </div>
                {inscricaoData.numeroBI && (
                  <div>
                    <span className="font-medium">Nº do BI:</span>
                    <p className="text-aauma-navy">{inscricaoData.numeroBI}</p>
                  </div>
                )}
                {inscricaoData.dataNascimento && (
                  <div>
                    <span className="font-medium">Data de Nascimento:</span>
                    <p className="text-aauma-navy">{new Date(inscricaoData.dataNascimento).toLocaleDateString('pt-AO')}</p>
                  </div>
                )}
                <div>
                  <span className="font-medium">Forma de Pagamento:</span>
                  <p className="text-aauma-navy">{inscricaoData.formaPagamento}</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-aauma-dark-gray">
              Sua fatura está disponível abaixo para download ou impressão com todos os dados fornecidos.
            </p>
          </CardContent>
        </Card>

        {/* Invoice */}
        <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <InvoiceTemplate data={invoiceData} />
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link to="/">
            <Button variant="outline" className="border-aauma-navy text-aauma-navy hover:bg-aauma-navy hover:text-white">
              <Home className="w-4 h-4 mr-2" />
              Voltar ao Início
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default InscricaoSucesso;
