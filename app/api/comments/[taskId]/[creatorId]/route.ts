import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

import { currentUser } from '@/lib/auth';
import { storage } from '@/lib/gcp';
import { getTemporaryUrl } from '@/temporaryUrl';

export const GET = async (req: Request, { params }: any) => {
	try {
		const comments = await db.comment.findMany({
			where: {
				taskId: params.taskId,
			},
			orderBy: { createdAt: 'desc' },
			include: { creator: true, files: true },
		});

		const getImages = async () => {
			for (const comment of comments) {
				comment.creator.src = await getTemporaryUrl(`${comment.creator.id}/${comment.creator.image}`);
				for (const file of comment.files)
					file.src = await getTemporaryUrl(`${params.creatorId}/${params.taskId}/${file.name}`);
			}
		};

		await getImages();

		return NextResponse.json(comments, { status: 200 });
	} catch (error) {
		return NextResponse.json({ message: 'Something went wrong with blogs' }, { status: 500 });
	}
};
