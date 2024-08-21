import { auth } from "@/auth";

import { SessionProvider } from "next-auth/react";
import { Header } from "../_components/Header";
import { Hero } from "../_components/Hero";
import { HomeEvents } from "../_components/HomeEvents";
import { Footer } from "../_components/Footer";
import { HomeBlogs } from "../_components/HomeBlogs";
import { Subscribe } from "../_components/Subscribe";

interface HomeLayoutProps {
  children: React.ReactNode;
}
const HomeLayout = async ({ children }: HomeLayoutProps) => {
  const session = await auth();
  return (
    <>
      <Hero />
      <HomeEvents />
      <HomeBlogs />
      <Subscribe />
    </>
  );
};
export default HomeLayout;
