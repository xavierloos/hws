"use client";
import { Title } from "@/components/title";
import React, { useState } from "react";
import { Input, Button, Image } from "@nextui-org/react";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
export const HomeBlogs = () => {
  const router = useRouter();
  return (
    <div className="container py-0 my-0 max-w-[1024px]">
      <div className="grid sm:grid-cols-2 gap-6 w-full min-h-[100px]">
        <div className="grid gap-6 items-center justify-center">
          <div>
            <h1 className=" text-primary items-start">Read all about</h1>
            <p className="text-muted-foreground text-sm">
              Find out the latest news. Read all about London shows, West End
              casts, upcoming shows, theatre reviews, and more. Check out our
              blogs.
            </p>
            <Button
              size="md"
              radius="none"
              className="m-auto bg-primary"
              endContent={<ArrowRightIcon />}
              onClick={() => router.push(`/blogs`, { scroll: false })}
            >
              Have a look
            </Button>
          </div>
        </div>
        <div className="w-full flex justify-center sm:pt-6">
          <Image
            isBlurred
            radius="sm"
            className="w-full max-h-[400px] md:max-h-[calc(80dvh)] m-auto"
            alt="NextUI hero Image"
            src="https://images.unsplash.com/photo-1570382160267-c233b329f78b?q=80&w=1924&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          />
        </div>
      </div>
    </div>
  );
};
