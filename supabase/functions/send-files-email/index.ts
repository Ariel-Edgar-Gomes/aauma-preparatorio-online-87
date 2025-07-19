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
    const { studentName, files }: SendFilesEmailRequest = await req.json();
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
        <h2>Ficheiros de inscrição do aluno</h2>
        <p><strong>Nome do Aluno:</strong> ${studentName}</p>
        <p>Em anexo encontram-se os ficheiros da inscrição deste aluno.</p>
        <br>
        <p>Cumprimentos,<br>Sistema AAUMA</p>
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