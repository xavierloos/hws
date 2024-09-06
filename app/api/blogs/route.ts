import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getTemporaryUrlImage } from "@/temporaryUrlImage";
import { NextResponse } from "next/server";

export const GET = async (req: Request) => {
 try {
  const user = await currentUser();
  if (!user) return { error: "Unathorized" };

  console.log(user);

  const url = new URL(req.url);
  const searchParams = new URLSearchParams(url.searchParams);
  const sortBy = searchParams.get("sortby");

  let sorting: any;
  switch (sortBy) {
   case "modified-asc":
    sorting = {
     modifiedAt: "asc", // or 'desc' for descending order
    };
    break;
   case "created-asc":
    sorting = {
     createdAt: "asc", // or 'desc' for descending order
    };
    break;
   case "created-desc":
    sorting = {
     createdAt: "desc", // or 'desc' for descending order
    };
    break;
   case "name-asc":
    sorting = {
     name: "asc", // or 'desc' for descending order
    };
    break;
   case "name-desc":
    sorting = {
     name: "desc", // or 'desc' for descending order
    };
    break;

   default:
    sorting = {
     modifiedAt: "desc", // or 'desc' for descending order
    };
    break;
  }

  const blogs = await db.blog.findMany({
   orderBy: sorting,
   include: { user: true },
   where: {
    OR: [
     { isActive: true }, // All active blogs of all users
     { createdBy: user.email }, // All blogs made by the specific user
    ],
   },
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
    blog.tempThumbnail = await getTemporaryUrlImage("files", blog.thumbnail);
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
    { message: "Slug already in use", type: "warning" },
    { status: 200 }
   );

  await db.blog.create({
   data: {
    ...blog,
    createdBy: user?.email,
    createdAt: new Date(),
    modifiedBy: user?.id,
    modifiedAt: new Date(),
   },
  });

  return NextResponse.json(
   { message: `New blog created successfully`, type: "success" },
   { status: 200 }
  );
 } catch (error) {
  return NextResponse.json(
   { message: "Something went wrong", error },
   { status: 500 }
  );
 }
};

export const PUT = async (req: Request, res: Response) => {
 try {
  const user = await currentUser();
  if (!user) return { error: "Unathorized" };

  // TODO: check if user has writing permissions

  const blog = await req.json();

  const existingSlug = await db.blog.findMany({
   where: { id: { not: blog.id }, slug: blog.slug },
  });

  if (existingSlug.length)
   return NextResponse.json(
    { message: "Slug already in use", type: "warning" },
    { status: 200 }
   );

  await db.blog.update({
   where: {
    id: blog.id,
   },
   data: {
    name: blog.name,
    slug: blog.slug,
    description: blog.description,
    thumbnail: blog.thumbnail,
    banner: blog.banner,
    categories: blog.categories,
    content: blog.content,
    isActive: blog.isActive,
    modifiedBy: user?.id,
    modifiedAt: new Date(),
   },
  });

  return NextResponse.json(
   { message: `Blog updated successfully`, type: "success" },
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
   { message: `Blog deleted successfully`, type: "success" },
   { status: 200 }
  );
 } catch (error) {
  return NextResponse.json(
   { message: "Something went wrong", error },
   { status: 500 }
  );
 }
};
