"use client";
import {
  Input,
  Select,
  SelectItem,
  Button,
  Avatar,
  Accordion,
  AccordionItem,
  DatePicker,
} from "@nextui-org/react";
import {
  now,
  getLocalTimeZone,
  DateValue,
  today,
} from "@internationalized/date";
import axios from "axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useEffect, useState } from "react";
import { FilePreviewer } from "./filePreviewer";

type TaskFormProps = {
  onSubmit: (e?: any, values?: any, files?: any) => {};
  isPending: boolean;
};

export const TaskFormModal = ({ onSubmit, isPending }: TaskFormProps) => {
  let priorities = [
    { name: "Urgent", color: "danger" },
    { name: "High", color: "primary" },
    { name: "Low", color: "default" },
  ];
  const [team, setTeam] = useState([]);
  const [files, setFiles] = useState<File[]>([]);

  const [inputs, setInputs] = useState({
    name: "",
    priority: {},
    dueDate: useState<DateValue>(),
    assignTo: [],
    attachments: null,
    description: "",
  });

  useEffect(() => {
    axios
      .get("/api/members")
      .then((res) => {
        setTeam(res.data);
      })
      .catch(() => {});
  }, []);

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" },
      ],
      ["link", "image", "video"],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "video",
  ];

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

  return (
    <form onSubmit={(e) => onSubmit(e, inputs, files)} className="grid gap-3">
      <Input
        size="sm"
        isRequired
        radius="md"
        type="text"
        label="Task"
        onChange={(e) => setInputs({ ...inputs, name: e.target.value })}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <Select
          size="sm"
          isRequired
          radius="md"
          label="Priority"
          items={priorities}
          onChange={
            (item) =>
              priorities.map(
                (p) =>
                  p.name == item.target.value &&
                  setInputs({ ...inputs, priority: p })
              )
            //
          }
          renderValue={(items) => {
            return items.map((item) => (
              <div className="flex gap-1 items-center">
                <Avatar
                  radius="full"
                  alt={item.data.name}
                  className={`flex-shrink-0 w-5 h-5 bg-${item.data.color}`}
                  src={item.data.name}
                />
                <div className="flex flex-col">
                  <span className="text-small">{item.key}</span>
                </div>
              </div>
            ));
          }}
        >
          {(i: any) => (
            <SelectItem key={i.name} value={i.name}>
              <div className="flex gap-1 items-center">
                <Avatar
                  radius="full"
                  alt={i.name}
                  src={i.name}
                  className={`flex-shrink-0 w-5 h-5 bg-${i.color}`}
                />
                <span className="text-small">{i.name}</span>
              </div>
            </SelectItem>
          )}
        </Select>
        <DatePicker
          size="sm"
          radius="md"
          isRequired
          hourCycle={24}
          hideTimeZone={true}
          label="Due Date & Time"
          showMonthAndYearPickers
          minValue={today(getLocalTimeZone())}
          placeholderValue={now("America/New_York")}
          className="w-full flex flex-col-reverse flex-wrap-reverse overflow-hidden"
          onChange={(date) => {
            const m = `${date?.month <= 9 ? "0" : ""}${date?.month}`;
            const d = `${date?.day <= 9 ? "0" : ""}${date?.day}`;
            const h = `${date?.hour <= 9 ? "0" : ""}${date?.hour}`;
            const min = `${date?.minute <= 9 ? "0" : ""}${date?.minute}`;
            setInputs({
              ...inputs,
              dueDate: `${date?.year}-${m}-${d}T${h}:${min}`,
            });
          }}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Select
          size="sm"
          isRequired
          radius="md"
          items={team}
          label="Assign to"
          selectionMode="multiple"
          onChange={(e) =>
            setInputs({ ...inputs, assignTo: e.target.value.split(",") })
          }
          renderValue={(items) => {
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
                  src={i.image}
                  className="flex-shrink-0"
                />
                <div className="flex flex-col">
                  <span className="text-small">{i.name}</span>
                  <span className="text-tiny text-default-400">
                    {i.username ?? i.email}
                  </span>
                </div>
              </div>
            </SelectItem>
          )}
        </Select>
        <div>
          <label
            htmlFor="attachments"
            className="bg-default-100 text-foreground-500 text-sm  hover:opacity-80 w-full h-12   hover:cursor-pointer hover:bg-default-200 rounded-xl px-3 py-3 flex item-center justify-start"
          >
            {files.length > 0
              ? `(${files.length}) Attach more... `
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
        </div>
      </div>
      {files.length > 0 && (
        <Accordion className="hover:opacity-80 w-full  hover:cursor-pointer hover:bg-default-200 rounded-xl">
          <AccordionItem key="1" aria-label="Attachments" subtitle="Attached">
            {files.map((item, index) => {
              item.index = index; //To delete from the uploading list
              return (
                <FilePreviewer
                  item={item}
                  key={index}
                  onDelete={onDeleteSelected}
                />
              );
            })}
          </AccordionItem>
        </Accordion>
      )}
      <ReactQuill
        theme="snow"
        placeholder="Description"
        className="bg-content2 min-h-[200px] rounded-xl"
        modules={modules}
        formats={formats}
        onChange={(e) => {
          setInputs({ ...inputs, description: e });
        }}
      />
      <Button size="md" color="primary" type="submit" isLoading={isPending}>
        Add Blog
      </Button>
    </form>
  );
};
