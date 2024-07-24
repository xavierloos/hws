import React, { useTransition } from "react";
import { Avatar } from "@nextui-org/react";
import { format } from "timeago.js";
import { useCurrentUser } from "@/hooks/use-current-user";
import { toast } from "sonner";
import axios from "axios";

type CommentProps = {
  item: any;
  isPending: boolean;
  onDelete: (id: string) => {};
};

export const Comment = ({ item, isPending, onDelete }: CommentProps) => {
  const user = useCurrentUser() || null;

  return (
    <div
      className={`flex my-2 max-w-[80%] m-auto animate-fade
      ${item.createdBy == user?.email ? "flex-row-reverse me-0" : "ms-0"}`}
    >
      <Avatar
        src={user?.image ? user?.image : ""}
        className={`w-6 h-6 shrink-0 ${
          item.createdBy === user?.email ? "ms-2" : "me-2"
        }`}
      />
      <div>
        <div
          className={`w-fit h-auto px-2 py-1 rounded-sm text-xs text-ellipsis text-content5 font-light  overflow-hidden break-words m-auto ${
            item.createdBy == user?.email
              ? "text-end me-0 bg-primary  text-black  rounded-tr-none"
              : "text-start ms-0 bg-default/50 text-black rounded-tl-none"
          }`}
        >
          {item?.comment}
        </div>
        <div
          className={`text-tiny text-default truncate text-ellipsis line-clamp-1  ${
            item.createdBy == user?.email ? "text-end " : "text-start"
          }`}
        >
          <span>{item?.name}</span>
          <span> • {format(item?.createdAt)}</span>
          {item.createdBy === user?.email && (
            <>
              {" • "}
              <span
                className="text-danger hover:underline cursor-pointer"
                onClick={() => onDelete(item.id)}
              >
                Delete
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
