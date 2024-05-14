import { Skeleton } from "@nextui-org/react";
import React from "react";

export const BlogSkeleton = () => {
  return (
    <>
      <Skeleton className="rounded-medium w-full h-12" />
      <Skeleton className="rounded-medium w-full h-20" />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="inline-flex items-center">
          <Skeleton className="rounded-medium w-full h-12" />
          <Skeleton className="rounded-full min-w-8 h-8 ms-2" />
        </div>
        <div className="inline-flex items-center">
          <Skeleton className="rounded-medium w-full h-12" />
          <Skeleton className="rounded-full min-w-8 h-8 ms-2" />
        </div>
      </div>
      <div className="inline-flex items-center">
        <Skeleton className="rounded-medium w-full h-12" />
        <Skeleton className="rounded-full min-w-8 h-8 ms-2" />
      </div>
      <Skeleton className="rounded-medium w-full min-h-[200px]" />
      <Skeleton className="rounded-medium w-full h-20" />
    </>
  );
};
