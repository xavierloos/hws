'use client';
import { TaskViewModal } from '@/components/taskViewModal';
import { TableItems } from './_components/TableItems';
import axios from 'axios';
import { useEffect, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useDisclosure } from '@nextui-org/react';

const TasksPage = () => {
	const user = useCurrentUser();
	const [data, setData] = useState([]);
	const [details, setDetails] = useState([]);
	const [isLoading, startLoading] = useTransition();
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [isSaving, startSaving] = useTransition();
	const initialCols = ['name', 'status', 'team', 'actions'];
	const cols = [
		{ name: 'NAME', uid: 'name', sortable: true },
		{ name: 'ASSIGNED TO', uid: 'team', sortable: true },
		{ name: 'STATUS', uid: 'status', sortable: true },
		{ name: 'PRIORITY', uid: 'priority', sortable: true },
		{ name: 'CREATED BY', uid: 'creator', sortable: true },
		{ name: 'ACTIONS', uid: 'actions' },
	];
	const statusOptions = [
		{ name: 'All', uid: 'All' },
		{ name: 'To Do', uid: 'To Do' },
		{ name: 'In Progress', uid: 'In Progress' },
		{ name: 'Completed', uid: 'Completed' },
		{ name: 'Blocked', uid: 'Blocked' },
		{ name: 'Canceled', uid: 'Canceled' },
	];

	useEffect(() => {
		getData();
	}, []);

	const getData = (sorting: string = 'due-date') => {
		startLoading(async () => {
			await axios
				.get(`/api/tasks?sortby=${sorting}`)
				.then((res) => {
					setData(res.data);
				})
				.catch((e) => {
					toast.error(e.response.data.message);
				});
		});
	};

	const onSubmit = async (e: React.FormEvent<HTMLFormElement>, values: any, files?: any) => {
		e.preventDefault();
		startSaving(async () => {
			const data = new FormData();

			//I need to create the task first
			const taskId = await axios.post('/api/tasks', values).then(async (res) => {
				return res.data.message;
			});
			//get the task id to add the files to the gcbucket
			const postFiles = async () => {
				files.forEach((item: any) => {
					data.append(taskId, item, item.name);
				});
				await axios
					.post(`/api/files?type=tasks`, data)
					.then((res) => {
						toast.success('Task added successfully');
					})
					.catch((e) => {
						toast.error(e.response.data.message);
					});
			};

			if (files.length > 0) {
				await postFiles();
			} else {
				toast.success('Task added successfully');
			}

			getData();
			handleOnClose();
		});
	};

	const onDelete = async (id: string, name: string, files: boolean = false) => {
		toast.warning(`Are you sure you want to delete: ${name}?`, {
			action: {
				label: 'YES',
				onClick: async () => {
					try {
						const res = await axios.delete(`/api/tasks?id=${id}&files=${files}`);
						toast.success(res.data.message);
						getData();
					} catch (e) {
						toast.error(e.response.data.error.meta.cause);
					}
				},
			},
		});
	};

	const handleOnClose = () => {
		return onClose();
	};

	return (
		<TableItems
			data={data}
			cols={cols}
			initialCols={initialCols}
			onDelete={onDelete}
			onSave={onSubmit}
			statusOptions={statusOptions}
			isLoading={isLoading}
			isSaving={isSaving}
			isNewOpen={isOpen}
			onNewOpen={onOpen}
			onNewClose={handleOnClose}
			getData={getData}
			permission={user?.permission}
		/>
	);
};

export default TasksPage;
