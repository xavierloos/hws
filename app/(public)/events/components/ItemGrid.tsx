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

import dateFormat from "dateformat";
import { HomeIcon } from "@radix-ui/react-icons";

type CardItemProps = {
  item: any;
};

export const ItemGrid = ({ item }: CardItemProps) => {
  const router = useRouter();
  // console.log(item?.classifications[0]?.genre?.name);
  const openItem = () => {
    router.push(`${item.url}`);
  };

  return (
    <Card isPressable onPress={() => openItem()} radius="none">
      <div className="w-full">
        <Image
          shadow="none"
          radius="none"
          width="100%"
          alt={item.name}
          className="w-full object-cover h-[200px]"
          src={item.images[0]["url"]}
        />
      </div>

      {item?.classifications &&
        item?.classifications[0]?.genre?.name != "Undefined" && (
          <div className="absolute t-0 z-10 w-full flex gap-2 justify-end p-2">
            <Chip color="primary" size="sm" className="shadow-md">
              {item?.classifications[0]?.genre?.name}
            </Chip>
          </div>
        )}

      <CardBody className="flex flex-col items-start justify-start">
        <small className="text-tiny font-bold text-foreground">
          {item.dates &&
            dateFormat(
              item.dates?.start.dateTime,
              "ddd dd/mmm/yy - HH:MM"
            )}{" "}
          ({format(item.dates?.start.dateTime)})
        </small>
        <h1 className="text-secondary font-bold text-large w-full line-clamp-2 ellipsis min-h-[50px] ">
          {item.name}
        </h1>
        {item?._embedded?.venues && (
          <small className="text-default-500 flex items-center pt-2 justify-end">
            <HomeIcon className="shrink-0 m-auto me-2" />
            {item?._embedded?.venues[0]?.city?.name}
            {item?._embedded?.venues[0]?.state &&
              `, ${item?._embedded?.venues[0]?.state.name}`}
          </small>
        )}
      </CardBody>
    </Card>
  );
};
