"use client";
import { Card, CardBody, Spinner } from "@nextui-org/react";
import { Title } from "./title";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export const ErrorCard = () => {
  const router = useRouter();
  useEffect(() => {
    setTimeout(router.push(`/hws/login`, { scroll: false }), 10000);
  }, []);

  return (
    <Card
      className="border-none bg-content1 max-w-md w-full rounded-large shadow-small"
      shadow="sm"
    >
      <CardBody className="grid  grid-cols-1  gap-2 items-center justify-center py-4 px-8">
        <Title
          text="Oops... 😢 "
          subtext="Something went wrong "
          className="items-start mb-2"
        />{" "}
        <Spinner size="lg" label="Redirecting to login..." />
      </CardBody>
    </Card>
  );
};
