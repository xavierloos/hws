import {
  Accordion,
  AccordionItem,
  Textarea,
  Input,
  Select,
  SelectItem,
  Avatar,
  Button,
  DatePicker,
  Badge,
} from "@nextui-org/react";
import { UserRole } from "@prisma/client";
import { useEffect, useState, useTransition } from "react";
import axios from "axios";
import { toast } from "sonner";
import { CameraIcon, Pencil1Icon, Pencil2Icon } from "@radix-ui/react-icons";

export const PersonalInformation = ({ fields }: any) => {
  const [isPending, startTransition] = useTransition();
  const [preview, setPreview] = useState(null);
  const [avatar, setAvatar] = useState<File[]>([]);

  const onSubmit = async (e: any) => {
    e.preventDefault();
    startTransition(async () => {
      if (preview) {
        const data = new FormData();
        data.append(avatar?.name, avatar);
        await axios.post(`/api/files?type=profiles`, data);
        fields.image = `${fields.id}.${avatar?.type.split("/")[1]}`;
      }
      await axios
        .put(`/api/members/${fields.id}?type=profile`, fields)
        .then((res) => {
          if (res?.data.error) toast.error(res?.data.error);
          if (res?.data.warning) toast.warning(res?.data.warning);
          if (res?.data.success) toast.success(res?.data.success);
        })
        .catch();
    });
  };

  const handleAvatarSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAvatar(e.target.files[0]);
      setPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  return (
    <Accordion
      defaultExpandedKeys={["p_i"]}
      className="h-fit bg-content1 rounded-medium shadow-small w-full px-6"
    >
      <AccordionItem
        key="p_i"
        aria-label="personal information"
        subtitle="Personal Information"
      >
        <form onSubmit={(e) => onSubmit(e)} className="grid gap-3">
          <div className="grid grid-cols-[1fr,2fr] flex-grow-1 overflow-auto">
            <div className="flex flex-col items-center p-2">
              <Badge
                size="lg"
                isOneChar
                shape="circle"
                color="default"
                showOutline={false}
                placement="bottom-right"
                content={
                  <label htmlFor="uploadfiles">
                    <CameraIcon />
                  </label>
                }
              >
                <Avatar
                  isBordered
                  src={preview || fields.tempUrl || fields.image}
                  className={` w-32 h-32 shrink-0 m-auto items-center ${
                    fields.role === "SUPERADMIN"
                      ? "bg-primary text-foreground"
                      : fields.role === "ADMIN"
                      ? "bg-foreground text-primary"
                      : "bg-default text-default-foreground"
                  }`}
                  color={
                    fields.role === "SUPERADMIN" || fields.role === "ADMIN"
                      ? "primary"
                      : "default"
                  }
                />
              </Badge>

              <input
                id="uploadfiles"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarSelected}
              />
            </div>
            <div className="grid gap-3">
              <div className="grid grid-cols-1 gap-3">
                <Input
                  size="sm"
                  radius="sm"
                  type="text"
                  label="Full Name"
                  defaultValue={fields?.name}
                  onValueChange={(v) => (fields.name = v)}
                />
                <Input
                  size="sm"
                  radius="sm"
                  type="text"
                  label="Username"
                  defaultValue={fields?.username}
                  onValueChange={(v) => (fields.username = v)}
                  placeholder="@username"
                />
              </div>
              <Input
                size="sm"
                isDisabled
                radius="sm"
                type="email"
                label="Email"
                defaultValue={fields?.email}
                placeholder="john.doe@email.com"
              />
            </div>
          </div>
          <div className="grid gap-3">
            <div className="grid gap-3 grid-cols-2">
              <Select
                size="sm"
                radius="sm"
                label="User Role"
                placeholder="Select a role"
                // isDisabled={inputs?.role === "USER"}
                onChange={(e) => (fields.role = e.target.value)}
                defaultSelectedKeys={[fields?.role]}
              >
                {Object.keys(UserRole).map((key) => (
                  <SelectItem key={key} value={key}>
                    {key}
                  </SelectItem>
                ))}
              </Select>
              <Input
                size="sm"
                radius="sm"
                type="text"
                variant="flat"
                defaultValue={fields?.tel}
                onValueChange={(v) => (fields.tel = v)}
                label="Phone Number"
                placeholder="+44 0 123456789"
              />
            </div>

            <Textarea
              size="sm"
              radius="sm"
              type="text"
              label="About"
              defaultValue={fields?.about}
              onValueChange={(v) => (fields.about = v)}
              placeholder="Something about myself"
            />
          </div>
          <div className="w-full justify-end flex mb-3">
            <Button
              size="md"
              color="danger"
              variant="light"
              // type="submit"
              // isLoading={pending}
            >
              Delete Account
            </Button>
            <Button
              size="md"
              color="primary"
              type="submit"
              className="ms-2"
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
