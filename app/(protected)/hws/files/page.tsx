"use client";

import axios from "axios";
import { useEffect, useState, useTransition } from "react";

import { toast } from "sonner";
import { TableItems } from "@/components/tableItems";

const FilesPage = () => {
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const initialCols = ["name", "type", "actions"];
  const cols = [
    { name: "NAME", uid: "name", sortable: true },
    { name: "TYPE", uid: "type", sortable: false },
    { name: "CREATED BY", uid: "createdBy", sortable: false },
    { name: "ACTIONS", uid: "actions" },
  ];

  useEffect(() => {
    getData();
  }, []);

  const getData = () => {
    axios
      .get("/api/files?type=")
      .then((res) => {
        setData(res.data);
      })
      .catch((e) => {
        toast.error(e.response.data.message);
      });
    setLoading(false);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>, files: any) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();

    files.forEach((item: any) => {
      data.append(item.name, item);
    });

    await axios
      .post(`/api/files?type=files`, data)
      .then((res) => {
        toast.success(res.data.message);
        getData();
      })
      .catch((e) => {
        toast.error(e.response.data.message);
      });
    setLoading(false);
  };

  const onDelete = async (id: string, name: string) => {
    toast.warning(`Are you sure you want to delete: ${name}?`, {
      action: {
        label: "YES",
        onClick: async () => {
          try {
            await axios.delete(`/api/files?id=${id}`);
            getData();
          } catch (error) {}
        },
      },
    });
  };

  return (
    <div>
      <TableItems
        data={data}
        cols={cols}
        initialCols={initialCols}
        type="files"
        onDelete={onDelete}
        onSubmit={onSubmit}
        loading={loading}
        // statusOptions={statusOptions}
        // handleView={handleView}
        isPending={isPending}
      />
    </div>
  );
};

export default FilesPage;
