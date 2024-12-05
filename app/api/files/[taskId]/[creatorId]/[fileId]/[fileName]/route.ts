import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { currentUser } from '@/lib/auth';
import { storage } from '@/lib/gcp';
import { getTemporaryUrl } from '@/temporaryUrl';

export const DELETE = async (req: any, { params }: any) => {
	try {
		const files = await db.file.findMany({
			where: { taskId: params.taskId },
		});

		if (files.length === 1) {
			await storage
				.bucket(`${process.env.GCP_BUCKET}`)
				.deleteFiles({ prefix: `${params.creatorId}/${params.taskId}` });
		} else {
			await storage
				.bucket(`${process.env.GCP_BUCKET}`)
				.file(`${params.creatorId}/${params.taskId}/${params.fileName}`)
				.delete();
		}

		await db.file.delete({
			where: {
				id: params.fileId,
			},
		});

		return NextResponse.json(
			{
				message: `File deleted successfully`,
				type: 'success',
			},
			{ status: 200 }
		);
	} catch (error) {
		return NextResponse.json({ message: 'Something went wrong', error }, { status: 500 });
	}
};
