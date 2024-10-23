import { useState } from 'react';
import { Switch, cn, Card, CardBody } from '@nextui-org/react';
import axios from 'axios';
import { toast } from 'sonner';

export const Notifications = ({ user }: any) => {
	const [fields, setFields] = useState(user);

	const update = async (field: string, value: any) => {
		await axios
			.put(`/api/members/${fields.id}`, { [field]: value })
			.then((res) => {
				setFields({ ...fields, [field]: value });
				if (res?.data.error) toast.error(res?.data.error);
				if (res?.data.warning) toast.warning(res?.data.warning);
				if (res?.data.success) toast.success(res?.data.success);
			})
			.catch();
	};

	return (
		<Card className='border-none max-w-md w-full rounded-md m-auto mt-3 p-4 text-default-foreground' shadow='sm'>
			<CardBody className='grid grid-cols-1 gap-8 items-center justify-center'>
				<Switch
					onValueChange={(e) => update('emailNotificationsEnabled', e)}
					defaultSelected={fields.emailNotificationsEnabled}
					classNames={{
						base: cn(
							'inline-flex flex-row-reverse w-full max-w-full hover:bg-default-200 items-center',
							'justify-between cursor-pointer  rounded-none py-1.5 px-3 gap-2 border-2 border-transparent  bg-content2'
						),
						wrapper: 'p-0 h-4 overflow-visible',
						thumb: cn(
							'w-6 h-6 border-2 shadow-lg  bg-content1',
							'group-data-[hover=true]:border-primary',
							//selected
							'group-data-[selected=true]:ml-6',
							// pressed
							'group-data-[pressed=true]:w-7',
							'group-data-[selected]:group-data-[pressed]:ml-4'
						),
					}}
				>
					<div className='flex flex-col gap-1'>
						<span className='font-semibold text-default-foreground'>
							Email enabled: {fields.emailNotificationsEnabled ? 'Yes' : 'No'}
						</span>
						<small className='text-tiny text-default-400 flex gap-1 items-center'>
							Get emails notifications to find out what's going on when you're not online.
						</small>
					</div>
				</Switch>
				<Switch
					onValueChange={(e) => update('smsNotificationsEnabled', e)}
					defaultSelected={fields.smsNotificationsEnabled}
					classNames={{
						base: cn(
							'inline-flex flex-row-reverse w-full max-w-full hover:bg-default-200 items-center',
							'justify-between cursor-pointer  rounded-none py-1.5 px-3 gap-2 border-2 border-transparent  bg-content2'
						),
						wrapper: 'p-0 h-4 overflow-visible',
						thumb: cn(
							'w-6 h-6 border-2 shadow-lg  bg-content1',
							'group-data-[hover=true]:border-primary',
							//selected
							'group-data-[selected=true]:ml-6',
							// pressed
							'group-data-[pressed=true]:w-7',
							'group-data-[selected]:group-data-[pressed]:ml-4'
						),
					}}
				>
					<div className='flex flex-col gap-1'>
						<span className='font-semibold text-default-foreground'>
							SMS enabled: {fields.smsNotificationsEnabled ? 'Yes' : 'No'}
						</span>
						<small className='text-tiny text-default-400 flex gap-1 items-center'>
							Get sms notifications to find out what's going on when you're not online.
						</small>
					</div>
				</Switch>
			</CardBody>
		</Card>
	);
};
