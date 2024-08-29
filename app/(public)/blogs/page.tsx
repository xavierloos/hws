"use client";
import { Title } from "@/components/title";
import * as React from "react";
import { useEffect, useState, useTransition } from "react";
import { CardItem } from "./_components/CardItem";
import axios from "axios";
import { toast } from "sonner";
import { Spinner } from "@nextui-org/react";

const BlogsPage = () => {
  const [isPending, startTransition] = useTransition();
  const [items, setItems] = useState([]);

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    startTransition(async () => {
      await axios
        .get("/api/blogs")
        .then((res) => {
          setItems(res.data);
        })
        .catch((e) => {});
    });
  };

  return (
    <div className="grid gap-6">
      <Title text="Blogs" className="items-start" />
      {isPending ? (
        <div className="w-full min-h-screen items-center justify-center flex">
          <Spinner label="Loading..." color="default" size="lg" />
        </div>
      ) : (
        <div className="max-w-full grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {items?.map((item) => (
            <CardItem item={item} key={item.id} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogsPage;
