import { db } from "@/lib/db";
import { sendNotification } from "@/lib/mailer";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
  try {
    const email = await req.json();

    await db.invitation.create({
      data: email,
    });

    await sendNotification(email.email);

    return NextResponse.json(
      { message: `An email has been sent`, type: "success" },
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
