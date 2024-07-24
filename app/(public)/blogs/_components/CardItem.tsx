import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Image,
  Button,
  Chip,
  User,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { format } from "timeago.js";
import { EyeOpenIcon } from "@radix-ui/react-icons";

type CardItemProps = {
  item: any;
  suggestion?: boolean;
};

export const CardItem = ({ item, suggestion = false }: CardItemProps) => {
  const router = useRouter();

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return (views / 1000000).toFixed(1) + "M";
    } else if (views >= 1000) {
      return (views / 1000).toFixed(1) + "K";
    } else {
      return views;
    }
  };

  const openBlog = () => {
    router.push(`/blogs/${item.slug}`);
  };

  return (
    <Card
      isFooterBlurred
      className={`h-full ${
        suggestion ? "h-[100px]" : "min-h-[300px]"
      } flex items-center`}
      isPressable
      onPress={() => openBlog()}
    >
      <CardHeader className="absolute z-10 top-1 flex-col items-start">
        {!suggestion && (
          <div className="flex gap-1">
            {item.categories.map((cat: any) => {
              return (
                <Chip
                  color="primary"
                  variant="solid"
                  size="sm"
                  key={cat.id}
                  className="shadow-md"
                >
                  {cat.name}
                </Chip>
              );
            })}
          </div>
        )}

        <h4
          className={`text-black/90 justify-start flex text-start font-medium ${
            suggestion ? "text-sm" : "text-xl"
          } drop-shadow-md`}
        >
          {item.name}
        </h4>
      </CardHeader>
      <Image
        removeWrapper
        alt={`${item.id} blog image`}
        className="z-0 w-full h-full"
        src={suggestion ? item.thumbnail : item.tempThumbnail}
      />
      {!suggestion && (
        <CardFooter className="flex flex-col gap-2 absolute bg-black/30 bottom-0 z-10">
          <div className="flex gap-2 min-h-[32px] w-full">
            <p className="text-tiny text-white/90 text-ellipsis line-clamp-2">
              {item.description}
            </p>
          </div>
          <div className="flex justify-between w-full gap-2 items-center">
            <User
              avatarProps={{
                size: "sm",
                className: "shrink-0",
                src: item.user.image,
              }}
              description={
                <span className="text-tiny truncate text-ellipsis line-clamp-1 text-white">
                  {format(item.createdAt)}
                </span>
              }
              name={
                <span
                  className={`text-tiny text-white w-full text-ellipsis font-medium overflow-hidden break-words line-clamp-1`}
                >
                  By @{item.modifiedBy.username}
                </span>
              }
            />
            <div className="flex flex-col text-white justify-center items-center">
              <EyeOpenIcon className="shrink-0 m-auto" />

              <div className="w-full m-auto flex justify-center text-[10px] items-center">
                {formatViews(item.views)}
              </div>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};
