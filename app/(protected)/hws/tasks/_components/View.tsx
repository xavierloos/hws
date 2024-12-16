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
	Alert,
} from '@nextui-org/react';

import { FaFileExcel, FaFileImage, FaFilePdf, FaFilePowerpoint, FaFileWord } from 'react-icons/fa';
import { BiSolidFileTxt } from 'react-icons/bi';
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
	Share1Icon,
	ExternalLinkIcon,
	TrashIcon,
	ReaderIcon,
	CheckCircledIcon,
	CircleBackslashIcon,
	LightningBoltIcon,
	ArrowDownIcon,
	ArrowUpIcon,
	CircleIcon,
	LapTimerIcon,
	ArrowRightIcon,
	CrumpledPaperIcon,
	CrossCircledIcon,
	GearIcon,
	MagicWandIcon,
	MagnifyingGlassIcon,
	ExclamationTriangleIcon,
	ClipboardIcon,
	LinkBreak2Icon,
} from '@radix-ui/react-icons';
import { now, getLocalTimeZone, parseDate, today, parseAbsoluteToLocal } from '@internationalized/date';
import { FilePreviewer } from '@/components/filePreviewer';
import { modules, formats } from '@/react-quill-settings';
import { I18nProvider } from '@react-aria/i18n';
import ReactQuill from 'react-quill';
import { cn } from '@/lib/utils';
type Props = {
	item: any;
	getData: (sort?: string) => {};
	onDelete: (id: string, name: string) => {};
};

export const View = ({ item, getData, onDelete }: Props) => {
	const user = useCurrentUser();
	const [searchMember, setSearchMember] = useState(null);
	const [team, setTeam] = useState([]);
	const [isSaving, startSaving] = useTransition();
	const [isDeleting, startDeleting] = useTransition();
	const [files, setFiles] = useState<File[]>([]);
	const [task, setTask] = useState(item?.[0]);
	const markup = { __html: task.description };
	const [description, setDescription] = useState(item?.[0].description);
	const [inputs, setInputs] = useState({
		comment: '',
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
		{ name: 'Bug', color: 'default' },
		{ name: 'Documentation', color: 'default' },
		{ name: 'Testing', color: 'default' },
		{ name: 'Research', color: 'default' },
		{ name: 'Feature', color: 'default' },
		{ name: 'Story', color: 'default' },
		{ name: 'Urgent', color: 'default' },
		{ name: 'Critical', color: 'default' },
		{ name: 'Maintenance', color: 'default' },
	];
	const iconMapping: Record<string, JSX.Element> = {
		Low: <ArrowDownIcon />,
		Medium: <ArrowRightIcon />,
		High: <ArrowUpIcon />,
		'To Do': <CircleIcon />,
		'In Progress': <LapTimerIcon />,
		Completed: <CheckCircledIcon />,
		Blocked: <CircleBackslashIcon />,
		Documentation: <ReaderIcon />,
		Feature: <LightningBoltIcon />,
		Maintenance: <GearIcon />,
		Story: <MagicWandIcon />,
		Research: <MagnifyingGlassIcon />,
		Testing: <ClipboardIcon />,
		Urgent: <ExclamationTriangleIcon />,
		Bug: <CrumpledPaperIcon />,
		Cancelled: <CrossCircledIcon />,
		Critical: <LinkBreak2Icon />,
	};

	const Icon = ({ label }: { label: string }) => {
		return iconMapping[label];
	};

	useEffect(() => {
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
					if (res.status === 200) await axios.get(`/api/files/${task.id}/${task.creatorId}`);
					updateTask();
					getData();
				})
				.catch((e) => {
					toast.error(e.response.data.message);
				});
		});
	};

	const onSubmitComment = async (e: React.FormEvent<HTMLFormElement>, values: any) => {
		e.preventDefault();
		startSaving(async () => {
			const data = new FormData();
			values.taskId = task.id;
			const commentId = await axios.post('/api/comments', values).then(async (res) => {
				return res.data;
			});

			const postFiles = async () => {
				files.forEach((item: any) => {
					data.append(task.id, item, item.name);
				});
				await axios.post(`/api/files?type=tasks&commentId=${commentId}`, data);
			};

			if (files.length > 0) await postFiles();
			setFiles([]);
			setInputs({
				comment: '',
			});
			updateTask();
			toast.success('Comment added successfully');
			getData();
		});
	};

	const onDeleteComment = async (id: string) => {
		await axios.delete(`/api/comments/comment/${id}`);
		updateTask();
		toast.success('Comment deleted successfully');
		getData();
	};

	const updateTask = async () => {
		setTask(
			await axios.get(`/api/tasks/${task.id}`).then(async (task: any) => {
				return task.data;
			})
		);
	};

	const update = async (field: string, value: any, e?: React.ChangeEvent<HTMLInputElement>) => {
		e?.preventDefault();
		if (field == 'assigmentIds') {
			try {
				await axios.put(`/api/tasks/${task.id}/assignments`, { userIds: value });
			} catch (error) {
				toast.error('Failed to update task members');
				return;
			}
		} else {
			if (['priority', 'status', 'type'].includes(field)) {
				const options = [...priorities, ...status, ...types];
				value = options.find((i) => i.name === value);
			}
			try {
				await axios.put(`/api/tasks/${task.id}?type=${field}`, { [field]: value });
			} catch (error) {
				toast.error(`Failed to update `);
				return;
			}
		}

		await updateTask();
		toast.success(`Task updated successfully`);
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
		console.log(item);
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

	const Label = ({ label, data }: any) => {
		return (
			<div className='flex flex-col gap-1'>
				<span className='text-foreground capitalize text-tiny'>{label}</span>
				<Popover showArrow placement='bottom' radius='sm'>
					<PopoverTrigger>
						<Chip
							className={`capitalize hover:cursor-pointer`}
							variant='flat'
							color={task[label].color}
							startContent={<Icon label={task[label].name} />}
						>
							{task[label].name}
						</Chip>
					</PopoverTrigger>
					<PopoverContent className='min-w-[200px] border-none radius-none'>
						<RadioGroup
							size='sm'
							label='Change priority'
							className='w-full flex gap-2 p-1'
							defaultValue={task[label].name}
							onValueChange={(e) => {
								update(label, e);
							}}
						>
							{data?.map((i, index) => {
								return (
									<Radio
										key={index}
										size='sm'
										value={i.name}
										isDisabled={i == task[label] ? true : false}
										classNames={{
											base: cn(
												`BASE flex min-w-full m-0 hover:bg-content2`,
												'flex cursor-pointer gap-1 p-1 rounded-md',
												` data-[selected=true]:text-${i.color} data-[selected=true]:bg-${i.color} !bg-opacity-20`
											),
											wrapper: cn('WRAPPER hidden w-full'),
											label: cn(`flex gap-2 items-center text-inherit text-default-foreground`),
										}}
									>
										<Icon label={i.name} />
										{i.name}
									</Radio>
								);
							})}
						</RadioGroup>
					</PopoverContent>
				</Popover>
			</div>
		);
	};

	return (
		<ModalBody className='w-full flex flex-col gap-2 my-4'>
			<div className='w-full flex justify-between'>
				{user.id == task.creator.id ? (
					<>
						<UpdateForm field='name' classes='text-sm font-semi flex gap-2 items-center' />
					</>
				) : (
					<h2>{task.name}</h2>
				)}

				{user.id == task.creator.id && (
					<Tooltip content={`Delete task`} size='sm' color='danger'>
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
					</Tooltip>
				)}
			</div>
			<div className='w-full flex gap-1 items-center text-foreground text-sm uppercase font-semibold'>
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
			{task.status.name != 'Completed' && new Date() > new Date(task.dueDate) && (
				<Alert size='sm' color='danger' variant='flat' title={'This task is overdue'} hideIconWrapper={true} />
			)}
			<div className='flex gap-3 flex-wrap'>
				<Label label='priority' data={priorities} />
				<Label label='status' data={status} />
				<Label label='type' data={types} />
			</div>
			<div className='flex flex-col gap-1'>
				<span className='text-foreground text-tiny'>Team members</span>
				<div className='flex'>
					{task.assignments && (
						<AvatarGroup isBordered max={13} className='ps-3 justify-start border-transparent'>
							{task.assignments.map((i) => {
								return (
									<Tooltip
										key={i}
										content={`${i.user.name} ${user.id == i.user.id ? ' • (me)' : ''}`}
										size='sm'
									>
										<Avatar size='sm' src={i.user.src} className={`shrink-0 ring-1`} />
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
								defaultValue={task.assigmentIds}
								onChange={(ids) => update('assigmentIds', ids)}
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
			<div className='flex flex-col gap-1'>
				<span className='text-foreground text-tiny mt-2'>Description</span>
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
			</div>
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
						<form onSubmit={(e) => onSubmitComment(e, inputs)}>
							<Textarea
								placeholder='What are you thinking?'
								size='sm'
								radius='full'
								fullWidth
								isRequired
								minRows={1}
								description={`${files.length} file(s) attached`}
								value={inputs.comment}
								onValueChange={(e) => setInputs({ ...inputs, comment: e })}
								startContent={<Avatar src={user?.src} size='sm' className='shrink-0' />}
								endContent={
									<>
										<label
											className='z-0 flex items-center justify-center rounded-full px-0 min-w-8 w-8 h-8 bg-default text-default-foreground hover:opacity-70'
											htmlFor='attachments'
										>
											<FilePlusIcon />
										</label>
										<input
											id='attachments'
											type='file'
											multiple
											accept='.xlsx,.xls,image/*,.doc, .docx,.ppt, .pptx,.txt,.pdf'
											className='hidden'
											onChange={handleFileSelected}
										/>
										<Button
											size='sm'
											isIconOnly
											color='primary'
											type='submit'
											radius='full'
											className='ms-2'
											isLoading={isSaving}
											startContent={<PaperPlaneIcon />}
										/>
									</>
								}
							/>
						</form>
						{task.comments?.map((i: any, index: any) => {
							return (
								<div
									key={index}
									className={`flex gap-2 max-w-[80%] m-auto ${
										i.creator.id == user.id ? 'ms-0' : 'flex-row-reverse me-0'
									}`}
								>
									<Avatar src={i.creator.src} size='sm' className='shrink-0' />
									<div className='flex flex-col gap-1'>
										<div className='flex gap-2 '>
											<div
												className={`flex ${
													i.creator?.id == user.id ? `flex-row` : `flex-row-reverse`
												}`}
											>
												<span
													className={`arrow  ${
														i.creator?.id == user.id
															? `before:border-x-transparent before:border-b-transparent before:border-t-primary before:content-['']`
															: `after:border-x-transparent after:border-b-transparent after:border-t-default-100 after:content-['']`
													}`}
												></span>
												<div
													className={`shadow-lg w-fit h-auto px-2 py-1 rounded-xl text-sm text-ellipsis text-content5 font-light overflow-hidden break-words text-start ${
														i.creator?.id == user.id
															? 'ms-0 bg-primary rounded-tl-none text-primary-foreground'
															: 'me-0 bg-default-100 rounded-tr-none'
													}`}
												>
													{i.comment}
												</div>
											</div>
											{i.creator.id === user.id && (
												<Button
													size='sm'
													isIconOnly
													color='danger'
													radius='full'
													variant='light'
													onClick={() => onDeleteComment(i.id)}
													startContent={<TrashIcon />}
												/>
											)}
										</div>
										{i.files.length > 0 && (
											<AvatarGroup
												isBordered
												renderCount={1}
												max={10}
												className={
													i.creator.id == user.id
														? 'flex justify-start mt-1'
														: 'flex justify-end mt-1'
												}
											>
												{i.files?.map((file) => {
													const imageUrl = file.type.includes('image')
														? file.src
														: `/${file.name.split('.').pop()}.png`;
													return (
														<Tooltip content={file.name} size='sm' key={file.id}>
															<Avatar
																size='lg'
																src={imageUrl}
																onClick={() => window.open(file.src)}
																radius='sm'
																className={`shrink-0 ring-1`}
															/>
														</Tooltip>
													);
												})}
											</AvatarGroup>
										)}
										<div
											className={`text-tiny text-foreground-400 truncate text-ellipsis line-clamp-1 ${
												i.creator.id == user.id ? 'text-start' : 'text-end'
											}`}
										>
											<span>
												{i.creator.id === user.id
													? 'Me'
													: `${
															i.creator.username
																? `@${i.creator.username}`
																: i.creator.email
													  }`}
											</span>
											{i.files.length > 0 && (
												<>
													{' • '}
													<span className=' underline'>Added some files</span>
												</>
											)}
											<span> • {format(i?.createdAt)}</span>
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
							console.log(item);
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
			<div className='flex w-full gap-2 justify-between items-center '>
				<hr className='w-full' />
				<div className='w-full flex flex-col items-center justify-center m-auto'>
					<span className='text-foreground text-tiny'>
						Task created by {task.creatorId === user.id ? 'me' : task?.creator.name}
					</span>
					<span className='text-foreground text-tiny'>{format(task?.createdAt)}</span>
				</div>
				<hr className='w-full' />
			</div>
		</ModalBody>
	);
};
