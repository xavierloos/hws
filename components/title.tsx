import { Poppins } from "next/font/google";
import { cn } from "@/lib/utils";

const font = Poppins({
  subsets: ["latin"],
  weight: ["700"],
});

interface TitleProps {
  text: string;
  subtext?: string;
  className?: string;
}

export const Title = ({ text, subtext, className }: TitleProps) => {
  return (
    <div
      className={`w-full capitalize flex flex-col gap-y-2 align-middle mb-2 ${className}`}
    >
      <h1
        className={cn(
          "text-3xl font-semibold border-b-3 border-primary",
          font.className
        )}
      >
        {text}
      </h1>
      {subtext && <h3 className="text-muted-foreground text-sm">{subtext}</h3>}
    </div>
  );
};
