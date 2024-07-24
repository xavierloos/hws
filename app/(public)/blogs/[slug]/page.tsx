"use client";

import React, { useEffect, useState, useTransition } from "react";
import { Image, Button, Chip, User, Spinner } from "@nextui-org/react";
import { CardItem } from "../_components/CardItem";
import { format } from "timeago.js";
import axios from "axios";
import { useSearchParams, usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { verifyComment } from "@/actions/verification";
import { Cross1Icon } from "@radix-ui/react-icons";
import { Comments } from "../_components/Comments";

const BlogPage = ({ params }: any) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const token = searchParams.get("token");
  const { slug } = params;
  const [blog, setBlog] = useState([]);
  const [message, setMessage] = useState(null);
  const [youMayAlsoLike, setYouMayAlsoLike] = useState([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      if (token) {
        verifyComment(token)
          .then((data) => {
            setMessage(data);
          })
          .catch(() => {});
      }
      await axios
        .get(`/api/blogs/${slug}`)
        .then((res) => {
          setBlog(res.data);
        })
        .catch((e) => {});
      await axios
        .get(`/api/blogs/${slug}/suggestions`)
        .then((res) => {
          setYouMayAlsoLike(res.data);
        })
        .catch((e) => {});
    });
  }, [token]);

  return (
    <>
      {isPending ? (
        <div className="w-full min-h-svh items-center justify-center flex">
          <Spinner
            label="Loading..."
            color="default"
            labelColor="default"
            size="lg"
          />
        </div>
      ) : (
        <>
          <div>
            {message && (
              <div
                className={`w-full items-center flex justify-between  border-1 p-2 rounded-xl mb-3 shadow-md bg ${
                  message.type == "success"
                    ? "bg-green-100 border-green-500"
                    : "bg-rose-100 border-rose-500"
                }`}
              >
                {message?.msg}
                <Button
                  size="sm"
                  isIconOnly
                  variant="flat"
                  radius="full"
                  color="danger"
                  aria-label="Like"
                  onClick={() => setMessage(null)}
                >
                  <Cross1Icon />
                </Button>
              </div>
            )}
            <section className="flex-col items-start">
              <Image
                removeWrapper
                radius="none"
                alt={`${blog?.id} blog image`}
                className="z-0 w-full h-[300px]"
                src={blog?.banner}
              />
              <h1 className="text-[3rem] tracking-[-.17rem] leading-[3rem] font-medium drop-shadow-lg">
                {blog?.name}
              </h1>
              <h2 className="text-foreground font-normal italic">
                "{blog?.description}"
              </h2>
            </section>
            <div className="grid grid-cols-1 md:grid-cols-[2fr,1fr] gap-4 mt-4">
              <section>
                <div className="flex gap-1">
                  {blog?.categories?.map((cat: any) => {
                    return (
                      <Chip
                        color="primary"
                        variant="solid"
                        size="sm"
                        key={cat.id}
                      >
                        {cat.name}
                      </Chip>
                    );
                  })}
                </div>
                <div
                  dangerouslySetInnerHTML={{ __html: blog.content }}
                  className=" text-justify"
                />
                <div className="bg-primary p-2 flex items-center justify-between rounded-xl">
                  <User
                    avatarProps={{
                      size: "lg",
                      className: "shrink-0",
                      src: blog?.user?.image,
                    }}
                    description={
                      <span className="text-tiny truncate text-ellipsis line-clamp-1">
                        {format(blog?.createdAt)}
                      </span>
                    }
                    name={
                      <span
                        className={`text-md w-full text-ellipsis font-medium overflow-hidden break-words line-clamp-1`}
                      >
                        By {blog?.user?.name}
                      </span>
                    }
                  />
                  <Button radius="full" size="sm" className="bg-white">
                    See all my post
                  </Button>
                </div>
                <div>
                  <h2 className="my-4">Join The Conversation!</h2>
                  <Comments slug={slug} />
                </div>
              </section>
              <aside>
                <h4 className="my-3">You may also like....</h4>
                <div className="grid md:grid-cols-1 grid-cols-3 gap-6">
                  {youMayAlsoLike.map((item) => {
                    return (
                      <CardItem item={item} suggestion={true} key={item.slug} />
                    );
                  })}
                </div>
              </aside>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default BlogPage;
