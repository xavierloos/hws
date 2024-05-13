import { Button, Tooltip, User } from "@nextui-org/react";
import { EyeOpenIcon, TrashIcon } from "@radix-ui/react-icons";

type FilePreviewerProps = {
  item: any;
  type?: string;
  onDelete?: (i: number) => {};
};

export const FilePreviewer = ({ item, onDelete, type }: FilePreviewerProps) => {
  const img = item.url ? item.url : URL.createObjectURL(item);

  return (
    <>
      <div className="flex w-full justify-between items-center my-1">
        <User
          avatarProps={{
            radius: "md",
            src: item.type.includes("application")
              ? `https://placehold.co/600x400?text=${item.type.split("/")[1]}`
              : img,
            name: item.name,
            className: "shrink-0",
          }}
          description={
            <span className="truncate text-ellipsis line-clamp-1 ">
              {item.size && `${(item.size / 1024).toFixed(2)}kB`}
            </span>
          }
          name={
            <span className="text-ellipsis  overflow-hidden  break-words line-clamp-2 ">
              {item.name}
            </span>
          }
        />
        <div className="flex items-center">
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
                size="md"
                isIconOnly
                color="danger"
                variant="light"
                className=" p-0 rounded-full"
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
