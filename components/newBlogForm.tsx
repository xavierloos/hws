"use client";
import {
  Input,
  Select,
  SelectItem,
  Switch,
  cn,
  Button,
  Spinner,
  Textarea,
  Skeleton,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
  RadioGroup,
  Radio,
  Badge,
  Avatar,
  Image,
  Tooltip,
} from "@nextui-org/react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useEffect, useState, useTransition } from "react";
import { ErrorForm } from "@/components/errorForm";
import { SuccessForm } from "@/components/success-form";
import { useCurrentUser } from "@/hooks/use-current-user";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axios from "axios";
import { toast } from "sonner";
import {
  CheckIcon,
  Cross1Icon,
  EyeClosedIcon,
  ImageIcon,
  InfoCircledIcon,
  MagicWandIcon,
  PaperPlaneIcon,
  PlusIcon,
  ReloadIcon,
} from "@radix-ui/react-icons";
import { FaMagic, FaSave } from "react-icons/fa";
import { FilePreviewer } from "./filePreviewer";
import { BlogSkeleton } from "./blogSkeleton";

type NewItemFormProps = {
  onSubmit: (e?: any, values?: any) => {};
  onClose: () => {};
};

export const NewBlogForm = ({ onSubmit, onClose }: NewItemFormProps) => {
  const [showAdd, setShowAdd] = useState({
    thumbnail: false,
    banner: false,
    category: false,
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [reloading, setReloading] = useState(false);
  const [isRegenateButtonActive, setIsRegenateButtonActive] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newImage, setNewImage] = useState<File[]>([]);
  const [isPending, startTransition] = useTransition();
  const [slugLoading, setSlugLoading] = useState(false);
  const [titleLoading, setTitleLoading] = useState(false);
  const [openAICategories, setOpenAICategories] = useState(null);
  const [contentLoading, setContentLoading] = useState(false);
  const [newImagePreview, setNewImagePreview] = useState(null);
  const [descriptionLoading, setDescriptionLoading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Selection>();
  const [fields, setFields] = useState({
    name: "",
    slug: undefined,
    description: undefined,
    isActive: false,
    categories: selectedCategories,
    content: undefined,
    thumbnail: undefined,
    banner: undefined,
  });

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

  useEffect(() => {
    getCategories();
    getImages();
  }, []);

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

  const createSlug = (value: string) => {
    const trimmedText = value.toLowerCase().trim();
    const alphanumericText = trimmedText.replace(/\W+/g, "-");
    // setFields({ ...fields, slug: alphanumericText.replace(/(^-|-$)/g, "") });
    return alphanumericText.replace(/(^-|-$)/g, "");
  };

  const generate = async () => {
    startTransition(async () => {
      await axios
        .get("/api/chat")
        .then((res) => {
          setFields({
            ...fields,
            name: JSON.parse(res.data.content).title,
            slug: JSON.parse(res.data.content).slug,
            description: JSON.parse(res.data.content).description,
            content: JSON.parse(res.data.content).content,
          });
          setOpenAICategories(JSON.parse(res.data.content).categories);
          setIsRegenateButtonActive(true);
        })
        .catch((e) => {
          toast.error(e.response.data.message);
        });
    });
  };

  const regenerate = async (input: string) => {
    let value;
    switch (input) {
      case "name":
        value = fields.name;
        setTitleLoading(true);
        break;
      case "description":
        value = fields.description;
        setDescriptionLoading(true);
        break;
      case "content":
        value = fields.content;
        setContentLoading(true);
        break;
      default:
        break;
    }

    await axios
      .post(`/api/chat`, { value })
      .then((res) => {
        const content = res.data.content;
        if (input === "name") {
          setFields({ ...fields, name: content, slug: createSlug(content) });
          setTitleLoading(false);
        }
        if (input === "description") {
          setFields({ ...fields, description: content });
          setDescriptionLoading(false);
        }
        if (input === "content") {
          setFields({ ...fields, content });
          setContentLoading(false);
        }
      })
      .catch((e) => {
        toast.error(e.stack);
      });
  };

  const addCategory = () => {
    startTransition(async () => {
      await axios
        .post("/api/categories", { newCategory })
        .then((res) => {
          if (res.data.type === "warning")
            return toast.warning(res.data.message);
          if (res.data.type === "success") toast.success(res.data.message);
          getCategories();
          setShowAdd({ ...showAdd, category: !showAdd.category });
        })
        .catch((e) => {
          toast.error(e.response.data.message);
        });
    });
  };
  const handleImageSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewImage(e.target.files[0]);
      setNewImagePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const onSubmitImage = async (newImage: any) => {
    startTransition(async () => {
      if (newImagePreview) {
        const data = new FormData();
        data.append(newImage?.name, newImage);
        await axios.post(`/api/files?type=files`, data).then((res) => {
          if (res.data.type === "success") toast.success(res.data.message);
          getImages();
          setShowAdd({ ...showAdd, thumbnail: false, banner: false });
          setNewImage([]);
        });
      }
    });
  };

  const handleSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFields({ ...fields, categories: new Set(e.target.value.split(",")) });
  };

  return (
    <form onSubmit={(e) => onSubmit(e, fields)} className="grid gap-3">
      {isPending ? (
        <BlogSkeleton />
      ) : (
        <>
          <div className="flex flex-row items-top">
            <Input
              size="sm"
              isRequired
              type="text"
              radius="md"
              label="Title"
              placeholder={fields.name}
              value={fields.name}
              onValueChange={(v) => {
                setFields({
                  ...fields,
                  name: v,
                  slug: createSlug(v),
                });
              }}
              description={fields.slug}
            />
            {isRegenateButtonActive && (
              <Tooltip content="Regenerate">
                <Button
                  size="sm"
                  isIconOnly
                  radius="full"
                  variant="solid"
                  className="ms-2 bg-content2"
                  onClick={() => regenerate("name")}
                  isLoading={titleLoading}
                >
                  <MagicWandIcon />
                </Button>
              </Tooltip>
            )}
          </div>
          <div className="flex flex-row items-top">
            <Textarea
              size="sm"
              minRows={1}
              maxRows={4}
              isRequired
              type="text"
              radius="md"
              label="Description"
              disableAutosize
              isLoading={descriptionLoading}
              classNames={{
                base: "w-full",
                input: "resize-y min-h-[10px] max-h-[60px]",
              }}
              value={fields.description}
              onChange={(v) => {
                setFields({ ...fields, description: v.target.value });
              }}
            />
            <Tooltip content="Regenerate">
              <Button
                size="sm"
                isIconOnly
                radius="full"
                variant="solid"
                className="ms-2 bg-content2"
                onClick={() => regenerate("description")}
              >
                <MagicWandIcon />
              </Button>
            </Tooltip>
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
                        radius="none"
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
                    radius="md"
                    items={images}
                    label="Thumbnail"
                    isDisabled={isPending}
                    defaultValue={fields.thumbnail}
                    onChange={(e) => {
                      fields.thumbnail = e.target.value;
                    }}
                    renderValue={(items) => {
                      return items.map((item) => item.key);
                    }}
                  >
                    {(item: any) => (
                      <SelectItem key={item.name} value={item.name}>
                        <div className="flex gap-x-1 items-center">
                          <Avatar
                            radius="none"
                            alt={item.name}
                            className="flex-shrink-0"
                            size="sm"
                            src={item.tempUrl}
                          />
                          <div className="flex flex-col">
                            <span className="text-small">{item.name}</span>
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
                        radius="none"
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
                        setShowAdd({ ...showAdd, banner: !showAdd.banner });
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
                    radius="md"
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
                            radius="none"
                            alt={item.name}
                            className="flex-shrink-0"
                            size="sm"
                            src={item.tempUrl}
                          />
                          <div className="flex flex-col">
                            <span className="text-small">{item.name}</span>
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
                  radius="md"
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
                      setShowAdd({ ...showAdd, category: !showAdd.category })
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
                  radius="md"
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
                      setShowAdd({ ...showAdd, category: !showAdd.category })
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
                  radius="full"
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

      <div className="grid gap-3 grid-cols-2">
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
      </div>
    </form>
  );
};
