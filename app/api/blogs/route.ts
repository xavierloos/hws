import { currentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { getTemporaryUrl } from '@/temporaryUrl';
import { NextResponse } from 'next/server';

export const GET = async (req: Request) => {
	try {
		const user = await currentUser();
		if (!user) return { error: 'Unathorized' };

		const url = new URL(req.url);
		const searchParams = new URLSearchParams(url.searchParams);
		const sortBy = searchParams.get('sortby');

		let sorting: any;
		switch (sortBy) {
			case 'modified-asc':
				sorting = {
					modifiedAt: 'asc',
				};
				break;
			case 'created-asc':
				sorting = {
					createdAt: 'asc',
				};
				break;
			case 'created-desc':
				sorting = {
					createdAt: 'desc',
				};
				break;
			case 'name-asc':
				sorting = {
					name: 'asc',
				};
				break;
			case 'name-desc':
				sorting = {
					name: 'desc',
				};
				break;
			default:
				sorting = {
					modifiedAt: 'desc',
				};
				break;
		}

		const blogs = await db.blog.findMany({
			orderBy: sorting,
			include: { creator: true, modifier: true, categories: true, thumbnail: true, banner: true },
			// where: {
			// 	OR: [
			// 		{ isActive: true }, // All active blogs of all users
			// 		{ creatorId: user.id }, // All blogs made by the specific user
			// 	],
			// },
		});

		const getImages = async () => {
			for (const blog of blogs) {
				blog.creator.src = await getTemporaryUrl(`${blog.creator.id}/${blog.creator.image}`);
				blog.modifier.src = await getTemporaryUrl(`${blog.modifier.id}/${blog.modifier.image}`);
				blog.thumbnail.src = await getTemporaryUrl(`${blog.thumbnail.creatorId}/${blog.thumbnail.name}`);
				blog.banner.src = await getTemporaryUrl(`${blog.banner.creatorId}/${blog.banner.name}`);
			}
		};

		await getImages();

		return NextResponse.json(blogs, { status: 200 });
	} catch (error) {
		return NextResponse.json({ message: 'Something went wrong with blogs' }, { status: 500 });
	}
};

export const POST = async (req: Request, res: Response) => {
	try {
		const user = await currentUser();
		if (!user) return { error: 'Unathorized' };

		// TODO: check if user has writing permissions

		const blog = await req.json();

		const existingSlug = await db.blog.findUnique({
			where: { slug: blog.slug },
		});

		if (existingSlug)
			return NextResponse.json({ message: 'Slug already in use', type: 'warning' }, { status: 200 });

		await db.blog.create({
			data: {
				...blog,
				creatorId: user.id,
				createdAt: new Date(),
				modifierId: user.id,
				modifiedAt: new Date(),
			},
		});

		return NextResponse.json({ message: `New blog created successfully`, type: 'success' }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ message: 'Something went wrong', error }, { status: 500 });
	}
};

export const PUT = async (req: Request, res: Response) => {
	try {
		const user = await currentUser();
		if (!user) return { error: 'Unathorized' };

		// TODO: check if user has writing permissions

		const blog = await req.json();

		const existingSlug = await db.blog.findMany({
			where: { id: { not: blog.id }, slug: blog.slug },
		});

		if (existingSlug.length)
			return NextResponse.json({ message: 'Slug already in use', type: 'warning' }, { status: 200 });

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

		return NextResponse.json({ message: `Blog updated successfully`, type: 'success' }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ message: 'Something went wrong', error }, { status: 500 });
	}
};

export const DELETE = async (req: any) => {
	try {
		const searchParams = req.nextUrl.searchParams;
		const id = searchParams.get('id');

		await db.blog.delete({
			where: {
				id,
			},
		});

		return NextResponse.json({ message: `Blog deleted successfully`, type: 'success' }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ message: 'Something went wrong', error }, { status: 500 });
	}
};
