"use server";
import { db } from "@/lib/db";
import { getUserByEmail } from "@/data/user";
import { getTokenByToken } from "@/data/verification";

export const verification = async (token: string, type: string) => {
  const existingToken = await getTokenByToken(token);

  if (existingToken == null)
    return { msg: "Token doesn't exist!", type: "error" };

  const hasExpired = new Date(existingToken.expires) < new Date();
  if (hasExpired) return { msg: "Token has expired", type: "error" };

  switch (type) {
    case "register":
      await db.token.delete({
        where: { id: existingToken.id },
      });

      return {
        msg: "Thank you for verify, the team will contact you soon",
        email: existingToken.email,
        type: "success",
      };
    case "subscribe":
      await db.token.delete({
        where: { id: existingToken.id },
      });

      return {
        msg: "Thank you for subscribe",
        email: existingToken.email,
        type: "success",
      };
    default:
      const existingUser = await getUserByEmail(existingToken?.email);
      if (!existingUser) return { msg: "Email doesn't exist", type: "error" };

      await db.user.update({
        where: { id: existingUser.id },
        data: {
          emailVerified: true,
          email: existingToken.email,
        },
      });

      await db.token.delete({
        where: { id: existingToken.id },
      });

      return {
        msg: `Thank you ${existingUser.email}, you account has been verified`,
        type: "success",
      };
  }
};

export const verifyComment = async (token: string) => {
  const existingToken = await getTokenByToken(token);
  if (!existingToken) return { msg: "Token doesn't exist!", type: "error" };

  await db.comment.updateMany({
    where: { createdBy: existingToken.email },
    data: {
      isVerified: true,
    },
  });

  await db.token.delete({
    where: { id: existingToken.id },
  });

  return {
    msg: `Thank you ${existingToken.email}, your comment has been verified and added`,
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
