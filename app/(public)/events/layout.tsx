import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Events | HWS",
  description:
    "Discover exciting events near you! Find conferences, workshops, concerts, and more. Explore our event calendar and never miss out on the fun.",
};

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = async ({ children }: LayoutProps) => {
  return (
    <div className="container min-h-screen max-w-[1024px]">{children}</div>
  );
};

export default Layout;
