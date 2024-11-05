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

		const res = await db.task.findMany({
			orderBy: sorting,
			where: {
				OR: [{ creatorId: user.email }, { assignedUserIds: { has: user.id } }],
			},
			include: {
				createdBy: {
					select: {
						id: true,
						name: true,
						username: true,
						image: true,
					},
				},
				assignedTo: {
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

		for (const item of res) {
			if (item.attachments) {
				for (const i of item.attachments) {
					const [url] = await storage
						.bucket(`${process.env.GCP_BUCKET}`)
						.file(`tasks/${item.id}/${i.name}`)
						.getSignedUrl(options);
					i.url = url;
				}
			}
			for (const i of item.assignedTo) {
				i.image = await getTemporaryUrlImage('profiles', i.image, i.id);
			}
			if (item.comments.length > 0) {
				for (const i of item.comments) {
					i.user.image = await getTemporaryUrlImage('profiles', i.user.image, i.user.id);
				}
			}

			item.createdBy.image = await getTemporaryUrlImage('profiles', item.createdBy.image, item.createdBy.id);
		}

		return NextResponse.json(res, { status: 200 });
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
