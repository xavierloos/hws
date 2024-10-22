'use client';
import axios from 'axios';
import { storage } from '@/lib/gcp';
import { Title } from '@/components/title';
import { useEffect, useState } from 'react';
import { Security } from './_components/security';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Notifications } from './_components/notifications';
import { PersonalInformation } from './_components/personalInformation';
import { PersonIcon, BellIcon, LockClosedIcon, IdCardIcon } from '@radix-ui/react-icons';
import { Tabs, Tab } from '@nextui-org/react';

const SettingsPage = () => {
	const user = useCurrentUser();
	const [data, setData] = useState();
	const [loading, setLoading] = useState(true);
	useEffect(() => {
		getData(user?.id);
	}, []);

	const getData = async (id: string) => {
		await axios
			.get(`/api/members/${id}`)
			.then((res) => {
				console.log(res.data);
				setData(res.data);
				setLoading(false);
			})
			.catch((e) => {});
	};

	const fields = (type: string) => {
		switch (type) {
			case 'profile':
				return {
					id: data?.id,
					name: data?.name,
					username: data?.username,
					email: data?.email,
					role: data?.role,
					tel: data?.tel,
					about: data?.about,
					image: data?.image,
					tempUrl: data?.tempUrl,
					permission: data?.permission,
					birthday: data?.birthday,
				};
			case 'security':
				return { id: data?.id, otpEnabled: data?.otpEnabled };
			case 'notifications':
				return {
					id: data?.id,
					emailNotificationsEnabled: data?.emailNotificationsEnabled,
					smsNotificationsEnabled: data?.smsNotificationsEnabled,
					tel: data?.tel,
				};
		}
	};

	return (
		<>
			<Title text='Settings' className=' items-start mb-4' />
			{!loading && (
				<Tabs aria-label='Options' color='primary' className='flex '>
					<Tab
						key='personalInfo'
						title={
							<div className='flex gap-2 items-center'>
								<PersonIcon />
								<span>Personal Information</span>
							</div>
						}
					>
						<PersonalInformation user={fields('profile')} />
					</Tab>
					<Tab
						key='Security'
						title={
							<div className='flex gap-2 items-center'>
								<LockClosedIcon />
								<span>Security</span>
							</div>
						}
					>
						<Security user={fields('security')} />
					</Tab>
					<Tab
						key='Notifications'
						title={
							<div className='flex gap-2 items-center'>
								<BellIcon />
								<span>Notifications</span>
							</div>
						}
					>
						<Notifications fields={fields('notifications')} />
					</Tab>

					<Tab
						key='billing'
						title={
							<div className='flex gap-2 items-center'>
								<IdCardIcon />
								<span>Billing</span>
							</div>
						}
					></Tab>
				</Tabs>
			)}
		</>
	);
};

export default SettingsPage;
