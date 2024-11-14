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

export const Account = ({ user }: any) => {
	const [fields, setFields] = useState(user);
	const [preview, setPreview] = useState(null);
	const [avatar, setAvatar] = useState(null);
	let socialInput: null;

	const handleAvatarSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			setAvatar(e.target.files[0]);
			setPreview(URL.createObjectURL(e.target.files[0]));
		}
	};

	const update = async (field: string, value: any, e?: React.ChangeEvent<HTMLInputElement>) => {
		e?.preventDefault();

		if (preview) {
			const data = new FormData();
			data.append(avatar?.name, avatar);
			await axios.post(`/api/files?type=profiles`, data);
			value = `${fields.id}.${avatar?.type.split('/')[1]}`;
		}

		await axios
			.put(`/api/members/${fields.id}`, { [field]: value })
			.then((res) => {
				switch (field) {
					case 'facebook':
					case 'twitter':
					case 'instagram':
					case 'linkedin':
					case 'github':
						setFields({
							...fields,
							social: {
								...fields.social,
								[field]: value,
							},
						});
						break;
					case 'username':
						res?.data.success && setFields({ ...fields, [field]: value });
						break;
					default:
						setFields({ ...fields, [field]: value });
						break;
				}
				if (res?.data.error) toast.error(res?.data.error);
				if (res?.data.warning) toast.warning(res?.data.warning);
				if (res?.data.success) toast.success(res?.data.success);
			})
			.catch();
	};

	const About = () => {
		return (
			<Popover showArrow placement='bottom' radius='sm'>
				<PopoverTrigger>
					<small className='italic font-light text-foreground'>
						{fields.about ? fields.about : 'Add bio'}
					</small>
				</PopoverTrigger>
				<PopoverContent radius='sm' className='p-0 min-w-[200px] border-none'>
					<form onSubmit={(e) => update('about', fields.about, e)}>
						<Textarea
							size='md'
							type='text'
							radius='sm'
							placeholder='Add something about me'
							defaultValue={fields.about}
							minRow={2}
							onValueChange={(e) => (fields.about = e)}
							isRequired
							fullWidth
							endContent={
								<Tooltip content='Update' size='sm'>
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

	const Social = ({ media, icon }: any) => {
		return (
			<Popover showArrow placement='bottom' radius='sm'>
				<Tooltip
					content={
						<div className='w-full flex gap-2'>
							<span>
								{media}.com/{fields.social?.[media]}
							</span>
							<ExternalLinkIcon />
							<CopyIcon />
						</div>
					}
					size='sm'
					isDisabled={fields.social?.[media] ? false : true}
				>
					<div>
						<PopoverTrigger>
							<Button
								size='sm'
								isIconOnly
								radius='full'
								variant={fields.social?.[media] ? 'solid' : 'flat'}
								color={fields.social?.[media] ? 'primary' : 'default'}
								startContent={icon}
							/>
						</PopoverTrigger>
					</div>
				</Tooltip>
				<PopoverContent radius='sm' className='p-0 min-w-[200px] border-none'>
					<form onSubmit={(e) => update(media, socialInput, e)}>
						<Input
							size='md'
							type='text'
							radius='sm'
							placeholder={`Add ${media}`}
							defaultValue={fields.social?.[media]}
							onValueChange={(e) => (socialInput = e)}
							startContent={icon}
							isRequired
							endContent={
								<Tooltip content={`Update ${media}`} size='sm'>
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

	const UpdateForm = ({ field, icon, classes }: any) => {
		return (
			<Popover showArrow placement='bottom' radius='sm' className=''>
				<PopoverTrigger>
					<span className={classes}>
						{icon} {fields[field] ? fields[field] : `Add ${field}`}
					</span>
				</PopoverTrigger>
				<PopoverContent radius='sm' className='p-0 min-w-[200px] border-none'>
					<form onSubmit={(e) => update(field, fields[field], e)}>
						<Input
							size='md'
							type={field == 'tel' ? 'tel' : 'text'}
							radius='sm'
							defaultValue={fields[field]}
							placeholder={field == 'tel' ? '123-456-7890' : `Add ${field}`}
							pattern={field == 'tel' ? '[0-9]{3}-[0-9]{3}-[0-9]{4}' : null}
							onValueChange={(e) => (fields[field] = e)}
							startContent={icon}
							isRequired
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

	return (
		<Card className='border-none max-w-md w-full rounded-md m-auto mt-3 p-4 text-default-foreground' shadow='sm'>
			<CardBody className='grid grid-cols-1 gap-2 items-center justify-center'>
				<div className='flex gap-3 items-center m-auto w-full'>
					<div className='flex shrink-0'>
						<Popover showArrow placement='bottom' radius='sm' className=''>
							<PopoverTrigger>
								<Image
									radius='full'
									className=' w-32 h-32 object-cover shrink-0'
									src={preview ? preview : fields?.src}
									alt={`${fields?.name} profile cover`}
								/>
							</PopoverTrigger>
							<PopoverContent radius='sm' className='p-0 min-w-[200px] border-none'>
								<form
									onSubmit={(e) => update('image', avatar, e)}
									className='relative w-full inline-flex tap-highlight-transparent flex-row items-center shadow-sm px-2 gap-1 bg-default-100 hover:bg-default-200   h-10 min-h-10 rounded-small transition-background !duration-150 outline-none group-data-[focus-visible=true]:z-10'
								>
									{preview ? (
										<Avatar radius='none' src={preview} className='w-5 h-5 shrink-0 my-auto' />
									) : (
										<ImageIcon className='w-5 h-5 shrink-0 my-auto' />
									)}
									<label
										htmlFor='uploadfiles'
										className='flex w-full items-center justify-start max-w-[200px] h-8 z-0 my-auto'
									>
										<span className='overflow-ellipsis line-clamp-1 break-all'>
											{avatar ? avatar.name : `Select new image`}
										</span>
									</label>
									<Tooltip content='Update' size='sm'>
										<Button size='sm' isIconOnly color='primary' radius='full' type='submit'>
											<PaperPlaneIcon />
										</Button>
									</Tooltip>
								</form>
							</PopoverContent>
						</Popover>
						<input
							id='uploadfiles'
							type='file'
							accept='image/*'
							className='hidden'
							onChange={handleAvatarSelected}
						/>
					</div>
					<div className='flex flex-col gap-1 w-full'>
						<div className='w-full flex justify-between items-center'>
							<UpdateForm
								field='name'
								icon={<PersonIcon />}
								classes='font-semibold flex items-center gap-2'
							/>
							<Tooltip content='Click on the fields to modify' size='sm'>
								<InfoCircledIcon />
							</Tooltip>
						</div>
						<span className='text-sm font-semi text-foreground  flex items-center gap-2'>
							<EnvelopeClosedIcon />
							{fields?.email}
						</span>
						<UpdateForm
							field='username'
							icon={<CiAt />}
							classes='text-sm font-semi flex gap-2 items-center'
						/>
						<UpdateForm
							field='tel'
							icon={<BiPhone />}
							classes='text-sm font-semi flex gap-2 items-center'
						/>
						<div className='flex gap-1 flex-wrap items-center w-full '>
							<Social media='facebook' icon={<FaFacebookF />} />
							<Social media='twitter' icon={<TwitterLogoIcon />} />
							<Social media='instagram' icon={<InstagramLogoIcon />} />
							<Social media='linkedin' icon={<LinkedInLogoIcon />} />
							<Social media='github' icon={<GitHubLogoIcon />} />
						</div>
					</div>
				</div>
				<div className='grid gap-3'>
					<div>
						<h5>Bio</h5>
						<About />
					</div>
					<div className='w-full flex justify-between items-center'>
						<h5>Birthday </h5>
						<DatePicker
							variant='underlined'
							defaultValue={fields.birthday && parseDate(fields.birthday)}
							className='birthday max-w-[130px]'
							onChange={(date: any) => {
								const m = `${date?.month <= 9 ? '0' : ''}${date?.month}`;
								const d = `${date?.day <= 9 ? '0' : ''}${date?.day}`;
								update('birthday', `${date.year}-${m}-${d}`);
							}}
						/>
					</div>
					<div className='w-full flex justify-between items-center'>
						<h5>Member since</h5>
						<small>{dateFormat(fields?.createdAt, 'dd/mmm/yy')}</small>
					</div>
					<div className='w-full flex justify-between items-center'>
						<h5>Role</h5>
						<small>{fields.role}</small>
					</div>
					<div className='w-full flex justify-between items-center'>
						<h5>Permissions</h5>
						<small>{fields.permission}</small>
					</div>
				</div>
				<Button size='md' color='danger' radius='none' variant='flat' fullWidth>
					DELETE MY PROFILE
				</Button>
			</CardBody>
		</Card>
	);
};
