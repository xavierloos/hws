import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { storage } from "@/lib/gcp";
import { getTemporaryUrlImage } from "@/temporaryUrlImage";
import { NextResponse } from "next/server";

export const GET = async (req: Request) => {
  try {
    const blogs = await db.blog.findMany({
      include: { user: true },
    });

    if (blogs.length > 0) {
      for (const blog of blogs) {
        const modifier = await db.user.findUnique({
          where: {
            id: blog.modifiedBy,
          },
          select: {
            id: true,
            name: true,
            username: true,
            role: true,
            image: true,
          },
        });

        modifier.image = await getTemporaryUrlImage(
          "profiles",
          modifier.image,
          modifier.id
        );

        const cats = [];
        for (const category of blog.categories) {
          const cat = await db.category.findUnique({
            where: {
              id: category,
            },
          });
          cats.push(cat);
        }

        blog.user.image = await getTemporaryUrlImage(
          "profiles",
          blog.user.image,
          blog.user.id
        );
        blog.categories = cats;
        blog.modifiedBy = modifier;
        blog.tempThumbnail = await getTemporaryUrlImage(
          "files",
          blog.thumbnail
        );
      }
    }

    return NextResponse.json(blogs, { status: 200 });
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
