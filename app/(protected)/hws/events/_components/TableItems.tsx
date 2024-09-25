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
} from "@nextui-org/react";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import dateFormat from "dateformat";
import Autoplay from "embla-carousel-autoplay";
import { ExternalLinkIcon } from "@radix-ui/react-icons";
import { Title } from "@/components/title";

type TableItemsProps = {
 data: any;
 cols: any;
 initialCols: any;
 isLoading: boolean;
 permission: string;
};

export const TableItems = ({
 data,
 cols,
 initialCols,
 isLoading,
}: TableItemsProps) => {
 const router = useRouter();
 type Items = (typeof data)[0];
 const [filterValue, setFilterValue] = useState("");
 const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));
 const [statusFilter, setStatusFilter] = useState("all");
 const [rowsPerPage, setRowsPerPage] = useState(5);
 const [page, setPage] = useState(1);
 const hasSearchFilter = Boolean(filterValue);

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
     return (
      <User
       avatarProps={{
        className: `shrink-0 m-auto rounded-md`,
        size: "lg",
        src: i.images[0]["url"],
       }}
       description={
        <span className="truncate text-ellipsis line-clamp-1 ">
         {i.dates &&
          dateFormat(i.dates?.start.dateTime, "ddd dd/mm/yy • HH:MM")}
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
    case "onSale":
     return (
      <Chip
       className="capitalize border-none gap-1 text-default-600"
       color={i.dates.status.code === "onsale" ? "success" : "default"}
       size="sm"
       variant="dot"
      >
       {i.dates.status.code === "onsale"
        ? i.dates.status.code
        : i.dates.status.code}
      </Chip>
     );

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
         onClick={() => router.push(`${i.url}`, { scroll: false })}
        >
         <ExternalLinkIcon />
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
    {/* FILTERS END*/}
    <div className="flex justify-between items-center">
     <span className="text-default-400 text-tiny">
      Total {data.length} events
     </span>

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
     </label>
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

 return (
  <>
   <Title text="Events" className="items-start" />
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
  </>
 );
};
