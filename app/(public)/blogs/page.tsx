"use client";
import { Title } from "@/components/title";
import * as React from "react";

import { useEffect, useState } from "react";
import { CardItem } from "./_components/CardItem";
import { blog } from "@/actions/blog";

const BlogsPage = () => {
  const [blogs, setBlogs] = useState([]);
  useEffect(() => {
    fetch("/api/blogs")
      .then((res) => res.json())
      .then((data) => {
        setBlogs(data);
      })
      .catch((e) => {});
  }, []);

  return (
    <div>
      <Title text="Blogs" className=" items-start mb-4" />
      <div className="max-w-[900px] gap-4 grid grid-cols-12 grid-rows-4 px-8">
        {blogs?.map((blog) => (
          <CardItem item={blog} />
        ))}
      </div>
    </div>
  );
};

export default BlogsPage;
