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
 InfoCircledIcon,
 ExitIcon,
 GroupIcon,
 CheckCircledIcon,
 ReaderIcon,
} from "@radix-ui/react-icons";
import { useTheme } from "next-themes";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
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
 DropdownSection,
 Avatar,
} from "@nextui-org/react";
import { signOut } from "next-auth/react";
import { useCurrentUser } from "@/hooks/use-current-user";
import axios from "axios";
import { BiGroup } from "react-icons/bi";

export const Sidebar = () => {
 const router = useRouter();
 const currentLocation = usePathname();
 const user = useCurrentUser();
 const [isCollapsed, setIsCollapsed] = useState(false);
 const { theme, setTheme } = useTheme();
 const [isPending, startTransition] = useTransition();
 const [data, setData] = useState(null);

 useEffect(() => {
  if (localStorage.getItem("isCollapsed")) {
   setIsCollapsed(
    localStorage.getItem("isCollapsed") === "true" ? true : false
   );
  }
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

 const toggleSidebar = () => {
  localStorage.setItem("isCollapsed", `${!isCollapsed}`);
  setIsCollapsed(!isCollapsed);
 };
 let iconClasses = "w-5 h-5";

 const NAVLINKS = [
  { link: "dashboard", icon: <DashboardIcon className={iconClasses} /> },
  { link: "events", icon: <RocketIcon className={iconClasses} /> },
  { link: "blogs", icon: <ReaderIcon className={iconClasses} /> },
  { link: "files", icon: <ImageIcon className={iconClasses} /> },
  { link: "tasks", icon: <CheckCircledIcon className={iconClasses} /> },
  { link: "members", icon: <BiGroup className={iconClasses} /> },
  // { link: "comments", icon: <ChatBubbleIcon className={iconClasses} /> },
  // { link: "subscriptions", icon: <BellIcon className={iconClasses} /> },
  // { link: "invoices", icon: <FileTextIcon className={iconClasses} /> },
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

 const MobileMenu = ({ item }: any, key: string) => {
  return (
   <Button
    color="default"
    variant={currentLocation == `/hws/${item.link}` ? "solid" : "light"}
    onClick={() => router.push(`/hws/${item.link}`, { scroll: false })}
    className={`uppercase flex font-medium rounded-md justify-start ${
     currentLocation == `/hws/${item.link}` && "shadow-md"
    }`}
    isDisabled={currentLocation == `/hws/${item.link}` ? true : false}
    startContent={item.icon}
   >
    {item.link}
   </Button>
  );
 };

 return (
  <>
   {/* SMALL DEVICES */}
   <Navbar className="bg-primary sm:hidden flex">
    <NavbarContent justify="start">
     <NavbarMenuToggle />
    </NavbarContent>
    <NavbarContent justify="center">
     <NavbarBrand className="font-bold text-xl capitalize">HWS</NavbarBrand>
    </NavbarContent>
    {/* USER MENU */}
    <NavbarContent justify="end">
     <NavbarItem>
      {!isPending && (
       <Dropdown
        classNames={{
         content: "p-0 border-none border-divider bg-background rounded-md",
        }}
       >
        <DropdownTrigger>
         <Avatar size="sm" showFallback src={data?.tempUrl} />
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
           key="theme"
           onClick={() => setTheme(theme == "dark" ? "light" : "dark")}
           startContent={theme === "dark" ? <SunIcon /> : <MoonIcon />}
          >
           {theme === "dark" ? "Lights On" : "Lights Off"}
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
     </NavbarItem>
    </NavbarContent>
    {/* MOBILE MENU CONTENT */}
    <NavbarMenu className="bg-primary">
     {NAVLINKS.map((item, index) => (
      <MobileMenu item={item} key={index} />
     ))}
    </NavbarMenu>
    {/* MOBILE MENU CONTENT ENDED */}
   </Navbar>
   {/* SMALL DEVICES ENDED*/}
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
       className={`w-5 h-5 ${!isCollapsed && "origin-center rotate-180 "}`}
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
