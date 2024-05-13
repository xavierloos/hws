"use server";
import { getUserByEmail } from "@/data/user";
import { sendResetPasswordEmail } from "@/lib/mailer";
import { generateToken } from "@/actions/tokens";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { getTokenByToken } from "@/data/verification";

export const forgotPassword = async (email: any) => {
  const existingEmail = await getUserByEmail(email);
  if (!existingEmail) return { error: "Email not found" };
  // If password is null means the account was created with google or github
  if (existingEmail.password === null)
    return {
      error: "This email belongs to another type of credentials",
    };

  const rpToken = await generateToken(email);
  await sendResetPasswordEmail(rpToken.email, rpToken.token);

  return { success: "A reset password email has been sent!" };
};

export const resetPassword = async (values: any, token: string) => {
  if (!token) return { error: "Missing token" };

  const existingToken = await getTokenByToken(token);
  if (!existingToken) return { error: "Invalid token" };

  const hasExpired = new Date(existingToken.expires) < new Date();
  if (hasExpired) return { error: "Token has expired" };

  const existingUser = await getUserByEmail(existingToken.email);
  if (!existingUser) return { error: "Email not found" };

  const hashedPassword = await bcrypt.hash(values.password, 10);

  await db.user.update({
    where: { id: existingUser.id },
    data: { password: hashedPassword },
  });

  await db.token.delete({
    where: { id: existingToken.id },
  });

  return { msg: "Password updated!", type: "success" };
};
