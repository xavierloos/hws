import { generateToken } from "@/actions/tokens";
import { getUserByEmail } from "@/data/user";
import { sendVerificationEmail } from "@/lib/mailer";
import { NextResponse } from "next/server";

export const POST = async (req: Request, res: Response) => {
  try {
    const { email, type } = await req.json();

    const existingEmail = await getUserByEmail(email);

    if (existingEmail !== null) {
      return NextResponse.json(
        {
          message: `Email is already in use, please try again`,
          type: "warning",
        },
        { status: 200 }
      );
    }

    const token = await generateToken(email);

    await sendVerificationEmail(token.email, token.token, type);

    return NextResponse.json(
      { message: "Please verify your email" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
};
