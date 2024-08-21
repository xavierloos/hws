import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Blogs | HWS",
  description:
    "Discover our latest insights and expert advice. Explore a variety of articles, tips, and trends. Stay informed and engaged with our blogs.",
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
