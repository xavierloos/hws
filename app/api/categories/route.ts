import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    const categories = await db.category.findMany();
    return new NextResponse(JSON.stringify(categories, { status: 200 }));
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ message: "Something went wrong" }, { status: 500 })
    );
  }
};

export const POST = async (req: Request, res: Response) => {
  try {
    const category = await req.json();
    const existingCategory = await db.category.findMany({
      where: {
        name: {
          contains: category.newCategory,
        },
      },
    });

    if (existingCategory.length > 0)
      return NextResponse.json(
        { message: `"${category.newCategory}" already exist`, type: "warning" },
        { status: 200 }
      );

    const res = await db.category.create({
      data: {
        name: category.newCategory,
      },
    });

    return NextResponse.json(
      {
        message: `"${category.newCategory}" added successfully`,
        type: "success",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong", type: "error" },
      { status: 500 }
    );
  }
};
