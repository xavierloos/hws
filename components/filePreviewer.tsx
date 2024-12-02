import { Button, Tooltip, User, Switch, ListboxItem, Listbox, Avatar } from '@nextui-org/react';
import { EyeOpenIcon, ImageIcon, LockClosedIcon, LockOpen1Icon, TrashIcon } from '@radix-ui/react-icons';
import { BiSolidFileTxt } from 'react-icons/bi';
import { FaFileExcel, FaFileImage, FaFilePdf, FaFilePowerpoint, FaFileWord } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { useCurrentUser } from '@/hooks/use-current-user';

type FilePreviewerProps = {
	item: any;
	type?: string;
	onDelete?: (i: number) => {};
};

export const FilePreviewer = ({ item, onDelete, type }: FilePreviewerProps) => {
	const user = useCurrentUser();

	const fileType = item.name.split('.').pop();

	return (
		<Listbox
			aria-label='User Menu'
			fullWidth
			onAction={() => window.open(item.src)}
			className='p-0 mb-1 gap-0 divide-y divide-default-300/50 dark:divide-default-100/80 bg-content1 overflow-visible rounded-sm'
			itemClasses={{
				base: 'p-1 rounded-none gap-3 h-12 data-[hover=true]:bg-default-100/80',
			}}
		>
			<ListboxItem
				key='issues'
				endContent={
					(item.creatorId == null || user.id === item.creatorId) && (
						<Tooltip content='Delete' size='sm'>
							<Button
								size='sm'
								isIconOnly
								radius='full'
								color='danger'
								variant='light'
								onClick={() => onDelete(item.index)}
							>
								<TrashIcon />
							</Button>
						</Tooltip>
					)
				}
				startContent={
					<Avatar
						showFallback
						radius='none'
						src={item.src}
						className='bg-transparent'
						fallback={
							fileType.includes('docx') ? (
								<FaFileWord size={70} className='w-full h-full text-blue-600' fill='currentColor' />
							) : fileType.includes('ppt') ? (
								<FaFilePowerpoint
									size={70}
									className='w-full h-full text-orange-600'
									fill='currentColor'
								/>
							) : fileType.includes('xls') ? (
								<FaFileExcel size={70} className='w-full h-full text-success' fill='currentColor' />
							) : fileType.includes('txt') ? (
								<BiSolidFileTxt
									size={70}
									className='w-full h-full text-foreground'
									fill='currentColor'
								/>
							) : fileType.includes('pdf') ? (
								<FaFilePdf size={100} className='w-full h-full text-red-500' fill='currentColor' />
							) : (
								<FaFileImage size={100} className='w-full h-full text-primary' fill='currentColor' />
							)
						}
					/>
				}
			>
				<div className='inline-flex flex-col items-start'>
					<span className='text-small text-inherit text-default-foreground w-full text-ellipsis font-normal overflow-hidden break-words line-clamp-1'>
						{item.name}
					</span>
					<span className='text-tiny text-foreground-400 truncate line-clamp-1 '>
						{item.creatorId && (item.creatorId === user.id ? 'By me' : `By ${item.user.name}`)} (
						{item.size && `${(item.size / 1024).toFixed(2)}kB`})
					</span>
				</div>
			</ListboxItem>
		</Listbox>
	);
};
