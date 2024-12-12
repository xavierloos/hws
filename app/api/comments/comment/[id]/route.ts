import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

import { currentUser } from '@/lib/auth';
import { storage } from '@/lib/gcp';

export const DELETE = async (req: any, { params }: any) => {
	try {
		const comment = await db.comment.findUnique({
			where: {
				id: params.id,
			},
			include: { task: true, files: true },
		});

		const deleteFiles = async () => {
			for (const file of comment.files) {
				await storage
					.bucket(`${process.env.GCP_BUCKET}`)
					.file(`${comment.task.creatorId}/${comment.taskId}/${file.name}`)
					.delete();
			}
		};
		if (comment.files.length > 0) await deleteFiles();

		await db.comment.delete({
			where: {
				id: params.id,
			},
		});

		return NextResponse.json({ message: `Comment deleted successfully` }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ message: 'Something went wrong', error }, { status: 500 });
	}
};
