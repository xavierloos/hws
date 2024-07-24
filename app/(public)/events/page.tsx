"use client";
import { Title } from "@/components/title";
import * as React from "react";

import { useEffect, useState } from "react";

const EventsPage = () => {
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
      <Title text="Events" className=" items-start mb-4" />
      <div className="max-w-[900px] gap-4 grid grid-cols-12 grid-rows-4 px-8"></div>
    </div>
  );
};

export default EventsPage;
