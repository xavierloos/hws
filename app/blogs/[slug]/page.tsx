"use client";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const BlogPage = ({ params }: any) => {
  const { slug } = params;
  const [blog, setBlog] = useState([]);
  useEffect(() => {
    fetch(`/api/blogs/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        setBlog(data);
      })
      .catch((e) => {});
  }, []);

  return (
    <div>
      <h1>{blog?.title}</h1>
      <p>{blog?.user?.name}</p>
    </div>
  );
};

export default BlogPage;
