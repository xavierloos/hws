"use server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { getUserByEmail, getUserByUsername } from "@/data/user";
import { generateToken } from "@/actions/tokens";
import { sendVerificationEmail } from "@/lib/mailer";

export const register = async (values: any, token?: string | null) => {
  const { name, email, username, password } = values;

  const existingUser = await getUserByEmail(email);
  if (existingUser) return { error: "Email already used" };

  const existingUsername = await getUserByUsername(username);
  if (existingUsername) return { error: "Username already used" };

  if (token) {
    const existingToken = await db.token.findMany({
      where: {
        token: {
          equals: token,
        },
      },
    });
    if (existingToken.length === 0 || existingToken[0].email !== email) {
      return { error: "Something's not right" };
    }
    await db.token.delete({
      where: { token },
    });
  }

  if (token === null) {
    const tkn = await generateToken(email);
    await sendVerificationEmail(tkn.email, tkn.token);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.user.create({
    data: {
      name,
      email,
      username,
      password: hashedPassword,
      emailVerified: token ? true : false,
    },
  });

  return {
    success: `Thanks for registering, ${
      token
        ? "please login into your account!"
        : "please confirm your email and login with your credentials"
    }`,
  };
};
