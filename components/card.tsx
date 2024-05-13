"use client";

import React from "react";
import { Card, CardBody, Image, Button, Slider } from "@nextui-org/react";

export const CardW = ({ children }: { children: React.ReactNode }) => {
  return (
    <Card
      isBlurred
      className="border-none bg-background/30 dark:bg-default-100/50 max-w-[610px]"
      shadow="md"
    >
      <CardBody>
        <div className="grid grid-cols-6 md:grid-cols-12 gap-6 md:gap-4 items-center justify-center">
          {children}
        </div>
      </CardBody>
    </Card>
  );
};
