import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { currentUser } from '@/lib/auth';
import { storage } from '@/lib/gcp';
import { getUserById } from '@/data/user';
import { getTemporaryUrlImage } from '@/temporaryUrlImage';

export const GET = async (req: Request) => {
	try {
		const user = await currentUser();
		if (!user) return { error: 'Unathorized' };

		const url = new URL(req.url);
		const searchParams = new URLSearchParams(url.searchParams);
		const sortBy = searchParams.get('sortby');

		const options = {
			version: 'v2', // defaults to 'v2' if missing.
			action: 'read',
			expires: Date.now() + 1000 * 60 * 60, // temporary url will expire in one hour
		};

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
					dueDate: 'asc',
				};
				break;
		}

		const tasks = await db.task.findMany({
			orderBy: sorting,
			where: {
				OR: [{ creatorId: user.id }, { teamIds: { has: user.id } }],
			},
			include: {
				creator: {
					select: {
						id: true,
						name: true,
						username: true,
						image: true,
					},
				},
				team: {
					select: {
						id: true,
						name: true,
						username: true,
						image: true,
					},
				},
				comments: {
					orderBy: {
						createdAt: 'desc',
					},
					where: {
						verified: true,
					},
					include: {
						user: {
							select: {
								id: true,
								username: true,
								image: true,
							},
						},
					},
				},
			},
		});

		const getImages = async () => {
			for (const task of tasks) {
				task.creator.src = await getTemporaryUrlImage(task.creator.id, task.creator.image);
				for (const member of task.team) {
					member.src = await getTemporaryUrlImage(member.id, member.image);
				}
				for (const comment of task.comments) {
					comment.user.src = await getTemporaryUrlImage(comment.user.id, comment.user.image);
				}
			}
		};

		await getImages();

		return NextResponse.json(tasks, { status: 200 });
	} catch (error) {
		return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
	}
};

export const POST = async (req: Request) => {
	try {
		const user = await currentUser();
		if (!user) return { error: 'Unathorized' };

		const task = await req.json();

		const res = await db.task.create({
			data: {
				...task,
				status: { name: 'To Do', color: 'default' }, //Default status
				creatorId: user?.email,
				createdAt: new Date(),
				modifiedAt: new Date(),
			},
		});

		return NextResponse.json({ message: res.id, type: 'success' }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ message: 'Something went wrong', error }, { status: 500 });
	}
};

export const DELETE = async (req: any) => {
	try {
		const searchParams = req.nextUrl.searchParams;
		const id = searchParams.get('id');

		const { attachments } = await db.task.findUnique({
			where: {
				id,
			},
			select: { attachments: true },
		});

		if (attachments) {
			// Delete file from GP
			await storage.bucket(`${process.env.GCP_BUCKET}`).deleteFiles({ prefix: `tasks/${id}/` });
		}

		await db.task.delete({
			where: {
				id,
			},
		});

		return NextResponse.json({ message: `Task deleted successfully` }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ message: 'Something went wrong', error }, { status: 500 });
	}
};
