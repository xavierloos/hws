import { db } from "@/lib/db";

export const getUserByEmail = async (email: string) => {
  try {
    const user = await db.user.findFirst({ where: { email } });
    return user;
  } catch (error) {
    return null;
  }
};

export const getSubscriberByEmail = async (email: string) => {
  try {
    const user = await db.newsletter.findFirst({ where: { email } });
    return user;
  } catch (error) {
    return null;
  }
};

export const getUserByUsername = async (username: string) => {
  try {
    const user = await db.user.findFirst({ where: { username } });
    return user;
  } catch (error) {
    return null;
  }
};

export const getUserById = async (id: string) => {
  try {
    const user = await db.user.findUnique({ where: { id } });
    return user;
  } catch (error) {
    return null;
  }
};
