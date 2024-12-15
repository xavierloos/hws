import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { currentUser } from '@/lib/auth';
import { storage } from '@/lib/gcp';
import { getUserById } from '@/data/user';
import { getTemporaryUrl } from '@/temporaryUrl';

export const GET = async (req: Request) => {
	try {
		const user = await currentUser();
		if (!user) return { error: 'Unathorized' };

		const url = new URL(req.url);
		const searchParams = new URLSearchParams(url.searchParams);
		const sortBy = searchParams.get('sortby');

		const sorting: any = {
			...(sortBy === 'modified-asc' && { modifiedAt: 'asc' }),
			...(sortBy === 'created-asc' && { createdAt: 'asc' }),
			...(sortBy === 'created-desc' && { createdAt: 'desc' }),
			...(sortBy === 'name-asc' && { name: 'asc' }),
			...(sortBy === 'name-desc' && { name: 'desc' }),
			...(sortBy === null && { dueDate: 'asc' }), // Default sort
		};

		const tasks = await db.task.findMany({
			orderBy: sorting,
			where: {
				OR: [
					{ creatorId: user.id },
					{
						assignments: {
							some: {
								userId: user.id,
							},
						},
					},
				],
			},
			include: {
				files: {
					include: {
						creator: true,
					},
				},
				creator: true,
				assignments: {
					include: {
						user: true,
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
						creator: true,
						files: true,
					},
				},
			},
		});

		// Helper function to fetch temporary image URLs
		const getImages = async () => {
			for (const task of tasks) {
				task.assigmentIds = [];
				task.creator.src = await getTemporaryUrl(`${task.creator.id}/${task.creator.image}`);

				for (const assignment of task.assignments) {
					task.assigmentIds.push(assignment.userId);
					assignment.user.src = await getTemporaryUrl(`${assignment.user.id}/${assignment.user.image}`);
				}

				for (const file of task.files) file.src = await getTemporaryUrl(`${user.id}/${task.id}/${file.name}`);

				for (const comment of task.comments) {
					comment.creator.src = await getTemporaryUrl(`${comment.creator.id}/${comment.creator.image}`);

					for (const file of comment.files) {
						file.src = await getTemporaryUrl(`${task.creator.id}/${task.id}/${file.name}`);
					}
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

		const { teamIds, ...task } = await req.json();

		const newTask = await db.task.create({
			data: {
				...task,
				status: { name: 'To Do', color: 'default' }, // Default status
				creatorId: user.id,
				createdAt: new Date(),
				modifiedAt: new Date(),
			},
		});

		if (Array.isArray(teamIds) && teamIds.length > 0) {
			const taskAssignments = teamIds.map((teamId: string) => ({
				userId: teamId,
				taskId: newTask.id,
			}));

			await db.taskAssignment.createMany({
				data: taskAssignments,
			});
		}
		return NextResponse.json({ message: newTask.id, type: 'success' }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ message: 'Something went wrong', error }, { status: 500 });
	}
};

export const DELETE = async (req: any) => {
	try {
		const user = await currentUser();
		if (!user) return { error: 'Unathorized' };
		const searchParams = req.nextUrl.searchParams;
		const id = searchParams.get('id');
		const files = searchParams.get('files');

		if (files) await storage.bucket(`${process.env.GCP_BUCKET}`).deleteFiles({ prefix: `${user.id}/${id}` });

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
