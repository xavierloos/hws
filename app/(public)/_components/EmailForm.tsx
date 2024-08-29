import React, { useState, useTransition } from "react";
import { Input, Button, Image } from "@nextui-org/react";
import axios from "axios";
import { toast } from "sonner";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { useCurrentUser } from "@/hooks/use-current-user";

export const EmailForm = ({ type }: any) => {
  const user = useCurrentUser();
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      await axios
        .post(`/api/emailverification`, { email, type })
        .then(async (res) => {
          if (res.data.type === "warning")
            return toast.warning(res.data.message);
          if (res.data.type === "error") return toast.error(res.data.message);
          return toast.success(res.data.message);
        })
        .catch((e) => {});
    });
  };

  return (
    <form onSubmit={(e) => onSubmit(e)}>
      <Input
        type="email"
        placeholder={`${user ? user.email : "Email"}`}
        size="md"
        radius="none"
        color="default"
        isRequired
        isDisabled={user || isPending ? true : false}
        onValueChange={(e) => {
          setEmail(e);
        }}
        description={
          type === "subscribe"
            ? "You can unsubscribe at any time"
            : "An invite to register will be send to your email"
        }
        endContent={
          <Button
            color="primary"
            type="submit"
            radius="full"
            size="sm"
            isIconOnly
            className="m-auto"
            isDisabled={email ? false : true}
            isLoading={isPending}
          >
            <ArrowRightIcon />
          </Button>
        }
      />
    </form>
  );
};
