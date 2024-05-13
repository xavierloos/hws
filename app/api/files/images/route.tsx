import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { currentUser } from "@/lib/auth";
import { storage } from "@/lib/gcp";

export const GET = async (req: any) => {
  const searchParams = req.nextUrl.searchParams;
  const type = searchParams.get("id");
  try {
    const options = {
      version: "v2", // defaults to 'v2' if missing.
      action: "read",
      expires: Date.now() + 1000 * 60 * 60, // temporary url will expire in one hour
    };

    let res = null;

    res = await db.file.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: true },
    });

    // for (const file of res) {
    //   const [url] = await storage
    //     .bucket(`${process.env.GCP_BUCKET}`)
    //     .file(`${type}/${file.name}`)
    //     .getSignedUrl(options);
    //   file.tempUrl = url;
    //   file.image = url;
    // }

    return NextResponse.json(res, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong", error },
      { status: 500 }
    );
  }
};
