"use client";
import { useEffect, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { Button, Card, CardBody, Input, Spinner } from "@nextui-org/react";
import { Title } from "./title";
import { resetPassword } from "@/actions/forgotPassword";
import {
  CheckCircledIcon,
  CircleIcon,
  ExclamationTriangleIcon,
  EyeClosedIcon,
  EyeOpenIcon,
} from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import { validateToken } from "@/actions/verification";

export const ResetPasswordForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | undefined>();
  const [messageType, setMessageType] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [password2Visible, setPassword2Visible] = useState(false);
  const [inputs, setInputs] = useState({
    password: undefined,
  });
  const [passwordValidation, setPasswordValidation] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasDigit: false,
    hasSpecialChar: false,
    confirmPasswordMatch: false,
  });

  useEffect(() => {
    if (token) {
      validateToken(token)
        .then((res) => {
          if (res.msg) {
            setMessage(res.msg);
            setMessageType(res.type);
          }
        })
        .catch((e) => {});
    } else {
      router.push(`/hws/login`, { scroll: false });
    }
    setLoading(false);
  }, [token]);

  const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible);
  const togglePassword2Visibility = () =>
    setPassword2Visible(!password2Visible);

  const validatePassword = (value: any) => {
    const upper = /(?=.*?[A-Z])/;
    const lower = /(?=.*?[a-z])/;
    const digit = /(?=.*?[0-9])/;
    const special = /(?=.*?[#?!@$ %^&*-])/;

    setPasswordValidation({
      ...passwordValidation,
      hasMinLength: checkLength(value),
      hasUpperCase: checkPassword(value, upper),
      hasLowerCase: checkPassword(value, lower),
      hasDigit: checkPassword(value, digit),
      hasSpecialChar: checkPassword(value, special),
    });
    setInputs({ ...inputs, password: value });
  };

  const checkLength = (value: string) => {
    if (value.length >= 8) {
      return true;
    } else {
      return false;
    }
  };

  const checkPassword = (value: string, checkPoint: any) => {
    if (value.match(checkPoint)) {
      return true;
    } else {
      return false;
    }
  };

  const confirmPassword = (value: string) => {
    if (value === inputs.password) {
      return setPasswordValidation({
        ...passwordValidation,
        confirmPasswordMatch: true,
      });
    } else {
      return setPasswordValidation({
        ...passwordValidation,
        confirmPasswordMatch: false,
      });
    }
  };

  const onSubmit = async (e: any, values: any) => {
    e.preventDefault();
    startTransition(() => {
      resetPassword(values, token).then((res) => {
        if (res.msg) {
          setMessage(res.msg);
          setMessageType(res.type);
        }
        setTimeout(() => router.push(`/hws/login`, { scroll: false }), 5000);
      });
    });
  };

  return (
    <Card className="border-none bg-content1 max-w-md w-full rounded-large shadow-md">
      <CardBody className="grid grid-cols-1 gap-3 items-center justify-start p-8">
        <Title
          text="Reset password"
          subtext={"You requested a changing password"}
          className="items-start mb-4"
        />
        {loading && <Spinner size="lg" label="One sec..." />}
        {message && (
          <div className="w-full flex flex-col justify-center text-center items-center">
            {messageType === "error" ? (
              <ExclamationTriangleIcon className="w-10 h-10" color="red" />
            ) : (
              <CheckCircledIcon className="w-10 h-10" color="green" />
            )}
            {message}
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
        {!loading && !message && (
          <>
            <form className="grid gap-3" onSubmit={(e) => onSubmit(e, inputs)}>
              <Input
                size="sm"
                isRequired
                radius="sm"
                label="New Password"
                type={passwordVisible ? "text" : "password"}
                onKeyUp={(e) => validatePassword(e.target.value)}
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
              <Input
                size="sm"
                isRequired
                radius="sm"
                label="Confirm Password"
                type={password2Visible ? "text" : "password"}
                onKeyUp={(e) => confirmPassword(e.target.value)}
                endContent={
                  <Button
                    size="md"
                    isIconOnly
                    variant="light"
                    className="p-0 rounded-full"
                    onClick={togglePassword2Visibility}
                  >
                    {password2Visible ? <EyeOpenIcon /> : <EyeClosedIcon />}
                  </Button>
                }
              />
              <div className="grid grid-cols-2 md:gap-2">
                <div>
                  <div className="text-muted-foreground text-xs flex">
                    {passwordValidation.hasMinLength ? (
                      <CheckCircledIcon className="me-2 text-success" />
                    ) : (
                      <CircleIcon className="me-2" />
                    )}
                    <span
                      className={
                        passwordValidation.hasMinLength && "line-through"
                      }
                    >
                      Min length (8)
                    </span>
                  </div>
                  <div className="text-muted-foreground text-xs flex">
                    {passwordValidation.hasUpperCase ? (
                      <CheckCircledIcon className="me-2 text-success" />
                    ) : (
                      <CircleIcon className="me-2" />
                    )}
                    <span
                      className={
                        passwordValidation.hasUpperCase && "line-through"
                      }
                    >
                      Upper letter (A-Z)
                    </span>
                  </div>
                  <div className="text-muted-foreground text-xs flex">
                    {passwordValidation.hasLowerCase ? (
                      <CheckCircledIcon className="me-2 text-success" />
                    ) : (
                      <CircleIcon className="me-2" />
                    )}
                    <span
                      className={
                        passwordValidation.hasLowerCase && "line-through"
                      }
                    >
                      Lower letter (a-z)
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs flex">
                    {passwordValidation.hasSpecialChar ? (
                      <CheckCircledIcon className="me-2 text-success" />
                    ) : (
                      <CircleIcon className="me-2" />
                    )}
                    <span
                      className={
                        passwordValidation.hasSpecialChar && "line-through"
                      }
                    >
                      Special character
                    </span>
                  </div>
                  <div className="text-muted-foreground text-xs flex">
                    {passwordValidation.confirmPasswordMatch ? (
                      <CheckCircledIcon className="me-2 text-success" />
                    ) : (
                      <CircleIcon className="me-2" />
                    )}
                    <span
                      className={
                        passwordValidation.confirmPasswordMatch &&
                        "line-through"
                      }
                    >
                      Passwords match
                    </span>
                  </div>
                </div>
              </div>
              <Button
                size="md"
                color="primary"
                type="submit"
                isLoading={isPending}
              >
                Change password
              </Button>
            </form>
            <div className="w-full grid grid-cols-1 gap-2">
              <div
                className="mt-2 text-foreground-400 text-center text-tiny m-auto hover:cursor-pointer hover:text-primary"
                onClick={() => router.push(`/hws/login`, { scroll: false })}
              >
                No , it wasn't me... Login
              </div>
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
};
