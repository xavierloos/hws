import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { storage } from "@/lib/gcp";
import { getUserById } from "@/data/user";

export const GET = async (req: Request) => {
  try {
    const options = {
      version: "v2", // defaults to 'v2' if missing.
      action: "read",
      expires: Date.now() + 1000 * 60 * 60, // temporary url will expire in one hour
    };

    const res = await db.task.findMany({ include: { user: true } });

    for (const item of res) {
      if (item.attachments) {
        for (const i of item.attachments) {
          const [url] = await storage
            .bucket(`${process.env.GCP_BUCKET}`)
            .file(`tasks/${item.id}/${i.name}`)
            .getSignedUrl(options);
          i.url = url;
        }
      }

      for (const i of item.assignTo) {
        const user = await getUserById(i.id);
        i.image = user.image;
        i.name = user.name;
        i.username = user.username;
        i.role = user.role;
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

export const POST = async (req: Request) => {
  try {
    const user = await currentUser();
    if (!user) return { error: "Unathorized" };

    const task = await req.json();

    const res = await db.task.create({
      data: {
        ...task,
        status: { name: "Pending", color: "default" },
        createdBy: user?.email,
        createdAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        message: res.id,
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

export const DELETE = async (req: any) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get("id");

    const { attachments } = await db.task.findUnique({
      where: {
        id,
      },
      select: { attachments: true },
    });

    if (attachments) {
      // Delete file from GP
      await storage
        .bucket(`${process.env.GCP_BUCKET}`)
        .deleteFiles({ prefix: `tasks/${id}/` });
    }

    await db.task.delete({
      where: {
        id,
      },
    });

    return NextResponse.json(
      { message: `Task deleted successfully` },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong", error },
      { status: 500 }
    );
  }
};
