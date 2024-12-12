'use client';
import { Title } from '@/components/title';
import { CardItem } from './_components/CardItem';
import { useEffect, useState, useTransition } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useCurrentUser } from '@/hooks/use-current-user';
const DashboardPage = () => {
	const user = useCurrentUser();
	const [data, setData] = useState([]);
	useEffect(() => {
		getData();
	}, []);

	const getData = async (sorting: string = 'modified-desc') => {
		// startLoading(async () => {
		await axios
			.get(`/api/members/${user.id}`)
			.then((res) => {
				setData(res.data);
			})
			.catch((e) => {
				toast.error(e.response.data.message);
			});
		// });
	};
	return (
		<div className='grid gap-4 grid-cols-1'>
			<Title text='Dashboard' className='items-start' />
			<div className='grid gap-4 w-full h-full items-stretch md:grid-cols-[3fr,1fr]'>
				<div className='w-full flex flex-col gap-4 md:grid-cols-2 lg:grid-cols-3'>
					<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
						<CardItem title='Members' />
						<CardItem title='Blogs' />
						<CardItem title='Files' />
					</div>
					<div className='grid gap-4 grid-cols-1'>
						<CardItem title='Overview' />
					</div>
				</div>
				<div className='grid gap-4 :grid-cols-1'>
					<CardItem title='Activity' />
				</div>
			</div>
		</div>
	);
};

export default DashboardPage;
