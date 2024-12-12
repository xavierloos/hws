import { CircularProgress, Card, CardBody, CardFooter, Chip, CardHeader, Button } from '@nextui-org/react';
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

type Props = {
	title: string;
};

export const CardItem = ({ title }: Props) => {
	return (
		<Card className='w-full min-h-[240px] border-none bg-gradient-to-br from-primary to-secondary'>
			<CardHeader className='pb-0 pt-2 px-4 flex items-start justify-between'>
				<p className='text-default-foreground text-tiny uppercase font-bold'>{title}</p>
				<Button
					isIconOnly
					// color='primary'
					radius='full'
					size='sm'
					variant='light'
					startContent={<PlusIcon />}
				/>
			</CardHeader>
			<CardBody className='justify-center items-center pb-0'>
				<CircularProgress
					classNames={{
						svg: 'w-36 h-36 drop-shadow-sm',
						indicator: 'stroke-white',
						track: 'stroke-white/30',
						value: 'text-3xl font-semibold text-white',
					}}
					showValueLabel={true}
					strokeWidth={4}
					value={70}
				/>
			</CardBody>
			<CardFooter className='justify-center items-center pt-0'>
				<Chip
					classNames={{
						base: 'border-1 border-white/30',
						content: 'text-white/90 text-small font-semibold',
					}}
					variant='bordered'
				>
					2800 Data points
				</Chip>
			</CardFooter>
		</Card>
	);
};
