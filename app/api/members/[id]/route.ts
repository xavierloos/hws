import { getUserByEmail, getUserByUsername } from '@/data/user';
import { currentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { storage } from '@/lib/gcp';
import { getTemporaryUrl } from '@/temporaryUrl';

export const GET = async (req: Request, { params }: any) => {
	try {
		// const user = await db.user.findFirst({
		// 	where: { id: params.id },
		// 	include: {
		// 		social: true,
		// 		_count: {
		// 			select: {
		//         assignedTaskIds: true,
		// 				assignedTasks: true,
		// 				blogs: true,

		// 				// assignedTasks: {
		// 				// 	where: {
		// 				// 		status: {
		// 				// 			path: ['name'],
		// 				// 			equals: 'Completed',
		// 				// 		},
		// 				// 	},
		// 				// },
		// 			},
		// 		},
		// 	},
		// });
		const user = await db.user.findFirst({
			where: { id: params.id },
			include: {
				social: true,
			},
			select: {
				id: true, // Include any other fields you need
				social: true,
				_count: {
					select: {
						tasks: true,
						// assignedTasks: true,
						blogs: true,
					},
				},
			},
		});
		console.log(user);

		const getImages = async () => (user.src = await getTemporaryUrl(`${user.id}/${user.image}`));
		await getImages();

		return NextResponse.json(user, { status: 200 });
	} catch (error) {
		return NextResponse.json({ message: 'Something went wrong', error }, { status: 500 });
	}
};

export const PUT = async (req: Request) => {
	try {
		const user = await currentUser();
		if (!user) return { error: 'Unathorized' };

		const checkUser = await getUserByEmail(user?.email);
		let field = await req.json();
		let socials = ['instagram', 'facebook', 'twitter', 'github', 'linkedin'];

		if (field.password) {
			const passwordMatch = await bcrypt.compare(field.password[0], checkUser?.password);
			if (passwordMatch) {
				const hashedPassword = await bcrypt.hash(field.password[1], 10);
				field = { password: hashedPassword };
			} else {
				return NextResponse.json({ error: 'Wrong passwords, no changes have been saved' }, { status: 200 });
			}
		}

		if (field.username) {
			const existingUsername = await getUserByUsername(field.username);
			if (existingUsername) return NextResponse.json({ error: 'Username is already used' }, { status: 200 });
		}

		if (Object.keys(field).some((key) => socials.includes(key))) {
			await prisma.social.upsert({
				where: {
					userId: user.id,
				},
				update: field,
				create: { ...field, userId: user.id },
			});
		} else {
			await db.user.update({
				where: { id: user.id },
				data: field,
			});
		}

		return NextResponse.json({ success: 'User updated successfully' }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ warning: 'Something went wrong', error }, { status: 500 });
	}
};
