"use client";
import { TaskViewModal } from "@/components/taskViewModal";
import { TableItems } from "./_components/TableItems";
import axios from "axios";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useDisclosure } from "@nextui-org/react";

const TasksPage = () => {
  const user = useCurrentUser()
  const [data, setData] = useState([]);
  const [details, setDetails] = useState([]);
  const [isLoading, startLoading] = useTransition();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isSaving, startSaving] = useTransition();
  const initialCols = ["name", "status", "createdBy", "assignTo", "actions"];
  const cols = [
    { name: "NAME", uid: "name", sortable: true },
    { name: "ASSIGNED TO", uid: "assignedTo", sortable: true },
    { name: "STATUS", uid: "status", sortable: true },
    { name: "PRIORITY", uid: "priority", sortable: true },
    { name: "CREATED BY", uid: "createdBy", sortable: true },
    { name: "ACTIONS", uid: "actions" },
  ];
  const statusOptions = [
    { name: "All", uid: "All" },
    { name: "Pending", uid: "Pending" },
    { name: "In Progress", uid: "In Progress" },
    { name: "Completed", uid: "Completed" },
    { name: "Blocked", uid: "Blocked" },
    { name: "Canceled", uid: "Canceled" },
  ];

  useEffect(() => {
    getData();
  }, []);

  const getData = (sorting: string = "due-date") => {
    startLoading(async () => {
      await axios
        .get(`/api/tasks?sortby=${sorting}`)
        .then((res) => {
          setData(res.data);
        })
        .catch((e) => {
          toast.error(e.response.data.message);
        });
    });
  };

  const onSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
    values: any,
    files?: any
  ) => {
    e.preventDefault();
    startSaving(async () => {
      const data = new FormData();
      if (files.length > 0) {
        values.attachments = [];
        files.forEach((item: any) => {
          values.attachments.push({
            name: item.name,
            url: null,
            type: item.type,
          }); //Append files to values
        });
      }

      const taskId = await axios
        .post("/api/tasks", values)
        .then(async (res) => {
          return res.data.message;
        });

      if (files.length > 0) {
        files.forEach((item: any) => {
          data.append(taskId, item, item.name);
        });
        await axios
          .post(`/api/files?type=tasks`, data)
          .then((res) => {
            toast.success("Task added successfully");
          })
          .catch((e) => {
            toast.error(e.response.data.message);
          });
      } else {
        toast.success("Task added successfully");
      }
      getData();
    });
  };

  const onDelete = async (id: string, name: string) => {
    toast.warning(`Are you sure you want to delete: ${name}?`, {
      action: {
        label: "YES",
        onClick: async () => {
          try {
            const res = await axios.delete(`/api/tasks?id=${id}`);
            toast.success(res.data.message);
            getData();
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
        onSave={onSubmit}
        statusOptions={statusOptions}
        isLoading={isLoading}
        isSaving={isSaving}
        isNewOpen={isOpen}
        onNewOpen={onOpen}
        onNewClose={handleOnClose}
        getData={getData}
        permission={user?.permission}
      />

      {/* <TaskViewModal
        data={details}
        isOpen={isOpen}
        handleView={handleView}
        getData={getData}
      />  */}
    </div>
  );
};

export default TasksPage;
