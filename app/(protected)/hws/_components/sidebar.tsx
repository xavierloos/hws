"use client";
import {
  DashboardIcon,
  GearIcon,
  MoonIcon,
  SunIcon,
  ImageIcon,
  FileTextIcon,
  RocketIcon,
  DrawingPinIcon,
  MixIcon,
  ChatBubbleIcon,
  BellIcon,
  Pencil2Icon,
  ChevronRightIcon,
} from "@radix-ui/react-icons";
import { useTheme } from "next-themes";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Tooltip } from "@nextui-org/react";
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
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  User,
} from "@nextui-org/react";
import { signOut } from "next-auth/react";
import { useCurrentUser } from "@/hooks/use-current-user";

export const Sidebar = () => {
  const router = useRouter();
  const currentPath = usePathname();
  const user = useCurrentUser();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("isCollapsed")) {
      setIsCollapsed(
        localStorage.getItem("isCollapsed") === "true" ? true : false
      );
    }
  }, []);

  const { theme, setTheme } = useTheme();

  const toggleSidebar = () => {
    localStorage.setItem("isCollapsed", `${!isCollapsed}`);
    setIsCollapsed(!isCollapsed);
  };
  let iconClasses = "w-5 h-5";

  const NAVLINKS = [
    { href: "dashboard", icon: <DashboardIcon className={iconClasses} /> },
    { href: "events", icon: <RocketIcon className={iconClasses} /> },
    { href: "blogs", icon: <Pencil2Icon className={iconClasses} /> },
    { href: "files", icon: <ImageIcon className={iconClasses} /> },
    { href: "tasks", icon: <DrawingPinIcon className={iconClasses} /> },
    { href: "members", icon: <MixIcon className={iconClasses} /> },
    { href: "comments", icon: <ChatBubbleIcon className={iconClasses} /> },
    { href: "subscriptions", icon: <BellIcon className={iconClasses} /> },
    { href: "invoices", icon: <FileTextIcon className={iconClasses} /> },
    { href: "settings", icon: <GearIcon className={iconClasses} /> },
  ];

  const onClick = async () => {
    await signOut();
  };

  return (
    <>
      {/* SMALL DEVICES */}
      <Navbar className="bg-primary  w-auto p-0 px-0 sm:hidden flex">
        <NavbarContent justify="start">
          <NavbarMenuToggle />
        </NavbarContent>
        <NavbarContent justify="center">
          <NavbarBrand className="font-bold text-inherit">HWS</NavbarBrand>
        </NavbarContent>
        {/* USER MENU */}
        <NavbarContent justify="end">
          <NavbarItem>
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
                />
              </DropdownTrigger>
              <DropdownMenu aria-label="User Actions" variant="solid">
                <DropdownItem
                  key="profile"
                  className="h-14 gap-2 justify-center"
                >
                  <p className="font-bold m-auto text-center">Signed in as</p>
                  <p className="font-bold">{user?.email}</p>
                </DropdownItem>
                <DropdownItem
                  key="help_and_feedback"
                  onClick={() => setTheme(theme == "dark" ? "light" : "dark")}
                >
                  {" "}
                  {theme === "dark" ? "Lights On" : "Lights Off"}
                </DropdownItem>
                <DropdownItem key="logout" color="danger" onClick={onClick}>
                  Log Out
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </NavbarItem>
        </NavbarContent>
        {/* SMALL MENU CONTENT */}
        <NavbarMenu className="bg-gradient-to-t from-background to-primary">
          {NAVLINKS.map((item, index) => (
            <NavbarMenuItem key={`${item.href}-${index}`}>
              <Link
                isDisabled={currentPath.includes(item.href)}
                className={`w-full capitalize font-medium p-2 rounded-md 
              ${
                currentPath.includes(item.href)
                  ? "bg-white"
                  : "hover:drop-shadow-sm"
              }
            `}
                color="foreground"
                href={item.href}
                size="sm"
              >
                {item.icon}
                <span className={isCollapsed ? "hidden" : "flex  ms-2"}>
                  {item.href}
                </span>
              </Link>
            </NavbarMenuItem>
          ))}
        </NavbarMenu>
      </Navbar>
      <nav
        style={{ transition: "all 0.4s cubic-bezier(0.175,0.885,0.32,1.1)" }}
        className={`hidden sm:flex min-h-screen max-h-screen flex-col justify-between px-2  bg-gradient-to-t from-background to-primary`}
      >
        <div className="grid gap-1 overflow-auto">
          <div className="py-3">
            <Link
              className={`capitalize p-2 rounded-md w-full flex transition shrink-0 hover:opacity-55`}
              color="foreground"
              size="lg"
              onClick={() => toggleSidebar()}
            >
              <ChevronRightIcon
                className={`w-5 h-5 ${
                  !isCollapsed && "origin-center rotate-180 "
                }`}
                style={{
                  transition: "all 0.4s cubic-bezier(0.175,0.885,0.32,1.1)",
                }}
              />
              <span
                className={`ms-2 font-semibold text-lg ${
                  isCollapsed ? "hidden" : "flex"
                }`}
              >
                HWS
              </span>
            </Link>
          </div>
          {NAVLINKS.map((item, index) => (
            <Tooltip
              key={index}
              showArrow
              placement="right"
              content={item.href.charAt(0).toUpperCase() + item.href.slice(1)}
              classNames={{
                base: [
                  // arrow color
                  "before:bg-neutral-400 dark:before:bg-white",
                ],
                content: ["py-2 px-4 shadow-xl", "bg-primary"],
              }}
              isDisabled={!isCollapsed}
            >
              <Link
                isDisabled={currentPath.includes(item.href)}
                className={`w-full capitalize font-medium p-2 rounded-md 
               ${
                 currentPath.includes(item.href)
                   ? "bg-white"
                   : "hover:drop-shadow-sm"
               }
             `}
                color="foreground"
                href={item.href}
                size="sm"
              >
                {item.icon}
                <span className={isCollapsed ? "hidden" : "flex  ms-2"}>
                  {item.href}
                </span>
              </Link>
            </Tooltip>
          ))}
        </div>
        <Link
          className={`capitalize font-medium p-2 rounded-md  bg-primary w-full flex transition my-4 shrink-0 hover:opacity-55 items-center justify-center`}
          color="foreground"
          size="sm"
          onClick={() => setTheme(theme == "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? (
            <SunIcon className={iconClasses} />
          ) : (
            <MoonIcon className={iconClasses} />
          )}
          <span className={isCollapsed ? "hidden" : "flex ms-2"}>
            {theme === "dark" ? "Lights On" : "Lights Off"}
          </span>
        </Link>
      </nav>
      {/* Small screen navbar */}
    </>
  );
};
