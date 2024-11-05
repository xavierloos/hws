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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { now, getLocalTimeZone, DateValue, today, parseAbsoluteToLocal } from '@internationalized/date';
import { FilePreviewer } from '@/components/filePreviewer';
import { modules, formats } from '@/react-quill-settings';

type Props = {
	item: any;
	onSubmit: (e: any, values: any, files: any) => {};
	isSaving: boolean;
	getData: (sort?: string) => {};
};

export const View = ({ item, onSubmit, isSaving, getData }: Props) => {
	const user = useCurrentUser();
	console.log(user);
	const [groupSelected, setGroupSelected] = useState([]);
	const [searchMember, setSearchMember] = useState(null);
	const [team, setTeam] = useState([]);
	const [images, setImages] = useState([]);
	const [isPending, startTransition] = useTransition();
	const [files, setFiles] = useState<File[]>([]);
	const [fields, setFields] = useState(item?.[0]);
	const markup = { __html: fields.description };
	const [comments, setComments] = useState([]);
	const [add, setAdd] = useState({
		image: false,
		category: false,
	});
	const [inputs, setInputs] = useState({
		comment: null,
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
		item?.assignedTo?.map((i) => {
			members.push(i.id);
		});
		setGroupSelected(members);
		// getComments();
		getMembers();
	}, [item]);

	const getComments = async () => {
		await axios
			.get(`/api/comments?id=${fields.id}`)
			.then(async (res) => {
				setComments(res.data);
			})
			.catch((e) => {});

		getMembers();
	};

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

	const onDeleteSelected = (index: number) => {
		const _files = Array.from(files);
		_files.splice(index, 1);
		setFiles(_files);
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
		console.log(values);
		await axios
			.post('/api/comments', values)
			.then(async (res) => {
				setInputs({
					comment: undefined,
					attachments: null,
					relatedId: undefined,
				});
				setFields({
					...fields,
					comments: [
						{
							comment: values.comment,
							createdAt: new Date(),
							user: {
								id: user.id,
								image: user.tempUrl,
								username: user.username,
							},
						},
						...(fields.comments || []),
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
		getComments();
	};

	const update = async (field: string, value: any) => {
		switch (field) {
			case 'priority':
				value = priorities.find((priority) => priority.name === value);
				break;
			case 'status':
				value = status.find((st) => st.name === value);
				break;
			case 'assignedUserIds':
				fields.assignedTo = team.filter((user) => value.includes(user.id));
				fields.ssignedUserIds = team.filter((t) => value.includes(t?.id));
				break;
			default:
				break;
		}
		await axios
			.put(`/api/tasks/${fields.id}?type=${field}`, { [field]: value })
			.then(() => {
				setFields({ ...fields, [field]: value });
				toast.success('Task updated successfully');
			})
			.catch((e) => {});
		console.log(fields);
		getData();
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
						src: item.tempUrl,
					}}
				/>
			</Checkbox>
		);
	};

	return (
		<ModalBody>
			<div className='m-0 p-0'>
				<span className='text-foreground text-tiny m-0 p-0'>
					Due {format(fields.dueDate)} • on {dateFormat(fields.dueDate, 'ddd dd/mmm/yy - HH:MM')}{' '}
				</span>
				<div className='flex justify-between'>
					<h2 className='m-0 p-0'>{fields.name}</h2>
					<div className='flex gap-1'>
						<Button size='sm' isIconOnly variant='flat' type='submit' radius='full'>
							<Share1Icon />
						</Button>
						<Button size='sm' isIconOnly variant='flat' color='danger' type='submit' radius='full'>
							<TrashIcon />
						</Button>
					</div>
				</div>
			</div>
			<div className='flex gap-3 flex-wrap'>
				<div className='flex flex-col gap-1'>
					<span className='text-foreground text-tiny m-0 p-0'>Priority</span>
					<Popover showArrow placement='bottom' radius='sm'>
						<PopoverTrigger>
							<Chip radius='sm' color={fields.priority.color} className='shadow-md'>
								{fields.priority.name}
							</Chip>
						</PopoverTrigger>
						<PopoverContent className='p-4 min-w-[200px] border-none radius-none'>
							<RadioGroup
								size='sm'
								label='Change priority'
								className='w-full justify-start mb-2'
								defaultValue={fields.priority.name}
								onValueChange={(e) => update('priority', e)}
							>
								{priorities?.map((i) => {
									return (
										<Radio
											size='sm'
											value={i.name}
											isDisabled={i == fields.priority ? true : false}
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
							<Chip radius='sm' color={fields.status.color} className='shadow-md'>
								{fields.status.name}
							</Chip>
						</PopoverTrigger>
						<PopoverContent className='p-4 min-w-[200px] border-none radius-none'>
							<RadioGroup
								size='sm'
								label='Change status'
								className='w-full justify-start mb-2'
								defaultValue={fields.status.name}
								onValueChange={(e) => update('status', e)}
							>
								{status?.map((i) => {
									return (
										<Radio size='sm' value={i.name} isDisabled={i == fields.status ? true : false}>
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
							<Chip radius='sm' color={fields.type} className='shadow-md'>
								{fields.type}
							</Chip>
						</PopoverTrigger>
						<PopoverContent className='p-4 min-w-[200px] border-none radius-none'>
							<RadioGroup
								size='sm'
								label='Change type'
								className='w-full justify-start mb-2'
								defaultValue={fields.type}
								onValueChange={(e) => update('type', e)}
							>
								{types?.map((i) => {
									return (
										<Radio size='sm' value={i.name} isDisabled={i == fields.type ? true : false}>
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
				<span className='text-foreground text-tiny m-0 p-0'>Team</span>
				<AvatarGroup isBordered max={13} className='px-3 justify-start border-transparent'>
					{fields?.assignedTo?.map((i) => {
						return (
							<Tooltip key={i} content={`${i.name} ${user.email == i.email ? ' • (me)' : ''}`} size='sm'>
								<Avatar size='sm' src={i.image} className={`shrink-0 ring-1`} />
							</Tooltip>
						);
					})}
					<Popover showArrow placement='bottom' radius='sm'>
						<PopoverTrigger>
							<Avatar
								size='sm'
								color='primary'
								showFallback
								className={`shrink-0 ring-1`}
								fallback={<PlusIcon className='text-foreground' fill='currentColor' />}
							/>
						</PopoverTrigger>
						<PopoverContent radius='sm' className='p-4 min-w-[200px] border-none radius-none'>
							<CheckboxGroup
								defaultValue={fields.assignedUserIds}
								onChange={(ids) => update('assignedUserIds', ids)}
								classNames='w-full overflow-y-hidden'
								style={{ overflow: 'scroll' }}
							>
								<Input
									size='sm'
									type='text'
									placeholder='Search member'
									onKeyUp={(e) => setSearchMember(e.target.value)}
								/>
								{team?.map((i, index) => {
									if (searchMember) {
										if (i.name?.toLowerCase().includes(searchMember?.toLowerCase())) {
											return <MemberCheckBox item={i} key={index} />;
										}
									} else {
										return <MemberCheckBox item={i} key={index} />;
									}
								})}
							</CheckboxGroup>
						</PopoverContent>
					</Popover>
				</AvatarGroup>
			</div>
			<div dangerouslySetInnerHTML={markup} className='markup text-sm text-foreground-600' />
			<User
				className='w-full justify-start'
				avatarProps={{
					size: 'sm',
					className: 'shrink-0',
					src: fields?.createdBy?.image,
				}}
				description={
					<span className='text-tiny truncate text-ellipsis line-clamp-1'>{format(fields?.createdAt)}</span>
				}
				name={
					<span
						className={`text-sm w-full text-ellipsis font-medium overflow-hidden break-words line-clamp-1`}
					>
						By {fields.creatorId === user.email ? 'me' : fields?.createdBy?.name}
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
								<span>{fields.comments.length} Comments</span>
							</div>
						}
					>
						<div className='flex gap-3 flex-col comments'>
							<form onSubmit={(e) => onSubmitComment(e, inputs, files, fields?.id)}>
								<Textarea
									placeholder='What are you thinking?'
									size='sm'
									radius='full'
									fullWidth
									isRequired
									minRows={1}
									description={`0 Files attached`}
									onValueChange={(e) => setInputs({ ...inputs, comment: e })}
									startContent={<Avatar src={user?.tempUrl} size='sm' className='shrink-0' />}
									endContent={
										<>
											<Button
												size='sm'
												isIconOnly
												color='foreground'
												// type="submit"
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
							{fields.comments?.map((i) => {
								return (
									<div
										className={`flex gap-2 max-w-[80%] m-auto ${
											i.user.id == user.id ? 'ms-0' : 'flex-row-reverse me-0'
										}`}
									>
										<Avatar src={i.user.image} size='sm' className='shrink-0' />
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
					{fields.attachments && (
						<Tab
							key='attachments'
							title={
								<div className='flex items-center space-x-2'>
									<FileIcon />
									<span>{fields.attachments.length} Attachments</span>
								</div>
							}
						>
							{fields.attachments.map((item, index) => {
								item.index = index; //To delete from the uploading list
								return <FilePreviewer item={item} key={index} onDelete={onDeleteSelected} />;
							})}
						</Tab>
					)}
				</Tabs>
			</div>
		</ModalBody>
	);
};
