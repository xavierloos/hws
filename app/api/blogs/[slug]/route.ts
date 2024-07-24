import { generateToken } from "@/actions/tokens";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendCommentVerification } from "@/lib/mailer";
import { getTemporaryUrlImage } from "@/temporaryUrlImage";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const GET = async (req: Request, { params }: any) => {
  try {
    const blog = await db.blog.findUnique({
      where: { slug: params.slug },
      include: {
        user: true,
        comments: {
          where: {
            isVerified: true, // Only include verified comments
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    let cats = [];
    for (const category of blog.categories) {
      const cat = await db.category.findUnique({
        where: {
          id: category,
        },
      });
      cats.push(cat);
    }

    blog.categories = cats;
    blog.banner = await getTemporaryUrlImage("files", blog.banner);
    blog.user.image = await getTemporaryUrlImage(
      "profiles",
      blog.user.image,
      blog.user.id
    );

    if (!blog)
      return NextResponse.json({ message: "Not found" }, { status: 500 });

    return NextResponse.json(blog, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong", error },
      { status: 500 }
    );
  }
};

export const POST = async (req: Request, { params }: any) => {
  try {
    const user = await currentUser();
    const comment = await req.json();

    const blog = await db.blog.findUnique({
      where: { id: comment.relatedId },
    });

    if (!blog)
      return NextResponse.json(
        { message: "Blog does not exist" },
        { status: 500 }
      );

    // CHECK IF THE COMMENT HAS EXPLICIT CONTEXT
    const response = await openai.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `return a boolean (true or false) code if text has explicit content or any text code: ${comment.comment}`,
        },
      ],
      model: "gpt-3.5-turbo",
    });
    const isExplicit = response.choices[0].message.content;

    if (isExplicit == "true") {
      return NextResponse.json(
        {
          message: "Detected sensitive content, please try again!",
          type: "warning",
        },
        { status: 200 }
      );
    }

    const res = await db.comment.create({
      data: {
        ...comment,
        createdAt: new Date(),
        isVerified: user ? true : false,
      },
    });

    // SEND A EMAIL VERIFICATION TO ADD THE COMMENT
    if (!user) {
      const token = await generateToken(comment.createdBy);
      await sendCommentVerification(token.email, token.token, params.slug);
    }

    return NextResponse.json(
      {
        message: user
          ? "Comment added"
          : "Thank you for your comment, and email has been sent to verify",
        type: "success",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong", error },
      { status: 500 }
    );
  }
};
