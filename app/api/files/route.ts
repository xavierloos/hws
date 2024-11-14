import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { currentUser } from '@/lib/auth';
import { storage } from '@/lib/gcp';
import { getTemporaryUrlImage } from '@/temporaryUrlImage';

export const GET = async (req: any) => {
	const searchParams = req.nextUrl.searchParams;
	const type = searchParams.get('type');
	const user = await currentUser();
	if (!user) return { error: 'Unathorized' };
	try {
		const typeFilter = type === 'all' ? {} : { type: { contains: type } };

		const files = await db.file.findMany({
			include: { user: true },
			where: {
				creatorId: user.id,
				...typeFilter,
			},
			orderBy: { createdAt: 'desc' },
		});

		const getImages = async () => {
			for (const file of files) {
				file.src = await getTemporaryUrlImage(user.id, file.name);
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
	try {
		const user = await currentUser();
		if (!user) return { error: 'Unathorized' };

		const data = await req.formData();
		const dataValues = Array.from(data.values());

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
						const taskId = Array.from(data.keys()); //Creates a folder with the id
						await bucket.file(`${type}/${taskId[0]}/${value.name}`).save(Buffer.from(buffer));
						break;
					default:
						const rand = crypto.randomInt(10, 1_00).toString();
						const name = `${value.name.split('.')[0]}-${rand}.${file.type.split('/')[1]}`;
						await bucket.file(`${user.id}/${name}`).save(Buffer.from(buffer));
						await db.file.create({
							data: {
								name: name,
								type: value.type,
								size: value.size,
								lastModified: value.lastModified,
								creatorId: user.id,
								createdAt: new Date(),
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
		const searchParams = req.nextUrl.searchParams;
		const id = searchParams.get('id');

		const res = await db.file.findUnique({
			where: {
				id,
			},
		});

		await db.file.delete({
			where: {
				id,
			},
		});

		await storage.bucket(`${process.env.GCP_BUCKET}`).file(`files/${res?.name}`).delete();

		return NextResponse.json({ message: `File deleted successfully` }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ message: 'Something went wrong', error }, { status: 500 });
	}
};
