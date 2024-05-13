import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { currentUser } from "@/lib/auth";
import { storage } from "@/lib/gcp";

export const GET = async (req: Request, { params }: any) => {
  try {
    const res = await db.task.findUnique({
      where: { id: params.id },
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

export const PUT = async (req: Request, { params }: any) => {
  const searchParams = req.nextUrl.searchParams;
  const type = searchParams.get("type");

  try {
    const user = await currentUser();
    if (!user) return { error: "Unathorized" };
    // TODO: check if user has writing permissions
    const task = await req.json();

    let updateField = {};

    switch (type) {
      case "status":
        updateField = { status: task.status };
        break;
      case "members":
        updateField = { assignTo: task };
        break;
      case "priority":
        updateField = { priority: task.priority };
        break;
      default:
        break;
    }

    const res = await db.task.update({
      where: { id: params.id },
      data: updateField,
    });

    return NextResponse.json(res, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong", error },
      { status: 500 }
    );
  }
};
