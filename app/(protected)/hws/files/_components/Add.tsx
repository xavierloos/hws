import { Button, ModalBody, ModalHeader } from '@nextui-org/react';
import { useState } from 'react';
import { FileIcon, FileTextIcon, PaperPlaneIcon, UploadIcon } from '@radix-ui/react-icons';
import { FilePreviewer } from '@/components/filePreviewer';

type NewFilesFormProps = {
	onSubmit: (e?: any, values?: any) => {};
	isSaving?: boolean;
};

export const Add = ({ onSubmit, isSaving, onClose }: NewFilesFormProps) => {
	const [files, setFiles] = useState<File[]>([]);

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
			<form
				onSubmit={(e) => {
					onSubmit(e, files);
				}}
				className='flex flex-col gap-3'
			>
				<div className='flex justify-between items-center'>
					<label
						htmlFor='uploadfiles'
						className='bg-default-100 text-foreground-500 text-sm hover:opacity-80 w-full h-12 hover:cursor-pointer hover:bg-default-200 rounded-md px-3 py-3 flex item-center justify-start'
					>
						<>
							<FileTextIcon className='w-5 h-5 my-auto me-2' />
							{files.length > 0 ? `(${files.length}) Add more... ` : 'Add files...'}
						</>
					</label>
					<input
						id='uploadfiles'
						type='file'
						multiple
						accept='.xlsx,.xls,image/*,.doc, .docx,.ppt, .pptx,.txt,.pdf'
						required
						className='hidden'
						onChange={handleFileSelected}
					/>
				</div>

				{files.map((item, index) => {
					item.upload = true; // To assign the image
					item.index = index; //To delete from the uploading list
					return <FilePreviewer item={item} key={index} onDelete={() => onDeleteSelected} />;
				})}

				<div className='flex justify-end items-center gap-3 w-fll mb-3'>
					<Button
						size='md'
						radius='none'
						color='primary'
						type='submit'
						isLoading={isSaving}
						onPress={onClose}
						isDisabled={!files.length && true}
						endContent={<UploadIcon />}
					>
						Upload {files.length > 0 && `${files.length} file${files.length > 1 ? 's' : ''}`}
					</Button>
				</div>
			</form>
		</ModalBody>
	);
};
