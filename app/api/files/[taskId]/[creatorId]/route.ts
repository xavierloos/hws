import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { currentUser } from '@/lib/auth';
import { storage } from '@/lib/gcp';
import { getTemporaryUrl } from '@/temporaryUrl';

export const GET = async (req: Request, { params }: any) => {
	try {
		const files = await db.file.findMany({
			where: { taskId: params.taskId },
			include: { creator: true },
		});

		const getImages = async () => {
			for (const file of files) {
				file.src = await getTemporaryUrl(`${params.creatorId}/${params.taskId}/${file.name}`);
			}
		};

		await getImages();

		return NextResponse.json(files, { status: 200 });
	} catch (error) {
		return NextResponse.json({ message: 'Something went wrong', error }, { status: 500 });
	}
};
