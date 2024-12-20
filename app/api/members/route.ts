import { getUserByEmail } from '@/data/user';
import { currentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { sendRegisterInvitation } from '@/lib/mailer';
import { generateToken } from '@/actions/tokens';
import { NextResponse } from 'next/server';
import { storage } from '@/lib/gcp';
import { getTemporaryUrl } from '@/temporaryUrl';

const options = {
	version: 'v2', // defaults to 'v2' if missing.
	action: 'read',
	expires: Date.now() + 1000 * 60 * 60, // temporary url will expire in 1hr
};

export const GET = async () => {
	try {
		const user = await currentUser();

		const members = await db.user.findMany({
			// where: {
			// 	id: {
			// 		not: user?.id,
			// 	},
			// },
			include: { social: true },
		});

		const getImages = async () => {
			for (const member of members) {
				member.src = (await getTemporaryUrl(`${member.id}/${member.image}`)) || null;
			}
		};
		await getImages();

		return NextResponse.json(members, { status: 200 });
	} catch (error) {
		return NextResponse.json(
			{
				message: 'Something went wrong',
			},
			{ status: 500 }
		);
	}
};

export const POST = async (req: Request) => {
	try {
		const user = await currentUser();
		if (!user) return { error: 'Unathorized' };

		const { email } = await req.json();

		const existingEmail = await getUserByEmail(email);

		if (existingEmail != null) {
			return NextResponse.json(
				{ message: 'Email already in use, please try again!', type: 'warning' },
				{ status: 200 }
			);
		}

		const token = await generateToken(email);

		await sendRegisterInvitation(token.email, token.token, user?.name);

		return NextResponse.json({ message: `An email has been sent to ${email}`, type: 'success' }, { status: 200 });
	} catch (error) {
		return NextResponse.json(
			{
				message: 'Something went wrong',
			},
			{ status: 500 }
		);
	}
};

export const PUT = async (req: any) => {
	try {
		const user = await currentUser();
		if (!user) return { error: 'Unathorized' };

		const searchParams = req.nextUrl.searchParams;
		const id = searchParams.get('id');

		let field = await req.json();

		await db.user.update({
			where: { id },
			data: field,
		});

		return NextResponse.json({ success: 'User updated successfully' }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ warning: 'Something went wrong', error }, { status: 500 });
	}
};

export const DELETE = async (req: any) => {
	try {
		const searchParams = req.nextUrl.searchParams;
		const id = searchParams.get('id');

		await db.user.delete({
			where: {
				id,
			},
		});

		return NextResponse.json({ message: `User deleted successfully`, type: 'success' }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ message: 'Something went wrong', error }, { status: 500 });
	}
};
