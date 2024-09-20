"use client";
import { useState, useEffect, useTransition } from "react";
import axios from "axios";
import { toast } from "sonner";
import { TableItems } from "./_components/TableItems";
import { useDisclosure } from "@nextui-org/react";

const MembersPage = () => {
 const [data, setData] = useState([]);
 const { isOpen, onOpen, onClose } = useDisclosure();
 const [isLoading, startLoading] = useTransition();
 const [isLoadingInvite, startLoadingInvite] = useTransition();
 const initialCols = ["name", "role", "status", "actions"];
 const cols = [
  { name: "NAME", uid: "name" },
  { name: "ROLE", uid: "role" },
  { name: "STATUS", uid: "status", sortable: true },
  { name: "ACTIONS", uid: "actions" },
 ];

 const statusOptions = [
  { name: "All", uid: "all" },
  { name: "Active", uid: true },
  { name: "Inactive", uid: false },
 ];

 useEffect(() => {
  getData();
 }, []);

 const getData = async () => {
  startLoading(async () => {
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
  startLoadingInvite(async () => {
   await axios
    .post("/api/members", value)
    .then(async (res) => {
     if (res.data.type === "warning") return toast.warning(res.data.message);
     handleOnClose();
     return toast.success(res.data.message);
    })
    .catch((e) => {
     toast.error(e.response.data.message);
    });
  });
 };

 const onDelete = async (id: string, name: string, isActive: boolean) => {
  toast.warning(`Are you sure you want to delete: ${name}?`, {
   description: isActive
    ? "You could make the status inactive to deny access!"
    : "All records will be deleted!",
   duration: 9000,
   cancel: {
    label: "NO",
    onClick: () => console.log("Cancel!"),
   },
   action: {
    label: "YES",
    onClick: async () => {
     try {
      await axios
       .delete(`/api/members?id=${id}`)
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

 const handleOnClose = () => {
  return onClose();
 };

 return (
  <div>
   <TableItems
    data={data}
    cols={cols}
    initialCols={initialCols}
    onDelete={onDelete}
    onSaveBlog={onSubmit}
    statusOptions={statusOptions}
    isLoading={isLoading}
    isLoadingInvite={isLoadingInvite}
    isNewBlogOpen={isOpen}
    onNewBlogOpen={onOpen}
    onNewBlogClose={handleOnClose}
    getData={getData}
   />
  </div>
 );
};

export default MembersPage;
