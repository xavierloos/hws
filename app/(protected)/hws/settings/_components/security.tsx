import { useState, useTransition } from "react";
import {
  Accordion,
  AccordionItem,
  Button,
  Input,
  Switch,
  Tooltip,
  cn,
} from "@nextui-org/react";
import {
  CheckCircledIcon,
  CircleIcon,
  EyeClosedIcon,
  EyeOpenIcon,
  InfoCircledIcon,
} from "@radix-ui/react-icons";
import axios from "axios";
import { toast } from "sonner";

export const Security = ({ fields }: any) => {
  const [isPending, startTransition] = useTransition();
  const [showPsswrd1, setShowPsswrd1] = useState(false);
  const [showPsswrd2, setShowPsswrd2] = useState(false);
  const [showPsswrd3, setShowPsswrd3] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasDigit: false,
    hasSpecialChar: false,
    confirmPasswordMatch: false,
  });

  const toggle1 = () => setShowPsswrd1(!showPsswrd1);
  const toggle2 = () => setShowPsswrd2(!showPsswrd2);
  const toggle3 = () => setShowPsswrd3(!showPsswrd3);

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
    fields.newPassword = value;
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
    if (value === fields.newPassword) {
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

  const onSubmit = (e: any) => {
    e.preventDefault();
    startTransition(() => {
      axios
        .put(`/api/members/${fields.id}?type=security`, fields)
        .then((res) => {
          if (res?.data.error) toast.error(res?.data.error);
          if (res?.data.warning) toast.warning(res?.data.warning);
          if (res?.data.success) toast.success(res?.data.success);
        })
        .catch();
    });
  };

  const PasswordHelp = () => {
    return (
      <Tooltip
        content={
          <div className="px-1 py-2">
            <div className="text-small font-bold flex items-center">
              <InfoCircledIcon className="me-1" /> Help
            </div>
            <div className="ms-4">
              <div className="text-muted-foreground text-tiny flex">
                {passwordValidation.hasMinLength ? (
                  <CheckCircledIcon className="me-1 text-success" />
                ) : (
                  <CircleIcon className="me-1" />
                )}
                Min length (8)
              </div>
              <div className="text-muted-foreground text-xs flex">
                {passwordValidation.hasUpperCase ? (
                  <CheckCircledIcon className="me-1 text-success" />
                ) : (
                  <CircleIcon className="me-1" />
                )}
                Upper letter (A-Z)
              </div>
              <div className="text-muted-foreground text-xs flex">
                {passwordValidation.hasLowerCase ? (
                  <CheckCircledIcon className="me-1 text-success" />
                ) : (
                  <CircleIcon className="me-1" />
                )}
                Lower letter (a-z)
              </div>
              <div className="text-muted-foreground text-xs flex">
                {passwordValidation.hasSpecialChar ? (
                  <CheckCircledIcon className="me-1 text-success" />
                ) : (
                  <CircleIcon className="me-1" />
                )}
                Special character
              </div>
            </div>
          </div>
        }
      >
        <InfoCircledIcon />
      </Tooltip>
    );
  };

  return (
    <Accordion
      className="h-fit bg-content1 rounded-medium shadow-small w-full px-6"
      defaultExpandedKeys={["security"]}
    >
      <AccordionItem key="security" aria-label="Security" subtitle="Security">
        <form onSubmit={(e) => onSubmit(e)} className="grid gap-3">
          <p className="text-xs">Change password</p>
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-3 md:grid-cols-1">
            <Input
              size="sm"
              radius="md"
              label="Old"
              type={showPsswrd1 ? "text" : "password"}
              onValueChange={(v) => (fields.password = v)}
              startContent={
                <span onClick={toggle1}>
                  {showPsswrd1 ? <EyeOpenIcon /> : <EyeClosedIcon />}
                </span>
              }
            />
            <Input
              size="sm"
              radius="md"
              label="New"
              type={showPsswrd2 ? "text" : "password"}
              onKeyUp={(e) => validatePassword(e.target.value)}
              startContent={
                <span onClick={toggle2}>
                  {showPsswrd2 ? <EyeOpenIcon /> : <EyeClosedIcon />}
                </span>
              }
              endContent={<PasswordHelp />}
            />
            <Input
              size="sm"
              radius="md"
              label="Confirm"
              type={showPsswrd3 ? "text" : "password"}
              onKeyUp={(e) => confirmPassword(e.target.value)}
              startContent={
                <span onClick={toggle3}>
                  {showPsswrd3 ? <EyeOpenIcon /> : <EyeClosedIcon />}
                </span>
              }
              endContent={
                passwordValidation.confirmPasswordMatch && (
                  <Tooltip
                    content={
                      <div className="px-1 py-2">
                        <div className="text-small font-bold flex items-center">
                          <InfoCircledIcon className="me-1" /> Help
                        </div>
                        <div className="ms-4">
                          <div className="text-muted-foreground text-xs flex">
                            {passwordValidation.confirmPasswordMatch ? (
                              <CheckCircledIcon className="me-2 text-success" />
                            ) : (
                              <CircleIcon className="me-2" />
                            )}
                            Passwords match
                          </div>
                        </div>
                      </div>
                    }
                  >
                    <CheckCircledIcon className=" text-success" />
                  </Tooltip>
                )
              }
            />
          </div>
          <Switch
            defaultSelected={fields.otpEnabled}
            onValueChange={(v) => (fields.otpEnabled = v)}
            classNames={{
              base: cn(
                "inline-flex flex-row-reverse w-full max-w-full hover:bg-default-200 items-center",
                "justify-between cursor-pointer rounded-lg gap-2 p-4 border-2 border-transparent  bg-content2"
              ),
              wrapper: "p-0 h-4 overflow-visible",
              thumb: cn(
                "w-6 h-6 border-2 shadow-lg  bg-content1",
                "group-data-[hover=true]:border-primary",
                //selected
                "group-data-[selected=true]:ml-6",
                // pressed
                "group-data-[pressed=true]:w-7",
                "group-data-[selected]:group-data-[pressed]:ml-4"
              ),
            }}
          >
            <div className="flex flex-col gap-1">
              <p className="text-xs">Enable OTP</p>
              <p className="text-tiny text-default-400">
                Send One-Time-Password confimation
              </p>
            </div>
          </Switch>
          <div className="w-full justify-end flex py-2">
            <Button
              size="md"
              type="submit"
              color="primary"
              isLoading={isPending}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </AccordionItem>
    </Accordion>
  );
};
