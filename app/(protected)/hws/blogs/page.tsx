"use client";
import { Title } from "@/components/title";
import * as React from "react";
import { useEffect, useState, useTransition } from "react";
import axios from "axios";
import { TableItems } from "@/components/tableItems";
import { toast } from "sonner";
import { NewBlogModal } from "@/components/newBlogModal";

const BlogPage = () => {
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState([]);

  const initialCols = ["name", "isActive", "createdBy", "actions"];
  const cols = [
    { name: "TITLE", uid: "name", sortable: true },
    { name: "SLUG", uid: "slug", sortable: true },
    { name: "CATEGORY", uid: "category", sortable: true },
    { name: "CREATED BY", uid: "createdBy", sortable: true },
    { name: "MODIFIED BY", uid: "modifiedBy", sortable: true },
    { name: "STATUS", uid: "isActive", sortable: true },
    { name: "ACTIONS", uid: "actions" },
  ];

  const statusOptions = [
    { name: "Active", uid: "true" },
    { name: "Draft", uid: "false" },
  ];

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    startTransition(async () => {
      await axios
        .get("/api/blogs")
        .then((res) => {
          setData(res.data);
        })
        .catch((e) => {
          toast.error(e.response.data.message);
        });
    });
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>, inputs: any) => {
    e.preventDefault();
    let cats = [];
    inputs.categories.forEach((element) => {
      cats.push(element);
    });
    inputs.categories = cats;
    await axios
      .post("/api/blogs", inputs)
      .then((res) => {
        getData();
      })
      .catch((e) => {
        toast.error(e.response.data.message);
      });
  };

  const onDelete = async (id: string, name: string) => {
    toast.warning(`Are you sure you want to delete: ${name}?`, {
      action: {
        label: "YES",
        onClick: async () => {
          try {
            const res = await axios.delete(`/api/blogs?id=${id}`);
            toast.success(res.data.message);
            getData();
          } catch (e) {
            toast.error(e.response.data.error.meta.cause);
          }
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
        type="blogs"
        onDelete={onDelete}
        onSubmit={onSubmit}
        statusOptions={statusOptions}
        isPending={isPending}
      />
    </div>
  );
};

export default BlogPage;
