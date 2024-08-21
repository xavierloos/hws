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
  return <>{children}</>;
};

export default Layout;
