"use client";
import {
  Input,
  Select,
  SelectItem,
  Skeleton,
  Spinner,
  Switch,
  Textarea,
  Button,
  cn,
  Avatar,
} from "@nextui-org/react";
import { useEffect, useState, useTransition } from "react";
import { Title } from "@/components/title";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axios from "axios";
import { useRouter } from "next/navigation";
import { FaSave } from "react-icons/fa";
import { FcCancel } from "react-icons/fc";

const EditBlogPage = (query: any) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState([]);
  const [inputs, setInputs] = useState({
    name: "",
    slug: "",
    description: "",
    isActive: false,
    content: "",
    thumbnail: "",
    banner: "",
    categoryId: "",
  });

  useEffect(() => {
    axios
      .get(`/api/blogs/${query.params.id}`)
      .then((res) => {
        setInputs(res.data);
        setLoading(false);
      })
      .catch((e) => {
        router.push(`/hws/blogs`, {
          scroll: false,
        });
      });

    axios
      .get("/api/categories")
      .then((res) => {
        setCategories(res.data);
      })
      .catch(() => {});
    axios
      .get("/api/files?type=image")
      .then((res) => {
        setImages(res.data);
      })
      .catch(() => {});
  }, []);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>, inputs: any) => {
    e.preventDefault();
    setSaving(true);
    await axios
      .put(`/api/blogs/${query.params.id}`, inputs)
      .then(() => {
        router.back();
      })
      .catch((e) => {});
  };

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

  return (
    <div>
      <Title
        text={`Edit: ${inputs.name ? inputs.name : ""}`}
        className=" items-start mb-3"
      />
      {saving ? (
        <div className="w-full h-screen justify-center flex items-center">
          <Spinner size="lg" label="Saving..." />
        </div>
      ) : (
        <form onSubmit={(e) => onSubmit(e, inputs)} className="grid gap-3">
          <div className="grid gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                type="text"
                label="Title"
                size="sm"
                className="border-1 rounded-md"
                color="default"
                isRequired
                value={inputs.name}
                onChange={(e) => {
                  setInputs({ ...inputs, name: e.target.value });
                }}
                endContent={loading && <Spinner size="sm" />}
              />
              <Input
                type="text"
                label="Slug"
                size="sm"
                className="border-1 rounded-md"
                color="default"
                isRequired
                value={inputs.slug}
                onChange={(e) => {
                  setInputs({ ...inputs, slug: e.target.value });
                }}
                endContent={loading && <Spinner size="sm" />}
              />
            </div>
            <Textarea
              label="Description"
              size="sm"
              className="w-full border-1 rounded-md"
              color="default"
              isRequired
              minRows={1}
              value={inputs.description}
              onChange={(e) => {
                setInputs({ ...inputs, description: e.target.value });
              }}
              endContent={loading && <Spinner size="sm" />}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Select
              size="sm"
              // isRequired
              label="Thumbnail"
              color="default"
              className="border-1 rounded-sm"
              renderValue={(items) => items.map((item) => item.key)}
              onChange={(e) =>
                setInputs({ ...inputs, thumbnail: e.target.value })
              }
            >
              {images.map((item: any) => (
                <SelectItem
                  key={item.name}
                  value={item.name}
                  className="p-0 pe-2"
                >
                  <div className="flex gap-1 items-center">
                    <Avatar
                      radius="md"
                      alt={item.name}
                      className="flex-shrink-0"
                      size="lg"
                      src={item.tempUrl}
                    />
                    <div className="flex flex-col">
                      <span className="text-small">{item.name}</span>
                      <span className="text-tiny text-default-400">
                        {item.size && `${(item.size / 1024).toFixed(2)}kB`}
                      </span>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </Select>

            <Select
              size="sm"
              // isRequired
              label="Banner"
              color="default"
              className="border-1 rounded-sm"
              renderValue={(items) => items.map((item) => item.key)}
              onChange={(e) => setInputs({ ...inputs, banner: e.target.value })}
            >
              {images.map((item: any) => (
                <SelectItem
                  key={item.name}
                  value={item.name}
                  className="p-0 pe-2"
                >
                  <div className="flex gap-1 items-center">
                    <Avatar
                      radius="md"
                      alt={item.name}
                      className="flex-shrink-0"
                      size="lg"
                      src={item.tempUrl}
                    />
                    <div className="flex flex-col">
                      <span className="text-small">{item.name}</span>
                      <span className="text-tiny text-default-400">
                        {item.size && `${(item.size / 1024).toFixed(2)}kB`}
                      </span>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </Select>
          </div>

          <div className="grid gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Switch
                size="sm"
                isDisabled={isPending}
                value={inputs.isActive}
                isSelected={inputs.isActive}
                onValueChange={(e: boolean) =>
                  setInputs({ ...inputs, isActive: e })
                }
                color="default"
                classNames={{
                  base: cn(
                    "inline-flex flex-row-reverse w-full max-w-full bg-content2 hover:bg-content3 items-center shrink-0",
                    "justify-between cursor-pointer rounded-sm gap-2 px-4 h-12 border-1 rounded-md ",
                    "data-[selected=true]:border-primary"
                  ),
                  wrapper:
                    "p-0 h-6 overflow-visible  group-data-[selected=true]:bg-content3",
                  thumb: cn(
                    "w-6 h-6 border-1",
                    "group-data-[hover=true]:border-primary",
                    //selected
                    "group-data-[selected=true]:ml-4 group-data-[selected=true]:bg-primary",
                    // pressed
                    "group-data-[pressed=true]:w-12",
                    "group-data-[selected]:group-data-[pressed]:ml-0"
                  ),
                }}
              >
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-content3">Active</p>
                </div>
              </Switch>
              <Select
                label="Category"
                className="border-1 rounded-md"
                color="default"
                // isRequired
                isDisabled={isPending}
                defaultSelectedKeys={[inputs.categoryId]}
                value={inputs.categoryId}
                onChange={(e) => {
                  setInputs({ ...inputs, categoryId: e.target.value });
                }}
                size="sm"
              >
                {categories?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </Select>
            </div>

            {loading ? (
              <Skeleton className="rounded-lg">
                <div className="bg-content2 min-h-[300px] rounded-lg z-20"></div>
              </Skeleton>
            ) : (
              <ReactQuill
                theme="snow"
                // onChange={field.onChange}
                placeholder="Write your content"
                className="bg-content2 min-h-[300px] border-1 rounded-md"
                modules={modules}
                formats={formats}
                value={inputs.content}
                onChange={(e) => {
                  setInputs({ ...inputs, content: e });
                }}
              />
            )}
          </div>
          <hr />
          <div className="flex justify-end items-center my-3">
            <Button
              size="md"
              color="danger"
              variant="light"
              isDisabled={loading}
              endContent={<FcCancel />}
              onClick={() => {
                router.push(`/hws/blogs`, {
                  scroll: false,
                });
              }}
            >
              Cancel
            </Button>
            <Button
              size="md"
              className="ms-2"
              color="primary"
              type="submit"
              isDisabled={loading}
              endContent={<FaSave />}
            >
              Save Edits
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default EditBlogPage;
