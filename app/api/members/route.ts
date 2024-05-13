import { getUserByEmail } from "@/data/user";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendRegisterInvitation } from "@/lib/mailer";
import { generateToken } from "@/actions/tokens";
import { NextResponse } from "next/server";
import { storage } from "@/lib/gcp";

export const GET = async () => {
  try {
    const user = await currentUser();

    const res = await db.user.findMany({
      where: {
        id: {
          not: user?.id,
        },
      },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        image: true,
      },
    });

    return new NextResponse(JSON.stringify(res, { status: 200 }));
  } catch (error) {
    return NextResponse.json(
      {
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
};

export const POST = async (req: Request) => {
  try {
    const user = await currentUser();
    if (!user) return { error: "Unathorized" };

    const email = await req.json();

    const existingEmail = await getUserByEmail(email.value);

    if (existingEmail) {
      return NextResponse.json(
        { message: "Email already in use, please try again!", type: "warning" },
        { status: 200 }
      );
    }

    const token = await generateToken(email.value);

    await sendRegisterInvitation(token.email, token.token);

    return NextResponse.json(
      { message: `An email has been sent to ${email.value}`, type: "success" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
};
