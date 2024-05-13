"use client";

import { useState, useEffect, useTransition } from "react";
import axios from "axios";
import { toast } from "sonner";
import { TableItems } from "@/components/tableItems";

const MembersPage = () => {
  const [data, setData] = useState([]);
  const [isPending, startTransition] = useTransition();
  const initialCols = ["name", "role", , "actions"];
  const cols = [
    { name: "NAME", uid: "name", sortable: true },
    { name: "ROLE", uid: "role", sortable: true },
    { name: "ACTIONS", uid: "actions" },
  ];
  // const statusOptions = [
  //   { name: "Pending", uid: "pending" },
  //   { name: "In Progress", uid: "inProgress" },
  //   { name: "Completed", uid: "completed" },
  //   { name: "Blocked", uid: "blocked" },
  //   { name: "Cancelled", uid: "cancelled" },
  // ];

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    startTransition(async () => {
      await axios
        .get("/api/members")
        .then((res) => {
          setData(res.data);
        })
        .catch((e) => {
          toast.error(e.response.data.message);
        });
    });
  };

  const onSubmit = async (e: any, value: string) => {
    e.preventDefault();
    await axios
      .post("/api/members", { value })
      .then(async (res) => {
        if (res.data.type === "warning") return toast.warning(res.data.message);
        return toast.success(res.data.message);
      })
      .catch((e) => {
        toast.error(e.response.data.message);
      });
  };

  return (
    <div>
      <TableItems
        data={data}
        cols={cols}
        initialCols={initialCols}
        type="members"
        // onDelete={onDelete}
        onSubmit={onSubmit}
        isPending={isPending}
        // statusOptions={statusOptions}
        // handleTaskPreviewer={handleTaskPreviewer}
      />
    </div>
  );
};

export default MembersPage;
