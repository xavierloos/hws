"use client";
import axios from "axios";
import { storage } from "@/lib/gcp";
import { Title } from "@/components/title";
import { useEffect, useState } from "react";
import { Security } from "./_components/security";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Notifications } from "./_components/notifications";
import { PersonalInformation } from "./_components/personalInformation";

const SettingsPage = () => {
  const user = useCurrentUser();
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getData(user?.id);
  }, []);

  const getData = async (id: string) => {
    await axios
      .get(`/api/members/${id}`)
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((e) => {});
  };

  const fields = (type: string) => {
    switch (type) {
      case "profile":
        return {
          id: data?.id,
          name: data?.name,
          username: data?.username,
          email: data?.email,
          role: data?.role,
          tel: data?.tel,
          about: data?.about,
          image: data?.image,
          tempUrl: data?.tempUrl,
        };
      case "security":
        return { id: data?.id, otpEnabled: data?.otpEnabled };
      case "notifications":
        return {
          id: data?.id,
          emailNotificationsEnabled: data?.emailNotificationsEnabled,
          smsNotificationsEnabled: data?.smsNotificationsEnabled,
          tel: data?.tel,
        };
    }
  };

  return (
    <>
      <Title text="Settings" className=" items-start mb-4" />
      <div className="grid lg:grid-cols-2 gap-3">
        {!loading && (
          <>
            <PersonalInformation fields={fields("profile")} />
            <Security fields={fields("security")} />
            <Notifications fields={fields("notifications")} />
          </>
        )}
      </div>
    </>
  );
};

export default SettingsPage;
