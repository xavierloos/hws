"use client";
import { Title } from "@/components/title";
import React, { useState, useTransition } from "react";
import { Input, Button, Image } from "@nextui-org/react";
import { ArrowRightIcon, EnvelopeClosedIcon } from "@radix-ui/react-icons";
import axios from "axios";
import { toast } from "sonner";

export const Hero = () => {
  const [isPending, startTransition] = useTransition();
  const [invite, setInvite] = useState(false);
  const [email, setEmail] = useState(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      axios
        .post(`/api/invites`, { email })
        .then(async (res) => {
          console.log(email);
          // if (res.data.type === "warning") return toast.warning(res.data.message);
          // return toast.success(res.data.message);
        })
        .catch((e) => {});
    });
    setEmail(null);
    setInvite(false);
  };

  return (
    <div className="container py-0 my-0 max-w-[1024px]">
      <div className="grid sm:grid-cols-2 gap-6 w-full min-h-[100px]">
        <div className="grid gap-6 items-center justify-center">
          <div>
            <h1 className=" text-primary items-start">
              A complete sistem with AI integration
            </h1>
            <p className="text-muted-foreground text-sm">
              Join the revolution and start being more creative
            </p>
            {invite ? (
              <form onSubmit={(e) => onSubmit(e)}>
                <Input
                  type="email"
                  placeholder="Email"
                  size="md"
                  radius="none"
                  autoFocus
                  color="default"
                  isRequired
                  className="transition-all ease-in-out duration-300"
                  onValueChange={(e) => {
                    setEmail(e);
                  }}
                  description="An invitation will be sent to your email"
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
            ) : (
              <Button
                size="md"
                radius="none"
                className="transition-all ease-in-out duration-300"
                color="primary"
                // className="m-auto bg-primary"
                endContent={<EnvelopeClosedIcon />}
                onClick={() => setInvite(true)}
              >
                Get an invite
              </Button>
            )}
          </div>
        </div>
        <div className="w-full flex justify-center sm:pt-6">
          <Image
            isBlurred
            radius="sm"
            className="w-full max-h-[400px] md:max-h-[calc(80dvh)] m-auto"
            alt="NextUI hero Image"
            src="https://images.unsplash.com/photo-1704098712161-67949aaf0eee?q=80&w=1587&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          />
        </div>
      </div>
    </div>
  );
};
