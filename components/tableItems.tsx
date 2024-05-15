import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  User,
  Pagination,
  Selection,
  SortDescriptor,
  Tooltip,
  Switch,
  Chip,
  Spinner,
  Button,
  useDisclosure,
  AvatarGroup,
  Avatar,
} from "@nextui-org/react";
import React, { useState } from "react";
import { FaChevronDown, FaPlus, FaSearch, FaUserEdit } from "react-icons/fa";
import { useRouter } from "next/navigation";
import dateFormat from "dateformat";
import Autoplay from "embla-carousel-autoplay";
import {
  CrossCircledIcon,
  DrawingPinIcon,
  EyeOpenIcon,
  Pencil1Icon,
  TrashIcon,
} from "@radix-ui/react-icons";
import { NewBlogForm } from "./newBlogForm";
import { NewFilesForm } from "./newFilesForm";
import { TaskFormModal } from "./taskFormModal";
import { format } from "timeago.js";
import { NewMemberForm } from "./newMemberForm";
import { Title } from "./title";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import axios from "axios";
type TableItemsProps = {
  data: any;
  cols: any;
  initialCols: any;
  type: string;
  onDelete?: (id: any, name: any) => {};
  onSubmit?: (e: any, files?: any) => {};
  statusOptions?: any;
  handleView?: (item?: any) => {};
  isPending: boolean;
};

export const TableItems = ({
  data,
  cols,
  initialCols,
  type,
  onDelete,
  onSubmit,
  statusOptions,
  handleView,
  isPending,
}: TableItemsProps) => {
  const router = useRouter();
  type Items = (typeof data)[0];
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));
  const [statusFilter, setStatusFilter] = useState<Selection>("all");
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = React.useState(1);
  const hasSearchFilter = Boolean(filterValue);
  const [isSearching, setIsSearching] = useState(false);
  // const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isOpen, setIsOpen] = useState(false);
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
  const handleNewItem = () => {
    setIsOpen(!isOpen);
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
      if (
        statusFilter !== "all" &&
        Array.from(statusFilter).length !== statusOptions.length
      ) {
        filteredItem = filteredItem.filter((i) => {
          if (type === "tasks") {
            Array.from(statusFilter).includes(i?.status);
          } else {
            Array.from(statusFilter).includes(i?.isActive ? "true" : "false");
          }
        });
      }
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

      let img = "";
      if (type === "files") {
        if (i.type.includes("application")) {
          img = `https://placehold.co/600x400?text=${i.type.split("/")[1]}`;
        } else {
          img = i.image;
        }
      }

      switch (columnKey) {
        case "name":
          if (type === "tasks") {
            return (
              <>
                <h3 className="font-medium text-ellipsis  overflow-hidden  break-words line-clamp-2 ">
                  {cellValue}
                </h3>
                <span className=" text-tiny text-slate-400 truncate text-ellipsis line-clamp-1 ">
                  Due {format(i.dueDate)}
                </span>
              </>
            );
          } else {
            return (
              <User
                avatarProps={{
                  isBordered: type === "members" ? true : false,
                  className: `shrink-0 ${
                    i.role === "SUPERADMIN"
                      ? "bg-primary text-foreground"
                      : i.role === "ADMIN"
                      ? "bg-foreground text-primary"
                      : "bg-default text-default-foreground"
                  }`,
                  color:
                    i.role === "SUPERADMIN" || i.role === "ADMIN"
                      ? "primary"
                      : "default",
                  size: "sm",
                  radius: type === "members" ? "full" : "none",
                  src:
                    type === "files"
                      ? img
                      : type === "members"
                      ? i.tempUrl || i.image
                      : i.tempThumbnailUrl,
                }}
                description={
                  <span className="truncate text-ellipsis line-clamp-1 ">
                    {type === "members" && i.username
                      ? `@${i.username}`
                      : i.email}
                    {i.dates &&
                      dateFormat(
                        i.dates?.start.dateTime,
                        "ddd dd/mmm/yy - HH:MM"
                      )}
                    {i.size && `${(i.size / 1024).toFixed(2)}kB`}
                  </span>
                }
                name={
                  <span
                    className={`text-ellipsis  overflow-hidden  break-words line-clamp-${
                      type === "uploads" ? "1" : "2"
                    } `}
                  >
                    {type === "members" ? i.name : cellValue}
                  </span>
                }
              />
            );
          }
        case "priority":
          return (
            <Chip size="sm" color={cellValue.color}>
              {cellValue.name}
            </Chip>
          );
        case "role":
          return (
            <Chip
              variant="flat"
              size="sm"
              className={
                i.role === "SUPERADMIN"
                  ? "bg-primary text-foreground"
                  : i.role === "ADMIN"
                  ? "bg-foreground text-primary"
                  : "bg-default"
              }
            >
              {cellValue}
            </Chip>
          );
        case "modifiedBy":
          return (
            <User
              avatarProps={{
                isBordered: true,
                // color: "default",
                // color: `${user?.role === "ADMIN" ? "primary" : "default"}`,
                // radius: "round",
                className: `shrink-0 ${
                  i?.role === "SUPERADMIN"
                    ? "bg-primary text-foreground"
                    : i?.role === "ADMIN"
                    ? "bg-foreground text-primary"
                    : "bg-default text-default-foreground"
                }`,
                src:
                  type === "uploads"
                    ? i.type.includes("application")
                      ? `https://placehold.co/600x400?text=${
                          i.type.split("/")[1]
                        }`
                      : i.image
                    : "",
                name: cellValue[0],
                // className: "shrink-0",
              }}
              description={
                <span className="truncate text-ellipsis line-clamp-1 ">
                  {i.dates &&
                    dateFormat(
                      i.dates?.start.dateTime,
                      "ddd dd/mmm/yy - HH:MM"
                    )}
                  {i.size && `${(i.size / 1024).toFixed(2)}kB`}
                </span>
              }
              name={
                <span
                  className={`text-ellipsis  overflow-hidden  break-words line-clamp-${
                    type === "uploads" ? "1" : "2"
                  } `}
                >
                  {cellValue}
                </span>
              }
            />
          );
        case "createdBy":
          return (
            <User
              avatarProps={{
                size: "sm",
                isBordered: true,
                className: `shrink-0 ${
                  i.user.role === "SUPERADMIN"
                    ? "bg-primary text-foreground"
                    : i.user.role === "ADMIN"
                    ? "bg-foreground text-primary"
                    : "bg-default text-default-foreground"
                }`,
                color:
                  i.user.role === "SUPERADMIN" || i.user.role === "ADMIN"
                    ? "primary"
                    : "default",
                src: i.user.image,
              }}
              description={
                <span className="truncate text-ellipsis line-clamp-1 ">
                  @{i.user.username}
                </span>
              }
              name={
                <span className="truncate text-ellipsis line-clamp-1 ">
                  {i.user.name}
                </span>
              }
            />
          );
        case "assignTo":
          if (cellValue.length === 1) {
            return (
              <User
                avatarProps={{
                  size: "sm",
                  isBordered: true,
                  className: `shrink-0 ${
                    cellValue[0].role === "SUPERADMIN"
                      ? "bg-primary text-foreground"
                      : cellValue[0].role === "ADMIN"
                      ? "bg-foreground text-primary"
                      : "bg-default text-default-foreground"
                  }`,
                  color:
                    cellValue[0].role === "SUPERADMIN" ||
                    cellValue[0].role === "ADMIN"
                      ? "primary"
                      : "default",
                  src: cellValue[0].image,
                }}
                description={
                  <span className="truncate text-ellipsis line-clamp-1 ">
                    @{cellValue[0].username}
                  </span>
                }
                name={
                  <span className="truncate text-ellipsis line-clamp-1 ">
                    {cellValue[0].name}
                  </span>
                }
              />
            );
          } else {
            return (
              <AvatarGroup
                size="sm"
                isBordered
                max={3}
                className=" px-3 justify-start"
              >
                {cellValue.map((val: any) => {
                  return (
                    <>
                      <Tooltip showArrow={true} content={val.name}>
                        <Avatar
                          size="sm"
                          src={val.image}
                          isBordered
                          className={`shrink-0 ${
                            val.role === "SUPERADMIN"
                              ? "bg-primary text-foreground"
                              : val.role === "ADMIN"
                              ? "bg-foreground text-primary"
                              : "bg-default text-default-foreground"
                          }`}
                          color={
                            val.role === "SUPERADMIN" || val.role === "ADMIN"
                              ? "primary"
                              : "default"
                          }
                        />
                      </Tooltip>
                    </>
                  );
                })}
              </AvatarGroup>
            );
          }
        case "category":
          return (
            <Chip size="sm" color="primary">
              {type === "blogs" && i.category.name}
              {i.classifications && i.classifications[0].genre.name}
            </Chip>
          );
        case "type":
          return (
            <Chip size="sm" color="primary">
              {i.type.split("/")[1].toUpperCase()}
            </Chip>
          );
        case "priceRanges":
          return (
            <p>
              {cellValue &&
                cellValue[0].min +
                  " - " +
                  cellValue[0].max +
                  " " +
                  cellValue[0].currency}
            </p>
          );
        case "onSale":
          return (
            <Switch
              isDisabled
              isSelected={i.dates.status.code === "onsale" ? true : false}
              // onChange={field.onChange}
            />
          );
        case "status":
          return (
            <Chip size="sm" color={cellValue.color}>
              {cellValue.name}
            </Chip>
          );
        case "isActive":
          return (
            <Switch
              isDisabled
              isSelected={i.isActive ? true : false}
              // onChange={field.onChange}
            />
          );
        case "actions":
          return (
            <div className="relative flex items-center gap-2 justify-end">
              {type === "blogs" && (
                <Tooltip content="Edit">
                  <Button
                    size="md"
                    isIconOnly
                    color="default"
                    variant="light"
                    className="p-0 rounded-full"
                    onClick={() =>
                      router.push(`/hws/blogs/${i.id}`, {
                        scroll: false,
                      })
                    }
                  >
                    <Pencil1Icon color="gray" />
                  </Button>
                </Tooltip>
              )}
              <Tooltip content="Show">
                <Button
                  size="md"
                  isIconOnly
                  color="primary"
                  variant="light"
                  className="p-0 rounded-full"
                  onClick={
                    () =>
                      type === "files" ? window.open(i.tempUrl) : handleView(i)
                    // router.push(`/hws/${type}/${i.id}`, {
                    //     scroll: false,
                    //   })
                  }
                >
                  <EyeOpenIcon color="purple" />
                </Button>
              </Tooltip>
              <Tooltip color="danger" content="Delete">
                <Button
                  size="md"
                  isIconOnly
                  color="danger"
                  variant="light"
                  className=" p-0 rounded-full"
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
      setRowsPerPage(Number(e.target.value));
      setPage(1);
    },
    []
  );

  const onSearchChange = React.useCallback((value?: string) => {
    if (value) {
      setIsSearching(true);
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
      setIsSearching(false);
    }
  }, []);

  const onClear = React.useCallback(() => {
    setFilterValue("");
    setPage(1);
    setIsSearching(false);
  }, []);

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-row justify-between gap-3 items-end">
          <Input
            size="md"
            isClearable
            className="w-full"
            placeholder={`Search ${type}...`}
            startContent={<FaSearch />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          <div className={`${isSearching ? "hidden" : "flex"} gap-3 sm:flex`}>
            {statusOptions && (
              <Dropdown className="w-full">
                <DropdownTrigger>
                  <Button
                    endContent={<FaChevronDown className="text-small" />}
                    variant="flat"
                    size="md"
                  >
                    Status
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  disallowEmptySelection
                  aria-label="Table Columns"
                  closeOnSelect={false}
                  selectedKeys={statusFilter}
                  selectionMode="multiple"
                  onSelectionChange={setStatusFilter}
                >
                  {statusOptions?.map((status: any) => (
                    <DropdownItem key={status.uid} className="capitalize">
                      {status.name}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            )}
            <Dropdown>
              <DropdownTrigger>
                <Button
                  size="md"
                  endContent={<FaChevronDown className="text-small" />}
                  variant="flat"
                >
                  Columns
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={visibleColumns}
                selectionMode="multiple"
                onSelectionChange={setVisibleColumns}
              >
                {cols.map((column) => (
                  <DropdownItem key={column.uid} className="capitalize">
                    {column.name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Button
              color="primary"
              size="md"
              endContent={<FaPlus />}
              onPress={handleNewItem}
            >
              <span className="hidden md:flex">Add New</span>
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Total {data.length} {type}
          </span>
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-none text-default-400 text-small"
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
            showShadow
            color="primary"
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
      <Title text={type} className="items-start" />
      <Table
        aria-label="Item list"
        isHeaderSticky
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        selectedKeys={selectedKeys}
        // selectionMode="multiple"
        sortDescriptor={sortByName}
        topContent={topContent}
        topContentPlacement="outside"
        onSelectionChange={setSelectedKeys}
        onSortChange={setSortDescriptor}
        onRowAction={() => {}}
        classNames={{
          table: "min-h-[150px]",
        }}
      >
        <TableHeader columns={headerColumns}>
          {(column: any) => (
            <TableColumn
              key={column.uid}
              align={column.uid === "actions" ? "center" : "start"}
              allowsSorting={column.sortable}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          items={sortedItems}
          isLoading={isPending}
          loadingContent={<Spinner label="Loading..." />}
        >
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      {/* <Modal
        backdrop="blur"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        radius="lg"
        classNames={{
          body: "py-0 max-h-screen",
          backdrop: "bg-black/50 backdrop-opacity-40",
          base: "bg-secondary",
          closeButton: "hover:bg-white/5 active:bg-white/10",
        }}
      >
        <ModalContent
          className="max-h-screen overflow-y-scroll"
          style={{ overflow: scroll }}
        >
          {(onClose) => (
            <>
              {type === "tasks" && (
                <NewTaskForm
                  type={type}
                  onSubmit={onSubmit}
                  onClose={onClose}
                />
              )}
              {type === "files" && (
                <NewFilesForm
                  type={type}
                  onSubmit={onSubmit}
                  onClose={onClose}
                />
              )}
              {type === "blogs" && (
                <NewBlogForm
                  type={type}
                  onSubmit={onSubmit}
                  onClose={onClose}
                />
              )}
              {type === "members" && (
                <NewMemberForm
                  type={type}
                  onSubmit={onSubmit}
                  onClose={onClose}
                />
              )}
            </>
          )}
        </ModalContent>
      </Modal> */}
      <Modal
        open={isOpen}
        onClose={handleNewItem}
        className="flex flex-1 flex-col gap-6 items-center justify-center z-0"
      >
        <Box
          style={{
            overflow: "scroll",
          }}
          className="flex flex-col gap-3 relative z-50 w-full box-border outline-none mx-1 my-1 sm:mx-6 sm:my-16 max-w-md rounded-large shadow-small overflow-y-hidden bg-white p-6 h-full"
        >
          <div className="flex justify-between w-full">
            <div className="flex items-center">
              <h1 className=" text-large font-semibold uppercase ">
                New {type}
              </h1>
            </div>
            <Button
              onClick={handleNewItem}
              size="sm"
              isIconOnly
              color="danger"
              variant="light"
              className="p-0 rounded-full"
            >
              <CrossCircledIcon />
            </Button>
          </div>
          {type === "tasks" && (
            <TaskFormModal
              type={type}
              onSubmit={onSubmit}
              isPending={isPending}
            />
          )}
          {type === "files" && <NewFilesForm type={type} onSubmit={onSubmit} />}
          {type === "blogs" && <NewBlogForm type={type} onSubmit={onSubmit} />}
          {type === "members" && (
            <NewMemberForm type={type} onSubmit={onSubmit} />
          )}
        </Box>
      </Modal>
    </>
  );
};