'use client';
// import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CircularProgress, Card, CardBody, CardFooter, Chip, CardHeader, Button } from '@nextui-org/react';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import {
	AvatarIcon,
	Cross1Icon,
	GlobeIcon,
	ImageIcon,
	MagicWandIcon,
	PaperPlaneIcon,
	PlusIcon,
} from '@radix-ui/react-icons';
const chartData = [
	{ month: 'January', desktop: 186, mobile: 80 },
	{ month: 'February', desktop: 305, mobile: 200 },
	{ month: 'March', desktop: 237, mobile: 120 },
	{ month: 'April', desktop: 73, mobile: 190 },
	{ month: 'May', desktop: 209, mobile: 130 },
	{ month: 'June', desktop: 214, mobile: 140 },
];
const chartConfig = {
	desktop: {
		label: 'Desktop',
		color: 'hsl(var(--chart-1))',
	},
	mobile: {
		label: 'Mobile',
		color: 'hsl(var(--chart-2))',
	},
} satisfies ChartConfig;

type Props = {
	title: string;
	data: number;
	limit: number;
};

export const Chart = ({ title, data, limit }: Props) => {
	return (
		// <Card  className='w-full min-h-[240px] border-none bg-gradient-to-br from-primary to-secondary'>
		// 	<CardHeader>
		// 		<CardTitle>Bar Chart - Multiple</CardTitle>
		// 		<CardDescription>January - June 2024</CardDescription>
		// 	</CardHeader>
		// 	<CardContent>
		// 		<ChartContainer config={chartConfig}>
		// 			<BarChart accessibilityLayer data={chartData}>
		// 				<CartesianGrid vertical={false} />
		// 				<XAxis
		// 					dataKey='month'
		// 					tickLine={false}
		// 					tickMargin={10}
		// 					axisLine={false}
		// 					tickFormatter={(value) => value.slice(0, 3)}
		// 				/>
		// 				<ChartTooltip cursor={false} content={<ChartTooltipContent indicator='dashed' />} />
		// 				<Bar dataKey='desktop' fill='var(--color-desktop)' radius={4} />
		// 				<Bar dataKey='mobile' fill='var(--color-mobile)' radius={4} />
		// 			</BarChart>
		// 		</ChartContainer>
		// 	</CardContent>
		// 	<CardFooter className='flex-col items-start gap-2 text-sm'>
		// 		<div className="flex gap-2 font-medium leading-none">
		//     Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
		//   </div>
		// 		<div className='leading-none text-muted-foreground'>Showing total visitors for the last 6 months</div>
		// 	</CardFooter>
		// </Card>
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
				{/* <CircularProgress
        classNames={{
          svg: 'w-36 h-36 drop-shadow-sm',
          indicator: 'stroke-white',
          track: 'stroke-white/30',
          value: 'text-3xl font-semibold text-white',
        }}
        color='success'
        showValueLabel={true}
        strokeWidth={4}
        value={(data / limit) * 100}
      /> */}
				<ChartContainer config={chartConfig} className='min-h-[200px] w-full'>
					<BarChart accessibilityLayer data={chartData}>
						<Bar dataKey='desktop' fill='white' radius={4} />
						<Bar dataKey='mobile' fill='var(--color-mobile)' radius={4} />
					</BarChart>
				</ChartContainer>
			</CardBody>
			<CardFooter className='justify-center items-center pt-0'>
				<Chip
					classNames={{
						base: 'border-1 border-white/30',
						content: 'text-white/90 text-small font-semibold',
					}}
					variant='bordered'
				>
					{data} out of {limit}
				</Chip>
			</CardFooter>
		</Card>
	);
};
