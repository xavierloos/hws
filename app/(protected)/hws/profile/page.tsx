"use client";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/use-current-user";
const ProfilePage = () => {
  const session = useCurrentUser();
  return (
    <>
      <div className=" flex-wrap">{JSON.stringify(session)}</div>
    </>
  );
};

export default ProfilePage;
