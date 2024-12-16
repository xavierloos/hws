import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { currentUser } from '@/lib/auth';
import { storage } from '@/lib/gcp';
import { getTemporaryUrl } from '@/temporaryUrl';

export const GET = async (req: any) => {
	const searchParams = req.nextUrl.searchParams;
	const type = searchParams.get('type');
	const user = await currentUser();
	if (!user) return { error: 'Unathorized' };
	try {
		const typeFilter = type === 'all' ? {} : { type: { contains: type } };

		const files = await db.file.findMany({
			include: { creator: true, thumbnails: true, banners: true },
			where: {
				creatorId: user.id,
				savedAsFile: true,
				...typeFilter,
			},
			orderBy: { createdAt: 'desc' },
		});

		const getImages = async () => {
			for (const file of files) {
				file.src = await getTemporaryUrl(`${user.id}/${file.name}`);
			}
		};

		await getImages();

		return NextResponse.json(files, { status: 200 });
	} catch (error) {
		return NextResponse.json({ message: 'Something went wrong', error }, { status: 500 });
	}
};

export const POST = async (req: Request) => {
	const searchParams = req.nextUrl.searchParams;
	const type = searchParams.get('type');
	const commentId = searchParams.get('commentId');

	try {
		const user = await currentUser();
		if (!user) return { error: 'Unathorized' };

		const data = await req.formData();
		const dataValues = Array.from(data.values());
		const taskId = Array.from(data.keys());
		const task = await db.task.findUnique({
			where: { id: taskId[0] },
		});
		console.log(task);
		const rand = crypto.randomInt(10, 1_00).toString();
		for (const value of dataValues) {
			if (typeof value === 'object' && 'arrayBuffer' in value) {
				const file = value as unknown as Blob;
				const buffer = await file.arrayBuffer();
				const bucket = storage.bucket(`${process.env.GCP_BUCKET}`);
				switch (type) {
					case 'profiles':
						const fName = `${user.id}.${value.type.split('/')[1]}`;
						await bucket.file(`${user.id}/${fName}`).save(Buffer.from(buffer));
						break;
					case 'tasks':
						const filename = commentId
							? `${value.name.split('.')[0]}-${rand}.${value.name.split('.').pop()}`
							: value.name;
						//Creates a folder with the id
						await bucket.file(`${task.creatorId}/${taskId[0]}/${filename}`).save(Buffer.from(buffer));
						await db.file.create({
							data: {
								name: filename,
								type: value.type,
								size: value.size,
								lastModified: value.lastModified,
								creatorId: user.id,
								createdAt: new Date(),
								taskId: taskId[0],
								commentId: commentId ? commentId : null,
							},
						});
						break;
					default:
						const name = `${value.name.split('.')[0]}-${rand}.${value.name.split('.').pop()}`;
						await bucket.file(`${user.id}/${name}`).save(Buffer.from(buffer));
						await db.file.create({
							data: {
								name: name,
								type: value.type,
								size: value.size,
								lastModified: value.lastModified,
								creatorId: user.id,
								createdAt: new Date(),
								savedAsFile: true,
							},
						});
						break;
				}
			}
		}
		return NextResponse.json(
			{
				message: `File${dataValues.length > 1 ? 's' : ''} uploaded successfully`,
				type: 'success',
			},
			{ status: 200 }
		);
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
		const taskid = searchParams.get('task');
		const name = searchParams.get('name');
		const deletefolder = searchParams.get('deletefolder');

		const src = taskid ? `${user.id}/${taskid}/${name}` : `${user.id}/${name}`;

		await db.file.delete({
			where: {
				id,
			},
		});

		if (deletefolder) {
			await storage.bucket(`${process.env.GCP_BUCKET}`).deleteFiles({ prefix: `${user.id}/${taskid}` });
		} else {
			await storage.bucket(`${process.env.GCP_BUCKET}`).file(src).delete();
		}

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
