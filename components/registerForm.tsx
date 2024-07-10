"use client";
import { register } from "@/actions/register";
import { useTransition, useEffect, useState } from "react";
import { validateToken } from "@/actions/verification";
import { useSearchParams } from "next/navigation";
import { Card, CardBody, Button, Input, Spinner } from "@nextui-org/react";
import {
  CheckCircledIcon,
  CircleIcon,
  ExclamationTriangleIcon,
  EyeClosedIcon,
  EyeOpenIcon,
  GitHubLogoIcon,
} from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import { Title } from "./title";
import { toast } from "sonner";
import { FaGoogle } from "react-icons/fa";
import { signIn } from "next-auth/react";
import { DEF_LOGIN_REDIRECT } from "@/routes";

export const RegisterForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [message, setMessage] = useState<string | undefined>();
  const [messageType, setMessageType] = useState<string | undefined>();
  const [passwordHelp, setPasswordHelp] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [password2Visible, setPassword2Visible] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasDigit: false,
    hasSpecialChar: false,
    confirmPasswordMatch: false,
  });
  const [inputs, setInputs] = useState({
    name: null,
    email: null,
    username: null,
    password: null,
  });
  const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible);
  const togglePassword2Visibility = () =>
    setPassword2Visible(!password2Visible);

  useEffect(() => {
    if (token) {
      validateToken(token)
        .then((res) => {
          if (res.msg) {
            setMessage(res.msg);
            setMessageType(res.type);
            setLoading(false);
          } else {
            inputs.email = res.email;
            setLoading(false);
          }
        })
        .catch((e) => {
          setError("Something went wrong");
          setLoading(false);
        });
    } else {
      router.push(`/hws/login`, { scroll: false });
    }
  }, [token]);

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
    setPasswordHelp(true);
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
      register(values, token).then((data) => {
        if (data?.error) toast.error(data?.error);
        if (data?.warning) toast.warning(data?.warning);
        if (data?.success) setSuccess(data?.success);
        setTimeout(() => router.push(`/hws/login`, { scroll: false }), 5000);
      });
    });
  };

  const callbackUrl = searchParams.get("callbackUrl");

  const onClick = (provider: "google" | "github") => {
    signIn(provider, {
      callbackUrl: callbackUrl || DEF_LOGIN_REDIRECT,
    });
  };

  return (
    <>
      <Card
        className="border-none bg-content1 max-w-md w-full rounded-large shadow-small"
        shadow="sm"
      >
        <CardBody className="grid  grid-cols-1  gap-2 items-center justify-center py-4 px-8">
          <Title
            text={token ? "Register invitation" : "Register"}
            subtext={
              message
                ? "Something went wrong"
                : token
                ? "Someone invited you to join their team, please register!"
                : "Please fill up the form"
            }
            className="items-start mb-2"
          />
          {loading && <Spinner size="lg" label="Loading..." />}
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
          {success && (
            <>
              <h3>{success}</h3>
              <Spinner size="md" label="Redirecting to login..." />
            </>
          )}

          {!error && !loading && !success && !message ? (
            <>
              <form
                className="grid gap-3"
                onSubmit={(e) => onSubmit(e, inputs)}
              >
                <Input
                  size="sm"
                  isRequired
                  radius="sm"
                  type="text"
                  label="Full Name"
                  onChange={(e) =>
                    setInputs({ ...inputs, name: e.target.value })
                  }
                />
                <Input
                  size="sm"
                  isRequired
                  isDisabled={token ? true : false}
                  radius="sm"
                  type="email"
                  label="Email"
                  value={token && inputs.email}
                  onChange={(e) =>
                    setInputs({ ...inputs, email: e.target.value })
                  }
                />
                <Input
                  size="sm"
                  isRequired
                  radius="sm"
                  type="text"
                  label="Username"
                  onKeyDown={(e) => {
                    if (e.keyCode === 32) e.preventDefault(); // Disable space key
                  }}
                  onChange={(e) =>
                    setInputs({ ...inputs, username: e.target.value })
                  }
                />
                <Input
                  size="sm"
                  isRequired
                  radius="sm"
                  label="Password"
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
                  description={
                    passwordHelp && (
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
                                passwordValidation.hasMinLength &&
                                "line-through"
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
                                passwordValidation.hasUpperCase &&
                                "line-through"
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
                                passwordValidation.hasLowerCase &&
                                "line-through"
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
                                passwordValidation.hasSpecialChar &&
                                "line-through"
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
                    )
                  }
                />
                <Button
                  size="md"
                  color="primary"
                  type="submit"
                  isLoading={isPending}
                  isDisabled={
                    inputs.name &&
                    inputs.username &&
                    inputs.email &&
                    inputs.password &&
                    passwordValidation.confirmPasswordMatch
                      ? false
                      : true
                  }
                >
                  Create account
                </Button>
              </form>
              {!token && (
                <>
                  <div className="w-full grid grid-cols-1 gap-2">
                    <div className="w-[50%] middle-line text-foreground-400 text-center text-tiny m-auto">
                      or use
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
                      onClick={() =>
                        router.push(`/hws/login`, { scroll: false })
                      }
                    >
                      Already an account? Login
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            <Title
              text={error ? "Register invitation" : ""}
              subtext={error}
              className="items-start mb-4"
            />
          )}
        </CardBody>
      </Card>
    </>
  );
};
