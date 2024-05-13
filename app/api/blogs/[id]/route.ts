import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const GET = async (req: Request, { params }: any) => {
  try {
    const res = await db.blog.findUnique({
      where: { id: params.id },
      select: {
        name: true,
        slug: true,
        description: true,
        isActive: true,
        content: true,
        thumbnail: true,
        banner: true,
        categoryId: true,
      },
    });
    if (!res)
      return NextResponse.json({ message: "Not found" }, { status: 500 });
    return NextResponse.json(res, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong", error },
      { status: 500 }
    );
  }
};

export const DELETE = async ({ params }: any) => {
  try {
    await db.blog.delete({
      where: {
        id: params.id,
      },
    });
    return NextResponse.json({ message: "Blog deleted" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong", error },
      { status: 500 }
    );
  }
};

export const PUT = async (req: Request, { params }: any) => {
  try {
    const user = await currentUser();
    if (!user) return { error: "Unathorized" };
    // TODO: check if user has writing permissions
    const blog = await req.json();

    // const existingSlug = await db.blog.findUnique({
    //   where: { slug: blog.slug },
    // });

    // if(blog.slug !== existingSlug){}

    // if (existingSlug)
    //   return NextResponse.json(
    //     { message: "Slug already in use" },
    //     { status: 500 }
    //   );

    const res = await db.blog.update({
      where: { id: params.id },
      data: {
        ...blog,
        modifiedBy: user?.id,
        modifiedAt: new Date(),
      },
    });
    return NextResponse.json(res, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong", error },
      { status: 500 }
    );
  }
};
