import { auth } from "@/auth";
import { Footer } from "./_components/Footer";
import { Header } from "./_components/Header";
import { SessionProvider } from "next-auth/react";

interface PublicLayoutProps {
  children: React.ReactNode;
}
const PublicLayout = async ({ children }: PublicLayoutProps) => {
  const session = await auth();
  return (
    <>
      <SessionProvider session={session}>
        <Header />
        <div className="container min-h-svh">
          <div className="p-2 md:p-4 max-w-[1096px] m-auto">{children}</div>
        </div>
        <Footer />
      </SessionProvider>
    </>
  );
};
export default PublicLayout;
