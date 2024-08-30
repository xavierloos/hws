"use client";
import { signOut } from "next-auth/react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Navbar, NavbarContent } from "@nextui-org/react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
  DropdownSection,
  User,
} from "@nextui-org/react";
import { useEffect, useState, useTransition } from "react";
import axios from "axios";
import { ExitIcon, InfoCircledIcon } from "@radix-ui/react-icons";

export const Header = () => {
  const user = useCurrentUser();
  const [data, setData] = useState(null);
  const [isPending, startTransition] = useTransition();
  const onClick = async () => {
    await signOut();
  };

  useEffect(() => {
    getData(user?.id);
  }, []);

  const getData = async (id: string) => {
    startTransition(async () => {
      await axios
        .get(`/api/members/${id}`)
        .then((res) => {
          return setData(res.data);
        })
        .catch((e) => {});
    });
  };

  return (
    <Navbar isBordered className="container hidden sm:flex">
      <NavbarContent justify="end">
        {!isPending && (
          <Dropdown
            classNames={{
              content:
                "p-0 border-none border-divider bg-background rounded-md",
            }}
          >
            <DropdownTrigger>
              <Avatar showFallback src={data?.tempUrl} />
            </DropdownTrigger>
            <DropdownMenu
              aria-label="options"
              className="px-3 border-none shadow-md rounded-md"
              itemClasses={{
                base: ["rounded-md"],
              }}
            >
              <DropdownSection aria-label="User Actions">
                <DropdownItem
                  isReadOnly
                  key="profile"
                  showDivider
                  className=" hover:cursor-none"
                >
                  <div className="flex flex-col justify-center items-center m-auto w-full">
                    <Avatar size="lg" showFallback src={data?.tempUrl} />
                    <span className="font-semibold">{data?.name}</span>
                    <small>@{data?.username}</small>
                    <small>{data?.email}</small>
                  </div>
                </DropdownItem>
                <DropdownItem key="hNf" startContent={<InfoCircledIcon />}>
                  Help and Feedback
                </DropdownItem>
                <DropdownItem
                  key="logout"
                  startContent={<ExitIcon />}
                  onClick={onClick}
                  color="danger"
                >
                  Log out
                </DropdownItem>
              </DropdownSection>
            </DropdownMenu>
          </Dropdown>
        )}
      </NavbarContent>
    </Navbar>
  );
};
