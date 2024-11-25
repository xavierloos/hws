import {
	Textarea,
	Input,
	Button,
	DatePicker,
	Image,
	Tooltip,
	Popover,
	PopoverContent,
	PopoverTrigger,
	Card,
	CardBody,
	Avatar,
	Chip,
	Radio,
	RadioGroup,
	Switch,
	cn,
} from '@nextui-org/react';
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import {
	ExternalLinkIcon,
	InfoCircledIcon,
	CameraIcon,
	GitHubLogoIcon,
	LinkedInLogoIcon,
	InstagramLogoIcon,
	TwitterLogoIcon,
	PaperPlaneIcon,
	PersonIcon,
	ImageIcon,
	CopyIcon,
	EnvelopeClosedIcon,
} from '@radix-ui/react-icons';
import dateFormat from 'dateformat';
import { CiAt } from 'react-icons/ci';
import { FaFacebookF } from 'react-icons/fa6';
import { parseDate } from '@internationalized/date';
import { BiPhone } from 'react-icons/bi';
import { useCurrentUser } from '@/hooks/use-current-user';
type Props = {
	user: any;
	getData: (sort?: string) => {};
};

export const View = ({ user, getData }: Props) => {
	const currentUser = useCurrentUser();

	const [fields, setFields] = useState(user?.[0]);
	const icons = {
		facebook: <FaFacebookF />,
		instagram: <InstagramLogoIcon />,
		twitter: <TwitterLogoIcon />,
		github: <GitHubLogoIcon />,
		linkedin: <LinkedInLogoIcon />,
	};
	let options = {
		role: ['SUPERADMIN', 'ADMIN', 'USER'],
		permission: ['READONLY', 'EDIT', 'CREATE', 'DELETE', 'ALL'],
		modify: ['EDIT', 'ALL'],
	};

	const update = async (field: string, value: any, e?: React.ChangeEvent<HTMLInputElement>) => {
		e?.preventDefault();

		await axios
			.put(`/api/members?id=${fields.id}`, { [field]: value })
			.then((res) => {
				setFields({ ...fields, [field]: value });
				if (res?.data.error) toast.error(res?.data.error);
				if (res?.data.warning) toast.warning(res?.data.warning);
				if (res?.data.success) toast.success(res?.data.success);
			})
			.catch();
		getData();
	};

	const UpdateField = ({ field }: any) => {
		return (
			<div className='w-full flex justify-between items-center'>
				<h5 className='capitalize'>{field}</h5>
				{options.modify.includes(currentUser.permission) ? (
					<Popover showArrow placement='bottom' radius='sm'>
						<PopoverTrigger>
							<Chip radius='sm' variant='flat'>
								{fields[field]}
							</Chip>
						</PopoverTrigger>
						<PopoverContent className='p-4 min-w-[200px] border-none radius-none'>
							<RadioGroup
								size='sm'
								label={`Change ${field}`}
								className='w-full justify-start mb-2'
								defaultValue={fields[field]}
								onValueChange={(e) => update(field, e)}
							>
								{options[field as keyof typeof options].map((i) => {
									return (
										<Radio
											key={i}
											size='sm'
											value={i}
											isDisabled={i == fields[field] ? true : false}
										>
											{i}
										</Radio>
									);
								})}
							</RadioGroup>
						</PopoverContent>
					</Popover>
				) : (
					<small>{fields[field]}</small>
				)}
			</div>
		);
	};

	const onDelete = async (id: string, name: string, isActive: boolean) => {
		toast.warning(`Are you sure you want to delete: ${name}?`, {
			description: isActive
				? 'You could make the status inactive to deny access!'
				: 'All records will be deleted!',
			duration: 9000,
			cancel: {
				label: 'NO',
				onClick: () => console.log('Cancel!'),
			},
			action: {
				label: 'YES',
				onClick: async () => {
					try {
						await axios
							.delete(`/api/members?id=${id}`)
							.then((res) => {
								toast.success(res.data.message);
							})
							.then(() => {
								getData();
							});
					} catch (e) {
						toast.error(e.response.data.error.meta.cause);
					}
				},
			},
		});
	};

	return (
		<div className='grid gap-3'>
			<div className='flex gap-3 items-center m-auto w-full'>
				<div className='flex shrink-0'>
					<Image
						radius='full'
						className=' w-32 h-32 object-cover shrink-0'
						src={fields?.src}
						alt={`${fields?.name} profile cover`}
					/>
				</div>
				<div className='flex flex-col gap-1 w-full'>
					<div className='font-semibold flex items-center gap-2'>
						<PersonIcon /> {fields.name}
					</div>
					<div className='font-semibold flex items-center gap-2'>
						<EnvelopeClosedIcon /> {fields?.email}
					</div>
					<div className='font-semibold flex items-center gap-2'>
						<CiAt /> {fields.username}
					</div>
					{fields.tel && (
						<div className='font-semibold flex items-center gap-2'>
							<BiPhone /> {fields.tel}
						</div>
					)}

					<div className='flex gap-1 flex-wrap items-center w-full '>
						{fields?.social &&
							Object.keys(fields.social).map((key) => {
								if (key !== 'id' && key !== 'userId' && fields.social[key]) {
									const socialIcon = icons[key as keyof typeof icons];
									return (
										<Tooltip
											content={
												<div className='w-full flex gap-2'>
													<span>
														{key}.com/{fields.social[key]}
													</span>
													<CopyIcon />
												</div>
											}
											size='sm'
										>
											<Button
												size='sm'
												isIconOnly
												radius='full'
												color='primary'
												startContent={socialIcon}
											/>
										</Tooltip>
									);
								}
							})}
					</div>
				</div>
			</div>
			<div className='grid gap-3'>
				{fields.about && (
					<div>
						<h5>Bio</h5>
						<small className='italic font-light text-foreground'>{fields.about}</small>
					</div>
				)}
				{fields.birthday && (
					<div className='w-full flex justify-between items-center'>
						<h5>Birthday </h5>
						<small>{dateFormat(fields?.birthday, 'ddd dS, mmmm, yyyy')}</small>
					</div>
				)}
				<div className='w-full flex justify-between items-center'>
					<h5>Member since</h5>
					<small>{dateFormat(fields?.createdAt, 'ddd dS, mmmm, yyyy')}</small>
				</div>
				<UpdateField field='role' />
				<UpdateField field='permission' />
				<div className='w-full flex justify-between items-center'>
					<h5>Status</h5>
					<small className='flex items-center align-middle'>
						<Switch
							onValueChange={(e) => update('isActive', e)}
							defaultSelected={fields.isActive}
							classNames={{
								wrapper: `p-0 h-4 overflow-visible hidden ${
									options.modify.includes(currentUser.permission) && 'flex'
								}`,
								thumb: cn(
									'w-6 h-6 border-2 shadow-sm  bg-content1',
									'group-data-[hover=true]:border-primary',
									//selected
									'group-data-[selected=true]:ml-6',
									// pressed
									'group-data-[pressed=true]:w-7',
									'group-data-[selected]:group-data-[pressed]:ml-4'
								),
							}}
							isDisabled={options.modify.includes(currentUser.permission) ? false : true}
						>
							<div className='flex flex-col gap-1'>
								<small className='text-tiny text-default-400 flex gap-1 items-center'>
									{fields.isActive ? 'Active' : 'Inactive'}
								</small>
							</div>
						</Switch>
					</small>
				</div>
			</div>
			{(currentUser.permission == 'ALL' || currentUser.permission == 'DELETE') && (
				<Button
					size='md'
					color='danger'
					radius='none'
					variant='flat'
					fullWidth
					onClick={() => onDelete(fields.id, fields.name, fields.isActive)}
				>
					DELETE PROFILE
				</Button>
			)}
		</div>
	);
};
