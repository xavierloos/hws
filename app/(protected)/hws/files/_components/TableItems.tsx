"use client";
import {
 Table,
 TableHeader,
 TableColumn,
 TableBody,
 TableRow,
 TableCell,
 Input,
 User,
 Pagination,
 Selection,
 SortDescriptor,
 Tooltip,
 Chip,
 Spinner,
 Button,
 Select,
 SelectItem,
 Modal,
 ModalContent,
 ModalHeader,
 useDisclosure,
} from "@nextui-org/react";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import dateFormat from "dateformat";
import Autoplay from "embla-carousel-autoplay";
import { ExternalLinkIcon, PlusIcon, TrashIcon } from "@radix-ui/react-icons";
import { AddBlog } from "./Add";
import { format } from "timeago.js";
import { Title } from "@/components/title";
import { EditBlog } from "./Edit";
import { useTransition } from "react";
import axios from "axios";
import { toast } from "sonner";
import { CardItem } from "./CardItem";

type TableItemsProps = {
 data: any;
 cols: any;
 initialCols: any;
 onDelete: (id: any, name: any) => {};
 onSaveBlog: (e: any, files?: any) => {};
 statusOptions?: any;
 isLoading: boolean;
 isSaving: boolean;
 isNewOpen: boolean;
 onNewOpen: () => void;
 onNewClose: () => void;
 getData: (sort?: string) => {};
};

export const TableItems = ({
 data,
 cols,
 initialCols,
 onDelete,
 onSaveBlog,
 statusOptions,
 isLoading,
 isSaving,
 isNewOpen,
 onNewOpen,
 onNewClose,
 getData,
}: TableItemsProps) => {
 const router = useRouter();
 type Items = (typeof data)[0];
 const [filterValue, setFilterValue] = useState("");
 const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));
 const [statusFilter, setStatusFilter] = useState("all");
 const [rowsPerPage, setRowsPerPage] = useState(5);
 const [page, setPage] = useState(1);
 const hasSearchFilter = Boolean(filterValue);
 const [editItem, setEditItem] = useState(undefined);
 const { isOpen, onOpen, onClose } = useDisclosure();
 const [isSavingEdit, startSavingEdit] = useTransition();

 const [visibleColumns, setVisibleColumns] = useState<Selection>(
  new Set(initialCols)
 );

 const [sortByName, setSortDescriptor] = useState<SortDescriptor>({
  column: "name",
  direction: "ascending",
 });

 const plugin = React.useRef(
  Autoplay({ delay: 2000, stopOnInteraction: true })
 );

 const onSubmitEdit = async (
  e: React.FormEvent<HTMLFormElement>,
  inputs: any
 ) => {
  e.preventDefault();

  startSavingEdit(async () => {
   let categories: Array<string> = [];
   inputs.categories.forEach((element: any) => categories.push(element));
   inputs.categories = categories;

   await axios
    .put("/api/blogs", inputs)
    .then(async (res: any) => {
     console.log(res);
     if (res.data.type === "warning") return toast.warning(res.data.message);
     toast.success(res.data.message);
     getData();
     return onClose();
    })
    .catch((e) => {
     toast.error(e.response.data.message);
    });
  });
 };

 const headerColumns = React.useMemo(() => {
  if (visibleColumns === "all") return cols;

  return cols.filter((column: any) =>
   Array.from(visibleColumns).includes(column.uid)
  );
 }, [visibleColumns]);

 const filteredItems = React.useMemo(() => {
  let filteredItem = [...data];

  if (hasSearchFilter) {
   filteredItem = filteredItem.filter((i) =>
    i?.name.toLowerCase().includes(filterValue.toLowerCase())
   );
  }
  if (statusOptions) {
   if (statusFilter === "all") return filteredItem;
   let statusFilterSelected = statusFilter === "true" ? true : false;
   filteredItem = filteredItem.filter(
    (i) => i?.isActive == statusFilterSelected
   );
  }

  return filteredItem;
 }, [data, filterValue, statusFilter]);

 const pages = Math.ceil(filteredItems.length / rowsPerPage);

 const items = React.useMemo(() => {
  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;

  return filteredItems.slice(start, end);
 }, [page, filteredItems, rowsPerPage]);

 const sortedItems = React.useMemo(() => {
  return [...items].sort((a: Items, b: Items) => {
   const first = a[sortByName.column as keyof Items] as number;

   const second = b[sortByName.column as keyof Items] as number;
   const cmp = first < second ? -1 : first > second ? 1 : 0;

   return sortByName.direction === "descending" ? -cmp : cmp;
  });
 }, [sortByName, items]);

 const renderCell = React.useCallback(
  async (i: Items, columnKey: React.Key) => {
   const cellValue = i[columnKey as keyof Items];

   switch (columnKey) {
    case "name":
     console.log(i);
     return (
      <User
       avatarProps={{
        className: `shrink-0 m-auto rounded-md`,
        size: "lg",
        src: i.tempThumbnail,
       }}
       description={
        <span className="truncate text-ellipsis line-clamp-1 ">
         {format(i.modifiedAt)} • On {dateFormat(i.modifiedAt, "dd/mmm/yy")}
        </span>
       }
       name={
        <span
         className={`text-default-foreground w-full text-ellipsis font-normal overflow-hidden break-words line-clamp-2`}
        >
         {cellValue}
        </span>
       }
      />
     );
    case "modifiedBy":
    case "createdBy":
     return (
      <User
       avatarProps={{
        className: `shrink-0 bg-default text-default-foreground`,
        size: "sm",
        radius: "full",
        src: cellValue.image || i.user.image,
       }}
       description={
        <span className="truncate text-ellipsis line-clamp-1 text-tiny">
         @{cellValue.username || i.user.username}
        </span>
       }
       name={
        <span
         className={`text-ellipsis overflow-hidden break-words line-clamp-1 text-sm`}
        >
         {cellValue.name || i.user.name}
        </span>
       }
      />
     );
    case "categories":
     return (
      <div className="flex gap-1 flex-wrap">
       {i.categories.map((category: any) => {
        return (
         <Chip size="sm" color="primary" key={category.id}>
          {category.name}
         </Chip>
        );
       })}
      </div>
     );
    case "isActive":
     return (
      <Chip
       className={`border-none text-${i.isActive ? "success" : "default"}`}
       color={i.isActive ? "success" : "default"}
       size="sm"
       variant="dot"
      >
       {i.isActive ? "Active" : "Draft"}
      </Chip>
     );
    case "slug":
     return <small className="text-default">{cellValue}</small>;
    case "actions":
     return (
      <div className="relative flex items-center gap-2 justify-end">
       <Tooltip content="Show" size="sm">
        <Button
         size="sm"
         isIconOnly
         radius="full"
         color="default"
         variant="light"
         onClick={() => router.push(`/blogs/${i.slug}`, { scroll: false })}
        >
         <ExternalLinkIcon />
        </Button>
       </Tooltip>
       <Tooltip color="danger" content="Delete" size="sm">
        <Button
         size="sm"
         isIconOnly
         radius="full"
         color="danger"
         variant="light"
         onClick={() => onDelete(i.id, i.name)}
        >
         <TrashIcon color="red" />
        </Button>
       </Tooltip>
      </div>
     );
    default:
     return cellValue;
   }
  },
  []
 );

 const onNextPage = React.useCallback(() => {
  if (page < pages) {
   setPage(page + 1);
  }
 }, [page, pages]);

 const onPreviousPage = React.useCallback(() => {
  if (page > 1) {
   setPage(page - 1);
  }
 }, [page]);

 const onRowsPerPageChange = React.useCallback(
  (e: React.ChangeEvent<HTMLSelectElement>) => {
   console.log(e.target.value);
   setRowsPerPage(Number(e.target.value));
   setPage(1);
  },
  []
 );

 const onSearchChange = React.useCallback((value?: string) => {
  if (value) {
   setFilterValue(value);
   setPage(1);
  } else {
   setFilterValue("");
  }
 }, []);

 const onClear = React.useCallback(() => {
  setFilterValue("");
  setPage(1);
 }, []);

 const topContent = React.useMemo(() => {
  return (
   <div className="flex flex-col gap-4">
    {/* FILTERS START */}
    <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
     <div className="flex gap-3 items-center">
      <Input
       size="sm"
       fullWidth
       type="text"
       isClearable
       radius="none"
       value={filterValue}
       label="Search"
       onClear={() => onClear()}
       onValueChange={onSearchChange}
      />
      <Tooltip content="ADD NEW" showArrow>
       <Button
        color="primary"
        className="flex sm:hidden shadow-md"
        radius="full"
        isIconOnly
        size="md"
        endContent={<PlusIcon />}
        onPress={() => {
         return onNewBlogOpen();
        }}
       />
      </Tooltip>
     </div>
     <div className="flex gap-3 items-center w-full">
      <div className="w-full">
       <div className={`grid gap-3 grid-cols-2`}>
        {statusOptions && (
         <Select
          size="sm"
          fullWidth
          radius="none"
          label="Status"
          disabledKeys={statusFilter}
          defaultSelectedKeys={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
         >
          {statusOptions?.map((status: any) => (
           <SelectItem key={status.uid}>{status.name}</SelectItem>
          ))}
         </Select>
        )}
        {cols && (
         <Select
          size="sm"
          fullWidth
          radius="none"
          label="Columns"
          selectionMode="multiple"
          disabledKeys={["name"]}
          // className=" overflow-hidden"
          defaultSelectedKeys={visibleColumns}
          onSelectionChange={setVisibleColumns}
         >
          {cols?.map((i: any) => (
           <SelectItem key={i.uid}>{i.name}</SelectItem>
          ))}
         </Select>
        )}
       </div>
      </div>
      <Tooltip content="ADD NEW" showArrow>
       <Button
        color="primary"
        className="sm:flex hidden shadow-md"
        radius="full"
        isIconOnly
        size="md"
        endContent={<PlusIcon />}
        onPress={() => {
         return onNewBlogOpen();
        }}
       />
      </Tooltip>
     </div>
    </div>
    {/* FILTERS END*/}
    <div className="flex justify-between items-center">
     <span className="text-default-400 text-tiny">
      Total {data.length} blogs
     </span>
     <div className="flex gap-3">
      <label className="flex items-center text-default-400 text-tiny">
       Sort by:
       <select
        className="bg-transparent outline-none text-default-400 text-tiny"
        onChange={(e) => getData(e.target.value)}
       >
        <option value="modified-asc">Last updated (asc)</option>
        <option value="modified-desc" selected>
         Last updated (desc)
        </option>
        <option value="created-asc">Date (asc)</option>
        <option value="created-desc">Date (desc)</option>
        <option value="name-asc">Name (asc)</option>
        <option value="name-desc">Name (desc)</option>
       </select>
      </label>
      <label className="flex items-center text-default-400 text-tiny">
       Items:
       <select
        className="bg-transparent outline-none text-default-400 text-tiny"
        onChange={onRowsPerPageChange}
       >
        <option value="5">5</option>
        <option value="10">10</option>
        <option value="15">15</option>
       </select>
      </label>{" "}
     </div>
    </div>
   </div>
  );
 }, [
  filterValue,
  statusFilter,
  visibleColumns,
  onSearchChange,
  onRowsPerPageChange,
  data.length,
  hasSearchFilter,
 ]);

 const bottomContent = React.useMemo(() => {
  return (
   <div className="py-2 px-2 flex justify-end items-center">
    {pages > 1 && (
     <Pagination
      isCompact
      showControls
      radius="none"
      size="sm"
      variant="light"
      page={page}
      total={pages}
      onChange={setPage}
     />
    )}
   </div>
  );
 }, [selectedKeys, items.length, page, pages, hasSearchFilter]);

 const onEditItem = (id: any) => {
  setEditItem(data.filter((i: any) => i.id === id));
  return onOpen();
 };

 return (
  <>
   <Title text="Blogs" className="items-start" />

   <div className="max-w-full grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
    {items?.map((item) => (
     <CardItem item={item} key={item.id} />
    ))}
   </div>
   <Table
    radius="none"
    isHeaderSticky
    bottomContent={bottomContent}
    bottomContentPlacement="outside"
    selectedKeys={selectedKeys}
    sortDescriptor={sortByName}
    topContent={topContent}
    className="p-0"
    topContentPlacement="outside"
    onSelectionChange={setSelectedKeys}
    onSortChange={setSortDescriptor}
    onRowAction={(id) => {
     return onEditItem(id);
    }}
    classNames={{
     wrapper: "p-0 border-none shadow-md rounded-md",
     table: "min-h-[200px]  ",
     th: "bg-primary text-black rounded-none border-none first:rounded-l-none last:rounded-r-none",
     thead: "[&>tr]:first:rounded-none [&>tr]:last:rounded-none",
    }}
   >
    <TableHeader columns={headerColumns}>
     {(column: any) => (
      <TableColumn
       key={column.uid}
       align={column.uid === "actions" ? "end" : "start"}
       allowsSorting={column.sortable}
      >
       {column.name}
      </TableColumn>
     )}
    </TableHeader>
    <TableBody
     emptyContent={"Your items will appear here."}
     items={items}
     isLoading={isLoading}
     loadingContent={<Spinner label="Loading..." />}
    >
     {(item) => (
      <TableRow key={item.id}>
       {(columnKey) => (
        <TableCell key={columnKey}>{renderCell(item, columnKey)}</TableCell>
       )}
      </TableRow>
     )}
    </TableBody>
   </Table>
   {/* ADD NEW BLOG */}
   {/* <Modal
    size="3xl"
    isOpen={isNewBlogOpen}
    onClose={onNewBlogClose}
    scrollBehavior="inside"
    shouldBlockScroll
    className="rounded-md"
   >
    <ModalContent>
     <ModalHeader className="flex flex-col gap-1">New Blog</ModalHeader>
     <AddBlog onSubmit={onSaveBlog} isSaving={isSaving} />
    </ModalContent>
   </Modal> */}
   {/* ADD NEW BLOG ENDS */}
   {/* EDIT BLOG */}
   {/* <Modal
    size="3xl"
    isOpen={isOpen}
    onClose={onClose}
    scrollBehavior="inside"
    shouldBlockScroll
    className="rounded-md"
   >
    <ModalContent>
     <ModalHeader className="flex flex-col gap-1">Edit Blog</ModalHeader>
     <EditBlog
      item={editItem}
      onSubmit={onSubmitEdit}
      isSaving={isSavingEdit}
     />
    </ModalContent>
   </Modal> */}
   {/* EDIT BLOG ENDS */}
  </>
 );
};
