import { generateToken } from "@/actions/tokens";
import { getSubscriberByEmail, getUserByEmail } from "@/data/user";
import { db } from "@/lib/db";
import { sendRegisterInvitation } from "@/lib/mailer";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
  console.log("here");
  try {
    const { email } = await req.json();
    console.log(email);

    const existingEmail = await getUserByEmail(email);
    const existingSubscriber = await getSubscriberByEmail(email);

    console.log(existingEmail, existingSubscriber);

    if (existingEmail || existingSubscriber) {
      return NextResponse.json(
        { message: "You are already subscribed!", type: "warning" },
        { status: 200 }
      );
    }

    const token = await generateToken(email);

    await sendRegisterInvitation(token.email, token.token);

    await db.newsletter.create({
      data: {
        email,
      },
    });

    console.log(token);
    return NextResponse.json(
      {
        message: `Thank you for subscribing. An email has been sent to ${email} to verify`,
        type: "success",
      },
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