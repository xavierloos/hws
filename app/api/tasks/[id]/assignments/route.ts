import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const PUT = async (req: Request, { params }: { params: { id: string } }) => {
	try {
		const { userIds } = await req.json();
		const taskId = params.id;

		// Delete existing assignments for the task
		await db.taskAssignment.deleteMany({
			where: {
				taskId,
			},
		});

		// Create new assignments with the provided userIds
		const newAssignments = userIds.map((userId: string) => ({ taskId, userId }));
		console.log(newAssignments);
		await db.taskAssignment.createMany({
			data: newAssignments,
		});

		return NextResponse.json({ message: 'Task assignments updated successfully' });
	} catch (error) {
		return NextResponse.json({ message: 'Failed to update task assignments', error }, { status: 500 });
	}
};
