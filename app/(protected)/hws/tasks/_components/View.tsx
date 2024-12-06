import {
	User,
	Input,
	Select,
	SelectItem,
	Button,
	ModalBody,
	Avatar,
	DatePicker,
	AvatarGroup,
	Tooltip,
	Popover,
	PopoverTrigger,
	PopoverContent,
	CheckboxGroup,
	Checkbox,
	Textarea,
	Tabs,
	Tab,
	Chip,
	RadioGroup,
	Radio,
} from '@nextui-org/react';
import { useEffect, useState, useTransition } from 'react';
import { useCurrentUser } from '@/hooks/use-current-user';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';

import { toast } from 'sonner';
import dateFormat from 'dateformat';
import { format } from 'timeago.js';
import {
	PaperPlaneIcon,
	PlusIcon,
	FilePlusIcon,
	ChatBubbleIcon,
	FileIcon,
	TrashIcon,
	Share1Icon,
} from '@radix-ui/react-icons';
import { now, getLocalTimeZone, parseDate, today, parseAbsoluteToLocal } from '@internationalized/date';
import { FilePreviewer } from '@/components/filePreviewer';
import { modules, formats } from '@/react-quill-settings';
import { I18nProvider } from '@react-aria/i18n';
import ReactQuill from 'react-quill';
type Props = {
	item: any;
	getData: (sort?: string) => {};
	onDelete: (id: string, name: string) => {};
};

export const View = ({ item, getData, onDelete }: Props) => {
	const user = useCurrentUser();
	const [searchMember, setSearchMember] = useState(null);
	const [team, setTeam] = useState([]);
	const [images, setImages] = useState([]);
	const [isPending, startTransition] = useTransition();
	const [isDeleting, startDeleting] = useTransition();
	const [files, setFiles] = useState<File[]>([]);
	const [task, setTask] = useState(item?.[0]);
	const markup = { __html: task.description };
	const [description, setDescription] = useState(item?.[0].description);
	const [add, setAdd] = useState({
		image: false,
		category: false,
	});
	const [inputs, setInputs] = useState({
		comment: '',
		attachments: null,
	});
	let priorities = [
		{ name: 'High', color: 'danger' },
		{ name: 'Medium', color: 'primary' },
		{ name: 'Low', color: 'default' },
	];
	let status = [
		{ name: 'Completed', color: 'success' },
		{ name: 'To Do', color: 'default' },
		{ name: 'In Progress', color: 'foreground' },
		{ name: 'Blocked', color: 'warning' },
		{ name: 'Cancelled', color: 'danger' },
	];
	let types = [
		{ key: 'Bug', name: 'Bug' },
		{ key: 'Documentation', name: 'Documentation' },
		{ key: 'Testing', name: 'Testing' },
		{ key: 'Research', name: 'Research' },
		{ key: 'Feature', name: 'Feature' },
		{ key: 'Story', name: 'Story' },
		{ key: 'Urgent', name: 'Urgent' },
		{ key: 'Critical', name: 'Critical' },
		{ key: 'Maintenance', name: 'Maintenance' },
	];

	useEffect(() => {
		let members: any[];
		item?.team?.map((i) => {
			members.push(i.id);
		});
		// setGroupSelected(members);
		// getComments();
		getMembers();
	}, [item]);

	const getMembers = async () => {
		await axios
			.get('/api/members')
			.then((res) => {
				setTeam(res.data);
			})
			.catch(() => {});
	};

	const getImages = () => {
		startTransition(async () => {
			await axios
				.get('/api/files?type=image')
				.then((res) => {
					setImages(res.data);
				})
				.catch(() => {});
		});
	};

	const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			const _files = Array.from(e.target.files);
			setFiles([...files, ..._files]);
		}
	};

	const onDeleteFile = async (fileId: string, fileName: string) => {
		startDeleting(async () => {
			await axios
				.delete(`/api/files/${task.id}/${task.creatorId}/${fileId}/${fileName}`)
				.then(async (res: any) => {
					if (res.status === 200)
						await axios.get(`/api/files/${task.id}/${task.creatorId}`).then((res: any) => {
							setTask({
								...task,
								files: res.data,
							});
							toast.success(`File deleted successfully`);
							getData();
						});
				})
				.catch((e) => {
					toast.error(e.response.data.message);
				});
		});
	};

	const onSubmitComment = async (e: React.FormEvent<HTMLFormElement>, values: any, files: any, id: string) => {
		e.preventDefault();
		const data = new FormData();
		values.taskId = id;

		if (files.length > 0) {
			values.attachments = [];
			files.forEach((item: any) => {
				values.attachments.push({
					name: item.name,
					url: null,
					type: item.type,
				}); //Append files to values
			});
		}

		await axios
			.post('/api/comments', values)
			.then(async (res) => {
				setInputs({
					comment: '',
					attachments: null,
				});
				//Temporary comment adding
				setTask({
					...task,
					comments: [
						{
							id: res.data.id,
							comment: values.comment,
							createdAt: new Date(),
							user: {
								id: user.id,
								src: user.src,
								username: user.username,
							},
						},
						...(task.comments || []),
					],
				});

				getData();

				// if (files.length > 0) {
				//   files.forEach((item: any) => {
				//     data.append(res.data.message, item, item.name);
				//   });
				//   await axios
				//     .post(`/api/tasks/${res.data.message}`, data)
				//     .then((res) => {
				//       toast.success(res.data.message);
				//     })
				//     .catch((e) => {
				//       toast.error(e.response.data.message);
				//     });
				// } else {
				//   toast.success("Task added successfully");
				// }
			})
			.catch((e) => {
				toast.error(e.response.data.message);
			});
	};

	const onDeleteComment = async (id: string) => {
		await axios.delete(`/api/comments?id=${id}`);
		getData();
		return setTask({
			...task,
			comments: task.comments.filter((comment: any) => comment.id !== id),
		});
	};

	const update = async (field: string, value: any, e?: React.ChangeEvent<HTMLInputElement>) => {
		e?.preventDefault();
		switch (field) {
			case 'priority':
				value = priorities.find((priority) => priority.name === value);
				break;
			case 'status':
				value = status.find((st) => st.name === value);
				break;
			case 'teamIds':
				task.team = team.filter((user: any) => value.includes(user.id));
				task.teamIds = team.filter((t: any) => value.includes(t.id));
				break;
			default:
				setTask({ ...task, [field]: value });
				break;
		}
		await axios
			.put(`/api/tasks/${task.id}?type=${field}`, { [field]: value })
			.then(() => {
				toast.success('Task updated successfully');
			})
			.catch((e) => {});

		getData();
	};

	const UpdateForm = ({ field, classes }: any) => {
		return (
			<Popover showArrow placement='bottom' radius='sm' className=''>
				<PopoverTrigger>
					<h2 className='m-0 p-0'>{task.name}</h2>
				</PopoverTrigger>
				<PopoverContent radius='sm' className='p-0 border-none'>
					<form onSubmit={(e) => update(field, task[field], e)}>
						<Input
							size='md'
							type='text'
							radius='sm'
							className='min-w-[300px]'
							defaultValue={task[field]}
							placeholder={`Update ${field}`}
							onValueChange={(e) => (task[field] = e)}
							isRequired
							fullWidth
							endContent={
								<Tooltip content={`Update ${field}`} size='sm'>
									<Button
										size='sm'
										isIconOnly
										color='primary'
										radius='full'
										type='submit'
										startContent={<PaperPlaneIcon />}
									/>
								</Tooltip>
							}
						/>
					</form>
				</PopoverContent>
			</Popover>
		);
	};

	const MemberCheckBox = ({ item }: any) => {
		return (
			<Checkbox value={item.id} className='flex gap-2'>
				<User
					size='sm'
					name={item.name}
					avatarProps={{
						size: 'sm',
						isBordered: false,
						className: 'w-5 h-5 shrink-0',
						src: item.src,
					}}
				/>
			</Checkbox>
		);
	};

	return (
		<ModalBody>
			<div className='m-0 p-0'>
				<div className='w-full flex gap-1 items-center text-foreground text-sm'>
					Due {format(task.dueDate)} • on{' '}
					{dateFormat(task.dueDate, `${user.id == task.creator.id ? 'ddd,' : 'ddd, dd/mm/yyyy, HH:mm'}`)}
					{user.id == task.creator.id && (
						<I18nProvider locale={'en-GB'}>
							<DatePicker
								size='sm'
								radius='none'
								hourCycle={24}
								hideTimeZone={true}
								variant='underlined'
								defaultValue={parseAbsoluteToLocal(task.dueDate)}
								showMonthAndYearPickers
								className='flex flex-col-reverse flex-wrap-reverse overflow-hidden datePicker w-[160px]'
								onChange={(date: any) => {
									const m = `${date?.month <= 9 ? '0' : ''}${date?.month}`;
									const d = `${date?.day <= 9 ? '0' : ''}${date?.day}`;
									const h = `${date?.hour <= 9 ? '0' : ''}${date?.hour}`;
									const min = `${date?.minute <= 9 ? '0' : ''}${date?.minute}`;
									update('dueDate', `${date?.year}-${m}-${d}T${h}:${min}Z`);
								}}
							/>
						</I18nProvider>
					)}
				</div>

				<div className='flex justify-between'>
					{user.id == task.creator.id ? (
						<>
							<UpdateForm field='name' classes='text-sm font-semi flex gap-2 items-center' />
							<Button
								size='sm'
								isIconOnly
								variant='flat'
								color='danger'
								type='submit'
								radius='full'
								onClick={() => onDelete(task.id, task.name)}
								startContent={<TrashIcon />}
							/>
						</>
					) : (
						<h2 className='m-0 p-0'>{task.name}</h2>
					)}
				</div>
			</div>
			<div className='flex gap-3 flex-wrap'>
				<div className='flex flex-col gap-1'>
					<span className='text-foreground text-tiny m-0 p-0'>Priority</span>
					<Popover showArrow placement='bottom' radius='sm'>
						<PopoverTrigger>
							<Chip radius='sm' color={task.priority.color} className='shadow-md'>
								{task.priority.name}
							</Chip>
						</PopoverTrigger>
						<PopoverContent className='p-4 min-w-[200px] border-none radius-none'>
							<RadioGroup
								size='sm'
								label='Change priority'
								className='w-full justify-start mb-2'
								defaultValue={task.priority.name}
								onValueChange={(e) => update('priority', e)}
							>
								{priorities?.map((i, index) => {
									return (
										<Radio
											key={index}
											size='sm'
											value={i.name}
											isDisabled={i == task.priority ? true : false}
										>
											{i.name}
										</Radio>
									);
								})}
							</RadioGroup>
						</PopoverContent>
					</Popover>
				</div>
				<div className='flex flex-col gap-1'>
					<span className='text-foreground text-tiny m-0 p-0'>Status</span>
					<Popover showArrow placement='bottom' radius='sm'>
						<PopoverTrigger>
							<Chip radius='sm' color={task.status.color} className='shadow-md'>
								{task.status.name}
							</Chip>
						</PopoverTrigger>
						<PopoverContent className='p-4 min-w-[200px] border-none radius-none'>
							<RadioGroup
								size='sm'
								label='Change status'
								className='w-full justify-start mb-2'
								defaultValue={task.status.name}
								onValueChange={(e) => update('status', e)}
							>
								{status?.map((i, index) => {
									return (
										<Radio
											key={index}
											size='sm'
											value={i.name}
											isDisabled={i == task.status ? true : false}
										>
											{i.name}
										</Radio>
									);
								})}
							</RadioGroup>
						</PopoverContent>
					</Popover>
				</div>
				<div className='flex flex-col gap-1'>
					<span className='text-foreground text-tiny m-0 p-0'>Type</span>
					<Popover showArrow placement='bottom' radius='sm'>
						<PopoverTrigger>
							<Chip radius='sm' color={task.type} className='shadow-md'>
								{task.type}
							</Chip>
						</PopoverTrigger>
						<PopoverContent className='p-4 min-w-[200px] border-none radius-none'>
							<RadioGroup
								size='sm'
								label='Change type'
								className='w-full justify-start mb-2'
								defaultValue={task.type}
								onValueChange={(e) => update('type', e)}
							>
								{types?.map((i, index) => {
									return (
										<Radio
											key={index}
											size='sm'
											value={i.name}
											isDisabled={i == task.type ? true : false}
										>
											{i.name}
										</Radio>
									);
								})}
							</RadioGroup>
						</PopoverContent>
					</Popover>
				</div>
			</div>

			<div className='flex flex-col gap-1'>
				<span className='text-foreground text-tiny m-0 p-0'>Team members</span>
				<div className='flex'>
					{task?.team.length > 0 && (
						<AvatarGroup isBordered max={13} className='ps-3 justify-start border-transparent'>
							{task?.team?.map((i) => {
								return (
									<Tooltip
										key={i}
										content={`${i.name} ${user.email == i.email ? ' • (me)' : ''}`}
										size='sm'
									>
										<Avatar size='sm' src={i.src} className={`shrink-0 ring-1`} />
									</Tooltip>
								);
							})}
						</AvatarGroup>
					)}
					<Popover showArrow placement='bottom' radius='sm'>
						<PopoverTrigger>
							<Button color='primary' radius='full' isIconOnly size='sm' endContent={<PlusIcon />} />
						</PopoverTrigger>
						<PopoverContent radius='sm' className='p-4 min-w-[200px] border-none radius-none'>
							<CheckboxGroup
								defaultValue={task.teamIds}
								onChange={(ids) => update('teamIds', ids)}
								classNames='w-full overflow-y-hidden'
								style={{ overflow: 'scroll' }}
							>
								<Input
									size='sm'
									type='text'
									placeholder='Search member'
									onKeyUp={(e) => setSearchMember(e.target.value)}
								/>
								{team?.map((i: any) => {
									if (searchMember) {
										if (i.name?.toLowerCase().includes(searchMember?.toLowerCase())) {
											return <MemberCheckBox item={i} key={i.id} />;
										}
									} else {
										return <MemberCheckBox item={i} key={i.id} />;
									}
								})}
							</CheckboxGroup>
						</PopoverContent>
					</Popover>
				</div>
			</div>
			{user.id == task.creator.id ? (
				<Popover showArrow placement='bottom' radius='sm'>
					<PopoverTrigger>
						<div dangerouslySetInnerHTML={markup} className='markup text-sm text-foreground-600' />
					</PopoverTrigger>
					<PopoverContent radius='sm' className='p-0 min-w-[200px] border-none'>
						<form onSubmit={(e) => update('description', description, e)}>
							<ReactQuill
								theme='snow'
								placeholder='Write your content'
								className='min-h-[300px] rounded-none bg-content2 max-w-[600px]'
								modules={modules}
								formats={formats}
								value={description}
								onChange={(v) => {
									setDescription(v);
								}}
							/>
							<Tooltip content={`Update description`} size='sm'>
								<Button
									size='sm'
									isIconOnly
									color='primary'
									radius='full'
									type='submit'
									isDisabled={description ? false : true}
									className='absolute appearance-none select-none top-1 right-1 rtl:left-1 rtl:right-[unset]'
									startContent={<PaperPlaneIcon />}
								/>
							</Tooltip>
						</form>
					</PopoverContent>
				</Popover>
			) : (
				<div dangerouslySetInnerHTML={markup} className='markup text-sm text-foreground-600' />
			)}

			<User
				className='w-full justify-start'
				avatarProps={{
					size: 'sm',
					className: 'shrink-0',
					src: task?.creator.src,
				}}
				description={
					<span className='text-tiny truncate text-ellipsis line-clamp-1'>{format(task?.createdAt)}</span>
				}
				name={
					<span
						className={`text-sm w-full text-ellipsis font-medium overflow-hidden break-words line-clamp-1`}
					>
						By {task.creatorId === user.id ? 'me' : task?.creator.name}
					</span>
				}
			/>
			<hr />

			<div>
				<Tabs aria-label='Options' color='primary'>
					<Tab
						key='comments'
						title={
							<div className='flex items-center space-x-2'>
								<ChatBubbleIcon />
								<span>{task.comments.length} Comments</span>
							</div>
						}
					>
						<div className='flex gap-3 flex-col comments'>
							<form onSubmit={(e) => onSubmitComment(e, inputs, files, task?.id)}>
								<Textarea
									placeholder='What are you thinking?'
									size='sm'
									radius='full'
									fullWidth
									isRequired
									minRows={1}
									description={`0 Files attached`}
									value={inputs.comment}
									onValueChange={(e) => setInputs({ ...inputs, comment: e })}
									startContent={<Avatar src={user?.src} size='sm' className='shrink-0' />}
									endContent={
										<>
											<Button
												size='sm'
												isIconOnly
												color='foreground'
												variant='flat'
												radius='full'
											>
												<FilePlusIcon />
											</Button>
											<Button
												size='sm'
												isIconOnly
												color='primary'
												type='submit'
												radius='full'
												className='ms-2'
											>
												<PaperPlaneIcon />
											</Button>
										</>
									}
								/>
							</form>
							{task.comments?.map((i: any, index: any) => {
								return (
									<div
										key={index}
										className={`flex gap-2 max-w-[80%] m-auto ${
											i.user.id == user.id ? 'ms-0' : 'flex-row-reverse me-0'
										}`}
									>
										<Avatar src={i.user.src} size='sm' className='shrink-0' />
										<div className='flex flex-col gap-1'>
											<div
												className={`w-fit h-auto px-2 py-1 rounded-xl text-sm text-ellipsis text-content5 font-light overflow-hidden break-words m-auto text-start ${
													i.user?.id == user?.id
														? 'ms-0 bg-primary rounded-tl-none text-primary-foreground'
														: 'me-0 bg-default-100 rounded-tr-none'
												}`}
											>
												{i.comment}
											</div>
											<div
												className={`text-tiny text-foreground-400 truncate text-ellipsis line-clamp-1 ${
													i.user.id == user.id ? 'text-start' : 'text-end'
												}`}
											>
												<span>
													{i.user.id === user.id
														? 'Me'
														: `${i.user.username ? `@${i.user.username}` : i.user.email}`}
												</span>
												<span>
													{i?.attachments && ' • ' + i?.attachments?.length + ' files'}
												</span>
												<span> • {format(i?.createdAt)}</span>
												{i.user.id === user.id && (
													<>
														{' • '}
														<span
															className='text-danger hover:underline'
															onClick={() => onDeleteComment(i.id)}
														>
															Delete
														</span>
													</>
												)}
											</div>
										</div>
									</div>
								);
							})}
						</div>
					</Tab>
					{task.files && (
						<Tab
							key='attachments'
							title={
								<div className='flex items-center space-x-2'>
									<FileIcon />
									<span>{task.files.length} Attachments</span>
								</div>
							}
						>
							{task.files.map((item, index) => {
								item.index = index; //To delete from the uploading list
								return (
									<FilePreviewer
										item={item}
										key={index}
										onDelete={onDeleteFile}
										isDeleting={isDeleting}
									/>
								);
							})}
						</Tab>
					)}
				</Tabs>
			</div>
		</ModalBody>
	);
};
