"use client";
import { Button, Input, ModalBody, ModalHeader } from "@nextui-org/react";
import { useState } from "react";
import { FileIcon } from "@radix-ui/react-icons";
import { FilePreviewer } from "./filePreviewer";

type NewMemberFormProps = {
  onSubmit: (e?: any, values?: any) => {};
  onClose: () => {};
};

export const NewMemberForm = ({ onSubmit, onClose }: NewMemberFormProps) => {
  const [email, setEmail] = useState(null);
  return (
    <form
      onSubmit={(e) => {
        onSubmit(e, email);
      }}
      className="gap-4 grid grid-cols-1 pb-4"
    >
      <div className="w-full text-muted-foreground text-sm">
        Send an invitation to a new member
      </div>
      <Input
        radius="md"
        type="email"
        label="Email"
        size="sm"
        isRequired
        onValueChange={(e) => setEmail(e)}
      />
      <Button size="md" color="primary" type="submit" onPress={onClose}>
        Send
      </Button>
    </form>
  );
};
