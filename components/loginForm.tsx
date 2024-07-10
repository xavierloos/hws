"use client";
import { Title } from "./title";
import { toast } from "sonner";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { login } from "@/actions/login";
import { useState, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button, Card, CardBody, Input } from "@nextui-org/react";
import {
  EyeClosedIcon,
  EyeOpenIcon,
  GitHubLogoIcon,
} from "@radix-ui/react-icons";
import { FaGoogle } from "react-icons/fa";
import { forgotPassword } from "@/actions/forgotPassword";
import { signIn } from "next-auth/react";
import { DEF_LOGIN_REDIRECT } from "@/routes";

export const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible);
  const [isPending, startTransition] = useTransition();
  const [inputs, setInputs] = useState({
    email: null,
    password: null,
    code: null,
  });
  const urlError =
    searchParams.get("error") === "OAuthAccountNotLinked"
      ? "Account already used with another provider"
      : "";
  const [showOTP, setShowOTP] = useState(false);

  const onSubmit = async (e: any, values: any) => {
    e.preventDefault();
    startTransition(() => {
      login(values, callbackUrl)
        .then((data) => {
          if (data?.error) toast.error(data?.error);
          if (data?.warning) toast.warning(data?.warning);
          if (data?.success) toast.success(data?.success);
          if (data?.otp) setShowOTP(true);
        })
        .catch();
    });
  };

  const onForgotPasword = (values: any) => {
    startTransition(() => {
      if (
        inputs.email == undefined ||
        inputs.email === "" ||
        inputs.email === null
      ) {
        toast.warning("Pleasse provide an email");
      } else {
        toast.warning(
          `Are you sure you want to reset password for: ${values}?`,
          {
            action: {
              label: "YES",
              onClick: async () => {
                try {
                  forgotPassword(values).then((res) => {
                    if (res?.error) toast.error(res?.error);
                    if (res?.warning) toast.warning(res?.warning);
                    if (res?.success) toast.success(res?.success);
                  });
                } catch (e) {}
              },
            },
          }
        );
      }
    });
  };

  const onClick = (provider: "google" | "github") => {
    signIn(provider, {
      callbackUrl: callbackUrl || DEF_LOGIN_REDIRECT,
    });
  };

  return (
    <Card className="border-none bg-content1 max-w-md w-full rounded-large shadow-md">
      <CardBody className="grid grid-cols-1 gap-3 items-center justify-start p-8">
        <Title
          text="Login"
          subtext={
            showOTP
              ? "Please enter the one-time password sent to your email"
              : "Access with your credentials"
          }
          className="items-start mb-4"
        />
        <form className="grid gap-4" onSubmit={(e) => onSubmit(e, inputs)}>
          {showOTP ? (
            <div className="w-full flex justify-center">
              <InputOTP
                required
                maxLength={6}
                onChange={(e) => setInputs({ ...inputs, code: e })}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                </InputOTPGroup>{" "}
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          ) : (
            <>
              <Input
                size="sm"
                isRequired
                radius="sm"
                type="email"
                label="Email"
                onChange={(e) =>
                  setInputs({ ...inputs, email: e.target.value })
                }
              />
              <Input
                size="sm"
                required
                radius="sm"
                label="Password"
                type={passwordVisible ? "text" : "password"}
                onChange={(e) =>
                  setInputs({ ...inputs, password: e.target.value })
                }
                description={
                  <span
                    className="w-full flex justify-end hover:cursor-pointer hover:text-primary"
                    onClick={() => onForgotPasword(inputs.email)}
                  >
                    Forgot password?
                  </span>
                }
                endContent={
                  <Button
                    size="md"
                    isIconOnly
                    variant="light"
                    className="p-0 rounded-full"
                    onClick={togglePasswordVisibility}
                  >
                    {passwordVisible ? <EyeOpenIcon /> : <EyeClosedIcon />}
                  </Button>
                }
              />
            </>
          )}

          <Button
            size="md"
            color="primary"
            type="submit"
            isLoading={isPending}
            isDisabled={inputs.email && inputs.password ? false : true}
          >
            {showOTP ? "Confirm OTP" : "Login"}
          </Button>
        </form>
        {!showOTP && (
          <div className="w-full grid grid-cols-1 gap-2">
            <div className="w-[50%] middle-line text-foreground-400 text-center text-tiny m-auto">
              or login with
            </div>
            <div className="w-[50%] flex justify-around m-auto">
              <Button
                radius="sm"
                size="md"
                isIconOnly
                color="primary"
                variant="flat"
                onClick={() => onClick("github")}
              >
                <GitHubLogoIcon className="w-6 h-6" />
              </Button>
              <Button
                radius="sm"
                size="md"
                isIconOnly
                color="primary"
                variant="flat"
                onClick={() => onClick("google")}
              >
                <FaGoogle className="w-5 h-5" />
              </Button>
            </div>
            <div
              className="mt-2 text-foreground-400 text-center text-tiny m-auto hover:cursor-pointer hover:text-primary"
              onClick={() => router.push(`/hws/register`, { scroll: false })}
            >
              No an account? Register
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
};
