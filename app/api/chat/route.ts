import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const GET = async (req: Request) => {
  try {
    const response = await openai.chat.completions.create({
      messages: [
        {
          role: "user",
          content:
            "return an article in a json format structure with a title, slug, description, category and full long content where the description is catchy and approved by SEO",
        },
      ],
      model: "gpt-3.5-turbo",
    });
    return NextResponse.json(response.choices[0].message, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong with blogs" },
      { status: 500 }
    );
  }
};

export const POST = async (req: Request) => {
  const reg = await req.json();
  try {
    const response = await openai.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `Make it better and catchy: ${reg.value}. No quotes. If the value is in a slug format, return it in the same format `,
        },
      ],
      model: "gpt-3.5-turbo",
    });
    return NextResponse.json(response.choices[0].message, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong with blogs" },
      { status: 500 }
    );
  }
};
