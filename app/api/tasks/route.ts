import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { storage } from "@/lib/gcp";
import { getUserById } from "@/data/user";
import { getTemporaryUrlImage } from "@/temporaryUrlImage";

export const GET = async (req: Request) => {
  try {
    const user = await currentUser();
    if (!user) return { error: "Unathorized" };

    const url = new URL(req.url);
    const searchParams = new URLSearchParams(url.searchParams);
    const sortBy = searchParams.get("sortby");
    console.log(sortBy)

    const options = {
      version: "v2", // defaults to 'v2' if missing.
      action: "read",
      expires: Date.now() + 1000 * 60 * 60, // temporary url will expire in one hour
    };

    let sorting: any;

    switch (sortBy) {
      case "modified-asc":
        sorting = {
          modifiedAt: "asc",
        };
        break;
      case "created-asc":
        sorting = {
          createdAt: "asc",
        };
        break;
      case "created-desc":
        sorting = {
          createdAt: "desc",
        };
        break;
      case "name-asc":
        sorting = {
          name: "asc",
        };
        break;
      case "name-desc":
        sorting = {
          name: "desc",
        };
        break;
      default:
        sorting = {
          dueDate: "asc",
        };
        break;
    }



    const res = await db.task.findMany({
      orderBy: sorting,
      include: { user: true },
      where: {
        OR: [
          {
            assignedIds: {
              has: user.id
            },
          },
          { createdBy: user.email }, // made by me
        ],
      },
    });

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

      item.user.image = await getTemporaryUrlImage(
        "profiles",
        item.user.image,
        item.user.id
      );

      item.assignedTo = []

      for (const i of item.assignedIds) {
        const user = await getUserById(i);
        const image = await getTemporaryUrlImage(
          "profiles",
          user.image,
          user.id
        );
        const name = user.name;
        const username = user.username;
        item.assignedTo.push({ image, name, username })
      }
    }

    return NextResponse.json(res, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong" },
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
        status: { name: "To Do", color: "default" }, //Default status
        createdBy: user?.email,
        createdAt: new Date(),
        modifiedAt: new Date(),
      },
    });

    return NextResponse.json(
      { message: res.id, type: "success" },
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
