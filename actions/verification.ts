"use server";
import { db } from "@/lib/db";
import { getUserByEmail } from "@/data/user";
import { getTokenByToken } from "@/data/verification";

export const verification = async (token: string) => {
  const existingToken = await getTokenByToken(token);
  if (!existingToken) return { msg: "Token doesn't exist!", type: "error" };

  const hasExpired = new Date(existingToken.expires) < new Date();
  if (hasExpired) {
    // const verification = await generateToken(existingToken?.email);
    // await sendVerificationEmail(verification?.email, verification.token);
    return { msg: "Token has expired", type: "error" };
  }

  const existingUser = await getUserByEmail(existingToken?.email);
  if (!existingUser) return { msg: "Email doesn't exist", type: "error" };

  await db.user.update({
    where: { id: existingUser.id },
    data: {
      emailVerified: new Date(),
      email: existingToken.email,
    },
  });

  await db.token.delete({
    where: { id: existingToken.id },
  });

  return {
    msg: `${existingUser.email} verified!, you can now login`,
    type: "success",
  };
};

export const validateToken = async (token: string) => {
  const existingToken = await getTokenByToken(token);
  if (!existingToken) return { msg: "Token doesn't exist!", type: "error" };

  const hasExpired = new Date(existingToken.expires) < new Date();
  if (hasExpired) return { msg: "Token has expired", type: "error" };

  // const existingUser = await getUserByEmail(existingToken.email);
  // if (existingUser) return { error: "Email already exist" };

  // await db.user.update({
  //   where: { id: existingUser.id },
  //   data: {
  //     emailVerified: new Date(),
  //     email: existingToken.email,
  //   },
  // });

  // await db.verificationToken.delete({
  //   where: { id: existingToken.id },
  // });

  return existingToken;
};
