"use client";
import { Title } from "@/components/title";
import * as React from "react";
import { useEffect, useState, useTransition } from "react";
import { CardItem } from "./_components/CardItem";
import axios from "axios";
import { toast } from "sonner";

const BlogsPage = () => {
  const [isPending, startTransition] = useTransition();
  const [blogs, setBlogs] = useState([]);
  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    startTransition(async () => {
      await axios
        .get("/api/blogs")
        .then((res) => {
          setBlogs(res.data);
        })
        .catch((e) => {});
    });
  };

  return (
    <div>
      <Title text="Blogs" className=" items-start mb-4" />
      <div className="max-w-full gap-4 grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 grid-cols-1">
        {blogs?.map((item) => (
          <CardItem item={item} />
        ))}
      </div>
    </div>
  );
};

export default BlogsPage;
