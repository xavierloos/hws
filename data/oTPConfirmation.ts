import { db } from "@/lib/db";

export const getOTPConfirmationByUserId = async (userId: string) => {
  try {
    const otpConfirmation = await db.oTPConfirmation.findUnique({
      where: { userId },
    });
    return otpConfirmation;
  } catch {
    return null;
  }
};
