import crypto from "crypto";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { getTokenByEmail } from "@/data/verification";

export const generateToken = async (email: string, type?: string | null) => {
  const token =
    type === "OTP" ? crypto.randomInt(100_000, 1_000_000).toString() : uuidv4();
  const expires =
    type === "OTP"
      ? new Date(new Date().getTime() + 3600 * 1000) // expires in 5mins
      : new Date(new Date().getTime() + 5 * 60 * 1_000); // expires one hour

  const existingToken = await getTokenByEmail(email);
  if (existingToken) await db.token.delete({ where: { id: existingToken.id } });

  const res = await db.token.create({
    data: {
      email,
      token,
      expires,
    },
  });

  return res;
};
