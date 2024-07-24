import React from "react";

export const Footer = ({ item }: any) => {
  const year = new Date().getFullYear();

  return (
    <div className="mt-6 w-full min-h-[100px] bg-slate-100 text-slate-400 justify-center items-center flex">
      HWS &copy; {year}
    </div>
  );
};
