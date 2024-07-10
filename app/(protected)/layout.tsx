import { Sidebar } from "./hws/_components/sidebar";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { Header } from "./hws/_components/header";

import Providers from "./providers";
interface ProtectedLayoutProps {
  children: React.ReactNode;
}
const ProtectedLayout = async ({ children }: ProtectedLayoutProps) => {
  const session = await auth();

  return (
    <>
      <SessionProvider session={session}>
        <Providers>
          <div className="flex flex-col sm:flex-row max-h-screen overflow-y-hidden transition-all">
            <Sidebar />
            <div className="w-full min-h-screen  overflow-scroll">
              <Header />
              <div className="container">
                <div className="p-2 md:p-4 max-w-[1096px] m-auto">
                  {children}
                </div>
              </div>
            </div>
          </div>
        </Providers>
      </SessionProvider>
    </>
  );
};
export default ProtectedLayout;
