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
import { useRouter } from "next/navigation";
import { PersonIcon } from "@radix-ui/react-icons";

export const Header = ({ item }: any) => {
  const router = useRouter();
  const menuItems = ["blogs", "events"];

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
        <NavbarItem className="hidden sm:flex">
          <Link color="foreground" href="/blogs">
            Blogs
          </Link>
        </NavbarItem>
        <NavbarItem isActive className="hidden sm:flex">
          <Link href="/events" aria-current="page" color="foreground">
            Events
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Button
            radius="none"
            size="sm"
            className="m-auto bg-white"
            onClick={() => router.push(`/hws/login`, { scroll: false })}
            endContent={<PersonIcon />}
          >
            LOGIN
          </Button>
        </NavbarItem>
      </NavbarContent>

      <NavbarMenu className="bg-gradient-to-t from-background to-primary">
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item}-${index}`}>
            <Link
              className="w-full"
              color="foreground"
              href={`/${item}`}
              size="lg"
            >
              {item}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </Navbar>
  );
};
