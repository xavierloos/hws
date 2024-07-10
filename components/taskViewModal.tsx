"use client";
import React, { useEffect, useState } from "react";
import Modal from "@mui/material/Modal";
import {
  Accordion,
  AccordionItem,
  Avatar,
  AvatarGroup,
  Button,
  Checkbox,
  CheckboxGroup,
  Chip,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Progress,
  Select,
  SelectItem,
  Textarea,
  Tooltip,
} from "@nextui-org/react";
import { FaTimes } from "react-icons/fa";
import {
  ChatBubbleIcon,
  CrossCircledIcon,
  DrawingPinIcon,
  LayersIcon,
  MixIcon,
  PaperPlaneIcon,
  PlusIcon,
  TextAlignLeftIcon,
} from "@radix-ui/react-icons";
import { format } from "timeago.js";
import { FilePreviewer } from "./filePreviewer";
import Box from "@mui/material/Box";
import { toast } from "sonner";
import axios from "axios";
import { currentUser } from "@/lib/auth";
import { useCurrentUser } from "@/hooks/use-current-user";
import dateFormat from "dateformat";

type TaskPreviewerProps = {
  data: any;
  isOpen: boolean;
  handleView: (item?: any) => {};
  getData: () => {};
};

export const TaskViewModal = ({
  data,
  isOpen,
  handleView,
  getData,
}: TaskPreviewerProps) => {
  const [groupSelected, setGroupSelected] = useState([]);
  const user = useCurrentUser();
  const [files, setFiles] = useState<File[]>([]);
  const markup = { __html: data.description };
  const [isLoading, setIsLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [searchMember, setSearchMember] = useState(null);
  const [inputs, setInputs] = useState({
    comment: undefined,
    attachments: null,
    relatedId: undefined,
  });
  const statusOptions = [
    { name: "Pending", color: "default" },
    { name: "Completed", color: "success" },
    { name: "Blocked", color: "danger" },
  ];
  const priorityOptions = [
    { name: "Urgent", color: "danger" },
    { name: "High", color: "primary" },
    { name: "Low", color: "default" },
  ];
  const [team, setTeam] = useState([]);

  useEffect(() => {
    const members = [];
    data?.assignTo?.map((i) => {
      members.push(i.id);
    });
    setGroupSelected(members);
    getComments();
  }, [data]);

  const getComments = async () => {
    await axios
      .get(`/api/comments?id=${data.id}`)
      .then(async (res) => {
        setComments(res.data);
      })
      .catch((e) => {});

    await axios
      .get("/api/members")
      .then((res) => {
        setTeam(res.data);
      })
      .catch(() => {});
  };

  const onSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
    values: any,
    files: any,
    id: string
  ) => {
    e.preventDefault();
    const data = new FormData();
    values.relatedId = id;
    setIsLoading(!isLoading);

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

    await axios
      .post("/api/comments", values)
      .then(async (res) => {
        setInputs({
          comment: undefined,
          attachments: null,
          relatedId: undefined,
        });
        getComments();
        setIsLoading(false);

        // if (files.length > 0) {
        //   files.forEach((item: any) => {
        //     data.append(res.data.message, item, item.name);
        //   });
        //   await axios
        //     .post(`/api/tasks/${res.data.message}`, data)
        //     .then((res) => {
        //       toast.success(res.data.message);
        //     })
        //     .catch((e) => {
        //       toast.error(e.response.data.message);
        //     });
        // } else {
        //   toast.success("Task added successfully");
        // }
      })
      .catch((e) => {
        toast.error(e.response.data.message);
      });
    // getData();
  };

  const onDelete = async (id: string) => {
    setIsLoading(!isLoading);
    await axios.delete(`/api/comments?id=${id}`);
    getComments();
    setIsLoading(false);
  };

  const updateMembers = async (ids: any) => {
    // data?.assignTo?.splice(id, 1);
    const newMembers = [];
    ids.map((i) => {
      newMembers.push({ id: i });
    });

    await axios
      .put(`/api/tasks/${data.id}?type=members`, newMembers)
      .then(async (res) => {
        await getData();
        toast.success("Task updated successfully");
      })
      .catch((e) => {});
  };

  const updateStatus = async (val: string) => {
    let i = statusOptions.find((i) => i.name === val);
    await axios
      .put(`/api/tasks/${data.id}?type=status`, { id: data.id, status: i })
      .then(() => {
        data.status = i;
        getData();
        toast.success("Task updated successfully");
      })
      .catch((e) => {});
  };

  const updatePriority = async (val: string) => {
    let i = priorityOptions.find((i) => i.name === val);
    await axios
      .put(`/api/tasks/${data.id}?type=priority`, { id: data.id, priority: i })
      .then(() => {
        data.priority = i;
        getData();
        toast.success("Task updated successfully");
      })
      .catch((e) => {});
  };

  const sendNotification = async (val: string) => {
    let i = priorityOptions.find((i) => i.name === val);
    await axios
      .put(`/api/tasks/${data.id}?type=priority`, { id: data.id, priority: i })
      .then(() => {
        data.priority = i;
        getData();
        toast.success("Task updated successfully");
      })
      .catch((e) => {});
  };

  return (
    <>
      <Modal
        open={isOpen}
        onClose={handleView}
        className="flex flex-1 flex-col gap-6 items-center justify-center z-0"
      >
        <Box
          style={{
            overflow: "scroll",
          }}
          className="flex flex-col gap-3 relative z-50 w-full box-border outline-none mx-1 my-1 sm:mx-6 sm:my-16 max-w-md rounded-large shadow-small overflow-y-hidden bg-white p-6"
        >
          <div className="flex justify-between w-full">
            <div>
              <div className="flex items-center">
                <DrawingPinIcon className="w-5 h-5 me-2 text-primary" />
                <h1 className="text-large font-semibold capitalize ">
                  {data?.name}
                </h1>
              </div>
              <div className=" text-muted-foreground text-tiny">
                Due {format(data?.dueDate)} • On{" "}
                {dateFormat(data?.dueDate, "ddd dd/mm/yy - HH:MM")}
              </div>
            </div>
            <Button
              onClick={handleView}
              size="sm"
              isIconOnly
              color="danger"
              variant="light"
              className="p-0 rounded-full"
            >
              <CrossCircledIcon />
            </Button>
          </div>
          <div className="w-full grid grid-cols-2 gap-4">
            <Select
              radius="sm"
              size="sm"
              key={data?.status?.color}
              color={data?.status?.color}
              defaultSelectedKeys={[data?.status?.name]}
              className="max-w-xs w-full"
              onChange={(e) => updateStatus(e.target.value)}
            >
              {statusOptions.map((st) => (
                <SelectItem key={st.name} value={st.name}>
                  {st.name}
                </SelectItem>
              ))}
            </Select>
            <Select
              radius="sm"
              size="sm"
              key={data?.priority?.color}
              color={data?.priority?.color}
              defaultSelectedKeys={[data?.priority?.name]}
              className="max-w-xs"
              onChange={(e) => updatePriority(e.target.value)}
            >
              {priorityOptions.map((i) => (
                <SelectItem key={i.name} value={i.name}>
                  {i.name}
                </SelectItem>
              ))}
            </Select>
          </div>
          <div className="team mb-2">
            <div className="flex items-center mb-2">
              <MixIcon className="text-primary me-2" />
              <h3 className="text-small text-foreground-500 font-normal">
                Team
              </h3>
            </div>
            <AvatarGroup className=" px-3 justify-start">
              <Tooltip
                showArrow={true}
                content={<>{data?.user?.name} • (me)</>}
              >
                <Avatar isBordered size="sm" src={data?.user?.image} />
              </Tooltip>
              {groupSelected?.map((i) =>
                team?.map((val: any, index: any) => {
                  if (i === val.id) {
                    return (
                      <Tooltip
                        color="primary"
                        showArrow={true}
                        content={val.name}
                        key={index}
                      >
                        <Avatar
                          color="primary"
                          isBordered
                          size="sm"
                          src={val.image}
                        />
                      </Tooltip>
                    );
                  }
                })
              )}
              <Popover showArrow placement="bottom">
                <PopoverTrigger>
                  <Avatar
                    size="sm"
                    showFallback
                    fallback={
                      <PlusIcon
                        className="text-foreground"
                        fill="currentColor"
                      />
                    }
                  />
                </PopoverTrigger>
                <PopoverContent className="p-2 min-w-[300px] border-none ">
                  <Input
                    size="sm"
                    type="text"
                    label="Search member"
                    onKeyUp={(e) => setSearchMember(e.target.value)}
                  />
                  <CheckboxGroup
                    value={groupSelected}
                    onChange={setGroupSelected}
                    classNames={{
                      base: "w-full px-2 py-2 max-h-[200px] overflow-y-hidden",
                    }}
                    style={{
                      overflow: "scroll",
                    }}
                  >
                    {team?.map((i) => {
                      if (searchMember) {
                        if (
                          i.name
                            ?.toLowerCase()
                            .includes(searchMember?.toLowerCase())
                        ) {
                          return (
                            <Checkbox value={i.id} key={i.id}>
                              <div className="flex gap-1 items-center m-auto w-full">
                                <Avatar
                                  size="sm"
                                  radius="sm"
                                  alt={i.name}
                                  src={i.image}
                                  className="flex-shrink-0 w-6 h-6 ms-2"
                                />
                                <div className="flex flex-col">
                                  <span className="text-xs">{i.name}</span>
                                  <span className="text-tiny text-default-400">
                                    {i.username ? i.username : i.email}
                                  </span>
                                </div>
                              </div>
                            </Checkbox>
                          );
                        }
                      } else {
                        return (
                          <Checkbox value={i.id}>
                            <div className="flex gap-1 items-center m-auto w-full">
                              <Avatar
                                size="sm"
                                radius="sm"
                                alt={i.name}
                                src={i.image}
                                className="flex-shrink-0 w-6 h-6"
                              />
                              <div className="flex flex-col">
                                <span className="text-xs">{i.name}</span>
                                <span className="text-tiny text-default-400">
                                  {i.username ? i.username : i.email}
                                </span>
                              </div>
                            </div>
                          </Checkbox>
                        );
                      }
                    })}
                  </CheckboxGroup>
                  <Button
                    size="sm"
                    radius="sm"
                    color="primary"
                    variant="solid"
                    className="p-0 rounded-md mx-2 my-2 w-full"
                    onClick={() => updateMembers(groupSelected)}
                  >
                    Save
                  </Button>
                </PopoverContent>
              </Popover>
            </AvatarGroup>
          </div>
          <Accordion
            defaultExpandedKeys={["1"]}
            className="p-0   border-1 px-2 rounded-md"
          >
            <AccordionItem
              key="1"
              subtitle="Description"
              startContent={<TextAlignLeftIcon className="text-primary" />}
            >
              <div dangerouslySetInnerHTML={markup} />
            </AccordionItem>
          </Accordion>
          {data?.attachments?.length > 0 && (
            <Accordion className="p-0 border-1 px-2 rounded-md">
              <AccordionItem
                startContent={<LayersIcon className="text-primary" />}
                subtitle={`Attachmets (${data?.attachments?.length})`}
              >
                {data?.attachments?.map((item, index) => {
                  item.index = index; //To delete from the uploading list
                  return <FilePreviewer item={item} key={index} type="tasks" />;
                })}
              </AccordionItem>
            </Accordion>
          )}
          <Accordion className="p-0 border-1 px-2 rounded-md">
            <AccordionItem
              subtitle={`Comments (${comments.length})`}
              startContent={<ChatBubbleIcon className="text-primary" />}
            >
              <div>
                <form
                  onSubmit={(e) => onSubmit(e, inputs, files, data?.id)}
                  className="grid gap-3"
                >
                  <div className="flex">
                    <Avatar
                      src={data?.user?.image}
                      className="w-6 h-6 me-2 shrink-0"
                    />
                    <Textarea
                      placeholder="What are you thinking?"
                      size="sm"
                      radius="sm"
                      className="w-full text-tiny"
                      color="default"
                      isRequired
                      minRows={1}
                      value={inputs.comment}
                      onChange={(e) => {
                        inputs.comment = e.target.value;
                      }}
                      endContent={
                        <Button
                          size="sm"
                          isIconOnly
                          color="primary"
                          type="submit"
                          className="ms-2 rounded-full"
                        >
                          <PaperPlaneIcon />
                        </Button>
                      }
                    />
                  </div>
                </form>
              </div>
              {(comments.length > 0 || isLoading) && (
                <Progress
                  size="sm"
                  isIndeterminate={isLoading}
                  aria-label="Loading..."
                  className="w-sm my-4 h-1"
                />
              )}
              <div className="comments">
                {comments?.map((item) => {
                  return (
                    <div
                      className={`flex my-2 max-w-[80%] m-auto ${
                        item.user?.id == user?.id
                          ? "ms-0"
                          : "flex-row-reverse me-0"
                      }`}
                    >
                      <Avatar
                        src={item?.user?.image}
                        className={`w-6 h-6 shrink-0 ${
                          item.user?.id === user?.id ? "me-2" : "ms-2"
                        }`}
                      />
                      <div>
                        <div
                          className={`w-fit h-auto px-2 py-1 rounded-sm text-xs text-ellipsis text-content5 font-light  overflow-hidden break-words m-auto ${
                            item.user?.id == user?.id
                              ? "text-start ms-0  bg-primary text-foreground rounded-tl-none"
                              : "text-end me-0  bg-foreground  text-primary  rounded-tr-none"
                          }`}
                        >
                          {item?.comment}
                        </div>
                        <div
                          className={`text-tiny text-default truncate text-ellipsis line-clamp-1 ${
                            item.user.id == user.id ? "text-start" : "text-end"
                          }`}
                        >
                          <span>
                            {item.user.id === user.id
                              ? "Me"
                              : `@${item?.user?.username}`}
                          </span>
                          <span>
                            {item?.attachments &&
                              " • " + item?.attachments?.length + " files"}
                          </span>
                          <span> • {format(item?.createdAt)}</span>
                          {item.user.id === user.id && (
                            <>
                              {" • "}
                              <span
                                className="text-danger hover:underline"
                                onClick={() => onDelete(item.id)}
                              >
                                Delete
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </AccordionItem>
          </Accordion>
        </Box>
      </Modal>
    </>
  );
};
