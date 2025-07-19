
import React from 'react';
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";

interface InvoiceData {
  studentName: string;
  course: string;
  shift: string;
  email?: string;
  contact?: string;
  birthDate?: string;
  address?: string;
  biNumber?: string;
  duration?: string;
  startDate: string;
  paymentMethod?: string; 
  inscriptionNumber: string;
  inscriptionDate: string;
  amount: number;
  createdBy?: string;
  turmaPair?: string;
  turma?: string;
}

interface InvoiceTemplateProps {
  data: InvoiceData;
}

export const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({ data }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Create a new window with just the invoice content
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const invoiceContent = document.getElementById('invoice-content')?.innerHTML;
      printWindow.document.write(`
        <html>
          <head>
            <title>Fatura - ${data.studentName}</title>
            <style>
              @page { 
                size: A4; 
                margin: 15mm; 
              }
              * {
                box-sizing: border-box;
              }
              body { 
                font-family: Arial, sans-serif; 
                margin: 0; 
                padding: 0; 
                font-size: 11px;
                line-height: 1.3;
                color: #000;
              }
              .invoice-container { 
                max-width: 100%; 
                margin: 0; 
                padding: 24px;
                background: white;
                border: 1px solid #d1d5db;
              }
              .header { 
                text-align: center; 
                margin-bottom: 20px; 
                border-bottom: 2px solid #003366;
                padding-bottom: 15px;
              }
               .logo { 
                 width: 48px; 
                 height: 48px; 
                 margin: 0 auto 8px; 
                 display: block;
               }
              .company-name { 
                font-size: 14px; 
                font-weight: bold; 
                margin-bottom: 8px; 
                color: #003366;
                text-align: center;
              }
              .invoice-title { 
                font-size: 24px; 
                font-weight: bold; 
                margin-bottom: 0; 
                color: #d32f2f;
                text-align: center;
              }
              .info-section { 
                margin-bottom: 20px; 
              }
              .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 32px;
                margin-bottom: 20px;
              }
              .info-row { 
                display: flex; 
                margin-bottom: 8px; 
                font-size: 12px;
              }
              .info-label { 
                font-weight: bold; 
                width: 112px; 
                color: #003366;
                flex-shrink: 0;
              }
              .info-value {
                color: #1f2937;
                flex: 1;
              }
              .table { 
                width: 100%; 
                border-collapse: collapse; 
                margin: 20px 0; 
                font-size: 12px;
              }
              .table th, .table td { 
                border: 1px solid #9ca3af; 
                padding: 12px; 
                text-align: left; 
              }
              .table th { 
                background-color: #f3f4f6; 
                font-weight: bold;
                color: #003366;
              }
              .table td {
                color: #1f2937;
              }
              .table .text-center {
                text-align: center;
              }
              .table .text-right {
                text-align: right;
              }
              .total-section { 
                text-align: left; 
                margin: 20px 0; 
                font-size: 14px;
                background-color: #f3f4f6;
                padding: 16px;
                border-radius: 6px;
                border: 1px solid #d1d5db;
              }
              .total-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
              }
              .total-label {
                font-weight: bold;
                color: #003366;
              }
              .total-value {
                font-weight: bold;
                font-size: 18px;
                color: #d32f2f;
              }
              .payment-method {
                font-size: 10px;
                color: #666;
              }
              .two-column {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin: 20px 0;
              }
              .section-title {
                font-size: 14px;
                font-weight: bold;
                margin-bottom: 12px;
                color: #003366;
                border-bottom: 1px solid #d1d5db;
                padding-bottom: 8px;
              }
              .schedule-table {
                width: 100%;
                font-size: 12px;
              }
              .schedule-table th,
              .schedule-table td {
                padding: 8px;
                text-align: center;
                border: 1px solid #9ca3af;
              }
              .signatures { 
                margin-top: 40px; 
                text-align: center; 
                font-size: 11px;
              }
              .signature-line { 
                border-bottom: 1px solid #333; 
                width: 200px; 
                margin: 20px auto 10px; 
                height: 1px;
              }
              .signature-label {
                font-weight: bold;
                color: #003366;
                margin-top: 5px;
              }
              .footer { 
                margin-top: 30px; 
                text-align: center; 
                font-size: 9px; 
                border-top: 1px solid #ccc;
                padding-top: 15px;
                color: #666;
              }
              .footer p {
                margin: 3px 0;
              }
              .footer .company-name {
                font-weight: bold;
                color: #003366;
                margin-bottom: 8px;
              }
              @media print { 
                body { margin: 0; }
                .no-print { display: none !important; }
                .page-break { page-break-before: always; }
              }
            </style>
          </head>
          <body>
            ${invoiceContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-AO');
  };

  const formatPeriod = (shift: string) => {
    return shift === 'manha' ? '08h00 - 12h00' : '14h00 - 18h00';
  };

  return (
    <div className="max-w-4xl mx-auto bg-white">
      {/* Action Buttons - Hidden on print */}
      <div className="no-print flex gap-4 mb-6 justify-end">
        <Button onClick={handlePrint} variant="outline" className="flex items-center gap-2">
          <Printer className="w-4 h-4" />
          Imprimir
        </Button>
        <Button onClick={handleDownload} className="flex items-center gap-2 bg-aauma-navy hover:bg-aauma-navy/90">
          <Download className="w-4 h-4" />
          Baixar PDF
        </Button>
      </div>

      {/* Invoice Content */}
      <div id="invoice-content" className="invoice-container p-6 border border-gray-300 bg-white">
        {/* Header */}
        <div className="header text-center mb-5 pb-4 border-b-2 border-aauma-navy">
          <img 
            src="/lovable-uploads/9e56fb52-9dc2-4075-8e3e-8b20fd589107.png" 
            alt="AAUMA Logo" 
            className="logo w-12 h-12 mx-auto mb-2"
          />
          <div className="company-name text-sm font-bold mb-2 text-aauma-navy">
            Associação Acadêmica Universidade Metodista de Angola
          </div>
          <h1 className="invoice-title text-2xl font-bold text-aauma-red mb-0">FACTURA</h1>
        </div>

        {/* Student Information */}
        <div className="info-section mb-5">
          <div className="grid grid-cols-2 gap-8 text-xs">
            <div className="space-y-2">
              <div className="flex">
                <span className="font-bold w-28 text-aauma-navy flex-shrink-0">Nome:</span>
                <span className="text-gray-800">{data.studentName}</span>
              </div>
              {data.biNumber && (
                <div className="flex">
                  <span className="font-bold w-28 text-aauma-navy flex-shrink-0">Nº BI:</span>
                  <span className="text-gray-800">{data.biNumber}</span>
                </div>
              )}
              {data.birthDate && (
                <div className="flex">
                  <span className="font-bold w-28 text-aauma-navy flex-shrink-0">Nascimento:</span>
                  <span className="text-gray-800">{formatDate(data.birthDate)}</span>
                </div>
              )}
              {data.address && (
                <div className="flex">
                  <span className="font-bold w-28 text-aauma-navy flex-shrink-0">Endereço:</span>
                  <span className="text-gray-800">{data.address}</span>
                </div>
              )}
              <div className="flex">
                <span className="font-bold w-28 text-aauma-navy flex-shrink-0">Curso:</span>
                <span className="text-gray-800">{data.course}</span>
              </div>
               <div className="flex">
                 <span className="font-bold w-28 text-aauma-navy flex-shrink-0">Período:</span>
                 <span className="text-gray-800">{formatPeriod(data.shift)}</span>
               </div>
               {data.turmaPair && (
                 <div className="flex">
                   <span className="font-bold w-28 text-aauma-navy flex-shrink-0">Par:</span>
                   <span className="text-gray-800">{data.turmaPair}</span>
                 </div>
               )}
               {data.turma && (
                 <div className="flex">
                   <span className="font-bold w-28 text-aauma-navy flex-shrink-0">Turma:</span>
                   <span className="text-gray-800">Turma {data.turma}</span>
                 </div>
               )}
            </div>
            <div className="space-y-2">
              <div className="flex">
                <span className="font-bold w-28 text-aauma-navy flex-shrink-0">Nº Inscrição:</span>
                <span className="text-gray-800">{data.inscriptionNumber}</span>
              </div>
              <div className="flex">
                <span className="font-bold w-28 text-aauma-navy flex-shrink-0">Data Inscrição:</span>
                <span className="text-gray-800">{formatDate(data.inscriptionDate)}</span>
              </div>
              {data.email && (
                <div className="flex">
                  <span className="font-bold w-28 text-aauma-navy flex-shrink-0">Email:</span>
                  <span className="text-gray-800">{data.email}</span>
                </div>
              )}
              {data.contact && (
                <div className="flex">
                  <span className="font-bold w-28 text-aauma-navy flex-shrink-0">Contacto:</span>
                  <span className="text-gray-800">{data.contact}</span>
                </div>
              )}
              <div className="flex">
                <span className="font-bold w-28 text-aauma-navy flex-shrink-0">Status:</span>
                <span className="text-green-600 font-medium">Activo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Services Table */}
        <div className="mb-5">
          <h3 className="text-sm font-bold mb-3 text-aauma-navy">Serviços</h3>
          <table className="table w-full text-xs border-collapse">
            <thead>
              <tr className="bg-aauma-light-gray">
                <th className="border border-gray-400 p-3 text-left text-aauma-navy">Descrição</th>
                <th className="border border-gray-400 p-3 text-center text-aauma-navy w-20">Qtd</th>
                <th className="border border-gray-400 p-3 text-right text-aauma-navy w-32">Valor (AOA)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-400 p-3">Taxa de Inscrição + Aulas Preparatórias ({data.duration || '1,2 Meses'})</td>
                <td className="border border-gray-400 p-3 text-center">1</td>
                <td className="border border-gray-400 p-3 text-right font-medium">{data.amount.toLocaleString('pt-AO')},00</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Two Column Layout for Registration and Schedule */}
        <div className="grid grid-cols-2 gap-6 mb-5">
          {/* Registration Data */}
          <div>
            <h3 className="text-sm font-bold mb-3 text-aauma-navy border-b border-gray-300 pb-2">Dados de Inscrição</h3>
            <table className="table w-full text-xs">
              <thead>
                <tr className="bg-aauma-light-gray">
                  <th className="border border-gray-400 p-2 text-aauma-navy">Nome</th>
                  <th className="border border-gray-400 p-2 text-aauma-navy">Curso</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-400 p-2">{data.studentName}</td>
                  <td className="border border-gray-400 p-2">{data.course}</td>
                </tr>
              </tbody>
            </table>
            <div className="mt-3 text-xs space-y-2">
              <div className="flex">
                <span className="font-bold w-20 text-aauma-navy">Início:</span>
                <span>{formatDate(data.startDate)}</span>
              </div>
              <div className="flex">
                <span className="font-bold w-20 text-aauma-navy">Duração:</span>
                <span>{data.duration || '1,2 Meses'}</span>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div>
            <h3 className="text-sm font-bold mb-3 text-aauma-navy border-b border-gray-300 pb-2">Horário</h3>
            <table className="schedule-table w-full text-xs">
              <thead>
                <tr className="bg-aauma-light-gray">
                  <th className="border border-gray-400 p-2 text-aauma-navy">Seg</th>
                  <th className="border border-gray-400 p-2 text-aauma-navy">Ter</th>
                  <th className="border border-gray-400 p-2 text-aauma-navy">Qua</th>
                  <th className="border border-gray-400 p-2 text-aauma-navy">Qui</th>
                  <th className="border border-gray-400 p-2 text-aauma-navy">Sex</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-400 p-2 text-center">L.P</td>
                  <td className="border border-gray-400 p-2 text-center">-</td>
                  <td className="border border-gray-400 p-2 text-center">L.P/Mat</td>
                  <td className="border border-gray-400 p-2 text-center">Fís</td>
                  <td className="border border-gray-400 p-2 text-center">Mat</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Total Section */}
        <div className="bg-aauma-light-gray p-4 rounded mb-5 border border-gray-300">
          <div className="flex justify-between items-center text-sm mb-2">
            <span className="font-bold text-aauma-navy">TOTAL GERAL:</span>
            <span className="font-bold text-lg text-aauma-red">{data.amount.toLocaleString('pt-AO')},00 AOA</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-aauma-navy">Forma de Pagamento:</span>
            <span className="font-medium">{data.paymentMethod || 'Cash'}</span>
          </div>
        </div>

         {/* Signatures - Centered */}
         <div className="signatures text-center mt-10">
           <div className="signature-line border-b border-black w-48 mx-auto mb-2"></div>
           <p className="font-bold text-sm text-aauma-navy">Assinatura do Responsável</p>
           {data.createdBy && (
             <p className="text-xs text-gray-600 mt-2">Inscrição realizada por: {data.createdBy}</p>
           )}
         </div>

        {/* Footer */}
        <div className="footer text-xs text-center pt-4 border-t border-gray-300 mt-8">
          <p className="font-bold text-aauma-navy mb-2">Associação Acadêmica da Universidade Metodista de Angola</p>
          <p className="text-gray-600">Rua Nossa Senhora da Muxima, nº 10 • Caixa Postal 6739 • LUANDA - ANGOLA</p>
          <p className="text-gray-600">Tel: (+244) 938 665 698 • (+244) 941 452 317</p>
          <p className="text-gray-600">Email: associacaodosestudantescauma@gmail.com</p>
        </div>
      </div>
    </div>
  );
};
