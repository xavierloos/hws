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
	CameraIcon,
	GitHubLogoIcon,
	LinkedInLogoIcon,
	InstagramLogoIcon,
	TwitterLogoIcon,
	PaperPlaneIcon,
	PersonIcon,
	ImageIcon,
} from '@radix-ui/react-icons';
import dateFormat from 'dateformat';
import { CiAt } from 'react-icons/ci';
import { parseDate } from '@internationalized/date';

export const Account = ({ user }: any) => {
	const [fields, setFields] = useState(user);

	const [preview, setPreview] = useState(null);
	const [avatar, setAvatar] = useState(null);

	// const onSubmit = async (e: any) => {
	// 	e.preventDefault();
	// 	startTransition(async () => {
	// 		if (preview) {
	// 			const data = new FormData();
	// 			data.append(avatar?.name, avatar);
	// 			await axios.post(`/api/files?type=profiles`, data);
	// 			fields.image = `${fields.id}.${avatar?.type.split('/')[1]}`;
	// 		}
	// 		await axios
	// 			.put(`/api/members/${fields.id}?type=profile`, fields)
	// 			.then((res) => {
	// 				if (res?.data.error) toast.error(res?.data.error);
	// 				if (res?.data.warning) toast.warning(res?.data.warning);
	// 				if (res?.data.success) toast.success(res?.data.success);
	// 			})
	// 			.catch();
	// 	});
	// };

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
					case 'name':
						setFields({ ...fields, name: value });
						break;
					case 'username':
						res?.data.success && setFields({ ...fields, username: value });
						break;
					case 'about':
						setFields({ ...fields, about: value });
						break;
					case 'birthday':
						setFields({ ...fields, birthday: value });
						break;
					default:
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
			<form onSubmit={(e) => update('about', fields.about, e)}>
				<Textarea
					size='md'
					type='text'
					radius='sm'
					placeholder='Add something about me'
					minRow={1}
					onValueChange={(e) => (fields.about = e)}
					isRequired
					endContent={
						<Tooltip content='Update' size='sm'>
							<Button size='sm' isIconOnly color='primary' radius='full' type='submit'>
								<PaperPlaneIcon />
							</Button>
						</Tooltip>
					}
				/>
			</form>
		);
	};

	return (
		<Card className='border-none max-w-md w-full rounded-md m-auto mt-3 p-4 text-default-foreground' shadow='sm'>
			<CardBody className='grid grid-cols-1 gap-2 items-center justify-center'>
				<div className='flex gap-3 items-center m-auto w-full'>
					<Popover showArrow placement='bottom' radius='sm' className=''>
						<PopoverTrigger>
							<Image
								radius='full'
								className=' w-32 h-32 object-cover shrink-0'
								src={preview ? preview : fields?.tempUrl}
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
					<div className='flex flex-col gap-1'>
						<Popover showArrow placement='bottom' radius='sm' className=''>
							<PopoverTrigger>
								<span className='font-semibold'>{fields?.name}</span>
							</PopoverTrigger>
							<PopoverContent radius='sm' className='p-0 min-w-[200px] border-none'>
								<form onSubmit={(e) => update('name', fields.name, e)}>
									<Input
										size='md'
										type='text'
										radius='sm'
										placeholder={fields.name}
										onValueChange={(e) => (fields.name = e)}
										startContent={<PersonIcon />}
										isRequired
										endContent={
											<Tooltip content='Update' size='sm'>
												<Button
													size='sm'
													isIconOnly
													color='primary'
													radius='full'
													type='submit'
												>
													<PaperPlaneIcon />
												</Button>
											</Tooltip>
										}
										// onKeyUp={(e) => setSearchMember(e.target.value)}
									/>
								</form>
							</PopoverContent>
						</Popover>

						<Popover showArrow placement='bottom' radius='sm' className=''>
							<PopoverTrigger>
								<span className='text-sm font-semibold flex items-center'>
									<CiAt /> {fields?.username}
								</span>
							</PopoverTrigger>
							<PopoverContent radius='sm' className='p-0 min-w-[200px] border-none'>
								<form onSubmit={(e) => update('username', fields.username, e)}>
									<Input
										size='md'
										type='text'
										radius='sm'
										placeholder={fields.username}
										// defaultValue={fields?.name}
										onValueChange={(e) => (fields.username = e)}
										startContent={<CiAt />}
										isRequired
										endContent={
											<Tooltip content='Update' size='sm'>
												<Button
													size='sm'
													isIconOnly
													color='primary'
													radius='full'
													type='submit'
												>
													<PaperPlaneIcon />
												</Button>
											</Tooltip>
										}
										// onKeyUp={(e) => setSearchMember(e.target.value)}
									/>
								</form>
							</PopoverContent>
						</Popover>
						<span className='text-sm font-semi text-foreground'>{fields?.email}</span>
						<div className='flex gap-1 flex-wrap items-center w-full '>
							<Tooltip content={`x.com/${fields?.username}`} size='sm'>
								<Button
									size='sm'
									isIconOnly
									radius='full'
									color='primary'
									// onClick={() => regenerate("content")}
								>
									<TwitterLogoIcon />
								</Button>
							</Tooltip>
							<Tooltip content={`github.com/${fields?.username}`} size='sm'>
								<Button
									size='sm'
									isIconOnly
									radius='full'
									color='primary'
									// onClick={() => regenerate("content")}
								>
									<GitHubLogoIcon />
								</Button>
							</Tooltip>
							<Tooltip content={`instagram.com/${fields?.username}`} size='sm'>
								<Button
									size='sm'
									isIconOnly
									radius='full'
									color='primary'
									// onClick={() => regenerate("content")}
								>
									<InstagramLogoIcon />
								</Button>
							</Tooltip>
							<Tooltip content={`linkedin.com/${fields?.username}`} size='sm'>
								<Button size='sm' isIconOnly radius='full' color='primary'>
									<LinkedInLogoIcon />
								</Button>
							</Tooltip>
							{/*	<Tooltip content={`facebook.com/${fields.username}`} size='sm'>
						<Button
							size='sm'
							isIconOnly
							radius='full'
							color='primary'
						 
						>
							<FaFacebook />
						</Button>
					</Tooltip>*/}
							{/* <Tooltip content={`mailto:${fields?.email}`} size='sm'>
								<Button
									size='sm'
									isIconOnly
									radius='full'
									color='primary'
									// onClick={() => regenerate("content")}
								>
									<EnvelopeClosedIcon />
								</Button>
							</Tooltip> */}
							{/*	<Tooltip content={`tel:${fields.tel}`} size='sm'>
						<Button
							size='sm'
							isIconOnly
							radius='full'
							color='primary'
							// onClick={() => regenerate("content")}
						>
							<BiPhone />
						</Button>
					</Tooltip> */}
						</div>
					</div>
				</div>
				<div className='grid gap-3'>
					<div>
						<h5>Bio</h5>
						{!fields.about ? (
							<About />
						) : (
							<Popover showArrow placement='bottom' radius='sm' className=''>
								<PopoverTrigger>
									<small className='italic font-light text-foreground'>{fields?.about}</small>
								</PopoverTrigger>
								<PopoverContent radius='sm' className='p-0 min-w-[200px] border-none'>
									<About />
								</PopoverContent>
							</Popover>
						)}
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
				<Button
					size='md'
					color='danger'
					radius='none'
					variant='flat'
					// onClick={() => regenerate('content')}
					fullWidth
					// isDisabled={user?.permission == 'DELETE' || user?.permission == 'ALL' ? false : true}
				>
					DELETE MY PROFILE
				</Button>
			</CardBody>
		</Card>
	);
};
