"use client";
import { FaDashcube, FaSearch, FaSignOutAlt, FaUser } from "react-icons/fa";
import { signOut } from "next-auth/react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Navbar, NavbarContent } from "@nextui-org/react";

import { FcMenu } from "react-icons/fc";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
  User,
} from "@nextui-org/react";
import { useEffect } from "react";

export const Header = () => {
  const user = useCurrentUser();

  const onClick = async () => {
    await signOut();
  };

  return (
    <Navbar isBordered className="container hidden sm:flex">
      <NavbarContent justify="end">
        <Dropdown placement="bottom-start">
          <DropdownTrigger>
            <User
              avatarProps={{
                isBordered: true,
                className: `shrink-0 ${
                  user?.role === "SUPERADMIN"
                    ? "bg-primary text-foreground"
                    : user?.role === "ADMIN"
                    ? "bg-foreground text-primary"
                    : "bg-default text-default-foreground"
                }`,
                color:
                  user?.role === "SUPERADMIN" || user?.role === "ADMIN"
                    ? "primary"
                    : "default",
                size: "sm",
                src: user?.tempUrl || user?.image,
              }}
              className="transition-transform flex flex-row-reverse"
              description={
                <span className="truncate text-ellipsis line-clamp-1 ">
                  {user?.username}
                </span>
              }
              name={
                <span
                  className={`text-ellipsis  overflow-hidden  break-words line-clamp-1 `}
                >
                  {user?.name}
                </span>
              }
            />
          </DropdownTrigger>
          <DropdownMenu aria-label="User Actions" variant="solid">
            <DropdownItem key="help_and_feedback">Help & Feedback</DropdownItem>
            <DropdownItem key="logout" color="danger" onClick={onClick}>
              Log Out
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </NavbarContent>
    </Navbar>
  );
};
