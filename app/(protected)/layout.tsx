import { Sidebar } from "./hws/_components/sidebar";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { Header } from "./hws/_components/header";
import Providers from "./providers";
import { LockClosedIcon } from "@radix-ui/react-icons";

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
         <div
          role="alert"
          className="flex items-center justify-start align-middle p-3 gap-2 relative w-full rounded-md border-none text-sm bg-primary/20 text-foreground mt-3"
         >
          <div>
           <LockClosedIcon />
          </div>
          <div className="flex gap-1 items-center">
           <span>Permissions:</span>
           <span>{session?.user?.permission}</span>
          </div>
         </div>
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
