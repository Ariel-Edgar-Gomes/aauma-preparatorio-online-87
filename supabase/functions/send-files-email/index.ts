import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SendFilesEmailRequest {
  studentName: string;
  studentInfo: {
    curso: string;
    numeroEstudante?: string;
    dataInscricao: string;
    turno?: string;
    par?: string;
    turma?: string;
    telefone: string;
    email?: string;
  };
  files: Array<{
    name: string;
    content: string; // base64 encoded
    type: string;
  }>;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('Send files email function called');

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { studentName, studentInfo, files }: SendFilesEmailRequest = await req.json();
    console.log(`Sending files for student: ${studentName}`);

    const attachments = files.map(file => ({
      filename: file.name,
      content: file.content,
      type: file.type,
      disposition: "attachment"
    }));

    const emailResponse = await resend.emails.send({
      from: "AAUMA <onboarding@resend.dev>",
      to: ["arieledgargomes02@gmail.com"],
      subject: `Ficheiros de inscrição - ${studentName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 10px;">
            Ficheiros de Inscrição do Aluno
          </h2>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e3a8a; margin-top: 0;">Dados do Aluno:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Nome:</td>
                <td style="padding: 8px 0; color: #6b7280;">${studentName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Curso:</td>
                <td style="padding: 8px 0; color: #6b7280;">${studentInfo.curso}</td>
              </tr>
              ${studentInfo.numeroEstudante ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Número do Estudante:</td>
                <td style="padding: 8px 0; color: #6b7280;">${studentInfo.numeroEstudante}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Data de Inscrição:</td>
                <td style="padding: 8px 0; color: #6b7280;">${new Date(studentInfo.dataInscricao).toLocaleDateString('pt-PT')}</td>
              </tr>
              ${studentInfo.turno ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Turno:</td>
                <td style="padding: 8px 0; color: #6b7280;">${studentInfo.turno}</td>
              </tr>
              ` : ''}
              ${studentInfo.par ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Par:</td>
                <td style="padding: 8px 0; color: #6b7280;">${studentInfo.par}</td>
              </tr>
              ` : ''}
              ${studentInfo.turma ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Turma:</td>
                <td style="padding: 8px 0; color: #6b7280;">${studentInfo.turma}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Telefone:</td>
                <td style="padding: 8px 0; color: #6b7280;">${studentInfo.telefone}</td>
              </tr>
              ${studentInfo.email ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Email:</td>
                <td style="padding: 8px 0; color: #6b7280;">${studentInfo.email}</td>
              </tr>
              ` : ''}
            </table>
          </div>
          
          <p style="color: #374151; line-height: 1.6;">
            Em anexo encontram-se os ficheiros da inscrição deste aluno (${files.length} ficheiro(s)).
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; margin: 0;">
              Cumprimentos,<br>
              <strong style="color: #1e3a8a;">Sistema AAUMA</strong>
            </p>
          </div>
        </div>
      `,
      attachments: attachments
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-files-email function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);