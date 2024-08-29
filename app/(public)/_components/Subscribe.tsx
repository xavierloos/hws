"use client";

import React, { useState } from "react";
import { Input, Button, Image } from "@nextui-org/react";
import axios from "axios";
import { toast } from "sonner";
import TopWave from "./TopWave";
import { ArrowLeftIcon, ArrowRightIcon } from "@radix-ui/react-icons";
import { useCurrentUser } from "@/hooks/use-current-user";
import { EmailForm } from "./EmailForm";

export const Subscribe = () => {
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
                <p className="text-muted-foreground text-md">
                  Subscribe to our newsletter to unlock exclusive updates!
                </p>
                <EmailForm type="subscribe" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
