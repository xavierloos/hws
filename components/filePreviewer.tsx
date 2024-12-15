import { Button, Tooltip, ListboxItem, Listbox, Avatar } from '@nextui-org/react';
import { TrashIcon } from '@radix-ui/react-icons';
import { useCurrentUser } from '@/hooks/use-current-user';

type FilePreviewerProps = {
	item: any;
	type?: string;
	onDelete?: (i: number | string, name?: string) => {};
	isDeleting?: Boolean;
};

export const FilePreviewer = ({ item, onDelete, type, isDeleting }: FilePreviewerProps) => {
	const user = useCurrentUser();
	const index = typeof item.id === 'string' ? item.id : item.index;
	const imageUrl =
		item.src && item.type.includes('image')
			? item.src
			: item.src && !item.type.includes('image')
			? `/${item.name.split('.').pop()}.png`
			: URL.createObjectURL(item);
	return (
		<Listbox
			aria-label='User Menu'
			fullWidth
			onAction={() => window.open(item.src)}
			className='p-0 mb-1 gap-0 divide-y divide-default-300/50 dark:divide-default-100/80 bg-content1 overflow-visible rounded-sm w-full'
			itemClasses={{
				base: 'p-1 rounded-none gap-3 h-12 data-[hover=true]:bg-default-100/80',
			}}
		>
			<ListboxItem
				key='files'
				endContent={
					(item.creatorId == null || user.id === item.creatorId) && (
						<Tooltip content='Delete' size='sm'>
							<Button
								size='sm'
								isIconOnly
								radius='full'
								color='danger'
								variant='light'
								isLoading={isDeleting}
								onClick={() => onDelete(index, item.name)}
							>
								<TrashIcon />
							</Button>
						</Tooltip>
					)
				}
				startContent={<Avatar showFallback radius='none' src={imageUrl} className='bg-transparent' />}
			>
				<div className='flex-col items-start'>
					<span className='text-default-foreground w-full truncate text-ellipsis overflow-hidden break-words line-clamp-1'>
						{item.name}
					</span>
					<span className='text-tiny text-foreground-400 truncate line-clamp-1 '>
						{item.creatorId && (item.creatorId === user.id ? 'By me' : `By ${item.creator.name}`)} (
						{item.size && `${(item.size / 1024).toFixed(2)}kB`})
					</span>
				</div>
			</ListboxItem>
		</Listbox>
	);
};
