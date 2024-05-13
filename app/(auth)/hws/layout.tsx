import { Poppins } from "next/font/google";
import { cn } from "@/lib/utils";

const font = Poppins({
  subsets: ["latin"],
  weight: ["700"],
});

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-screen flex flex-col justify-center items-center bg-gradient-to-t from-background to-yellow-300">
      <div
        className={`w-full flex flex-col gap-y-2 align-middle text-center mb-3`}
      >
        <h1 className={cn("text-6xl font-semibold", font.className)}>HWS</h1>
        <h3 className="text-muted-foreground font-semibold text-xl">
          Halo Website Studio
        </h3>
      </div>
      {children}
    </div>
  );
};

export default AuthLayout;
