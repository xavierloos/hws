import {
	Input,
	Select,
	SelectItem,
	Switch,
	cn,
	Button,
	Textarea,
	ModalBody,
	Avatar,
	Tooltip,
	Spinner,
} from '@nextui-org/react';
import { useEffect, useState, useTransition } from 'react';
import { useCurrentUser } from '@/hooks/use-current-user';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';
import { toast } from 'sonner';
import {
	AvatarIcon,
	Cross1Icon,
	GlobeIcon,
	ImageIcon,
	MagicWandIcon,
	PaperPlaneIcon,
	PlusIcon,
} from '@radix-ui/react-icons';

type AddProps = {
	onSubmit: (e: any, values: any) => {};
	isSaving: boolean;
};

export const AddBlog = ({ onSubmit, isSaving }: AddProps) => {
	const [add, setAdd] = useState({
		image: false,
		category: false,
	});
	const [images, setImages] = useState([]);
	const [categories, setCategories] = useState([]);
	const [isRegenateButtonActive, setIsRegenateButtonActive] = useState(false);
	const [newCategory, setNewCategory] = useState('');
	const [newImage, setNewImage] = useState<File[]>([]);
	const [isGenerating, startGenerating] = useTransition();
	const [isSavingCategory, startSavingCategory] = useTransition();
	const [isSavingImage, startSavingImage] = useTransition();
	const [isPending, startTransition] = useTransition();
	const [titleLoading, setTitleLoading] = useState(false);
	const [openAICategories, setOpenAICategories] = useState(null);
	const [contentLoading, setContentLoading] = useState(false);
	const [newImagePreview, setNewImagePreview] = useState(null);
	const [descriptionLoading, setDescriptionLoading] = useState(false);
	const [fields, setFields] = useState({
		name: undefined,
		slug: undefined,
		description: undefined,
		isActive: false,
		categoryIds: new Set<undefined>(),
		content: undefined,
		thumbnailId: undefined,
		bannerId: undefined,
	});

	const modules = {
		toolbar: [
			[{ header: [1, 2, 3, 4, 5, 6, false] }],
			['bold', 'italic', 'underline', 'strike', 'blockquote'],
			[{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
			['link', 'image', 'video'],
			['clean'],
		],
	};

	const formats = [
		'header',
		'bold',
		'italic',
		'underline',
		'strike',
		'blockquote',
		'list',
		'bullet',
		'indent',
		'link',
		'image',
		'video',
	];

	useEffect(() => {
		getCategories();
		getImages();
	}, []);

	const getCategories = () => {
		startTransition(async () => {
			await axios
				.get('/api/categories')
				.then((res) => {
					setCategories(res.data);
				})
				.catch(() => {});
		});
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

	const createSlug = (value: string) => {
		const trimmedText = value.toLowerCase().trim();
		const alphanumericText = trimmedText.replace(/\W+/g, '-');
		return alphanumericText.replace(/(^-|-$)/g, '');
	};

	const generate = async () => {
		startGenerating(async () => {
			await axios
				.get('/api/chat')
				.then((res) => {
					setFields({
						...fields,
						name: JSON.parse(res.data.content).title,
						slug: JSON.parse(res.data.content).slug,
						description: JSON.parse(res.data.content).description,
						content: JSON.parse(res.data.content).content,
					});
					setOpenAICategories(JSON.parse(res.data.content).categories);
					setIsRegenateButtonActive(true);
				})
				.catch((e) => {
					toast.error(e.response.data.message);
				});
		});
	};

	const regenerate = async (input: string) => {
		let value;
		switch (input) {
			case 'name':
				value = fields.name;
				setTitleLoading(true);
				break;
			case 'description':
				value = fields.description;
				setDescriptionLoading(true);
				break;
			case 'content':
				value = fields.content;
				setContentLoading(true);
				break;
			default:
				break;
		}

		await axios
			.post(`/api/chat`, { value })
			.then((res) => {
				const content = res.data.content;
				if (input === 'name') {
					setFields({ ...fields, name: content, slug: createSlug(content) });
					setTitleLoading(false);
				}
				if (input === 'description') {
					setFields({ ...fields, description: content });
					setDescriptionLoading(false);
				}
				if (input === 'content') {
					setFields({ ...fields, content });
					setContentLoading(false);
				}
			})
			.catch((e) => {
				toast.error(e.stack);
			});
	};

	const addCategory = () => {
		startSavingCategory(async () => {
			await axios
				.post('/api/categories', { newCategory })
				.then((res) => {
					if (res.data.type === 'warning') return toast.warning(res.data.message);
					if (res.data.type === 'success') toast.success(res.data.message);
					getCategories();
					setAdd({ ...add, category: !add.category });
				})
				.catch((e) => {
					toast.error(e.response.data.message);
				});
		});
	};

	const handleImageSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			setNewImage(e?.target?.files[0]);
			setNewImagePreview(URL.createObjectURL(e.target.files[0]));
		}
	};

	const onSubmitImage = async (newImage: any) => {
		startSavingImage(async () => {
			if (newImagePreview) {
				const data = new FormData();
				data.append(newImage?.name, newImage);
				await axios.post(`/api/files?type=files`, data).then((res) => {
					if (res.data.type === 'success') toast.success(res.data.message);
					getImages();
					setAdd({ ...add, image: false });
					setNewImage([]);
				});
			}
		});
	};

	return (
		<>
			<ModalBody>
				<form onSubmit={async (e) => onSubmit(e, fields)} className='grid gap-3'>
					{isGenerating ? (
						<div className='flex items-center justify-center min-h-[200px]'>
							<Spinner size='lg' label='Generating...' />
						</div>
					) : (
						<>
							<div className='flex flex-row items-top gap-3'>
								<Input
									size='sm'
									isRequired
									type='text'
									radius='none'
									label='Title'
									value={fields.name}
									onValueChange={(v) => {
										setFields({
											...fields,
											name: v,
											slug: createSlug(v),
										});
									}}
									description={fields.slug}
								/>
								{isRegenateButtonActive && (
									<Tooltip content='Regenerate title' size='sm'>
										<Button
											size='sm'
											isIconOnly
											radius='full'
											variant='solid'
											isLoading={titleLoading}
											className='bg-primary'
											onClick={() => regenerate('name')}
										>
											<MagicWandIcon />
										</Button>
									</Tooltip>
								)}
							</div>
							<div className='flex flex-row items-top gap-3'>
								<Textarea
									size='sm'
									minRows={1}
									maxRows={4}
									isRequired
									type='text'
									radius='none'
									label='Description'
									disableAutosize
									classNames={{
										base: 'w-full',
										input: 'resize-y min-h-[10px] max-h-[60px]',
									}}
									value={fields.description}
									onValueChange={(e) => {
										setFields({ ...fields, description: e });
									}}
								/>
								{isRegenateButtonActive && (
									<Tooltip content='Regenerate description' size='sm'>
										<Button
											size='sm'
											isIconOnly
											radius='full'
											variant='solid'
											className='bg-primary'
											isLoading={descriptionLoading}
											onClick={() => regenerate('description')}
										>
											<MagicWandIcon />
										</Button>
									</Tooltip>
								)}
							</div>
							<div
								className='flex gap-3 items-center w-full'
								style={{ transition: 'all 0.4s cubic-bezier(0.175,0.885,0.32,1.1)' }}
							>
								{add.image ? (
									<>
										<label
											htmlFor='uploadImage'
											className='bg-default-100 text-foreground-500 text-sm  hover:opacity-80 w-full h-12 hover:cursor-pointer hover:bg-default-200 rounded-none px-3 py-3 flex items-center'
											style={{ transition: 'all 0.4s cubic-bezier(0.175,0.885,0.32,1.1)' }}
										>
											{newImagePreview ? (
												<Avatar
													radius='none'
													src={newImagePreview}
													className='w-5 h-full me-2 shrink-0 my-auto'
												/>
											) : (
												<ImageIcon className='w-5 h-5 me-2 shrink-0 my-auto' />
											)}
											<span className=' inline-flex item-center justify-start overflow-ellipsis line-clamp-1 break-all'>
												{newImage?.name ? newImage?.name : 'Select image...'}
											</span>
										</label>
										<Tooltip content='Cancel' size='sm'>
											<Button
												size='sm'
												isIconOnly
												color='danger'
												variant='flat'
												isDisabled={isSavingImage}
												className='rounded-full hover:opacity-100'
												onClick={() => {
													setNewImagePreview(null);
													setNewImage([]);
													setAdd({ ...add, image: !add.image });
												}}
											>
												<Cross1Icon />
											</Button>
										</Tooltip>
										<Tooltip content='Save image' size='sm'>
											<Button
												size='sm'
												isIconOnly
												color='primary'
												isLoading={isSavingImage}
												isDisabled={!newImagePreview || isSavingImage}
												className='rounded-full hover:opacity-100'
												onClick={() => onSubmitImage(newImage)}
											>
												<PaperPlaneIcon />
											</Button>
										</Tooltip>
									</>
								) : (
									<>
										<div className='grid gap-3 grid-cols-2 w-full'>
											<Select
												items={images}
												label=''
												placeholder='Thumbnail'
												radius='none'
												isRequired
												size='lg'
												isDisabled={isPending}
												className='w-full overflow-ellipsis line-clamp-1 break-all'
												onChange={(e) =>
													setFields({
														...fields,
														thumbnailId: e.target.value,
													})
												}
												renderValue={(items) => {
													return items.map((item) => (
														<div key={item.key} className='flex items-center gap-2'>
															<Avatar
																alt={item.data.name}
																className='flex-shrink-0'
																size='sm'
																radius='none'
																src={item.data.src}
															/>
															<div className='flex flex-col'>
																<span>{item.data.name}</span>
															</div>
														</div>
													));
												}}
											>
												{(item) => (
													<SelectItem key={item.id} textValue={item.name}>
														<div className='flex gap-2 items-center'>
															<Avatar
																alt={item.name}
																className='flex-shrink-0'
																size='sm'
																radius='none'
																src={item.src}
															/>
															<div className='flex flex-col'>
																<span className='text-small'>{item.name}</span>
																<span className='text-tiny text-default-400'>
																	{item.size && `${(item.size / 1024).toFixed(2)}kB`}
																</span>
															</div>
														</div>
													</SelectItem>
												)}
											</Select>
											<Select
												items={images}
												label=''
												placeholder='Banner'
												radius='none'
												isRequired
												size='lg'
												isDisabled={isPending}
												className='w-full overflow-ellipsis line-clamp-1 break-all text-sm placeholder:text-xs'
												onChange={(e) =>
													setFields({
														...fields,
														bannerId: e.target.value,
													})
												}
												renderValue={(items) => {
													return items.map((item) => (
														<div key={item.key} className='flex items-center gap-2'>
															<Avatar
																alt={item.data.name}
																className='flex-shrink-0'
																size='sm'
																radius='none'
																src={item.data.src}
															/>
															<div className='flex flex-col'>
																<span>{item.data.name}</span>
															</div>
														</div>
													));
												}}
											>
												{(item) => (
													<SelectItem key={item.id} textValue={item.name}>
														<div className='flex gap-2 items-center'>
															<Avatar
																alt={item.name}
																className='flex-shrink-0'
																size='sm'
																radius='none'
																src={item.src}
															/>
															<div className='flex flex-col'>
																<span className='text-small'>{item.name}</span>
																<span className='text-tiny text-default-400'>
																	{item.size && `${(item.size / 1024).toFixed(2)}kB`}
																</span>
															</div>
														</div>
													</SelectItem>
												)}
											</Select>
										</div>
										<Tooltip content='Add image' size='sm'>
											<Button
												size='sm'
												isIconOnly
												variant='solid'
												onClick={() =>
													setAdd({
														...add,
														image: !add.image,
													})
												}
												className='rounded-full bg-primary'
											>
												<PlusIcon />
											</Button>
										</Tooltip>
									</>
								)}
								<input
									id='uploadImage'
									type='file'
									accept='image/*'
									className='hidden'
									onChange={handleImageSelected}
								/>
							</div>
							<div className={`flex gap-3 ${openAICategories ? 'items-start' : 'items-center'}`}>
								{add.category ? (
									<>
										<Input
											size='sm'
											type='text'
											radius='none'
											label='Add category'
											isDisabled={isSavingCategory}
											onValueChange={(v) =>
												setNewCategory(v.charAt(0).toUpperCase() + v.slice(1))
											}
											autoFocus
											style={{
												transition: 'all 0.4s cubic-bezier(0.175,0.885,0.32,1.1)',
											}}
										/>
										<Tooltip content='Cancel' size='sm'>
											<Button
												size='sm'
												isIconOnly
												radius='full'
												color='danger'
												variant='flat'
												isDisabled={isSavingCategory}
												onClick={(e) => setAdd({ ...add, category: !add.category })}
											>
												<Cross1Icon />
											</Button>
										</Tooltip>
										<Tooltip content='Save category' size='sm'>
											<Button
												size='sm'
												isIconOnly
												radius='full'
												color='primary'
												isDisabled={!newCategory || isSavingCategory}
												isLoading={isSavingCategory}
												onClick={() => addCategory()}
											>
												<PaperPlaneIcon />
											</Button>
										</Tooltip>
									</>
								) : (
									<>
										<Select
											size='sm'
											fullWidth
											isRequired
											radius='none'
											label='Categories'
											isMultiline={false}
											isDisabled={isPending}
											selectionMode='multiple'
											onSelectionChange={(e) => setFields({ ...fields, categoryIds: e })}
											description={
												openAICategories && `Suggested categories: ${openAICategories}`
											}
											style={{
												transition: 'all 0.4s cubic-bezier(0.175,0.885,0.32,1.1)',
											}}
										>
											{categories.map((i: any) => (
												<SelectItem key={i.id} value={i.name}>
													{i.name}
												</SelectItem>
											))}
										</Select>
										<Tooltip content='Add category' size='sm'>
											<Button
												size='sm'
												isIconOnly
												radius='full'
												variant='solid'
												className='bg-primary'
												onClick={(e) => setAdd({ ...add, category: !add.category })}
											>
												<PlusIcon
													className={`origin-center ${add.category && 'rotate-45 '}`}
													style={{
														transition: 'all 0.5s cubic-bezier(0.175,0.885,0.32,1.1)',
													}}
												/>
											</Button>
										</Tooltip>
									</>
								)}
							</div>
							<div className='flex gap-3 w-full items-top'>
								<ReactQuill
									theme='snow'
									placeholder='Write your content'
									className='min-h-[200px] rounded-none bg-content2 w-full'
									modules={modules}
									formats={formats}
									value={fields.content}
									onChange={(v) => {
										setFields({ ...fields, content: v });
									}}
								/>
								{isRegenateButtonActive && (
									<Tooltip content='Regenerate content' size='sm'>
										<Button
											size='sm'
											isIconOnly
											radius='full'
											className='bg-primary'
											onClick={() => regenerate('content')}
											isLoading={contentLoading}
										>
											<MagicWandIcon />
										</Button>
									</Tooltip>
								)}
							</div>
							<Switch
								onValueChange={(e) => {
									setFields({
										...fields,
										isActive: e,
									});
								}}
								classNames={{
									base: cn(
										'inline-flex flex-row-reverse w-full max-w-full hover:bg-default-200 items-center',
										'justify-between cursor-pointer  rounded-none py-1.5 px-3 gap-2 border-2 border-transparent  bg-content2'
									),
									wrapper: 'p-0 h-4 overflow-visible',
									thumb: cn(
										'w-6 h-6 border-2 shadow-lg  bg-content1',
										'group-data-[hover=true]:border-primary',
										//selected
										'group-data-[selected=true]:ml-6',
										// pressed
										'group-data-[pressed=true]:w-7',
										'group-data-[selected]:group-data-[pressed]:ml-4'
									),
								}}
							>
								<div className='flex flex-col gap-1'>
									<span className='text-small text-default-600 font-normal'>
										Status: {fields.isActive ? 'Active' : 'Draft'}
									</span>
									<small className='text-tiny text-default-400 flex gap-1 items-center'>
										<AvatarIcon /> Draft (default): Only visible to me
									</small>
									<small className='text-tiny text-default-400 flex gap-1 items-center'>
										<GlobeIcon /> Active: Visible to the public
									</small>
								</div>
							</Switch>
							<div className='flex justify-end items-center gap-3 w-fll mb-3'>
								<Button
									size='md'
									radius='none'
									color='default'
									endContent={<MagicWandIcon />}
									onClick={generate}
									isDisabled={isSaving}
								>
									GENERATE
								</Button>
								<Button
									size='md'
									color='primary'
									type='submit'
									radius='none'
									isDisabled={
										isSaving ||
										!fields.name ||
										!fields.description ||
										!fields.bannerId ||
										!fields.thumbnailId ||
										!fields.categoryIds ||
										!fields.content
									}
									spinnerPlacement='end'
									endContent={!isSaving && <PaperPlaneIcon />}
									isLoading={isSaving}
								>
									SAVE
								</Button>
							</div>
						</>
					)}
				</form>
			</ModalBody>
		</>
	);
};
