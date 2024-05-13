"use client";
import { TaskViewModal } from "@/components/taskViewModal";
import { TableItems } from "@/components/tableItems";
import axios from "axios";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

const TasksPage = () => {
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState([]);
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const initialCols = ["name", "status", "assignTo", "actions"];
  const cols = [
    { name: "NAME", uid: "name", sortable: true },
    { name: "PRIORITY", uid: "priority", sortable: true },
    { name: "CREATED BY", uid: "createdBy", sortable: true },
    { name: "ASSIGNED TO", uid: "assignTo", sortable: true },
    { name: "STATUS", uid: "status", sortable: true },
    { name: "ACTIONS", uid: "actions" },
  ];
  const statusOptions = [
    { name: "Pending", uid: "pending" },
    { name: "In Progress", uid: "inProgress" },
    { name: "Completed", uid: "completed" },
    { name: "Blocked", uid: "blocked" },
    { name: "Cancelled", uid: "cancelled" },
  ];

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    setLoading(true);
    await axios
      .get("/api/tasks")
      .then((res) => {
        setData(res.data);
      })
      .catch((e) => {
        toast.error(e.response.data.message);
      });
    setLoading(false);
  };

  const onSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
    values: any,
    files: any
  ) => {
    e.preventDefault();
    startTransition(async () => {
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

      const details = []; //Temporary
      values.assignTo.forEach((item: any) => {
        details.push({ id: item });
      });

      values.assignTo = details;

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
            toast.success(res.data.message);
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

  const handleView = (item?: any) => {
    setIsOpen(!isOpen);
    setDetails(item);
  };

  return (
    <div>
      <TableItems
        data={data}
        cols={cols}
        initialCols={initialCols}
        type="tasks"
        onDelete={onDelete}
        onSubmit={onSubmit}
        loading={loading}
        statusOptions={statusOptions}
        handleView={handleView}
        isPending={isPending}
      />

      <TaskViewModal
        data={details}
        isOpen={isOpen}
        handleView={handleView}
        getData={getData}
      />
    </div>
  );
};

export default TasksPage;
