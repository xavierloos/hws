import { auth } from "@/auth";
import { Footer } from "./_components/Footer";
import { Header } from "./_components/Header";
import { SessionProvider } from "next-auth/react";
import { Hero } from "./_components/Hero";
import { HomeEvents } from "./_components/HomeEvents";

interface HomeLayoutProps {
  children: React.ReactNode;
}
const HomeLayout = async ({ children }: HomeLayoutProps) => {
  const session = await auth();
  return (
    <>
      <SessionProvider session={session}>
        <Header />
        {children}
        <Footer />
      </SessionProvider>
    </>
  );
};
export default HomeLayout;
