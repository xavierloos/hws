import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Image,
  Button,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";

export const CardItem = ({ item }: any) => {
  const router = useRouter();
  return (
    <Card isFooterBlurred className="w-full h-[300px] col-span-6 sm:col-span-4">
      <CardHeader className="absolute z-10 top-1 flex-col items-start">
        <Button
          className="text-tiny uppercase font-bold"
          color="secondary"
          radius="full"
          size="md"
        >
          New
          {/* {item.categoryId} */}
        </Button>
      </CardHeader>
      <Image
        removeWrapper
        alt="Card example background"
        className="z-0 w-full h-full scale-125 -translate-y-6 object-cover"
        src="https://source.unsplash.com/random"
      />
      <CardFooter className="absolute bg-white/30 bottom-0 border-t-1 border-zinc-100/50 z-10 justify-between py-1 px-3">
        <div className="min-h-[60px] flex">
          <h6
            className="text-white font-medium text-sm md:text-lg  line-clamp-2 m-0"
            onClick={() =>
              router.push(`/blogs/${item.slug}`, { scroll: false })
            }
          >
            {item.title} some util sad adoj dlfle ggnv ldjfjk dkfjdfn jdfjdf
          </h6>
        </div>
      </CardFooter>
    </Card>
  );
};
