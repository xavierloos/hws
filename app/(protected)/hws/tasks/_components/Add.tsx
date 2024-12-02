import { Input, Select, SelectItem, Button, ModalBody, Avatar, DatePicker } from '@nextui-org/react';
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
	ArrowDownIcon,
	ArrowUpIcon,
	ArrowRightIcon,
} from '@radix-ui/react-icons';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { now, getLocalTimeZone, DateValue, today } from '@internationalized/date';
import { FilePreviewer } from '@/components/filePreviewer';

type AddProps = {
	onSubmit: (e: any, values: any, files: any) => {};
	isSaving: boolean;
};

export const Add = ({ onSubmit, isSaving }: AddProps) => {
	const [add, setAdd] = useState({
		image: false,
		category: false,
	});
	let priorities = [
		{ name: 'High', color: 'danger' },
		{ name: 'Medium', color: 'primary' },
		{ name: 'Low', color: 'default' },
	];
	let types = [
		{ key: 'Bug', label: 'Bug' },
		{ key: 'Documentation', label: 'Documentation' },
		{ key: 'Testing', label: 'Testing' },
		{ key: 'Research', label: 'Research' },
		{ key: 'Feature', label: 'Feature' },
		{ key: 'Story', label: 'Story' },
		{ key: 'Urgent', label: 'Urgent' },
		{ key: 'Critical', label: 'Critical' },
		{ key: 'Maintenance', label: 'Maintenance' },
	];
	const [team, setTeam] = useState([]);
	const [images, setImages] = useState([]);
	const [isPending, startTransition] = useTransition();

	const [files, setFiles] = useState<File[]>([]);
	const [fields, setFields] = useState({
		name: undefined,
		priority: {},
		type: useState<Selection>(new Set([])),
		dueDate: useState<DateValue>(),
		teamIds: [],
		description: undefined,
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
		axios
			.get('/api/members')
			.then((res) => {
				setTeam(res.data);
			})
			.catch(() => {});
	}, []);

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

	return (
		<ModalBody>
			<form onSubmit={(e) => onSubmit(e, fields, files)} className='grid gap-3'>
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
							});
						}}
					/>
				</div>
				<div className='grid gap-3 grid-cols-3 w-full'>
					<Select
						size='sm'
						isRequired
						radius='none'
						label='Priority'
						items={priorities}
						onChange={
							(item: any) =>
								priorities.map(
									(p) => p.name == item.target.value && setFields({ ...fields, priority: p })
								)
							//
						}
						renderValue={(items: any) => items.map((i: any) => i.key)}
					>
						{(i: any) => (
							<SelectItem key={i.name} value={i.name} rounded='none'>
								<div className='flex gap-1 items-center'>
									{/* <Avatar
                    radius="full"
                    alt={i.name}
                    // src={i.name}
                    // icon={i.icon}
                    className={`flex-shrink-0 w-5 h-5 bg-${i.color}`}

                  /> */}
									<span className='text-small'>{i.name}</span>
								</div>
							</SelectItem>
						)}
					</Select>
					<Select
						size='sm'
						isRequired
						radius='none'
						label='Type'
						onChange={(e) => setFields({ ...fields, type: e.target.value })}
						// renderValue={(items: any) => items.map((i: any) => i.key)}
					>
						{types.map((type) => (
							<SelectItem key={type.key}>{type.label}</SelectItem>
						))}
					</Select>
					<DatePicker
						size='sm'
						radius='none'
						isRequired
						hourCycle={24}
						hideTimeZone={true}
						label='Due Date & Time'
						showMonthAndYearPickers
						minValue={today(getLocalTimeZone())}
						placeholderValue={now('America/New_York')}
						className='w-full flex flex-col-reverse flex-wrap-reverse overflow-hidden'
						onChange={(date: any) => {
							const m = `${date?.month <= 9 ? '0' : ''}${date?.month}`;
							const d = `${date?.day <= 9 ? '0' : ''}${date?.day}`;
							const h = `${date?.hour <= 9 ? '0' : ''}${date?.hour}`;
							const min = `${date?.minute <= 9 ? '0' : ''}${date?.minute}`;
							setFields({
								...fields,
								dueDate: `${date?.year}-${m}-${d}T${h}:${min}Z`,
							});
						}}
					/>
				</div>
				<div className={`grid gap-3 sm:grid-cols-2`}>
					<Select
						size='sm'
						isRequired
						radius='none'
						items={team}
						label='Assign to'
						selectionMode='multiple'
						onChange={(e) => setFields({ ...fields, teamIds: e.target.value.split(',') })}
						renderValue={(items: any) => {
							return <p>{items.length} selected</p>;
						}}
					>
						{(i: any) => (
							<SelectItem key={i.key} value={i.name}>
								<div className='flex gap-1 items-center'>
									<Avatar
										size='sm'
										radius='full'
										alt={i.name}
										src={i.src}
										className='flex-shrink-0'
									/>
									<div className='flex flex-col'>
										<span className='text-small'>{i.name}</span>
										<span className='text-tiny text-default-400'>@{i.username}</span>
									</div>
								</div>
							</SelectItem>
						)}
					</Select>

					<div>
						<label
							htmlFor='attachments'
							className='relative w-full inline-flex shadow-sm tap-highlight-transparent bg-default-100 hover:bg-default-200 rounded-none flex-col items-start justify-center gap-0 outline-none h-12 min-h-12 py-1.5 px-3 text-sm text-foreground-500'
						>
							{files.length > 0 ? `(${files.length}) Attach more... ` : 'Attachments'}
						</label>
						<input
							id='attachments'
							type='file'
							multiple
							accept='.xlsx,.xls,image/*,.doc, .docx,.ppt, .pptx,.txt,.pdf'
							className='hidden'
							onChange={handleFileSelected}
						/>
					</div>
				</div>
				<div className='flex gap-3 w-full items-top mb-0'>
					<ReactQuill
						theme='snow'
						placeholder='Write your content'
						className='min-h-[200px] rounded-none bg-content2 w-full'
						modules={modules}
						formats={formats}
						value={fields.description}
						onChange={(v) => {
							setFields({ ...fields, description: v });
						}}
					/>
				</div>
				{files.length > 0 && (
					<Accordion type='single' collapsible className='w-full m-0'>
						<AccordionItem value='item-1'>
							<AccordionTrigger>Attachments ({files.length})</AccordionTrigger>
							<AccordionContent>
								{files.map((item, index) => {
									item.index = index; //To delete from the uploading list
									return <FilePreviewer item={item} key={index} onDelete={onDeleteSelected} />;
								})}
							</AccordionContent>
						</AccordionItem>
					</Accordion>
				)}
				<div className='flex justify-end items-center gap-3 w-fll mb-3'>
					<Button
						size='md'
						color='primary'
						type='submit'
						radius='none'
						isDisabled={
							isSaving ||
							!fields.name ||
							!fields.description ||
							!fields.priority ||
							!fields.type ||
							!fields.dueDate ||
							!fields.teamIds ||
							!fields.description
						}
						spinnerPlacement='end'
						endContent={!isSaving && <PaperPlaneIcon />}
						isLoading={isSaving}
					>
						SAVE
					</Button>
				</div>
			</form>
		</ModalBody>
	);
};
