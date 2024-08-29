import { generateToken } from "@/actions/tokens";
import { getUserByEmail } from "@/data/user";
import { sendVerificationEmail } from "@/lib/mailer";
import { NextResponse } from "next/server";

export const POST = async (req: Request, res: Response) => {
  console.log("eher");
  try {
    const { email } = await req.json();
    console.log(email);

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

    await sendVerificationEmail(token.email, token.token, "register");

    return NextResponse.json(
      { message: "Please verify your account" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
};
