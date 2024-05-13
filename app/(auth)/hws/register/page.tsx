"use client";
import { RegisterForm } from "@/components/registerForm";
import { Spinner } from "@nextui-org/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
const RegisterPage = () => {
  // const router = useRouter();
  // const [loading, setLoding] = useState(true);
  // useEffect(() => {
  //   router.push(`/hws/login`, { scroll: false });
  // }, []);
  // return <Spinner size="lg" label="One sec..." />;
  return <RegisterForm />;
};

export default RegisterPage;
