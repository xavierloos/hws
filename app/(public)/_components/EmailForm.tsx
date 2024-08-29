import React, { useState } from "react";
import { Input, Button, Image } from "@nextui-org/react";
import axios from "axios";
import { toast } from "sonner";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { useCurrentUser } from "@/hooks/use-current-user";

export const EmailForm = ({ item }: any) => {
  const user = useCurrentUser();
  const [email, setEmail] = useState(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await axios
      .post(`/api/emailverification`, { email })
      .then(async (res) => {
        console.log(res);
        if (res.data.type === "warning") return toast.warning(res.data.message);
        if (res.data.type === "error") return toast.error(res.data.message);
        return toast.success(res.data.message);
      })
      .catch((e) => {});
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
        isDisabled={user ? true : false}
        onValueChange={(e) => {
          setEmail(e);
        }}
        description="Add your email"
        endContent={
          <Button
            color="primary"
            type="submit"
            radius="full"
            size="sm"
            isIconOnly
            className="m-auto"
            isDisabled={email ? false : true}
          >
            <ArrowRightIcon />
          </Button>
        }
      />
    </form>
  );
};
