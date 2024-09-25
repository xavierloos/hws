import React, { useState } from "react";
import { Card, CardBody, Image, Chip } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { format } from "timeago.js";

import dateFormat from "dateformat";
import { HomeIcon } from "@radix-ui/react-icons";

type CardItemProps = {
  item: any;
};

export const ItemList = ({ item }: CardItemProps) => {
  const router = useRouter();
  const openItem = () => {
    router.push(`${item.url}`);
  };

  return (
    <Card
      isPressable
      onPress={() => openItem()}
      className="border-none max-w-full"
      radius="none"
    >
      <CardBody className="flex flex-row p-0">
        <Image
          shadow="none"
          radius="none"
          alt={item.name}
          className="object-cover w-[100px] max-w-[100px] sm:w-[150px] sm:max-w-[150px] h-full"
          src={item.images[0]["url"]}
        />
        <div className="w-full grid gap-2 grid-cols-1 p-3 justify-start">
          <div className="w-full flex flex-row justify-between m-0 p-0">
            <small className="text-tiny font-bold text-foreground">
              {item.dates &&
                dateFormat(
                  item.dates?.start.dateTime,
                  "ddd dd/mmm/yy - HH:MM"
                )}{" "}
              ({format(item.dates?.start.dateTime)})
            </small>
            {item?.classifications &&
              item?.classifications[0]?.genre?.name != "Undefined" && (
                <Chip color="primary" size="sm" className="shadow-sm">
                  {item?.classifications[0]?.genre?.name}
                </Chip>
              )}{" "}
          </div>
          <h1 className="text-secondary font-bold text-large w-full line-clamp-2 ellipsis ">
            {item.name}
          </h1>
          {item?._embedded?.venues && (
            <small className="text-default-500 w-full flex items-center">
              <HomeIcon className="shrink-0  me-2" />
              {item?._embedded?.venues[0]?.city?.name}
              {item?._embedded?.venues[0]?.state &&
                `, ${item?._embedded?.venues[0]?.state.name}`}
            </small>
          )}
        </div>
      </CardBody>
    </Card>
  );
};
