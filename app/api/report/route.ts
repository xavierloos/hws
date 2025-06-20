import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { currentUser } from '@/lib/auth';
import { storage } from '@/lib/gcp';
import { getUserById } from '@/data/user';
import { getTemporaryUrl } from '@/temporaryUrl';

export const GET = async (req: Request, { params }: any) => {
	try {
		console.log('here');
		const blogTrends = await prisma.blog.aggregateRaw({
			pipeline: [
				{
					$group: {
						_id: { $month: '$createdAt' }, // Group by month
						count: { $sum: 1 }, // Count blogs
					},
				},
			],
		});
		console.log(blogTrends);
		const userGrowth = await db.user.groupBy({
			by: ['createdAt'], // Group by creation date
			_count: {
				id: true, // Count users
			},
			where: {
				isActive: true, // Optional: filter for active users
			},
		});
		console.log(userGrowth);
		console.log('here');
		// const user = await db.user.findUnique({
		// 	where: { id: params.id },
		// 	include: {
		// 		social: true,
		// 		assignments: true,
		// 		_count: {
		// 			select: {
		// 				assignments: {
		// 					where: {
		// 						task: {
		// 							status: {
		// 								equals: { name: 'Completed', color: 'success' },
		// 							},
		// 						},
		// 					},
		// 				},
		// 				blogs: true,
		// 				tasks: true,
		// 				files: {
		// 					where: {
		// 						isDefault: false,
		// 						savedAsFile: true,
		// 					},
		// 				},
		// 			},
		// 		},
		// 	},
		// });
		// console.log(user);
		// const getImages = async () => (user.src = await getTemporaryUrl(`${user.id}/${user.image}`));
		// await getImages();

		return NextResponse.json(userGrowth, { status: 200 });
	} catch (error) {
		return NextResponse.json({ message: 'Something went wrong', error }, { status: 500 });
	}
};
