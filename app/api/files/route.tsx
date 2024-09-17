import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { currentUser } from "@/lib/auth";
import { storage } from "@/lib/gcp";

export const GET = async (req: any) => {
 const searchParams = req.nextUrl.searchParams;
 const type = searchParams.get("type");

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
   where: {
    type: {
     contains: type,
    },
   },
  });

  for (const file of res) {
   const [url] = await storage
    .bucket(`${process.env.GCP_BUCKET}`)
    .file(`files/${file.name}`)
    .getSignedUrl(options);
   file.tempUrl = url;
   file.image = url;
  }

  return NextResponse.json(res, { status: 200 });
 } catch (error) {
  return NextResponse.json(
   { message: "Something went wrong", error },
   { status: 500 }
  );
 }
};

export const POST = async (req: Request) => {
 const searchParams = req.nextUrl.searchParams;
 const type = searchParams.get("type");
 try {
  const user = await currentUser();
  if (!user) return { error: "Unathorized" };

  const data = await req.formData();
  const dataValues = Array.from(data.values());
  console.log(data);
  console.log(JSON.stringify(data.values));

  for (const v of dataValues) {
   console.log(v);
   if (typeof v === "object" && "arrayBuffer" in v) {
    const file = v as unknown as Blob;
    const buffer = await file.arrayBuffer();

    if (type === "profiles") {
     const fName = `${user.id}.${file.type.split("/")[1]}`;
     await storage
      .bucket(`${process.env.GCP_BUCKET}`)
      .file(`${type}/${user.id}/${fName}`)
      .save(Buffer.from(buffer));
    } else if (type === "tasks") {
     const taskId = Array.from(data.keys()); //Creates a folder with the id
     await storage
      .bucket(`${process.env.GCP_BUCKET}`)
      .file(`${type}/${taskId[0]}/${v.name}`)
      .save(Buffer.from(buffer));
    } else {
     const rand = crypto.randomInt(10, 1_00).toString();
     const fName = `${v.name.split(".")[0]}-${rand}.${file.type.split("/")[1]}`;
     console.log(data);
     //  await storage
     //   .bucket(`${process.env.GCP_BUCKET}`)
     //   .file(`${type}/${fName}`)
     //   .save(Buffer.from(buffer));

     //  await db.file.create({
     //   data: {
     //    name: fName,
     //    type: v.type,
     //    size: v.size,
     //    isPrivate:
     //    lastModified: v.lastModified,
     //    createdBy: user?.id,
     //    createdAt: new Date(),
     //   },
     //  });
    }
   }
  }

  return NextResponse.json(
   {
    message: `File${dataValues.length > 1 ? "s" : ""} uploaded successfully`,
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

export const DELETE = async (req: any) => {
 try {
  const searchParams = req.nextUrl.searchParams;
  const id = searchParams.get("id");

  const res = await db.file.findUnique({
   where: {
    id,
   },
  });

  await db.file.delete({
   where: {
    id,
   },
  });

  await storage
   .bucket(`${process.env.GCP_BUCKET}`)
   .file(`files/${res?.name}`)
   .delete();

  return NextResponse.json(
   { message: `File deleted successfully` },
   { status: 200 }
  );
 } catch (error) {
  return NextResponse.json(
   { message: "Something went wrong", error },
   { status: 500 }
  );
 }
};
