"use client";
import { Title } from "@/components/title";
import React, { useState } from "react";
import { Input, Button } from "@nextui-org/react";
import axios from "axios";
import { toast } from "sonner";

export const Footer = ({ item }: any) => {
  const year = new Date().getFullYear();
  const [email, setEmail] = useState(null);

  const onSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
    value: string
  ) => {
    e.preventDefault();

    axios
      .put(`/api/newsletter`, { value })
      .then(async (res) => {
        if (res.data.type === "warning") return toast.warning(res.data.message);
        return toast.success(res.data.message);
      })
      .catch((e) => {});
  };

  return (
    <footer>
      <div className="w-full min-h-[200px] bg-slate-100 text-slate-400 justify-center items-center flex">
        HWS &copy; {year}
      </div>
    </footer>
  );
};
