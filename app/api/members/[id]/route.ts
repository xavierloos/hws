import { getUserByEmail, getUserByUsername } from "@/data/user";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { storage } from "@/lib/gcp";

export const GET = async (req: Request, { params }: any) => {
  try {
    const res = await db.user.findFirst({
      where: { id: params.id },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        tel: true,
        about: true,
        image: true,
        otpEnabled: true,
        emailNotificationsEnabled: true,
        smsNotificationsEnabled: true,
      },
    });
    if (res?.image && res?.image.includes(res?.id)) {
      const options = {
        version: "v2", // defaults to 'v2' if missing.
        action: "read",
        expires: Date.now() + 1000 * 60 * 60, // temporary url will expire in 1hr
      };
      const [url] = await storage
        .bucket(`${process.env.GCP_BUCKET}`)
        .file(`profiles/${res.id}/${res.image}`)
        .getSignedUrl(options);
      res.tempUrl = url;
    }

    return NextResponse.json(res, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong", error },
      { status: 500 }
    );
  }
};

export const PUT = async (req: Request) => {
  const searchParams = req.nextUrl.searchParams;
  const type = searchParams.get("type");

  try {
    const user = await currentUser();
    if (!user) return { error: "Unathorized" };

    const update = await req.json();
    let toUpdate = {};

    switch (type) {
      case "profile":
        if (user?.username !== update.username) {
          const existingUsername = await getUserByUsername(update.username);
          if (existingUsername)
            return NextResponse.json(
              { error: "Username already used" },
              { status: 200 }
            );
        }

        toUpdate = {
          username: update.username,
          name: update.name,
          email: update.email,
          role: update.role,
          tel: update.tel,
          about: update.about,
          image: update.image,
        };
        break;
      case "security":
        const checkUser = await getUserByEmail(user?.email);
        if (update.password) {
          const passwordMatch = await bcrypt.compare(
            update.password,
            checkUser?.password
          );
          if (!passwordMatch)
            return NextResponse.json(
              { error: "Wrong passwords, no changes have been saved" },
              { status: 200 }
            );
          const hashedPassword = await bcrypt.hash(update.newPassword, 10);
          toUpdate = {
            password: hashedPassword,
            otpEnabled: update.otpEnabled,
          };
        } else {
          toUpdate = {
            otpEnabled: update.otpEnabled,
          };
        }
        break;
      case "notifications":
        toUpdate = {
          emailNotificationsEnabled: update.emailNotificationsEnabled,
          smsNotificationsEnabled: update.smsNotificationsEnabled,
        };
        break;
    }

    const res = await db.user.update({
      where: { id: user.id },
      data: toUpdate,
    });

    return NextResponse.json(
      { success: "Changes safed successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { warning: "Something went wrong", error },
      { status: 500 }
    );
  }
};
