"use server";
import { db } from "@/lib/db";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { getUserByEmail } from "@/data/user";
import { DEF_LOGIN_REDIRECT } from "@/routes";
import { generateToken } from "@/actions/tokens";
import { sendVerificationEmail, send2FAEmail } from "@/lib/mailer";
import { getOTPConfirmationByUserId } from "@/data/oTPConfirmation";
import bcrypt from "bcryptjs";
import { getTokenByEmail } from "@/data/verification";

export const login = async (values: any, callbackUrl?: string | null) => {
  const { email, password, code } = values;
  const existingUser = await getUserByEmail(email);
  const matchingPassword = bcrypt.compare(password, existingUser?.password);
  console.log(matchingPassword)

  if (
    !existingUser ||
    !existingUser.email ||
    !existingUser.password ||
    !matchingPassword
  ) {
    return { error: "Please check your login details and try again" };
  }

  if (!existingUser.emailVerified) {
    const verification = await generateToken(existingUser.email);
    await sendVerificationEmail(verification.email, verification.token);
    return {
      warning: "Before continuing, please verify your account from email",
    };
  }

  if (existingUser.otpEnabled && existingUser.email) {
    if (code) {
      const token = await getTokenByEmail(existingUser.email);

      if (!token || token.token !== code) return { error: "Invalid OTP" };

      const hasExpired = new Date(token.expires) < new Date();
      if (hasExpired) return { error: "OTP Expired" };

      await db.token.delete({ where: { id: token.id } });

      const existingConfirmation = await getOTPConfirmationByUserId(
        existingUser.id
      );

      if (existingConfirmation)
        await db.oTPConfirmation.delete({
          where: { id: existingConfirmation.id },
        });

      await db.oTPConfirmation.create({ data: { userId: existingUser.id } });
    } else {
      const token = await generateToken(existingUser.email, "OTP");
      await send2FAEmail(token.email, token.token);

      return {
        success: "OTP's been sent to your email",
        otp: true,
      };
    }
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl || DEF_LOGIN_REDIRECT,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid Credentials" };
        default:
          return { error: "Something is not right" };
      }
    }
    throw error;
  }
};
