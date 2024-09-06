import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
 title: "Create Next App",
 description: "Generated by create next app",
};

export default async function RootLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return (
  <html lang="en">
   <body className={inter.className}>{children}</body>
   <Toaster richColors position="bottom-center" closeButton />
  </html>
 );
}
