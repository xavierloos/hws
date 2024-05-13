import { useState, useTransition } from "react";
import {
  Accordion,
  AccordionItem,
  Button,
  Input,
  Switch,
  cn,
} from "@nextui-org/react";
import axios from "axios";
import { toast } from "sonner";

export const Notifications = ({ fields }: any) => {
  const [isPending, startTransition] = useTransition();

  const onSubmit = (e: any) => {
    e.preventDefault();
    startTransition(() => {
      axios
        .put(`/api/members/${fields.id}?type=notifications`, fields)
        .then((res) => {
          if (res?.data.error) toast.error(res?.data.error);
          if (res?.data.warning) toast.warning(res?.data.warning);
          if (res?.data.success) toast.success(res?.data.success);
        })
        .catch();
    });
  };

  return (
    <>
      <Accordion
        className="h-fit bg-content1 rounded-medium shadow-small w-full px-6"
        defaultExpandedKeys={["notifications"]}
      >
        <AccordionItem
          key="notifications"
          aria-label="Notifications"
          subtitle="Notifications"
        >
          <form onSubmit={(e) => onSubmit(e)} className="grid gap-3">
            <Switch
              defaultSelected={fields.emailNotificationsEnabled}
              onValueChange={(v) => (fields.emailNotificationsEnabled = v)}
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
                <p className="text-xs">Email</p>
                <p className="text-tiny text-default-400">
                  Send emails notifications
                </p>
              </div>
            </Switch>
            <Switch
              isDisabled={fields.tel ? false : true}
              defaultSelected={fields.smsNotificationsEnabled}
              onValueChange={(v) => (fields.smsNotificationsEnabled = v)}
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
                <p className="text-xs">SMS</p>
                <p className="text-tiny text-default-400">
                  Send SMS notifications (make sure you add a phone number)
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
    </>
  );
};
