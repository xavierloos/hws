import { getUserByEmail } from '@/data/user';
import { currentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { sendRegisterInvitation } from '@/lib/mailer';
import { generateToken } from '@/actions/tokens';
import { NextResponse } from 'next/server';
import { storage } from '@/lib/gcp';

export const GET = async () => {
	try {
		const user = await currentUser();

		const res = await db.user.findMany({
			where: {
				id: {
					not: user?.id,
				},
			},
			include: { social: true },
		});

		for (const key in res) {
			if (Object.prototype.hasOwnProperty.call(res, key)) {
				const element = res[key];
				const options = {
					version: 'v2', // defaults to 'v2' if missing.
					action: 'read',
					expires: Date.now() + 1000 * 60 * 60, // temporary url will expire in 1hr
				};

				const [url] = await storage
					.bucket(`${process.env.GCP_BUCKET}`)
					.file(`profiles/${element.id}/${element.image}`)
					.getSignedUrl(options);
				element.tempUrl = url;
			}
		}

		return new NextResponse(JSON.stringify(res, { status: 200 }));
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
		console.log(id, field);

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
