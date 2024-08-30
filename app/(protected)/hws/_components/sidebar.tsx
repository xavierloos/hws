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
  const currentLocation = usePathname();
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
    { link: "dashboard", icon: <DashboardIcon className={iconClasses} /> },
    { link: "events", icon: <RocketIcon className={iconClasses} /> },
    { link: "blogs", icon: <Pencil2Icon className={iconClasses} /> },
    { link: "files", icon: <ImageIcon className={iconClasses} /> },
    { link: "tasks", icon: <DrawingPinIcon className={iconClasses} /> },
    { link: "members", icon: <MixIcon className={iconClasses} /> },
    { link: "comments", icon: <ChatBubbleIcon className={iconClasses} /> },
    { link: "subscriptions", icon: <BellIcon className={iconClasses} /> },
    { link: "invoices", icon: <FileTextIcon className={iconClasses} /> },
    { link: "settings", icon: <GearIcon className={iconClasses} /> },
  ];

  const onClick = async () => {
    await signOut();
  };

  const DarkTheme = () => {
    return (
      <Tooltip
        showArrow
        placement="right"
        content={theme === "dark" ? "LIGHTS ON" : "LIGHTS OFF"}
        classNames={{
          base: [
            // arrow color
            "before:bg-primary dark:before:bg-primary",
          ],
          content: ["bg-primary uppercase font-medium"],
        }}
        isDisabled={!isCollapsed}
      >
        <Button
          fullWidth
          isIconOnly={isCollapsed}
          color="secondary"
          onClick={() => setTheme(theme == "dark" ? "light" : "dark")}
          className={`uppercase flex font-medium rounded-md`}
        >
          {theme === "dark" ? (
            <SunIcon className={iconClasses} />
          ) : (
            <MoonIcon className={iconClasses} />
          )}
          <span className={isCollapsed ? "hidden" : "flex"}>
            {theme === "dark" ? "LIGHTS ON" : "LIGHTS OFF"}
          </span>
        </Button>
      </Tooltip>
    );
  };

  const SideMenu = ({ item }: any, key: string) => {
    return (
      <Tooltip
        key={key}
        showArrow
        placement="right"
        content={item.link}
        classNames={{
          base: [
            // arrow color
            "before:bg-primary dark:before:bg-primary",
          ],
          content: ["bg-primary uppercase font-medium"],
        }}
        isDisabled={!isCollapsed}
      >
        <Button
          isIconOnly={isCollapsed}
          color="default"
          variant={currentLocation == `/hws/${item.link}` ? "solid" : "light"}
          onClick={() => router.push(`/hws/${item.link}`, { scroll: false })}
          className={`uppercase flex font-medium rounded-md ${
            currentLocation == `/hws/${item.link}` && "shadow-md"
          } ${!isCollapsed && "justify-start"}`}
          isDisabled={currentLocation == `/hws/${item.link}` ? true : false}
        >
          {item.icon}
          <span className={isCollapsed ? "hidden" : "flex"}>{item.link}</span>
        </Button>
      </Tooltip>
    );
  };

  return (
    <>
      {/* SMALL DEVICES */}
      <Navbar className="bg-primary  w-auto p-0 px-0 sm:hidden flex text-secondary-foreground">
        <NavbarContent justify="start">
          <NavbarMenuToggle />
        </NavbarContent>
        <NavbarContent justify="center">
          <NavbarBrand className="font-bold text-secondary-foreground capitalize p-2 rounded-md w-full flex transition shrink-0">
            HWS
          </NavbarBrand>
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
                        : "secondary",
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
            <NavbarMenuItem key={`${item.link}-${index}`}>
              <Link
                isDisabled={currentLocation.includes(item.link)}
                className={`text-secondary-foreground w-full capitalize font-medium p-2 rounded-md transition shrink-0 hover:text-accent-foreground 
              ${
                currentLocation.includes(item.link)
                  ? "bg-accent opacity-100 hover:cursor-none"
                  : "hover:drop-shadow-sm"
              }
            `}
                href={item.link}
                size="sm"
              >
                {item.icon}
                <span className={isCollapsed ? "hidden" : "flex  ms-2"}>
                  {item.link}
                </span>
              </Link>
            </NavbarMenuItem>
          ))}
        </NavbarMenu>
      </Navbar>
      {/* SIDE BAR MENU */}
      <nav
        style={{ transition: "all 0.4s cubic-bezier(0.175,0.885,0.32,1.1)" }}
        className={`hidden sm:flex min-h-screen max-h-screen flex-col justify-between p-2 bg-primary ${
          isCollapsed ? "min-w-[60px]" : "min-w-[200px]"
        }`}
      >
        <div className="grid gap-1 overflow-auto justify-center">
          <Button
            isIconOnly={isCollapsed}
            color="default"
            variant="light"
            onClick={() => toggleSidebar()}
            className={`uppercase flex font-bold text-xl rounded-md ${
              !isCollapsed && "justify-start"
            }`}
          >
            <ChevronRightIcon
              className={`w-5 h-5 ${
                !isCollapsed && "origin-center rotate-180 "
              }`}
              style={{
                transition: "all 0.4s cubic-bezier(0.175,0.885,0.32,1.1)",
              }}
            />
            <span className={isCollapsed ? "hidden" : "flex"}>HWS</span>
          </Button>
          {NAVLINKS.map((item, index) => {
            return <SideMenu item={item} key={index} />;
          })}
        </div>
        <div className="flex justify-center">
          <DarkTheme />
        </div>
      </nav>
      {/* SIDE BAR MENU ENDED*/}
    </>
  );
};
