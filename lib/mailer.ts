import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const DOMAIN = process.env.NEXT_PUBLIC_APP_URL;

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${DOMAIN}/emailverification?token=${token}`;
  await resend.emails.send({
    from: "onbording@resend.dev",
    to: email,
    subject: "Confirm your email",
    html: `<p>Click <a href='${confirmLink}>here</a> to confirm email.</p>`,
  });
};

export const sendResetPasswordEmail = async (email: string, token: string) => {
  const rpLink = `${DOMAIN}/newpassword?token=${token}`;
  await resend.emails.send({
    from: "onbording@resend.dev",
    to: email,
    subject: "Reset password email",
    html: `<p>Click <a href='${rpLink}'>here</a> to reset your password.</p>`,
  });
};

export const send2FAEmail = async (email: string, token: string) => {
  await resend.emails.send({
    from: "onbording@resend.dev",
    to: email,
    subject: "2FA code for CMS",
    html: `<p>Your 2FA code is: ${token}</p>`,
  });
};

export const sendRegisterInvitation = async (email: string, token: string) => {
  const confirmLink = `${DOMAIN}/hws/registerinvitation?token=${token}`;
  await resend.emails.send({
    from: "onbording@resend.dev",
    to: email,
    subject: "Register invitation",
    html: `<p>Click <a href='${confirmLink}'>here</a> to register.</p>`,
  });
};
