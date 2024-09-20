import { Input, Button, ModalBody, Tooltip } from "@nextui-org/react";
import { useState } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { PaperPlaneIcon } from "@radix-ui/react-icons";

type AddProps = {
 onSubmit: (e: any, values: any) => {};
 isLoading: boolean;
};

export const Add = ({ onSubmit, isLoading }: AddProps) => {
 const [fields, setFields] = useState({
  email: undefined,
 });

 return (
  <>
   <ModalBody>
    <form
     onSubmit={async (e) => onSubmit(e, fields)}
     className="grid gap-3 mb-4"
    >
     <div className="flex flex-row items-center gap-3">
      <Input
       size="sm"
       isRequired
       type="email"
       radius="none"
       label="Email"
       value={fields.email}
       onValueChange={(v) => {
        setFields({
         ...fields,
         email: v,
        });
       }}
       description="An email invitation will be sent"
       endContent={
        <Tooltip content="Send invitation" size="sm">
         <Button
          size="sm"
          color="primary"
          type="submit"
          radius="full"
          // className="m-auto my-auto"
          isIconOnly
          isDisabled={isLoading || !fields.email}
          endContent={!isLoading && <PaperPlaneIcon />}
          isLoading={isLoading}
         />
        </Tooltip>
       }
      />
     </div>
    </form>
   </ModalBody>
  </>
 );
};
