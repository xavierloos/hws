"use client";
import * as React from "react";
import { useEffect, useState, useTransition } from "react";
import axios from "axios";
import { toast } from "sonner";
import { TableItems } from "./_components/TableItems";
import { useDisclosure } from "@nextui-org/react";
import { useCurrentUser } from "@/hooks/use-current-user";

const BlogPage = () => {
 const user = useCurrentUser();
 const [isSaving, startSaving] = useTransition();
 const [isLoading, startLoading] = useTransition();
 const [data, setData] = useState([]);
 const initialCols = ["name", "isActive", "actions"];
 const { isOpen, onOpen, onClose } = useDisclosure();
 const cols = [
  { name: "Title", uid: "name", sortable: true },
  { name: "Slug", uid: "slug", sortable: true },
  { name: "Category", uid: "categories", sortable: true },
  { name: "Created by", uid: "createdBy", sortable: true },
  { name: "Modified by", uid: "modifiedBy", sortable: true },
  { name: "Status", uid: "isActive", sortable: true },
  { name: "Actions", uid: "actions" },
 ];

 const statusOptions = [
  { name: "All", uid: "all" },
  { name: "Active", uid: true },
  { name: "Draft", uid: false },
 ];

 useEffect(() => {
  getData();
 }, []);

 const getData = async (sorting: string = "modified-desc") => {
  startLoading(async () => {
   await axios
    .get(`/api/blogs?sortby=${sorting}`)
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
  startSaving(async () => {
   let categories: Array<string> = [];
   inputs.categories.forEach((element: any) => categories.push(element));
   inputs.categories = categories;

   await axios
    .post("/api/blogs", inputs)
    .then(async (res: any) => {
     if (res.data.type === "warning") return toast.warning(res.data.message);
     toast.success(res.data.message);
     await getData().then(() => {
      return handleOnClose();
     });
    })
    .catch((e) => {
     toast.error(e.response.data.message);
    });
  });
 };

 const handleOnClose = () => {
  return onClose();
 };

 const onDelete = async (id: string, name: string) => {
  toast.warning(`Are you sure you want to delete: ${name}?`, {
   action: {
    label: "YES",
    onClick: async () => {
     try {
      await axios
       .delete(`/api/blogs?id=${id}`)
       .then((res) => {
        toast.success(res.data.message);
       })
       .then(() => {
        getData();
       });
     } catch (e) {
      toast.error(e.response.data.error.meta.cause);
     }
    },
   },
  });
 };

 return (
  <TableItems
   data={data}
   cols={cols}
   initialCols={initialCols}
   onDelete={onDelete}
   onSaveBlog={onSubmit}
   statusOptions={statusOptions}
   isLoading={isLoading}
   isSaving={isSaving}
   isNewBlogOpen={isOpen}
   onNewBlogOpen={onOpen}
   onNewBlogClose={handleOnClose}
   getData={getData}
   permission={user?.permission}
  />
 );
};

export default BlogPage;
