"use client";
import * as React from "react";
import { useEffect, useState, useTransition } from "react";
import axios from "axios";
import { toast } from "sonner";
import { BlogForm } from "@/app/(protected)/hws/blogs/_components/BlogForm";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import { Button } from "@nextui-org/react";
import { CrossCircledIcon } from "@radix-ui/react-icons";
import { TableItems } from "./_components/TableItems";
import { useDisclosure } from "@nextui-org/react";

const BlogPage = () => {
 const [isSaving, startSaving] = useTransition();
 const [isLoding, startLoading] = useTransition();
 const [data, setData] = useState([]);
 const [details, setDetails] = useState([]);
 //  const [isOpen, setIsOpen] = useState(false);
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

 const getData = async () => {
  startLoading(async () => {
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
  startSaving(async () => {
   let categories: Array<string> = [];
   inputs.categories.forEach((element: any) => categories.push(element));
   inputs.categories = categories;

   await axios
    .post("/api/blogs", inputs)
    .then(async (res: any) => {
     //  await getData();
     console.log(res);
     //  return onClose;
    })
    .catch((e) => {
     toast.error(e.response.data.message);
    });
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

 //  const handleView = (item?: any) => {
 //   setIsOpen(!isOpen);
 //   setDetails(item);
 //  };

 //  const handleModal = () => {
 //   setIsOpen(!isOpen);
 //  };

 return (
  <div>
   <TableItems
    data={data}
    cols={cols}
    initialCols={initialCols}
    type="blogs"
    onDelete={onDelete}
    onSaveBlog={onSubmit}
    statusOptions={statusOptions}
    // handleView={handleView}
    isLoading={isLoding}
    isSaving={isSaving}
    isOpen={isOpen}
    onOpen={onOpen}
    onClose={onClose}
   />
   {/* <Modal
    open={isOpen}
    onClose={handleView}
    className="flex flex-1 flex-col gap-6 items-center justify-center z-0 w-full "
   >
    <Box
     style={{
      overflow: "scroll",
     }}
     className="flex flex-col gap-3 relative z-50 w-full box-border outline-none mx-1 my-1 sm:mx-6 sm:my-16 max-w-md rounded-large shadow-small overflow-y-hidden bg-white p-6 h-full"
    >
     <div className="flex justify-between w-full">
      <div className="flex items-center">
       <h1 className=" text-large font-semibold uppercase ">{details.name}</h1>
      </div>
      <Button
       onClick={handleModal}
       size="sm"
       isIconOnly
       color="danger"
       variant="light"
       className="p-0 rounded-full"
      >
       <CrossCircledIcon />
      </Button>
     </div>
     <BlogForm values={details} onSubmit={onSubmit} onClose={handleModal} />
    </Box>
   </Modal> */}
  </div>
 );
};

export default BlogPage;
