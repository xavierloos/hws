"use client";

import React, { useState } from "react";
import { Input, Button, Image } from "@nextui-org/react";
import axios from "axios";
import { toast } from "sonner";
import TopWave from "./TopWave";
import { ArrowLeftIcon, ArrowRightIcon } from "@radix-ui/react-icons";
import { useCurrentUser } from "@/hooks/use-current-user";

export const Subscribe = ({ item }: any) => {
  const user = useCurrentUser();
  const [email, setEmail] = useState(null);

  const onSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
    value: string
  ) => {
    e.preventDefault();

    axios
      .put(`/api/newsletter`, { value })
      .then(async (res) => {
        console.log(res);
        if (res.data.type === "warning") return toast.warning(res.data.message);
        return toast.success(res.data.message);
      })
      .catch((e) => {});
  };

  return (
    <>
      <TopWave />
      <div className="bg-primary">
        <div className="container pt-0 my-0 pb-8 max-w-[1024px]">
          <div className="grid sm:grid-cols-2 gap-6 w-full min-h-[100px]">
            <div className="w-full flex justify-center">
              <Image
                isBlurred
                radius="sm"
                className="min-w-full max-h-[400px] md:max-h-[calc(80dvh)] m-auto"
                alt="NextUI hero Image"
                src="https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=1827&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              />
            </div>

            <div className="grid gap-6 items-center justify-center">
              <div>
                <h1 className=" text-secondary items-start">
                  Stay in the loop
                </h1>
                <p className="text-muted-foreground text-sm">
                  Subscribe to our newsletter and stay updated!
                </p>
                <form onSubmit={(e) => onSubmit(e, email)}>
                  <Input
                    type="email"
                    placeholder={`${user ? user.email : "Email"}`}
                    size="md"
                    radius="none"
                    color="default"
                    isRequired
                    isDisabled={user ? true : false}
                    onChange={(e) => {
                      setEmail(e.target.value);
                    }}
                    description="You can unsubscribe at any time"
                    endContent={
                      <Button
                        color="primary"
                        type="submit"
                        radius="full"
                        size="sm"
                        isIconOnly
                        className="m-auto"
                        isDisabled={email ? false : true}
                        // endContent={<FaSave />}
                      >
                        <ArrowRightIcon />
                      </Button>
                    }
                  />
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
