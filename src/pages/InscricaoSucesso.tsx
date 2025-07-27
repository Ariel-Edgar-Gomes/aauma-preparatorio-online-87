import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Home } from "lucide-react";
import { InvoiceTemplate } from "@/components/invoice/InvoiceTemplate";

const InscricaoSucesso = () => {
  const location = useLocation();
  const inscricaoData = location.state?.inscricaoData;

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

  // Generate invoice data from inscription data (usando mesma estrutura do StudentInvoiceDialog)
  const invoiceData = inscricaoData ? {
    studentName: inscricaoData.nomeCompleto,
    course: inscricaoData.curso,
    shift: inscricaoData.turno,
    realPeriod: inscricaoData.realPeriod || '',
    realSchedule: inscricaoData.realSchedule || 'Horário não disponível',
    email: inscricaoData.email,
    contact: inscricaoData.contacto,
    birthDate: inscricaoData.dataNascimento,
    address: inscricaoData.endereco,
    biNumber: inscricaoData.numeroBI,
    duration: inscricaoData.duracao,
    startDate: '2025-08-18', // Data fixa do início do preparatório
    paymentMethod: inscricaoData.formaPagamento,
    paymentStatus: 'inscrito',
    inscriptionNumber: generateSequentialNumber(),
    inscriptionDate: new Date().toISOString(),
    amount: 40000,
    createdBy: null,
    turmaPair: inscricaoData.par,
    turma: inscricaoData.turma,
    sala: inscricaoData.sala || 'Sala não definida'
  } : null;

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
    <div className="min-h-screen bg-gradient-to-br from-aauma-light-gray via-white to-aauma-light-gray">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-aauma-red">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img 
                src="/lovable-uploads/9e56fb52-9dc2-4075-8e3e-8b20fd589107.png" 
                alt="AAUMA Logo" 
                className="w-12 h-12 object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-aauma-navy">Preparatório AAUMA</h1>
                <p className="text-sm text-aauma-dark-gray">Inscrição Concluída</p>
              </div>
            </Link>
          </div>
        </div>
      </header>

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
