import {
  User,
  Input,
  Select,
  SelectItem,
  Button,
  ModalBody,
  Avatar,
  DatePicker, AvatarGroup, Tooltip, Popover, PopoverTrigger, PopoverContent, CheckboxGroup, Checkbox, Textarea, Tabs, Tab
} from "@nextui-org/react";
import { useEffect, useState, useTransition } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axios from "axios";
import { toast } from "sonner";
import { format } from "timeago.js";
import {
  AvatarIcon,
  Cross1Icon,
  GlobeIcon,
  ImageIcon,
  MagicWandIcon,
  PaperPlaneIcon,
  PlusIcon, ArrowDownIcon, ArrowUpIcon, ArrowRightIcon, FilePlusIcon, ChatBubbleIcon, FileIcon
} from "@radix-ui/react-icons";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  now,
  getLocalTimeZone,
  DateValue,
  today, parseAbsoluteToLocal
} from "@internationalized/date";
import { FilePreviewer } from "@/components/filePreviewer";
import { modules, formats } from "@/react-quill-settings";

type Props = {
  item: any;
  onSubmit: (e: any, values: any, files: any) => {};
  isSaving: boolean;
};

export const Edit = ({ item, onSubmit, isSaving }: Props) => {
  const user = useCurrentUser();

  const [groupSelected, setGroupSelected] = useState([]);
  const [searchMember, setSearchMember] = useState(null);
  const [team, setTeam] = useState([]);
  const [images, setImages] = useState([]);
  const [isPending, startTransition] = useTransition();
  const [files, setFiles] = useState<File[]>([]);
  const [fields, setFields] = useState(item?.[0]);
  const [comments, setComments] = useState([]);
  const [add, setAdd] = useState({
    image: false,
    category: false,
  });
  const [inputs, setInputs] = useState({
    comment: undefined,
    attachments: null,
    relatedId: undefined,
  });
  let priorities = [
    { name: "High", color: "danger" },
    { name: "Medium", color: "primary" },
    { name: "Low", color: "default" },
  ];
  let status = [
    { name: "Completed", color: "success" },
    { name: "To Do", color: "default" },
    { name: "In Progress", color: "foreground" },
    { name: "Blocked", color: "warning" },
    { name: "Cancelled", color: "danger" },
  ];
  let types = [
    { key: "Bug", label: "Bug" },
    { key: "Documentation", label: "Documentation" },
    { key: "Testing", label: "Testing" },
    { key: "Research", label: "Research" },
    { key: "Feature", label: "Feature" },
    { key: "Story", label: "Story" },
    { key: "Urgent", label: "Urgent" },
    { key: "Critical", label: "Critical" },
    { key: "Maintenance", label: "Maintenance" }
  ];

  useEffect(() => {
    const members = [];
    item?.assignTo?.map((i) => {
      members.push(i.id);
    });
    setGroupSelected(members);
    getComments()
    getMembers()
  }, [item]);

  const getComments = async () => {
    await axios
      .get(`/api/comments?id=${fields.id}`)
      .then(async (res) => {
        setComments(res.data);
      })
      .catch((e) => { });

    getMembers()
  };

  const getMembers = async () => {
    await axios
      .get("/api/members")
      .then((res) => {
        setTeam(res.data);
      })
      .catch(() => { });
  };

  const getImages = () => {
    startTransition(async () => {
      await axios
        .get("/api/files?type=image")
        .then((res) => {
          setImages(res.data);
        })
        .catch(() => { });
    });
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const _files = Array.from(e.target.files);
      setFiles([...files, ..._files]);
    }
  };

  const onDeleteSelected = (index: number) => {
    const _files = Array.from(files);
    _files.splice(index, 1);
    setFiles(_files);
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
        // await getData();
        toast.success("Task updated successfully");
      })
      .catch((e) => { });
  };


  const onSubmitComment = async (
    e: React.FormEvent<HTMLFormElement>,
    values: any,
    files: any,
    id: string
  ) => {
    e.preventDefault();
    const data = new FormData();
    values.relatedId = id;


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
    console.log(values)

    await axios
      .post("/api/comments", values)
      .then(async (res) => {
        setInputs({
          comment: undefined,
          attachments: null,
          relatedId: undefined,
        });
        getComments();


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

  const onDeleteComment = async (id: string) => {
    await axios.delete(`/api/comments?id=${id}`);
    getComments();
  };

  return (

    <ModalBody>
      <form onSubmit={(e) => onSubmit(e, fields, files)} className="grid gap-3">
        <div className="flex flex-row items-top gap-3">
          <Input
            size="sm"
            // isRequired
            type="text"
            radius="none"
            label="Title"
            value={fields.name}

            onValueChange={(v) => {
              setFields({
                ...fields,
                name: v,

              });
            }}
            description={`Created by ${fields.createdBy == user.email ? 'me' : fields.user.name} (${format(fields.createdAt)})`}
            isDisabled={fields.createdBy == user.email ? false : true}
          />
        </div>
        <div className="grid gap-3 grid-cols-3 w-full">
          <Select
            size="sm"
            // isRequired
            radius="none"
            label="Priority"
            items={priorities}
            selectedKeys={[fields.priority.name]}
            disabledKeys={[fields.priority.name]}
            color={fields.priority.color}
            onChange={
              (item: any) =>
                priorities.map(
                  (p) =>
                    p.name == item.target.value &&
                    setFields({ ...fields, priority: p })
                )
              //
            }
            renderValue={(items: any) => items.map((i: any) => i.key)}
            isDisabled={fields.createdBy == user.email ? false : true}
          >
            {(i: any) => (
              <SelectItem key={i.name} value={i.name} rounded='none'>
                <div className="flex gap-1 items-center">
                  <span className="text-small">{i.name}</span>
                </div>
              </SelectItem>
            )}
          </Select>
          <Select
            size="sm"
            // isRequired
            radius="none"
            label="Type"
            selectedKeys={[fields.type]}
            disabledKeys={[fields.type]}
            onChange={(e) => setFields({ ...fields, type: e.target.value })}
          // renderValue={(items: any) => items.map((i: any) => i.key)}
          >
            {types.map((type) => (
              <SelectItem key={type.key}>
                {type.label}
              </SelectItem>
            ))}
          </Select>
          <DatePicker
            size="sm"
            radius="none"
            // isRequired
            hourCycle={24}
            hideTimeZone={true}
            label="Due Date & Time"
            showMonthAndYearPickers
            defaultValue={parseAbsoluteToLocal(fields.dueDate)}
            placeholderValue={now("America/New_York")}
            className="w-full flex flex-col-reverse flex-wrap-reverse overflow-hidden"
            onChange={(date: any) => {
              const m = `${date?.month <= 9 ? "0" : ""}${date?.month}`;
              const d = `${date?.day <= 9 ? "0" : ""}${date?.day}`;
              const h = `${date?.hour <= 9 ? "0" : ""}${date?.hour}`;
              const min = `${date?.minute <= 9 ? "0" : ""}${date?.minute}`;
              setFields({
                ...fields,
                dueDate: `${date?.year}-${m}-${d}T${h}:${min}Z`,
              });
            }}
          />
        </div>
        <div
          className={`grid gap-3 sm:grid-cols-2`}
        >
          <Select
            size="sm"
            // isRequired
            radius="none"
            items={team}
            label="Assign to"
            description={fields.assignedIds.includes(user.id) ? `Assigned to me` : ''}
            selectionMode="multiple"
            selectedKeys={fields.assignedIds}
            onChange={(e) =>
              setFields({ ...fields, assignedIds: e.target.value.split(",") })
            }
            renderValue={(items: any) => {
              return <p>{items.length} selected</p>;
            }}
          >
            {(i: any) => (
              <SelectItem key={i.key} value={i.name}>
                <div className="flex gap-1 items-center">
                  <Avatar
                    size="sm"
                    radius="full"
                    alt={i.name}
                    src={i.tempUrl}
                    className="flex-shrink-0"
                  />
                  <div className="flex flex-col">
                    <span className="text-small">{i.name}</span>
                    <span className="text-tiny text-default-400">
                      @{i.username}
                    </span>
                  </div>
                </div>
              </SelectItem>
            )}
          </Select>
          <Select
            size="sm"
            // isRequired
            radius="none"
            label="Status"
            items={status}
            selectedKeys={[fields.status.name]}
            disabledKeys={[fields.status.name]}
            color={fields.status.color}
            onChange={
              (item: any) =>
                status.map(
                  (s) =>
                    s.name == item.target.value &&
                    setFields({ ...fields, status: s })
                )
              //
            }
            renderValue={(items: any) => items.map((i: any) => i.key)}
            isDisabled={fields.createdBy == user.email ? false : true}
          >
            {(i: any) => (
              <SelectItem key={i.name} value={i.name} rounded='none'>
                <div className="flex gap-1 items-center">
                  <span className="text-small">{i.name}</span>
                </div>
              </SelectItem>
            )}
          </Select>
          {/* <div>
            <label
              htmlFor="attachments"
              className="relative w-full inline-flex shadow-sm tap-highlight-transparent bg-default-100 hover:bg-default-200 rounded-none flex-col items-start justify-center gap-0 outline-none h-12 min-h-12 py-1.5 px-3 text-sm text-foreground-500"
            >
              {fields.attachments ? `(${fields.attachments.length}) Attach more... `
                : "Attachments"}
            </label>
            <input
              id="attachments"
              type="file"
              multiple
              accept=".xlsx,.xls,image/*,.doc, .docx,.ppt, .pptx,.txt,.pdf"
              className="hidden"
              onChange={handleFileSelected}
            />
          </div> */}
        </div>
        <div className="flex gap-3 w-full items-top mb-0">
          <ReactQuill
            theme="snow"
            placeholder="Write your content"
            className="min-h-[200px] rounded-none bg-content2 w-full"
            modules={modules}
            formats={formats}
            value={fields.description}
            onChange={(v) => {
              setFields({ ...fields, description: v });
            }}
          />
        </div>
      </form>
      <div>
        <Tabs aria-label="Options" color='primary'>
          <Tab key="comments" title={
            < div className="flex items-center space-x-2">
              <ChatBubbleIcon />
              <span>{comments.length} Comments</span>
            </div>
          }
          >
            <form
              onSubmit={(e) => onSubmitComment(e, inputs, files, fields?.id)}
              className="grid gap-3 mb-3"
            >
              <div className="flex">
                <Avatar
                  src={user?.tempUrl}
                  size='sm'
                  className="me-2 shrink-0"
                />
                <Textarea
                  placeholder="What are you thinking?"
                  size="sm"
                  radius="sm"
                  className="w-full text-tiny"
                  color="default"
                  isRequired
                  minRows={1}
                  description={`Files attached`}
                  // value={inputs.comment}
                  onValueChange={(e) => setInputs({ ...inputs, comment: e })}
                  endContent={
                    <>
                      <Button
                        size="sm"
                        isIconOnly
                        color="foreground"
                        // type="submit"
                        variant="flat"
                        className="ms-2 rounded-full"
                      >
                        <FilePlusIcon />
                      </Button>
                      <Button
                        size="sm"
                        isIconOnly
                        color="primary"
                        type="submit"
                        className="ms-2 rounded-full"
                      >
                        <PaperPlaneIcon />
                      </Button>

                    </>
                  }
                />
              </div>
            </form>

            <div className="comments">
              {comments?.map((i) => {
                return (
                  <div
                    className={`flex my-2 max-w-[80%] m-auto ${i.user?.id == user?.id
                      ? "ms-0"
                      : "flex-row-reverse me-0"
                      }`}
                  >
                    <Avatar
                      src={i?.user?.tempUrl}
                      size='sm'
                      className={`shrink-0 ${i.user?.id === user?.id ? "me-2" : "ms-2"
                        }`}
                    />
                    <div>
                      <div
                        className={`w-fit h-auto px-2 py-1 rounded-xl text-sm text-ellipsis text-content5 font-light overflow-hidden break-words m-auto ${i.user?.id == user?.id
                          ? "text-start ms-0 bg-primary rounded-tl-none"
                          : "text-start me-0 bg-foreground-50 rounded-tr-none"
                          }`}
                      >
                        {i?.comment}
                      </div>
                      <div
                        className={`text-tiny text-foreground-400 truncate text-ellipsis line-clamp-1 ${i.user.id == user.id ? "text-start" : "text-end"
                          }`}
                      >
                        <span>
                          {i?.user?.id === user?.id
                            ? "Me"
                            : `@${i?.user?.username}`}
                        </span>
                        <span>
                          {i?.attachments &&
                            " • " + i?.attachments?.length + " files"}
                        </span>
                        <span> • {format(i?.createdAt)}</span>
                        {i.user.id === user.id && (
                          <>
                            {" • "}
                            <span
                              className="text-danger hover:underline"
                              onClick={() => onDeleteComment(i.id)}
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
          </Tab>
          {fields.attachments ? <Tab key="attachments" title={
            <div className="flex items-center space-x-2">
              <FileIcon />
              <span>{fields.attachments.length} Attachments</span>
            </div>
          }>
            {fields.attachments.map((item, index) => {
              item.index = index; //To delete from the uploading list
              return (
                <FilePreviewer
                  item={item}
                  key={index}
                  onDelete={onDeleteSelected}
                />
              );
            })}
          </Tab> : null
          }
        </Tabs>
      </div>
      {/* <div className="flex justify-end items-center gap-3 w-fll mb-3">
          <Button
            size="md"
            color="primary"
            type="submit"
            radius="none"
            // isDisabled={
            //   isSaving ||
            //   !fields.name ||
            //   !fields.description
            // }
            spinnerPlacement="end"
            endContent={!isSaving && <PaperPlaneIcon />}
            isLoading={isSaving}
          >
            SAVE
          </Button>
        </div> */}

    </ModalBody>

  );
};
