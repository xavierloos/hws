import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { currentUser } from '@/lib/auth';
import { storage } from '@/lib/gcp';
import { getTemporaryUrl } from '@/temporaryUrl';

export const GET = async (req: Request, { params }: any) => {
	try {
		const task = await db.task.findUnique({
			where: { id: params.id },
			include: {
				files: {
					include: {
						creator: true,
					},
				},
				creator: true,
				team: true,
				comments: {
					orderBy: {
						createdAt: 'desc',
					},
					where: {
						verified: true,
					},
					include: {
						creator: true,
						files: true,
					},
				},
			},
		});
		const getImages = async () => {
			task.creator.src = await getTemporaryUrl(`${task.creator.id}/${task.creator.image}`);
			for (const member of task.team) member.src = await getTemporaryUrl(`${member.id}/${member.image}`);
			for (const file of task.files)
				file.src = await getTemporaryUrl(`${task.creatorId}/${task.id}/${file.name}`);
			for (const comment of task.comments) {
				comment.creator.src = await getTemporaryUrl(`${comment.creator.id}/${comment.creator.image}`);
				for (const file of comment.files)
					file.src = await getTemporaryUrl(`${task.creatorId}/${task.id}/${file.name}`);
			}
		};

		await getImages();

		return NextResponse.json(task, { status: 200 });
	} catch (error) {
		return NextResponse.json({ message: 'Something went wrong', error }, { status: 500 });
	}
};

export const PUT = async (req: Request, { params }: any) => {
	const searchParams = req.nextUrl.searchParams;
	const type = searchParams.get('type');

	try {
		const user = await currentUser();
		if (!user) return { error: 'Unathorized' };
		// TODO: check if user has writing permissions
		const field = await req.json();

		const res = await db.task.update({
			where: { id: params.id },
			data: field,
		});

		return NextResponse.json(res, { status: 200 });
	} catch (error) {
		return NextResponse.json({ message: 'Something went wrong', error }, { status: 500 });
	}
};

export const DELETE = async (req: any, { params }: any) => {
	try {
		const task = await db.task.findUnique({
			where: { id: params.id },
			include: { files: true },
		});

		if (task.files.length > 0) {
			await storage.bucket(`${process.env.GCP_BUCKET}`).deleteFiles({ prefix: `${task.creatorId}/${params.id}` });
		}

		await db.task.delete({
			where: {
				id: params.id,
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
