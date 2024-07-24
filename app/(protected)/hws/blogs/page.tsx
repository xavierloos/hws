"use client";
import * as React from "react";
import { useEffect, useState, useTransition } from "react";
import axios from "axios";
import { TableItems } from "@/components/tableItems";
import { toast } from "sonner";

import { BlogForm } from "@/components/blogForm";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import { Button } from "@nextui-org/react";
import { CrossCircledIcon } from "@radix-ui/react-icons";

const BlogPage = () => {
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState([]);
  const [details, setDetails] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const initialCols = ["name", "isActive", "actions"];
  const cols = [
    { name: "TITLE", uid: "name", sortable: true },
    { name: "SLUG", uid: "slug", sortable: true },
    { name: "CATEGORIES", uid: "categories", sortable: true },
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
  const handleView = (item?: any) => {
    setIsOpen(!isOpen);
    setDetails(item);
  };

  const handleModal = () => {
    setIsOpen(!isOpen);
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
        handleView={handleView}
        isPending={isPending}
      />
      <Modal
        open={isOpen}
        onClose={handleView}
        className="flex flex-1 flex-col gap-6 items-center justify-center z-0"
      >
        <Box
          style={{
            overflow: "scroll",
          }}
          className="flex flex-col gap-3 relative z-50 w-full box-border outline-none mx-1 my-1 sm:mx-6 sm:my-16 max-w-md rounded-large shadow-small overflow-y-hidden bg-white p-6 h-full"
        >
          <div className="flex justify-between w-full">
            <div className="flex items-center">
              <h1 className=" text-large font-semibold uppercase ">
                {details.name}
              </h1>
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
          <BlogForm
            values={details}
            onSubmit={onSubmit}
            onClose={handleModal}
          />
        </Box>
      </Modal>
    </div>
  );
};

export default BlogPage;
