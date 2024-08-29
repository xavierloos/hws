"use client";
import React from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  NavbarContent,
  NavbarItem,
  Link,
  Button,
} from "@nextui-org/react";
import { useRouter, usePathname } from "next/navigation";
import {
  HomeIcon,
  PersonIcon,
  ReaderIcon,
  RocketIcon,
} from "@radix-ui/react-icons";
import { useCurrentUser } from "@/hooks/use-current-user";

export const Header = ({ item }: any) => {
  const user = useCurrentUser();
  const router = useRouter();
  const currentLocation = usePathname();

  const menuItems = [
    {
      name: "home",
      link: "home",
      icon: <HomeIcon />,
    },
    { name: "events", link: "events", icon: <RocketIcon /> },
    { name: "blogs", link: "blogs", icon: <ReaderIcon /> },
  ];

  return (
    <Navbar disableAnimation className="bg-primary">
      <NavbarContent className="sm:hidden" justify="start">
        <NavbarMenuToggle />
      </NavbarContent>
      <NavbarContent className="sm:hidden pr-3" justify="center">
        <NavbarBrand>
          <p className="font-bold text-inherit">HWS</p>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarBrand>
          <p className="font-bold text-inherit">HWS</p>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent justify="end">
        {menuItems?.map((item, index) => {
          return (
            <NavbarItem className="hidden sm:flex" key={index}>
              <Button
                radius="none"
                size="sm"
                variant="light"
                className={`uppercase ${
                  currentLocation === `/${item.link}`
                    ? "border-b-1 border-cyan-950"
                    : ""
                }`}
                onClick={() => router.push(`/${item.link}`, { scroll: false })}
                startContent={item.icon}
                isDisabled={currentLocation == `/${item.link}` ? true : false}
              >
                {item.name}
              </Button>
            </NavbarItem>
          );
        })}
        <NavbarItem>
          <Button
            radius="none"
            size="sm"
            className="m-auto bg-white"
            onClick={() => router.push(`/hws/login`, { scroll: false })}
            startContent={<PersonIcon />}
          >
            {user ? "DASHBOARD" : "LOGIN"}
          </Button>
        </NavbarItem>
      </NavbarContent>

      <NavbarMenu className="bg-gradient-to-t from-background to-primary">
        {menuItems?.map((item, index) => {
          return (
            <NavbarItem className="flex sm:hidden" key={index}>
              <Button
                radius="none"
                size="md"
                fullWidth
                className={`flex justify-start uppercase ${
                  currentLocation === `/${item.link}`
                    ? "border-b-1 border-cyan-950"
                    : ""
                }`}
                variant="light"
                onClick={() => router.push(`/${item.link}`, { scroll: false })}
                startContent={item.icon}
                isDisabled={currentLocation == `/${item.link}` ? true : false}
              >
                {item.name}
              </Button>
            </NavbarItem>
          );
        })}
      </NavbarMenu>
    </Navbar>
  );
};
