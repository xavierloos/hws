import React from 'react';
import { Card, CardHeader, CardBody, CardFooter, Image, Chip, Button } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { format } from 'timeago.js';
import { EyeOpenIcon } from '@radix-ui/react-icons';
// import Link from 'next/link';

type CardItemProps = {
	item: any;
	suggestion?: boolean;
};

const CategoryChips = ({ categories }: { categories: any[] }) => (
	<div className='flex gap-1'>
		{categories.map((cat) => (
			<Chip key={cat.id} color='primary' variant='solid' size='sm' className='shadow-lg'>
				{cat.name}
			</Chip>
		))}
	</div>
);

export const CardItem = ({ item, suggestion = false }: CardItemProps) => {
	const router = useRouter();

	const openLink = () => {
		router.push(`/blogs/${item.slug}`);
	};

	return (
		<Card isPressable onPress={openLink} className={`shadow-sm w-full h-[300px] flex items-center rounded-md`}>
			<CardHeader className='absolute z-10 top-1 flex-col items-start'>
				{!suggestion && <CategoryChips categories={item.categories} />}
			</CardHeader>
			<Image
				removeWrapper
				alt={`${item.id} blog image`}
				className='z-0 w-full h-full rounded-md object-cover'
				src={item?.thumbnail?.src}
			/>
			<CardFooter className='flex flex-col gap-2 absolute bg-white/50 bottom-0 z-10 rounded-b-md shadow-sm text-left'>
				<h4 className={`text-black/90 text-ellipsis line-clamp-1 w-full`}>{item.name}</h4>
				<small className='text-black/60 text-ellipsis line-clamp-2 w-full'>{item.description}</small>
			</CardFooter>
		</Card>
	);
};
