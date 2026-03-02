/**
 * Send support ticket notification email via Resend (optional).
 * Set RESEND_API_KEY to enable. From address must be verified in Resend.
 */
const RESEND_API = "https://api.resend.com/emails";

export async function sendTicketCreatedEmail(params: {
  to: string;
  ticketId: string;
  title: string;
  appUrl: string;
}): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  const from = process.env.RESEND_FROM ?? "onboarding@resend.dev";
  const res = await fetch(RESEND_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [params.to],
      subject: `[Support] ${params.title}`,
      html: `A support ticket was created. <br><br>Title: ${params.title}<br>ID: ${params.ticketId}<br><a href="${params.appUrl}/dashboard/tickets/${params.ticketId}">View ticket</a>`,
    }),
  });
  return res.ok;
}
