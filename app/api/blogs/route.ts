import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { storage } from "@/lib/gcp";
import { NextResponse } from "next/server";

export const GET = async (req: Request) => {
  try {
    const options = {
      version: "v2", // defaults to 'v2' if missing.
      action: "read",
      expires: Date.now() + 1000 * 60 * 60, // temporary url will expire in one hour
    };

    const res = await db.blog.findMany({
      include: { user: true },
    });

    if (res.length > 0) {
      for (const file of res) {
        const [url] = await storage
          .bucket(`${process.env.GCP_BUCKET}`)
          .file(`files/${file.thumbnail}`)
          .getSignedUrl(options);
        file.tempUrl = url;
      }
    }

    return NextResponse.json(res, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong with blogs" },
      { status: 500 }
    );
  }
};

export const POST = async (req: Request, res: Response) => {
  try {
    const user = await currentUser();
    if (!user) return { error: "Unathorized" };

    // TODO: check if user has writing permissions

    const blog = await req.json();

    const existingSlug = await db.blog.findUnique({
      where: { slug: blog.slug },
    });

    if (existingSlug)
      return NextResponse.json(
        { message: "Slug already in use" },
        { status: 500 }
      );

    const r = await db.blog.create({
      data: {
        ...blog,
        createdBy: user?.email,
        createdAt: new Date(),
        modifiedBy: user?.id,
        modifiedAt: new Date(),
      },
    });

    return NextResponse.json(
      { message: `${blog.title} created successfully` },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong", error },
      { status: 500 }
    );
  }
};

export const DELETE = async (req: any) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get("id");

    await db.blog.delete({
      where: {
        id,
      },
    });

    return NextResponse.json(
      { message: `Blog deleted successfully` },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong", error },
      { status: 500 }
    );
  }
};
