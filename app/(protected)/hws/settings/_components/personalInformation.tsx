import {
	Accordion,
	AccordionItem,
	Textarea,
	Input,
	Select,
	SelectItem,
	Avatar,
	Button,
	DatePicker,
	Badge,
	Image,
	Tooltip,
	Switch,
} from '@nextui-org/react';
import { UserRole } from '@prisma/client';
import { useEffect, useState, useTransition } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import {
	CameraIcon,
	Pencil1Icon,
	Pencil2Icon,
	GitHubLogoIcon,
	LinkedInLogoIcon,
	InstagramLogoIcon,
	EnvelopeClosedIcon,
	FaFacebook,
	BiPhone,
	TwitterLogoIcon,
} from '@radix-ui/react-icons';
import dateFormat from 'dateformat';

export const PersonalInformation = ({ fields }: any) => {
	console.log(fields);
	const [isPending, startTransition] = useTransition();
	const [preview, setPreview] = useState(null);
	const [avatar, setAvatar] = useState<File[]>([]);

	const onSubmit = async (e: any) => {
		e.preventDefault();
		startTransition(async () => {
			if (preview) {
				const data = new FormData();
				data.append(avatar?.name, avatar);
				await axios.post(`/api/files?type=profiles`, data);
				fields.image = `${fields.id}.${avatar?.type.split('/')[1]}`;
			}
			await axios
				.put(`/api/members/${fields.id}?type=profile`, fields)
				.then((res) => {
					if (res?.data.error) toast.error(res?.data.error);
					if (res?.data.warning) toast.warning(res?.data.warning);
					if (res?.data.success) toast.success(res?.data.success);
				})
				.catch();
		});
	};

	const handleAvatarSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			setAvatar(e.target.files[0]);
			setPreview(URL.createObjectURL(e.target.files[0]));
		}
	};

	return (
		<div className='flex flex-col gap-3 p-6 max-w-[400px] m-auto justify-center border-none shadow-lg rounded-md bg-content1 '>
			<div className='flex gap-1 flex-col justify-center items-center m-auto w-full'>
				<Image
					radius='full'
					className=' w-40 h-40 object-cover'
					src={fields.tempUrl}
					alt={`${fields.name} profile cover`}
				/>
				<span className='font-semibold'>{fields.name}</span>
				<small>@{fields.username}</small>
				<div className='flex gap-3 justify-center items-center w-full '>
					<Tooltip content={`x.com/${fields.username}`} size='sm'>
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
					<Tooltip content={`github.com/${fields.username}`} size='sm'>
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
					<Tooltip content={`instagram.com/${fields.username}`} size='sm'>
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
					<Tooltip content={`linkedin.com/${fields.username}`} size='sm'>
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
					<Tooltip content={`mailto:${fields.email}`} size='sm'>
						<Button
							size='sm'
							isIconOnly
							radius='full'
							color='primary'
							// onClick={() => regenerate("content")}
						>
							<EnvelopeClosedIcon />
						</Button>
					</Tooltip>
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
			<div className='grid gap-2'>
				<div>
					<h5>About me</h5>
					<small className='italic font-light text-foreground'>{fields.about}</small>
				</div>
				<div className='w-full flex justify-between items-center'>
					<h5>Member since</h5>
					<small>{dateFormat(fields[0]?.createdAt, 'dd/mmm/yy')}</small>
				</div>
				<div className='w-full flex justify-between items-center'>
					<h5>Birthday</h5>
					<small>{dateFormat(fields.birthday, 'dd/mmm/yy')}</small>
				</div>
				<div className='w-full flex justify-between items-center'>
					<h5>Role</h5>
					<Select
						size='sm'
						className='max-w-[150px]'
						defaultSelectedKeys={['superadmin']}
						// isDisabled={user?.permission == 'EDIT' || user?.permission == 'ALL' ? false : true}
					>
						<SelectItem key='superadmin'>Superadmin</SelectItem>
						<SelectItem key='admin'>Admin</SelectItem>
						<SelectItem key='user'>User</SelectItem>
					</Select>
				</div>
				<div className='w-full flex justify-between items-center'>
					<h5>Permissions</h5>
					<Select
						size='sm'
						className='max-w-[150px]'
						color='default'
						variant='solid'
						defaultSelectedKeys={['all']}
						// isDisabled={user?.permission == 'EDIT' || user?.permission == 'ALL' ? false : true}
					>
						<SelectItem key='all'>All</SelectItem>
						<SelectItem key='edit'>Edit</SelectItem>
						<SelectItem key='create'>Create</SelectItem>
						<SelectItem key='delete'>Delete</SelectItem>
					</Select>
				</div>
				<div className='w-full flex justify-between items-center'>
					<h5>Status</h5>
					<Switch
						size='sm'
						defaultSelected
						color='success'
						// isDisabled={user?.permission == 'EDIT' || user?.permission == 'ALL' ? false : true}
					>
						Active
					</Switch>
				</div>
			</div>

			<Button
				size='md'
				color='danger'
				radius='none'
				variant='light'
				// onClick={() => regenerate('content')}
				fullWidth
				// isDisabled={user?.permission == 'DELETE' || user?.permission == 'ALL' ? false : true}
			>
				DELETE PROFILE
			</Button>
		</div>
		// <form onSubmit={(e) => onSubmit(e)} className='flex flex-col gap-3 max-w-[600px] justify-center'>
		// 	<div className='grid grid-cols-[1fr,2fr] flex-grow-1 overflow-auto'>
		// 		<div className='flex flex-col items-center p-2'>
		// 			<Badge
		// 				size='lg'
		// 				isOneChar
		// 				shape='circle'
		// 				color='default'
		// 				showOutline={false}
		// 				placement='bottom-right'
		// 				content={
		// 					<label htmlFor='uploadfiles'>
		// 						<CameraIcon />
		// 					</label>
		// 				}
		// 			>
		// 				<Avatar
		// 					isBordered
		// 					src={preview || fields.tempUrl || fields.image}
		// 					className={` w-32 h-32 shrink-0 m-auto items-center ${
		// 						fields.role === 'SUPERADMIN'
		// 							? 'bg-primary text-foreground'
		// 							: fields.role === 'ADMIN'
		// 							? 'bg-foreground text-primary'
		// 							: 'bg-default text-default-foreground'
		// 					}`}
		// 					color={fields.role === 'SUPERADMIN' || fields.role === 'ADMIN' ? 'primary' : 'default'}
		// 				/>
		// 			</Badge>

		// 			<input
		// 				id='uploadfiles'
		// 				type='file'
		// 				accept='image/*'
		// 				className='hidden'
		// 				onChange={handleAvatarSelected}
		// 			/>
		// 		</div>
		// 		<div className='grid gap-3'>
		// 			<div className='grid grid-cols-1 gap-3'>
		// 				<Input
		// 					size='sm'
		// 					radius='sm'
		// 					type='text'
		// 					label='Full Name'
		// 					defaultValue={fields?.name}
		// 					onValueChange={(v) => (fields.name = v)}
		// 				/>
		// 				<Input
		// 					size='sm'
		// 					radius='sm'
		// 					type='text'
		// 					label='Username'
		// 					defaultValue={fields?.username}
		// 					onValueChange={(v) => (fields.username = v)}
		// 					placeholder='@username'
		// 				/>
		// 			</div>
		// 			<Input
		// 				size='sm'
		// 				isDisabled
		// 				radius='sm'
		// 				type='email'
		// 				label='Email'
		// 				defaultValue={fields?.email}
		// 				placeholder='john.doe@email.com'
		// 			/>
		// 		</div>
		// 	</div>
		// 	<div className='grid gap-3'>
		// 		<div className='grid gap-3 grid-cols-2'>
		// 			<Select
		// 				size='sm'
		// 				radius='sm'
		// 				label='User Role'
		// 				placeholder='Select a role'
		// 				// isDisabled={inputs?.role === "USER"}
		// 				onChange={(e) => (fields.role = e.target.value)}
		// 				defaultSelectedKeys={[fields?.role]}
		// 			>
		// 				{Object.keys(UserRole).map((key) => (
		// 					<SelectItem key={key} value={key}>
		// 						{key}
		// 					</SelectItem>
		// 				))}
		// 			</Select>
		// 			<Input
		// 				size='sm'
		// 				radius='sm'
		// 				type='text'
		// 				variant='flat'
		// 				defaultValue={fields?.tel}
		// 				onValueChange={(v) => (fields.tel = v)}
		// 				label='Phone Number'
		// 				placeholder='+44 0 123456789'
		// 			/>
		// 		</div>

		// 		<Textarea
		// 			size='sm'
		// 			radius='sm'
		// 			type='text'
		// 			label='About'
		// 			defaultValue={fields?.about}
		// 			onValueChange={(v) => (fields.about = v)}
		// 			placeholder='Something about myself'
		// 		/>
		// 	</div>
		// 	<div className='w-full justify-end flex mb-3'>
		// 		<Button
		// 			size='md'
		// 			color='danger'
		// 			variant='light'
		// 			// type="submit"
		// 			// isLoading={pending}
		// 		>
		// 			Delete Account
		// 		</Button>
		// 		<Button size='md' color='primary' type='submit' className='ms-2' isLoading={isPending}>
		// 			Save Changes
		// 		</Button>
		// 	</div>
		// </form>
	);
};
