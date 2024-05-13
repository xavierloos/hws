import { db } from "@/lib/db";

export const getTokenByEmail = async (email: string) => {
  try {
    const verification = await db.token.findFirst({
      where: { email },
    });
    return verification;
  } catch {
    return null;
  }
};

export const getTokenByToken = async (token: string) => {
  try {
    const verification = await db.token.findUnique({
      where: { token },
    });
    return verification;
  } catch {
    return null;
  }
};
