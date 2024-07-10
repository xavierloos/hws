"use client";
import React, { useEffect, useState, useTransition } from "react";
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
  User,
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
import { BlogSkeleton } from "./blogSkeleton";

type BlogViewProps = {
  data: any;
  isOpen: boolean;
  handleView: (item?: any) => {};
  getData: () => {};
};

export const BlogViewModal = ({
  data,
  isOpen,
  handleView,
  getData,
}: BlogViewProps) => {
  const [isPending, startTransition] = useTransition();
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
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
    getCategories();
    getImages();
  }, [data]);
  const getCategories = () => {
    startTransition(async () => {
      await axios
        .get("/api/categories")
        .then((res) => {
          setCategories(res.data);
        })
        .catch(() => {});
    });
  };

  const getImages = () => {
    startTransition(async () => {
      await axios
        .get("/api/files?type=image")
        .then((res) => {
          setImages(res.data);
        })
        .catch(() => {});
    });
  };

  // const getComments = async () => {
  //   await axios
  //     .get(`/api/comments?id=${data.id}`)
  //     .then(async (res) => {
  //       setComments(res.data);
  //     })
  //     .catch((e) => {});

  //   await axios
  //     .get("/api/members")
  //     .then((res) => {
  //       setTeam(res.data);
  //     })
  //     .catch(() => {});
  // };

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
        // getComments();
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

  // const onDelete = async (id: string) => {
  //   setIsLoading(!isLoading);
  //   await axios.delete(`/api/comments?id=${id}`);
  //   getComments();
  //   setIsLoading(false);
  // };

  // const updateMembers = async (ids: any) => {
  //   // data?.assignTo?.splice(id, 1);
  //   const newMembers = [];
  //   ids.map((i) => {
  //     newMembers.push({ id: i });
  //   });

  //   await axios
  //     .put(`/api/tasks/${data.id}?type=members`, newMembers)
  //     .then(async (res) => {
  //       await getData();
  //       toast.success("Task updated successfully");
  //     })
  //     .catch((e) => {});
  // };

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

  // const updatePriority = async (val: string) => {
  //   let i = priorityOptions.find((i) => i.name === val);
  //   await axios
  //     .put(`/api/tasks/${data.id}?type=priority`, { id: data.id, priority: i })
  //     .then(() => {
  //       data.priority = i;
  //       getData();
  //       toast.success("Task updated successfully");
  //     })
  //     .catch((e) => {});
  // };

  // const sendNotification = async (val: string) => {
  //   let i = priorityOptions.find((i) => i.name === val);
  //   await axios
  //     .put(`/api/tasks/${data.id}?type=priority`, { id: data.id, priority: i })
  //     .then(() => {
  //       data.priority = i;
  //       getData();
  //       toast.success("Task updated successfully");
  //     })
  //     .catch((e) => {});
  // };

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
            <div className="flex items-center">
              <h1 className=" text-large font-semibold uppercase ">
                {data.name}
              </h1>
            </div>
            <Button
              // onClick={handleNewItem}
              size="sm"
              isIconOnly
              color="danger"
              variant="light"
              className="p-0 rounded-full"
            >
              <CrossCircledIcon />
            </Button>
          </div>
          <form onSubmit={(e) => console.log(e)} className="grid gap-3">
            {isPending ? (
              <BlogSkeleton />
            ) : (
              <>
                <div className="flex flex-row items-top">
                  <Input
                    size="sm"
                    isRequired
                    type="text"
                    radius="sm"
                    label="Title"
                    value={data.name}
                    // onValueChange={(v) => {
                    //   setFields({
                    //     ...fields,
                    //     name: v,
                    //     slug: createSlug(v),
                    //   });
                    // }}
                    description={data.slug}
                  />
                  {/* {isRegenateButtonActive && (
                    <Tooltip content="Regenerate">
                      <Button
                        size="sm"
                        isIconOnly
                        radius="sm"
                        variant="solid"
                        className="ms-2 bg-content2"
                        onClick={() => regenerate("name")}
                        isLoading={titleLoading}
                      >
                        <MagicWandIcon />
                      </Button>
                    </Tooltip>
                  )} */}
                </div>
                <div className="flex flex-row items-top">
                  <Textarea
                    size="sm"
                    minRows={1}
                    maxRows={4}
                    isRequired
                    type="text"
                    radius="sm"
                    label="Description"
                    disableAutosize
                    // isLoading={descriptionLoading}
                    classNames={{
                      base: "w-full",
                      input: "resize-y min-h-[10px] max-h-[60px]",
                    }}
                    value={data.description}
                    // onChange={(v) => {
                    //   setFields({ ...fields, description: v.target.value });
                    // }}
                  />
                  {/* <Tooltip content="Regenerate">
                    <Button
                      size="sm"
                      isIconOnly
                      radius="sm"
                      variant="solid"
                      className="ms-2 bg-content2"
                      onClick={() => regenerate("description")}
                    >
                      <MagicWandIcon />
                    </Button>
                  </Tooltip> */}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex flex-row items-center">
                    {showAdd.thumbnail ? (
                      <>
                        <label
                          htmlFor="uploadImage"
                          className="bg-default-100 text-foreground-500 text-sm  hover:opacity-80 w-full h-12 hover:cursor-pointer hover:bg-default-200 rounded-xl px-3 py-3 flex"
                        >
                          {newImagePreview ? (
                            <Avatar
                              radius="sm"
                              src={newImagePreview}
                              className="w-5 h-5 me-2 shrink-0"
                            />
                          ) : (
                            <ImageIcon className="w-5 h-5 me-2 shrink-0" />
                          )}
                          <span className=" inline-flex item-center justify-start overflow-ellipsis line-clamp-1 break-all">
                            {newImage.name ? newImage.name : "Add Thumbnail..."}
                          </span>
                        </label>
                        <Tooltip content="Cancel">
                          <Button
                            size="sm"
                            isIconOnly
                            color="danger"
                            variant="flat"
                            className="ms-2 rounded-full hover:opacity-100"
                            onClick={() => {
                              setNewImagePreview(null);
                              setNewImage([]);
                              setShowAdd({
                                ...showAdd,
                                thumbnail: !showAdd.thumbnail,
                              });
                            }}
                          >
                            <Cross1Icon />
                          </Button>
                        </Tooltip>
                        <Tooltip content="Save Thumbnail">
                          <Button
                            size="sm"
                            isIconOnly
                            color="primary"
                            isLoading={isPending}
                            isDisabled={newImagePreview ? false : true}
                            className="ms-2 rounded-full hover:opacity-100"
                            onClick={() => onSubmitImage(newImage)}
                          >
                            <PaperPlaneIcon />
                          </Button>
                        </Tooltip>
                      </>
                    ) : (
                      <>
                        <Select
                          size="sm"
                          isRequired
                          radius="sm"
                          items={images}
                          label="Thumbnail"
                          isDisabled={isPending}
                          defaultValue={data.thumbnail}
                          // onChange={(e) => {
                          //   fields.thumbnail = e.target.value;
                          // }}
                          renderValue={(items) => {
                            return items.map((item) => item.key);
                          }}
                        >
                          {(item: any) => (
                            <SelectItem key={item.name} value={item.name}>
                              <div className="flex gap-x-1 items-center">
                                <Avatar
                                  radius="sm"
                                  alt={item.name}
                                  className="flex-shrink-0"
                                  size="sm"
                                  src={item.tempUrl}
                                />
                                <div className="flex flex-col">
                                  <span className="text-small">
                                    {item.name}
                                  </span>
                                  <span className="text-tiny text-default-400">
                                    {item.size &&
                                      `${(item.size / 1024).toFixed(2)}kB`}
                                  </span>
                                </div>
                              </div>
                            </SelectItem>
                          )}
                        </Select>
                        <Tooltip content="Add Thumbnail">
                          <Button
                            size="sm"
                            isIconOnly
                            variant="solid"
                            className="p-0 rounded-full ms-2  bg-content2"
                            onClick={() =>
                              setShowAdd({
                                ...showAdd,
                                thumbnail: !showAdd.thumbnail,
                                banner: false,
                              })
                            }
                          >
                            <PlusIcon
                              className={`origin-center ${
                                showAdd.thumbnail && "rotate-45 "
                              }`}
                              style={{
                                transition:
                                  "all 0.5s cubic-bezier(0.175,0.885,0.32,1.1)",
                              }}
                            />
                          </Button>
                        </Tooltip>
                      </>
                    )}
                  </div>
                  <div className="flex flex-row items-center">
                    {showAdd.banner ? (
                      <>
                        <label
                          htmlFor="uploadImage"
                          className="bg-default-100 text-foreground-500 text-sm  hover:opacity-80 w-full h-12 hover:cursor-pointer hover:bg-default-200 rounded-xl px-3 py-3 flex"
                        >
                          {newImagePreview ? (
                            <Avatar
                              radius="sm"
                              src={newImagePreview}
                              className="w-5 h-5 me-2 shrink-0"
                            />
                          ) : (
                            <ImageIcon className="w-5 h-5 me-2 shrink-0" />
                          )}
                          <span className=" inline-flex item-center justify-start overflow-ellipsis line-clamp-1 break-all">
                            {newImage.name ? newImage.name : "Add Banner..."}
                          </span>
                        </label>
                        <Tooltip content="Cancel">
                          <Button
                            size="sm"
                            isIconOnly
                            color="danger"
                            variant="flat"
                            className="ms-2 rounded-full hover:opacity-100"
                            onClick={() => {
                              setNewImagePreview(null);
                              setNewImage([]);
                              setShowAdd({
                                ...showAdd,
                                banner: !showAdd.banner,
                              });
                            }}
                          >
                            <Cross1Icon />
                          </Button>
                        </Tooltip>
                        <Tooltip content="Save Banner">
                          <Button
                            size="sm"
                            isIconOnly
                            color="primary"
                            isLoading={isPending}
                            isDisabled={newImagePreview ? false : true}
                            className="ms-2 rounded-full hover:opacity-100"
                            onClick={() => onSubmitImage(newImage)}
                          >
                            <PaperPlaneIcon />
                          </Button>
                        </Tooltip>
                      </>
                    ) : (
                      <>
                        <Select
                          size="sm"
                          isRequired
                          radius="sm"
                          label="Banner"
                          items={images}
                          isDisabled={isPending}
                          defaultValue={fields.banner}
                          onChange={(e) => {
                            fields.banner = e.target.value;
                          }}
                          renderValue={(items) => {
                            return items.map((item) => item.key);
                          }}
                        >
                          {(item: any) => (
                            <SelectItem key={item.name} value={item.name}>
                              <div className="flex gap-x-1 items-center">
                                <Avatar
                                  radius="sm"
                                  alt={item.name}
                                  className="flex-shrink-0"
                                  size="sm"
                                  src={item.tempUrl}
                                />
                                <div className="flex flex-col">
                                  <span className="text-small">
                                    {item.name}
                                  </span>
                                  <span className="text-tiny text-default-400">
                                    {item.size &&
                                      `${(item.size / 1024).toFixed(2)}kB`}
                                  </span>
                                </div>
                              </div>
                            </SelectItem>
                          )}
                        </Select>
                        <Tooltip content="Add Banner">
                          <Button
                            size="sm"
                            isIconOnly
                            variant="solid"
                            className="p-0 rounded-full ms-2  bg-content2"
                            onClick={(e) =>
                              setShowAdd({
                                ...showAdd,
                                thumbnail: false,
                                banner: !showAdd.banner,
                              })
                            }
                          >
                            <PlusIcon
                              className={`origin-center ${
                                showAdd.banner && "rotate-45 "
                              }`}
                              style={{
                                transition:
                                  "all 0.5s cubic-bezier(0.175,0.885,0.32,1.1)",
                              }}
                            />
                          </Button>
                        </Tooltip>
                      </>
                    )}
                  </div>
                  <input
                    id="uploadImage"
                    type="file"
                    accept="image/*"
                    // required
                    className="hidden"
                    onChange={handleImageSelected}
                  />
                </div>
                <div className="flex flex-row items-center">
                  {showAdd.category ? (
                    <>
                      <Input
                        size="sm"
                        type="text"
                        radius="sm"
                        label="Add category"
                        onValueChange={(v) =>
                          setNewCategory(v.charAt(0).toUpperCase() + v.slice(1))
                        }
                        isDisabled={isPending}
                        autoFocus
                      />
                      <Tooltip content="Cancel">
                        <Button
                          size="sm"
                          isIconOnly
                          color="danger"
                          variant="flat"
                          className="ms-2 rounded-full hover:opacity-100"
                          onClick={(e) =>
                            setShowAdd({
                              ...showAdd,
                              category: !showAdd.category,
                            })
                          }
                        >
                          <Cross1Icon />
                        </Button>
                      </Tooltip>
                      <Button
                        size="sm"
                        isIconOnly
                        color="primary"
                        isDisabled={newCategory ? false : true}
                        className="ms-2 rounded-full"
                        onClick={() => addCategory()}
                      >
                        <PaperPlaneIcon />
                      </Button>{" "}
                    </>
                  ) : (
                    <>
                      <Select
                        size="sm"
                        isRequired
                        radius="sm"
                        label="Categories"
                        isDisabled={isPending}
                        selectionMode="multiple"
                        selectedKeys={selectedCategories}
                        onChange={handleSelectionChange}
                        description={
                          openAICategories &&
                          `Suggested categories: ${openAICategories}`
                        }
                      >
                        {categories.map((item) => (
                          <SelectItem key={item.id} value={item.name}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </Select>
                      <Tooltip content="Add a category">
                        <Button
                          size="sm"
                          isIconOnly
                          variant="solid"
                          className="p-0 rounded-full ms-2  bg-content2"
                          onClick={(e) =>
                            setShowAdd({
                              ...showAdd,
                              category: !showAdd.category,
                            })
                          }
                        >
                          <PlusIcon
                            className={`origin-center ${
                              showAdd.category && "rotate-45 "
                            }`}
                            style={{
                              transition:
                                "all 0.5s cubic-bezier(0.175,0.885,0.32,1.1)",
                            }}
                          />
                        </Button>
                      </Tooltip>
                    </>
                  )}
                </div>
                <div className="flex flex-row items-top">
                  <ReactQuill
                    theme="snow"
                    placeholder="Write your content"
                    className="min-h-[200px] rounded-xl bg-content2"
                    modules={modules}
                    formats={formats}
                    value={fields.content}
                    onChange={(v) => {
                      setFields({ ...fields, content: v });
                    }}
                    endContent={
                      <Button
                        size="md"
                        isIconOnly
                        variant="light"
                        className="my-auto p-0 rounded-full"
                        onClick={() => regenerate("description")}
                      >
                        <MagicWandIcon className="w-5 h-5" />
                      </Button>
                    }
                  />
                  {isRegenateButtonActive && (
                    <Tooltip content="Regenerate">
                      <Button
                        size="sm"
                        isIconOnly
                        radius="sm"
                        variant="solid"
                        className="ms-2 bg-content2"
                        onClick={() => regenerate("content")}
                        isLoading={contentLoading}
                      >
                        <MagicWandIcon />
                      </Button>
                    </Tooltip>
                  )}
                </div>
                <Switch
                  onChange={(e) => {
                    fields.isActive = e.target.checked;
                  }}
                  classNames={{
                    base: cn(
                      "inline-flex flex-row-reverse w-full max-w-full hover:bg-default-200 items-center",
                      "justify-between cursor-pointer  rounded-xl gap-2 p-4 border-2 border-transparent  bg-content2"
                    ),
                    wrapper: "p-0 h-4 overflow-visible",
                    thumb: cn(
                      "w-6 h-6 border-2 shadow-lg  bg-content1",
                      "group-data-[hover=true]:border-primary",
                      //selected
                      "group-data-[selected=true]:ml-6",
                      // pressed
                      "group-data-[pressed=true]:w-7",
                      "group-data-[selected]:group-data-[pressed]:ml-4"
                    ),
                  }}
                >
                  <div className="flex flex-col gap-1">
                    <p className="text-xs">Active</p>
                    <p className="text-tiny text-default-400">
                      Make active will be visible to public
                    </p>
                  </div>
                </Switch>
              </>
            )}

            {/* <div className="grid gap-3 grid-cols-2">
              <Button
                size="md"
                color="default"
                endContent={
                  loading ? <Spinner size="sm" color="white" /> : <FaMagic />
                }
                onClick={generate}
                isDisabled={loading}
              >
                {loading ? "Generaring..." : "Generate"}
              </Button>
              <Button
                size="md"
                color="primary"
                type="submit"
                isDisabled={loading}
                endContent={<FaSave />}
                // onPress={onClose}
              >
                Add Blog
              </Button>
            </div> */}
          </form>
        </Box>
      </Modal>
    </>
  );
};
