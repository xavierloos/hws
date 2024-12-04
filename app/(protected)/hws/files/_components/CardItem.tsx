import React, { useState, useEffect } from 'react';
import {
	Card,
	CardHeader,
	CardBody,
	CardFooter,
	Image,
	Button,
	Chip,
	User,
	Tooltip,
	Dropdown,
	DropdownTrigger,
	DropdownMenu,
	DropdownItem,
} from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { format } from 'timeago.js';
import {
	ClockIcon,
	CopyIcon,
	DotsVerticalIcon,
	EyeOpenIcon,
	LockClosedIcon,
	LockOpen1Icon,
	LockOpen2Icon,
	OpenInNewWindowIcon,
	Share1Icon,
	TrashIcon,
} from '@radix-ui/react-icons';
import { toast } from 'sonner';
import axios from 'axios';

type CardItemProps = {
	item: any;
	onDelete: (id: any, name: any) => {};
};

export const CardItem = ({ item, onDelete }: CardItemProps) => {
	const router = useRouter();
	const [image, setImage] = useState('');

	useEffect(() => {
		if (item.type.includes('sheet')) {
			setImage('https://www.freeiconspng.com/thumbs/xls-icon/excel-png-office-xlsx-icon-3.png');
		} else if (item.type.includes('pdf')) {
			setImage(
				'https://static.vecteezy.com/system/resources/previews/023/234/824/original/pdf-icon-red-and-white-color-for-free-png.png'
			);
		} else {
			setImage(item.src);
		}
	}, [image]);

	const openLink = () => {
		router.push(`${item.src}`);
	};

	return (
		<Card
			isFooterBlurred
			isPressable
			className='border-none min-h-[200] h-[200px] rounded-md shadow-md'
			onPress={openLink}
		>
			{(!item.banners.length || !item.thumbnails.length) && (
				<CardHeader className='absolute top-0 flex items-end w-full gap-1 z-50 justify-end py-1 px-[5px]'>
					<Tooltip color='danger' content='Delete' size='sm'>
						<Button
							size='sm'
							isIconOnly
							radius='full'
							color='danger'
							// variant='light'
							onClick={() => onDelete(item.id, item.name)}
						>
							<TrashIcon />
						</Button>
					</Tooltip>
				</CardHeader>
			)}

			<Image
				alt='Woman listing to music'
				className='w-full object-cover min-h-[140px]'
				radius='md'
				height='100%'
				width='100%'
				src={image}
			/>

			<CardFooter className='flex gap-1 absolute bottom-0 z-10 justify-between rounded-b py-1 px-[5px]'>
				<div className='text-tiny overflow-hidden break-words line-clamp-1 text-default-foreground'>
					{item.name}
				</div>
				<Dropdown size='sm' className='max-w-[200px] rounded-md'>
					<DropdownTrigger>
						<Button size='sm' isIconOnly radius='full' variant='light'>
							<DotsVerticalIcon />
						</Button>
					</DropdownTrigger>
					<DropdownMenu aria-label='Static Actions'>
						<DropdownItem isReadOnly key='profile' showDivider className='hover:cursor-none'>
							<div className='flex gap-1 flex-col justify-center items-center m-auto w-full'>
								<div className='text-tiny font-semibold text-wrap break-all'>{item?.name}</div>
								<div className='text-tiny text-foreground'>{(item.size / 1024).toFixed(2)}kB</div>
								<div className='text-tiny text-foreground'>By @{item?.creator?.username}</div>
								<div className='flex gap-2 justify-between w-full'>
									<div className='text-tiny text-foreground flex gap-1 items-center '>
										{/* {item.isPrivate ? <LockClosedIcon /> : <LockOpen2Icon />}
										{item.isPrivate ? 'Private' : 'Public'} */}
									</div>
									<div className='text-tiny text-foreground flex gap-1 items-center '>
										<ClockIcon /> {format(item.createdAt)}
									</div>
								</div>
							</div>
						</DropdownItem>
						<DropdownItem
							key='open'
							onClick={openLink}
							startContent={<OpenInNewWindowIcon />}
							className=' rounded-md'
						>
							Open file
						</DropdownItem>
						<DropdownItem
							key='open'
							onClick={openLink}
							startContent={<Share1Icon />}
							className=' rounded-md'
						>
							Share with
						</DropdownItem>
						<DropdownItem key='open' onClick={openLink} startContent={<CopyIcon />} className=' rounded-md'>
							Copy link
						</DropdownItem>
						<DropdownItem
							key='delete'
							className='text-danger rounded-md'
							color='danger'
							startContent={<TrashIcon />}
						>
							Delete file
						</DropdownItem>
					</DropdownMenu>
				</Dropdown>
			</CardFooter>
		</Card>
	);
};
