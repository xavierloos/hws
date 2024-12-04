'use client';

import axios from 'axios';
import { useEffect, useState, useTransition, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { Input, Tooltip, Button, Spinner, Modal, ModalContent, ModalHeader, useDisclosure } from '@nextui-org/react';
import { CardItem } from './_components/CardItem';
import { Title } from '@/components/title';
import { PlusIcon } from '@radix-ui/react-icons';
import { Add } from './_components/Add';

const FilesPage = () => {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [data, setData] = useState([]);
	const [filterValue, setFilterValue] = useState('');
	const hasSearchFilter = Boolean(filterValue);
	const [isLoading, startLoading] = useTransition();
	const [isSaving, startSaving] = useTransition();

	useEffect(() => {
		getData();
	}, []);

	const getData = () => {
		startLoading(async () => {
			await axios
				.get('/api/files?type=all')
				.then((res: any) => {
					setData(res.data);
				})
				.catch((e) => {
					toast.error(e.response.data.message);
				});
		});
	};

	const filteredItems = useMemo(() => {
		let filteredItem = [...data];
		if (hasSearchFilter) {
			filteredItem = filteredItem.filter((i) => i?.name.toLowerCase().includes(filterValue.toLowerCase()));
		}
		return filteredItem;
	}, [data, filterValue]);

	const onSubmit = (e: React.FormEvent<HTMLFormElement>, files: any) => {
		e.preventDefault();
		startSaving(async () => {
			const data = new FormData();
			files.forEach((item: any) => data.append(item.name, item));

			await axios
				.post(`/api/files?type=files`, data)
				.then((res) => {
					toast.success(res.data.message);
					getData();
					handleOnClose();
				})
				.catch((e) => {
					toast.error(e.response.data.message);
				});
		});
	};

	const onDelete = async (id: string, name: string) => {
		toast.warning(`Are you sure you want to delete: ${name}?`, {
			action: {
				label: 'YES',
				onClick: async () => {
					try {
						await axios.delete(`/api/files?id=${id}&name=${name}`);
						getData();
					} catch (error) {}
				},
			},
		});
	};

	const onSearchChange = useCallback((value?: string) => {
		if (value) {
			setFilterValue(value);
		} else {
			setFilterValue('');
		}
	}, []);

	const onClear = useCallback(() => {
		setFilterValue('');
	}, []);

	const handleOnClose = () => {
		return onClose();
	};

	return (
		<>
			<div className='grid gap-4 grid-cols-1'>
				<Title text='Files' className='items-start' />
				<div className='flex flex-col gap-4'>
					{/* FILTERS START */}
					<div className='flex gap-3 items-center'>
						<Input
							size='sm'
							fullWidth
							type='text'
							isClearable
							radius='none'
							value={filterValue}
							label='Search'
							onClear={() => onClear()}
							onValueChange={onSearchChange}
						/>
						<Tooltip content='ADD NEW' showArrow>
							<Button
								color='primary'
								className='flex shadow-md'
								radius='full'
								isIconOnly
								size='md'
								endContent={<PlusIcon />}
								onPress={onOpen}
							/>
						</Tooltip>
					</div>
					{/* FILTERS END*/}
					<div className='flex justify-between items-center'>
						<span className='text-default-400 text-tiny'>Total {data.length} files</span>
					</div>
				</div>
				<div className='w-full flex gap-6 min-h-[200px] justify-start'>
					{isLoading ? (
						<Spinner size='lg' label='Loading...' color='primary' />
					) : (
						<div className='grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'>
							{filteredItems?.map((item: any) => (
								<CardItem item={item} key={item.id} onDelete={onDelete} />
							))}
						</div>
					)}
				</div>
			</div>
			<Modal
				size='sm'
				isOpen={isOpen}
				onClose={onClose}
				scrollBehavior='inside'
				shouldBlockScroll
				className='rounded-md'
			>
				<ModalContent>
					<ModalHeader className='flex flex-col gap-1'>Add Files</ModalHeader>
					<Add onSubmit={onSubmit} isSaving={isSaving} />
				</ModalContent>
			</Modal>
		</>
	);
};

export default FilesPage;
