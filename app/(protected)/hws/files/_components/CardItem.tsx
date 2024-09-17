import React, { useState, useEffect } from "react";
import {
 Card,
 CardHeader,
 CardBody,
 CardFooter,
 Image,
 Button,
 Chip,
 User,
 Dropdown,
 DropdownTrigger,
 DropdownMenu,
 DropdownItem,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { format } from "timeago.js";
import {
 ClockIcon,
 CopyIcon,
 DotsVerticalIcon,
 EyeOpenIcon,
 LockClosedIcon,
 LockOpen1Icon,
 LockOpen2Icon,
 OpenInNewWindowIcon,
 Share1Icon,
 TrashIcon,
} from "@radix-ui/react-icons";

type CardItemProps = {
 item: any;
};

export const CardItem = ({ item }: CardItemProps) => {
 console.log(item);
 const router = useRouter();
 const [image, setImage] = useState("");
 useEffect(() => {
  if (item.type.includes("sheet")) {
   setImage(
    "https://www.freeiconspng.com/thumbs/xls-icon/excel-png-office-xlsx-icon-3.png"
   );
  } else if (item.type.includes("pdf")) {
   setImage(
    "https://static.vecteezy.com/system/resources/previews/023/234/824/original/pdf-icon-red-and-white-color-for-free-png.png"
   );
  } else {
   setImage(item.tempUrl);
  }
 }, [image]);

 const openLink = () => {
  router.push(`${item.tempUrl}`);
 };

 return (
  <Card
   isFooterBlurred
   isPressable
   className="border-none min-h-[200] h-[200px] rounded-md shadow-md"
   onPress={openLink}
  >
   <CardHeader className="absolute z-50 top-0 flex-col items-end w-full">
    <div className="flex justify-center items-center z-40 text-black w-5 h-5 rounded-full bg-primary shadow-md">
     {item.isPrivate ? (
      <LockClosedIcon className="w-3 h-3 font-thin" />
     ) : (
      <LockOpen2Icon className="w-3 h-3 font-thin" />
     )}
    </div>
   </CardHeader>

   <Image
    alt="Woman listing to music"
    className="object-cover  min-w-full min-h-[200] h-[200px] rounded-md"
    height={200}
    src={image}
   />

   <CardFooter className="absolute bg-white/60 bottom-0 z-10 justify-between rounded-b py-0.5 px-[5px] flex gap-1">
    <div className="text-tiny text-black truncate text-ellipsis line-clamp-1 w-full">
     {item.name}
    </div>
    <Dropdown size="sm" className="max-w-[200px] rounded-md">
     <DropdownTrigger>
      <Button variant="flat" size="sm" isIconOnly radius="full">
       <DotsVerticalIcon />
      </Button>
     </DropdownTrigger>
     <DropdownMenu aria-label="Static Actions">
      <DropdownItem
       isReadOnly
       key="profile"
       showDivider
       className=" hover:cursor-none"
      >
       <div className="flex gap-1 flex-col justify-center items-center m-auto w-full">
        <div className="text-tiny font-semibold text-wrap break-all">
         {item?.name}
        </div>
        <div className="text-tiny text-foreground">
         {(item.size / 1024).toFixed(2)}kB
        </div>
        <div className="text-tiny text-foreground">
         By @{item?.user?.username}
        </div>
        <div className="flex gap-2 justify-between w-full">
         <div className="text-tiny text-foreground flex gap-1 items-center ">
          {item.isPrivate ? <LockClosedIcon /> : <LockOpen2Icon />}
          {item.isPrivate ? "Private" : "Public"}
         </div>
         <div className="text-tiny text-foreground flex gap-1 items-center ">
          <ClockIcon /> {format(item.createdAt)}
         </div>
        </div>
       </div>
      </DropdownItem>

      <DropdownItem
       key="open"
       onClick={openLink}
       startContent={<OpenInNewWindowIcon />}
       className=" rounded-md"
      >
       Open file
      </DropdownItem>
      <DropdownItem
       key="open"
       onClick={openLink}
       startContent={<Share1Icon />}
       className=" rounded-md"
      >
       Share with
      </DropdownItem>
      <DropdownItem
       key="open"
       onClick={openLink}
       startContent={<CopyIcon />}
       className=" rounded-md"
      >
       Copy link
      </DropdownItem>
      <DropdownItem
       key="delete"
       className="text-danger rounded-md"
       color="danger"
       startContent={<TrashIcon />}
      >
       Delete file
      </DropdownItem>
     </DropdownMenu>
    </Dropdown>
   </CardFooter>
  </Card>
 );
};
