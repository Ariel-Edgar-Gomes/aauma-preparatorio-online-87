import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailFile {
  content: string; // base64 (sem o prefixo data:)
  filename: string;
  type: string;
}

interface StudentDocumentsRequest {
  studentData: {
    nome: string;
    email?: string;
    telefone: string;
    numeroBI: string;
    dataNascimento?: string;
    endereco?: string;
    curso: string;
    turno: string;
    par: string;
    turma: string;
    numeroEstudante: string;
    dataInscricao: string;
  };
  files: {
    foto?: EmailFile | null;
    copiaBI?: EmailFile | null;
    declaracaoCertificado?: EmailFile | null;
    comprovativoPagamento?: EmailFile | null;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== Iniciando processamento de documentos do estudante ===");

    const { studentData, files }: StudentDocumentsRequest = await req.json();

    console.log("Dados do estudante:", studentData);
    console.log("Arquivos recebidos:", Object.keys(files));

    // Initialize Resend
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    // Email destination
    const emailDestination = "arieledgargomes04@gmail.com";

    // Prepare attachments a partir dos ficheiros enviados em base64
    const attachments: Array<{ filename: string; content: string; type: string; disposition: string }> = [];

    for (const [fileType, file] of Object.entries(files)) {
      if (file && file.content) {
        attachments.push({
          filename: file.filename || `${fileType}.file`,
          content: file.content,
          type: file.type || "application/octet-stream",
          disposition: "attachment",
        });
        console.log(`Arquivo ${fileType} preparado para anexo (${file.filename})`);
      }
    }

    // Format the email content
    const emailHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #003366; color: white; padding: 20px; text-align: center;">
          <h1>Nova Inscrição - Preparatório AAUMA</h1>
        </div>
        
        <div style="padding: 20px; background: #f9f9f9;">
          <h2 style="color: #003366;">Dados do Estudante</h2>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background: #f3f4f6; font-weight: bold;">Nome Completo:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${studentData.nome}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background: #f3f4f6; font-weight: bold;">Nº Estudante:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${studentData.numeroEstudante}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background: #f3f4f6; font-weight: bold;">Nº BI:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${studentData.numeroBI}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background: #f3f4f6; font-weight: bold;">Email:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${studentData.email || 'Não informado'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background: #f3f4f6; font-weight: bold;">Contacto:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${studentData.telefone}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background: #f3f4f6; font-weight: bold;">Data Nascimento:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${studentData.dataNascimento || 'Não informado'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background: #f3f4f6; font-weight: bold;">Endereço:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${studentData.endereco || 'Não informado'}</td>
            </tr>
          </table>

          <h3 style="color: #003366;">Dados Académicos</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background: #f3f4f6; font-weight: bold;">Curso:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${studentData.curso}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background: #f3f4f6; font-weight: bold;">Turno:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${studentData.turno}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background: #f3f4f6; font-weight: bold;">Par de Turma:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${studentData.par}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background: #f3f4f6; font-weight: bold;">Turma:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${studentData.turma}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background: #f3f4f6; font-weight: bold;">Data Inscrição:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${new Date(studentData.dataInscricao).toLocaleDateString('pt-AO')}</td>
            </tr>
          </table>

          <h3 style="color: #003366;">Documentos Anexados</h3>
          <ul>
            ${files.foto ? '<li>📷 Fotografia</li>' : ''}
            ${files.copiaBI ? '<li>📄 Cópia do BI</li>' : ''}
            ${files.declaracaoCertificado ? '<li>📜 Declaração/Certificado</li>' : ''}
            ${files.comprovativoPagamento ? '<li>💰 Comprovativo de Pagamento</li>' : ''}
            ${attachments.length === 0 ? '<li>Nenhum documento anexado</li>' : ''}
          </ul>
        </div>

        <div style="background: #003366; color: white; padding: 15px; text-align: center;">
          <p style="margin: 0;">Associação Acadêmica da Universidade Metodista de Angola</p>
          <p style="margin: 5px 0 0 0; font-size: 12px;">Preparatório para Exames de Acesso</p>
        </div>
      </div>
    `;

    // Send email with attachments
    console.log(`Enviando email para: ${emailDestination}`);
    console.log(`Número de anexos: ${attachments.length}`);

    const emailResponse = await resend.emails.send({
      from: "AAUMA Preparatório <onboarding@resend.dev>",
      to: [emailDestination],
      subject: `Nova Inscrição: ${studentData.nome} - ${studentData.numeroEstudante}`,
      html: emailHTML,
      attachments: attachments.length > 0 ? attachments : undefined,
    });

    console.log("Email enviado com sucesso:", emailResponse);

    return new Response(
      JSON.stringify({
        success: true,
        emailId: emailResponse.data?.id,
        attachmentsCount: attachments.length,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error("Erro na edge function send-student-documents:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
        success: false,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
};

serve(handler);
