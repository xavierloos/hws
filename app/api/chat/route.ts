import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const GET = async (req: any) => {
  const searchParams = req.nextUrl.searchParams;
  const type = searchParams.get("type");
  console.log(type);
  try {
    if (type === "blog") {
      const response = await openai.chat.completions.create({
        messages: [
          {
            role: "user",
            content:
              "return an article in a json format structure with a title, slug, description, categories separated by commas and full long content where the content is formatted with html tags",
          },
        ],
        model: "gpt-3.5-turbo",
      });
      return NextResponse.json(response.choices[0].message, { status: 200 });
    } else {
      const response = await openai.chat.completions.create({
        messages: [
          {
            role: "user",
            content: `Make it better and catchy: "${type}". No quotes. If the value is a title, return the new title and the new slug in a json format structure `,
          },
        ],
        model: "gpt-3.5-turbo",
      });
      console.log(response.choices[0].message);
      return NextResponse.json(response.choices[0].message, { status: 200 });
    }
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
