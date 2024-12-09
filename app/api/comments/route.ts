import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

import { currentUser } from '@/lib/auth';
import { storage } from '@/lib/gcp';
import { getTemporaryUrlImage } from '@/temporaryUrl';

export const GET = async (req: Request) => {
	const searchParams = req.nextUrl.searchParams;
	const id = searchParams.get('id');
	try {
		const options = {
			version: 'v2', // defaults to 'v2' if missing.
			action: 'read',
			expires: Date.now() + 1000 * 60 * 60, // temporary url will expire in one hour
		};

		const res = await db.comment.findMany({
			where: {
				relatedId: id,
			},
			orderBy: { createdAt: 'desc' },
			include: { creator: true },
		});

		// for (const item of res) {
		//   if (item.attachments) {
		//     for (const i of item.attachments) {
		//       const [url] = await storage
		//         .bucket(`${process.env.GCP_BUCKET}`)
		//         .file(`tasks/${item.id}/${i.name}`)
		//         .getSignedUrl(options);
		//       i.url = url;
		//     }
		//   }

		//   for (const i of item.assignTo) {
		//     const user = await getUserById(i.id);
		//     i.image = user.image;
		//     i.name = user.name;
		//     i.username = user.username;
		//   }
		// }
		for (const item of res) {
			item.user.src = await getTemporaryUrlImage(item.user.id, item.user.image);
		}

		return NextResponse.json(res, { status: 200 });
	} catch (error) {
		return NextResponse.json({ message: 'Something went wrong with blogs' }, { status: 500 });
	}
};

export const POST = async (req: Request) => {
	try {
		const user = await currentUser();
		if (!user) return { error: 'Unathorized' };

		const comment = await req.json();

		const res = await db.comment.create({
			data: {
				...comment,
				verified: true,
				creatorId: user?.id,
				createdAt: new Date(),
			},
		});

		return NextResponse.json(res.id, { status: 200 });
	} catch (error) {
		return NextResponse.json({ message: 'Something went wrong', error }, { status: 500 });
	}
};

export const DELETE = async (req: any) => {
	try {
		const searchParams = req.nextUrl.searchParams;
		const id = searchParams.get('id');

		const res = await db.comment.findUnique({
			where: {
				id,
			},
		});

		await db.comment.delete({
			where: {
				id,
			},
		});

		// await storage.bucket(`${process.env.GCP_BUCKET}`).file(res?.name).delete();

		return NextResponse.json({ message: `Comment deleted successfully` }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ message: 'Something went wrong', error }, { status: 500 });
	}
};
