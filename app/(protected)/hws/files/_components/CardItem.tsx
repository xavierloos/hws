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
// import axios from '../../../../../public/';
type CardItemProps = {
	item: any;
	onDelete: (id: any, name: any) => {};
};

export const CardItem = ({ item, onDelete }: CardItemProps) => {
	const [image, setImage] = useState(null);
	const [isLoaded, setIsLoaded] = useState(false);

	useEffect(() => {
		const img = new window.Image();
		const placeholder = 'https://miro.medium.com/v2/resize:fit:512/format:webp/0*pyRw1qikTI1eqGm9.gif';

		// Set placeholder initially
		setImage(placeholder);

		// Determine the correct image to load
		const imageUrl = item.type.includes('image') ? item.src : `/${item.name.split('.').pop()}.png`;

		img.src = imageUrl;
		img.onload = () => {
			setImage(imageUrl);
			setIsLoaded(true);
		};
		img.onerror = () => {
			console.error('Failed to load image:', imageUrl);
		};
	}, [item.type, item.src]);

	if (image)
		return (
			<Card
				isFooterBlurred
				isPressable
				className={`border-none min-h-[200] h-[200px] min-w-[200px] rounded-md shadow-md hover:scale-105 transition-all duration-500 z-10 easy-in-out`}
				onPress={() => window.open(`${item.src}`)}
				style={{
					backgroundImage: `url(${image})`,
					backgroundSize: 'cover',
					backgroundRepeat: 'no-repeat',
				}}
			>
				{!item.banners.length && !item.thumbnails.length && (
					<CardHeader className='absolute top-0 flex items-end w-full gap-1 z-50 justify-end py-1 px-[5px]'>
						<Tooltip color='danger' content='Delete' size='sm'>
							<Button
								size='sm'
								isIconOnly
								radius='full'
								color='danger'
								onClick={() => onDelete(item.id, item.name)}
							>
								<TrashIcon />
							</Button>
						</Tooltip>
					</CardHeader>
				)}
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
										<div className='text-tiny text-foreground flex gap-1 items-center '></div>
										<div className='text-tiny text-foreground flex gap-1 items-center '>
											<ClockIcon /> {format(item.createdAt)}
										</div>
									</div>
								</div>
							</DropdownItem>
							<DropdownItem
								key='open'
								onClick={() => window.open(`${item.src}`)}
								startContent={<OpenInNewWindowIcon />}
								className=' rounded-md'
							>
								Open file
							</DropdownItem>
							<DropdownItem
								key='open'
								// onClick={() => window.open(`${item.src}`)}
								startContent={<Share1Icon />}
								className=' rounded-md'
							>
								Share with
							</DropdownItem>
							<DropdownItem
								key='open'
								// onClick={() => window.open(`${item.src}`)}
								startContent={<CopyIcon />}
								className=' rounded-md'
							>
								Copy link
							</DropdownItem>
							{!item.banners.length && !item.thumbnails.length && (
								<DropdownItem
									key='delete'
									className='text-danger rounded-md'
									color='danger'
									startContent={<TrashIcon />}
									onClick={() => onDelete(item.id, item.name)}
								>
									Delete file
								</DropdownItem>
							)}
						</DropdownMenu>
					</Dropdown>
				</CardFooter>
			</Card>
		);
};
