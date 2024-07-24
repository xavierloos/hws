import React, { useTransition, useEffect, useState } from "react";
import { format } from "timeago.js";
import { useCurrentUser } from "@/hooks/use-current-user";
import { toast } from "sonner";
import axios from "axios";
import { Comment } from "./Comment";
import { PaperPlaneIcon } from "@radix-ui/react-icons";
import {
  Image,
  Button,
  Chip,
  User,
  Textarea,
  Avatar,
  Input,
} from "@nextui-org/react";

type CommentsProps = {
  slug: string;
};

export const Comments = ({ slug }: CommentsProps) => {
  const user = useCurrentUser() || null;
  const [comments, setComments] = useState([]);
  const [isPending, startTransition] = useTransition();
  const [inputs, setInputs] = useState({
    relatedId: null,
    name: user?.name || "",
    createdBy: user?.email || "",
    comment: "",
  });

  useEffect(() => {
    getComments();
  }, []);

  const getComments = () => {
    axios
      .get(`/api/blogs/${slug}`)
      .then((res) => {
        setComments(res.data.comments);
        setInputs({ ...inputs, relatedId: res.data.id });
      })
      .catch((e) => {});
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>, values: any) => {
    e.preventDefault();
    startTransition(async () => {
      await axios
        .post(`/api/blogs/${slug}`, values)
        .then(async (res) => {
          if (res?.data.type === "warning") toast.warning(res?.data.message);
          if (res?.data.type === "success") toast.success(res?.data.message);
          setInputs({
            ...inputs,
            name: user?.name || "",
            createdBy: user?.email || "",
            comment: "",
          });
        })
        .catch((e) => {
          toast.error(e.response.data.message);
        });
      return getComments();
    });
  };

  const onDelete = async (id: string) => {
    startTransition(async () => {
      await axios.delete(`/api/comments?id=${id}`).then(() => getComments());
    });
  };

  return (
    <>
      <form onSubmit={(e) => onSubmit(e, inputs)}>
        <div className="flex">
          <Avatar
            size="sm"
            showFallback
            // src={data?.user?.image}
            className=" me-2 shrink-0"
          />
          <div className="w-full grid grid-cols-1 gap-3">
            <div className="grid grid-cols-2 gap-3">
              <Input
                size="sm"
                type="text"
                isRequired
                placeholder="Full Name"
                defaultValue={user?.name || ""}
                isDisabled={user ? true : false}
                onValueChange={(e) => {
                  inputs.name = e;
                }}
              />
              <Input
                size="sm"
                type="email"
                isRequired
                placeholder="Email"
                defaultValue={user?.email || ""}
                isDisabled={user ? true : false}
                onValueChange={(e) => {
                  inputs.createdBy = e;
                }}
              />
            </div>
            <Textarea
              placeholder="What do you think of this blog?"
              size="sm"
              radius="sm"
              className="w-full text-tiny"
              color="default"
              isRequired
              defaultValue={inputs.comment}
              minRows={2}
              onChange={(e) => {
                inputs.comment = e.target.value;
              }}
              endContent={
                <Button
                  size="sm"
                  isIconOnly
                  color="primary"
                  type="submit"
                  className="ms-2 rounded-full"
                  isLoading={isPending}
                >
                  <PaperPlaneIcon />
                </Button>
              }
            />
          </div>
        </div>
      </form>
      <div className="flex flex-col gap-2 justify-start my-3 animate-fade">
        {comments?.map((item: any) => {
          return (
            <Comment
              item={item}
              key={item.id}
              isPending={isPending}
              onDelete={onDelete}
            />
          );
        })}
      </div>
    </>
  );
};
