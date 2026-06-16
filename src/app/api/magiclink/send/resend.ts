import nodemailer from "nodemailer";

const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL!;

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: CONTACT_EMAIL,
    pass: process.env.SMTP_GOOGLE?.replace(/\s+/g, ""),
  },
});

const FONT_STACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

const LOGO_BASE64 =
  "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";

const buildMagicLinkEmailHtml = (magicLinkUrl: string) => `
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Seu link de acesso</title>
  </head>
  <body style="margin:0; padding:0; background-color:#fafaf8; font-family:${FONT_STACK};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fafaf8;">
      <tr>
        <td align="center" style="padding:40px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; background-color:#ffffff; border-radius:20px; overflow:hidden; border:1px solid rgba(0,0,0,0.08);">
            <!-- Header -->
            <tr>
              <td style="background-color:#DC2626; background-image:linear-gradient(135deg, #DC2626 0%, #EA580C 100%); padding:36px 40px; text-align:center;">
                <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:0 auto;">
                  <tr>
                    <td style="background-color:rgba(255,255,255,0.18); border-radius:14px; padding:14px; vertical-align:middle;">
                      <img src="cid:devshowcase-logo" width="48" height="48" alt="Dev Showcase" style="display:block; border:0;" />
                    </td>
                    <td style="padding-left:14px; vertical-align:middle; text-align:left;">
                      <span style="font-size:22px; font-weight:600; color:#ffffff;">Dev <span style="font-weight:700;">Showcase</span></span>
                    </td>
                  </tr>
                </table>
                <p style="margin:10px 0 0; font-size:11px; letter-spacing:0.08em; text-transform:uppercase; color:rgba(255,255,255,0.75);">
                  Premium Portfólio
                </p>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:40px 40px 8px;">
                <p style="margin:0 0 12px; font-size:11px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#9CA3AF;">
                  Magic Link &middot; Autenticação sem senha
                </p>
                <h1 style="margin:0 0 16px; font-size:24px; line-height:1.3; font-weight:700; color:#111827;">
                  Seu link de acesso chegou
                </h1>
                <p style="margin:0 0 28px; font-size:14px; line-height:1.6; color:#4B5563;">
                  Clique no botão abaixo para entrar na demonstração de Magic Link do Dev Showcase.
                  Você recebeu este e-mail porque solicitou um login sem senha.
                </p>
                <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:0 auto 20px;">
                  <tr>
                    <td style="background-color:#DC2626; background-image:linear-gradient(135deg, #DC2626 0%, #B91C1C 100%); border-radius:12px;">
                      <a href="${magicLinkUrl}" target="_blank" style="display:inline-block; padding:14px 36px; font-size:15px; font-weight:600; color:#ffffff; text-decoration:none;">
                        Entrar agora
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="margin:0 0 28px; font-size:12px; line-height:1.5; color:#9CA3AF; text-align:center;">
                  Este link expira em 15 minutos e só pode ser usado uma única vez.
                </p>
              </td>
            </tr>

            <!-- Fallback link -->
            <tr>
              <td style="padding:0 40px 28px;">
                <p style="margin:0 0 8px; font-size:12px; color:#9CA3AF;">
                  O botão não funcionou? Copie e cole o link abaixo no navegador:
                </p>
                <p style="margin:0; padding:12px 14px; background-color:#F9FAFB; border:1px solid #E5E7EB; border-radius:8px; font-family:monospace; font-size:12px; word-break:break-all;">
                  <a href="${magicLinkUrl}" target="_blank" style="color:#DC2626; text-decoration:none;">${magicLinkUrl}</a>
                </p>
              </td>
            </tr>

            <!-- Security note -->
            <tr>
              <td style="padding:0 40px 36px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FFFBEB; border:1px solid #FDE68A; border-radius:10px;">
                  <tr>
                    <td style="padding:14px 16px; font-size:12px; line-height:1.5; color:#92400E;">
                      <strong>Não foi você?</strong> Pode ignorar este e-mail com segurança — nenhuma ação será feita e o link expira automaticamente.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- Footer -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
            <tr>
              <td style="text-align:center; padding:24px 24px 0;">
                <p style="margin:0 0 6px; font-size:12px; color:#9CA3AF;">Dev Showcase — Premium Developer Portfolio</p>
                <p style="margin:0; font-size:11px; color:#C4C8CE;">&copy; 2026 Dev Showcase — Jordão Beghetto Massariol. Todos os direitos reservados.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

const buildMagicLinkEmailText = (magicLinkUrl: string) =>
  [
    "Dev Showcase — Magic Link",
    "",
    "Seu link de acesso chegou.",
    "",
    `Acesse: ${magicLinkUrl}`,
    "",
    "Este link expira em 15 minutos e só pode ser usado uma única vez.",
    "Se você não solicitou este e-mail, pode ignorá-lo com segurança.",
  ].join("\n");

export const sendMail = async (
  email: string,
  token: string,
  domain: string,
) => {
  const magicLinkUrl = `${domain}/showcase/auth?token=${token}`;

  try {
    await transporter.sendMail({
      from: `Dev Showcase <${CONTACT_EMAIL}>`,
      to: email,
      subject: "Seu link de acesso — Dev Showcase",
      html: buildMagicLinkEmailHtml(magicLinkUrl),
      text: buildMagicLinkEmailText(magicLinkUrl),
      attachments: [
        {
          filename: "favicon-96x96.png",
          content: Buffer.from(LOGO_BASE64, "base64"),
          cid: "devshowcase-logo",
        },
      ],
    });
  } catch (error) {
    console.error({ error });
  }
};
