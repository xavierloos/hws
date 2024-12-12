import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { currentUser } from '@/lib/auth';
import { storage } from '@/lib/gcp';
import { getTemporaryUrl } from '@/temporaryUrl';

export const DELETE = async (req: any, { params }: any) => {
	try {
		const user = await currentUser();
		if (!user) return { error: 'Unathorized' };

		const file = await db.file.findUnique({
			where: {
				id: params.id,
			},
			include: { banners: true, thumbnails: true },
		});

		if (user.id != file.creatorId) return { error: 'Unathorized' };
		if (file.banners.length || file.thumbnails.length) return { error: 'Unathorized' };

		await db.file.delete({
			where: {
				id: params.id,
			},
		});

		await storage.bucket(`${process.env.GCP_BUCKET}`).file(`${user.id}/${file.name}`).delete();

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
