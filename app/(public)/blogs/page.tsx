'use client';
import { Title } from '@/components/title';
// import * as React from 'react';
import React, { useEffect, useState, useTransition, useMemo, useCallback } from 'react';
import { CardItem } from './_components/CardItem';
import axios from 'axios';
import { toast } from 'sonner';
import { Spinner, Input } from '@nextui-org/react';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';

const BlogsPage = () => {
	const [isPending, startTransition] = useTransition();
	const [query, setQuery] = useState('');
	const [items, setItems] = useState([]);
	const [hasLoaded, setHasLoaded] = useState(false);

	useEffect(() => {
		startTransition(() => {
			const fetchBlogs = async () => {
				try {
					const res = await axios.get(`/api/blogs?api_key=${process.env.NEXT_PUBLIC_API_KEY}`);
					setItems(Array.isArray(res.data) ? res.data : []);
					setHasLoaded(true);
				} catch (e) {
					console.error('Failed to fetch blogs', e);
					toast.error('Failed to load blogs');
					setItems([]);
				}
			};

			fetchBlogs();
		});
	}, []);

	const handleSearchChange = React.useCallback((value) => {
		setQuery(value);
	}, []);

	const filteredItems = useMemo(() => {
		if (!query) return items;
		return items.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()));
	}, [items, query]);

	return (
		<div className='grid gap-6'>
			<div className='flex '>
				<Title text='Blogs' className='items-start' />
				{isPending && <Spinner color='primary' size='lg' />}
			</div>

			<Input
				startContent={
					<MagnifyingGlassIcon className='text-black/50 mb-0.5 dark:text-white/90 text-slate-400 pointer-events-none flex-shrink-0' />
				}
				size='md'
				radius='none'
				type='text'
				placeholder='Search by title'
				fullWidth
				isClearable
				onValueChange={handleSearchChange}
			/>

			{hasLoaded && filteredItems.length === 0 && (
				<p className='text-center text-gray-500'>No blogs found matching your search.</p>
			)}
			<div className='max-w-full grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3'>
				{filteredItems?.map((item) => (
					<CardItem item={item} key={item.id} />
				))}
			</div>
		</div>
	);
};

export default BlogsPage;
