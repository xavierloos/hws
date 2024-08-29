"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { verification } from "@/actions/verification";
import { Card, CardBody, Spinner } from "@nextui-org/react";
import { Title } from "./title";
import { useRouter } from "next/navigation";
import { FaWatchmanMonitoring } from "react-icons/fa";
import {
  CheckCircledIcon,
  ExclamationTriangleIcon,
} from "@radix-ui/react-icons";
import axios from "axios";

export const VerificationForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const type = searchParams.get("type") || "";
  const [message, setMessage] = useState<string | undefined>();
  const [messageType, setMessageType] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token == null) router.push(`/hws/login`, { scroll: false });
    if (token) {
      verification(token, type)
        .then(async (res) => {
          console.log(type, res);
          await axios
            .post(`/api/members/request`, { email: res.email })
            .then(async (res: any) => {
              console.log(res);
            })
            .catch((e) => {});
          setMessage(res.msg);
          setMessageType(res.type);
        })
        .catch(() => {});
    }
    setLoading(false);
  }, [token]);

  return (
    <Card className="border-none bg-content1 max-w-md w-full rounded-md shadow-md">
      <CardBody className="grid grid-cols-1 gap-3 items-center justify-start p-8">
        <Title
          text="Email Verification"
          subtext={message ? message : "Please wait while we verify you"}
          className="items-center mb-4"
        />
        {message && (
          <div className="w-full flex flex-col justify-center text-center items-center">
            {messageType === "error" ? (
              <ExclamationTriangleIcon className="w-10 h-10" color="red" />
            ) : (
              <CheckCircledIcon className="w-10 h-10" color="green" />
            )}
            <div className="w-full grid grid-cols-1 gap-2">
              <div
                className="mt-2 text-foreground-400 text-center text-tiny m-auto hover:cursor-pointer hover:text-primary"
                onClick={() => router.push(`/hws/login`, { scroll: false })}
              >
                Take me back to Login
              </div>
            </div>
          </div>
        )}

        {loading && <Spinner size="lg" label="One sec..." />}
      </CardBody>
    </Card>
  );
};
