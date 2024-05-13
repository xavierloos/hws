import { db } from "@/lib/db";

export const getResetPasswordTokenByToken = async (token: string) => {
  try {
    const rpToken = await db.token.findUnique({
      where: { token },
    });
    return rpToken;
  } catch (error) {
    return null;
  }
};

export const getResetPasswordTokenByEmail = async (email: string) => {
  try {
    const rpToken = await db.token.findFirst({
      where: { email },
    });
    return rpToken;
  } catch (error) {
    return null;
  }
};
