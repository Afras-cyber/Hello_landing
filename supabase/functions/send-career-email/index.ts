
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CareerEmailRequest {
  type: 'job_application' | 'open_application';
  jobTitle?: string;
  applicantName: string;
  applicantEmail: string;
  message?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, jobTitle, applicantName, applicantEmail, message }: CareerEmailRequest = await req.json();

    const subject = type === 'job_application' 
      ? `Uusi työhakemus: ${jobTitle}`
      : 'Uusi avoin työhakemus';

    const emailContent = type === 'job_application'
      ? `
        <h2>Uusi työhakemus saapunut</h2>
        <p><strong>Työpaikka:</strong> ${jobTitle}</p>
        <p><strong>Hakijan nimi:</strong> ${applicantName}</p>
        <p><strong>Hakijan sähköposti:</strong> ${applicantEmail}</p>
        ${message ? `<p><strong>Viesti:</strong></p><p>${message}</p>` : ''}
        <p>Ota yhteyttä hakijaan mahdollisimman pian.</p>
      `
      : `
        <h2>Uusi avoin työhakemus saapunut</h2>
        <p><strong>Hakijan nimi:</strong> ${applicantName}</p>
        <p><strong>Hakijan sähköposti:</strong> ${applicantEmail}</p>
        ${message ? `<p><strong>Viesti:</strong></p><p>${message}</p>` : ''}
        <p>Hakija on kiinnostunut työskentelemään Blondifylla.</p>
      `;

    const emailResponse = await resend.emails.send({
      from: "Blondify Career <onboarding@resend.dev>",
      to: ["vilma@blondify.fi"],
      subject: subject,
      html: emailContent,
    });

    console.log("Career email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-career-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
