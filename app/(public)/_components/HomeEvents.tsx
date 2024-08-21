"use client";
import { Title } from "@/components/title";
import React, { useState } from "react";
import { Input, Button, Image } from "@nextui-org/react";
import TopWave from "./TopWave";
import BottomWave from "./BottomWave";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";

export const HomeEvents = () => {
  const router = useRouter();
  return (
    <>
      <TopWave />
      <div className="bg-primary">
        <div className="container py-0 my-0 max-w-[1024px]">
          <div className="grid sm:grid-cols-2 gap-6 w-full min-h-[100px]">
            <div className="w-full flex justify-center">
              <Image
                isBlurred
                radius="sm"
                className="w-full max-h-[400px] md:max-h-[calc(80dvh)] m-auto"
                alt="NextUI hero Image"
                src="https://images.unsplash.com/photo-1697339413375-1c12cc691fce?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              />
            </div>

            <div className="grid gap-6 items-center justify-center">
              <div>
                <h1 className=" text-secondary items-start">
                  Check out the latest events!
                </h1>
                <p className="text-muted-foreground text-sm">
                  Discover the latest events happending in london, from musicals
                  and sensational plays. Don't miss out on this chance to book
                  great seats at incredible rates.
                </p>
                <Button
                  size="md"
                  radius="none"
                  className="m-auto bg-white"
                  endContent={<ArrowRightIcon />}
                  onClick={() => router.push(`/events`, { scroll: false })}
                >
                  Take me there
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <BottomWave />
    </>
  );
};
