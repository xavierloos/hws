import { currentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { storage } from '@/lib/gcp';
import { getTemporaryUrlImage } from '@/temporaryUrl';
import { NextResponse } from 'next/server';

export const GET = async (req: Request, { params }: any) => {
	try {
		const suggestions = await db.blog.findMany({
			where: {
				slug: { notIn: [params.slug] },
			},
			select: {
				name: true,
				slug: true,
				thumbnail: true,
			},
		});

		if (suggestions.length > 0) {
			for (const suggestion of suggestions) {
				suggestion.thumbnail = await getTemporaryUrlImage('files', suggestion.thumbnail);
			}
		}

		if (!suggestions) return NextResponse.json({ message: 'Not found' }, { status: 500 });

		return NextResponse.json(suggestions, { status: 200 });
	} catch (error) {
		return NextResponse.json({ message: 'Something went wrong', error }, { status: 500 });
	}
};
