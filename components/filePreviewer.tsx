import { Button, Tooltip, User, Switch } from "@nextui-org/react";
import {
 EyeOpenIcon,
 ImageIcon,
 LockClosedIcon,
 LockOpen1Icon,
 TrashIcon,
} from "@radix-ui/react-icons";
import { BiSolidFileTxt } from "react-icons/bi";
import {
 FaFileExcel,
 FaFileImage,
 FaFilePdf,
 FaFilePowerpoint,
 FaFileWord,
} from "react-icons/fa";
import { useState, useEffect } from "react";

type FilePreviewerProps = {
 item: any;
 type?: string;
 onDelete?: (i: number) => {};
};

export const FilePreviewer = ({ item, onDelete, type }: FilePreviewerProps) => {
 let img = ["image/jpeg", "image/png", "image/jpg"].includes(item.type)
  ? URL.createObjectURL(item)
  : null;

 const [isPrivate, setIsPrivate] = useState(false);

 const fileType = item.name.split(".").pop();

 useEffect(() => {
  item.isPrivate = isPrivate;
 }, [isPrivate]);

 return (
  <>
   <div className="flex w-full justify-between items-center gap-2">
    <User
     avatarProps={{
      radius: "sm",
      src: img,
      size: "lg",
      name: item.name,
      className: "shrink-0 bg-transparent",
      fallback: fileType.includes("docx") ? (
       <FaFileWord
        size={70}
        className="w-full h-full text-blue-600"
        fill="currentColor"
       />
      ) : fileType.includes("ppt") ? (
       <FaFilePowerpoint
        size={70}
        className="w-full h-full text-orange-600"
        fill="currentColor"
       />
      ) : fileType.includes("xls") ? (
       <FaFileExcel
        size={70}
        className="w-full h-full text-success"
        fill="currentColor"
       />
      ) : fileType.includes("txt") ? (
       <BiSolidFileTxt
        size={70}
        className="w-full h-full text-foreground"
        fill="currentColor"
       />
      ) : fileType.includes("pdf") ? (
       <FaFilePdf
        size={100}
        className="w-full h-full text-red-500"
        fill="currentColor"
       />
      ) : (
       <FaFileImage
        size={100}
        className="w-full h-full text-primary"
        fill="currentColor"
       />
      ),
     }}
     description={
      <span className="truncate text-ellipsis line-clamp-1 ">
       {item.size && `${(item.size / 1024).toFixed(2)}kB`}
      </span>
     }
     name={
      <span className="text-ellipsis overflow-hidden break-words line-clamp-2 ">
       {item.name}
      </span>
     }
    />
    <div className="flex items-center gap-4">
     <div className="flex items-center text-foreground text-sm">
      <Switch
       isSelected={isPrivate}
       onValueChange={setIsPrivate}
       size="sm"
       thumbIcon={({ isSelected, className }) =>
        isSelected ? (
         <LockClosedIcon className="w-3 h-3 text-foreground" />
        ) : (
         <LockOpen1Icon className="w-3 h-3 text-foreground" />
        )
       }
      />
     </div>
     {type === "tasks" ? (
      <Tooltip content="Show">
       <Button
        size="md"
        isIconOnly
        color="primary"
        variant="light"
        className="p-0 rounded-full"
        onClick={() => window.open(item.url)}
       >
        <EyeOpenIcon color="purple" />
       </Button>
      </Tooltip>
     ) : (
      <Tooltip content="Delete">
       <Button
        size="sm"
        isIconOnly
        color="danger"
        variant="flat"
        radius="full"
        onClick={() => onDelete(item.index)}
       >
        <TrashIcon color="red" />
       </Button>
      </Tooltip>
     )}
    </div>
   </div>
  </>
 );
};
