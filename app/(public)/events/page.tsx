"use client";
import { Title } from "@/components/title";
import * as React from "react";
import { useEffect, useState, useTransition } from "react";
import axios from "axios";
import {
  Spinner,
  Chip,
  Input,
  Select,
  SelectItem,
  DatePicker,
  Switch,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  RadioGroup,
  Radio,
  Accordion,
  AccordionItem,
  useDisclosure,
  CheckboxGroup,
  Checkbox,
} from "@nextui-org/react";
import { getLocalTimeZone, today } from "@internationalized/date";
import { ItemGrid } from "./components/ItemGrid";
import {
  MagnifyingGlassIcon,
  GridIcon,
  RowsIcon,
  HeartFilledIcon,
} from "@radix-ui/react-icons";
import { FaVolleyballBall, FaUser } from "react-icons/fa";
import { GiMicrophone } from "react-icons/gi";
import { BiSolidCameraMovie } from "react-icons/bi";
import { FaMasksTheater, FaUserGroup } from "react-icons/fa6";

import { ItemList } from "./components/ItemList";

const sortBy = [
  { key: "relevance,asc", label: "Relevance" },
  { key: "name,asc", label: "Name (asc)" },
  { key: "name,desc", label: "Name (desc)" },
  { key: "date,asc", label: "Date (asc)" },
  { key: "date,desc", label: "Date (desc)" },
  { key: "distance,asc", label: "Distance" },
  { key: "onSaleStartDate,asc", label: "On Sale" },
  { key: "venueName,asc", label: "Venue" },
  { key: "random", label: "Random" },
];

const classificationsTypes = [
  { key: "music", label: "Music", icon: <GiMicrophone /> },
  { key: "sport", label: "Sport", icon: <FaVolleyballBall /> },
  { key: "arts,theatre", label: "Arts & Theatre", icon: <FaMasksTheater /> },
  { key: "film", label: "Film", icon: <BiSolidCameraMovie /> },
  { key: "group", label: "Group", icon: <FaUserGroup /> },
  { key: "individual", label: "Individual", icon: <FaUser /> },
  { key: "donation", label: "Donation", icon: <HeartFilledIcon /> },
];

const EventsPage = () => {
  const [isPending, startTransition] = useTransition();
  const [items, setItems] = useState([]);
  const [gridView, setGridView] = useState(true);
  const [filterSelected, setFilterSelected] = useState(true);
  const [classifications, setClassifications] = React.useState<Selection>(
    new Set([])
  );
  const date = new Date();
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0"); //January is 0!
  const yyyy = date.getFullYear();

  const [filters, setFilters] = useState({
    sortedBy: "date,asc",
    keyword: "",
    types: [],
    startDate: `${yyyy}-${mm}-${dd}`,
  });

  useEffect(() => {
    getData();
  }, [filters, classifications]);

  const getData = async () => {
    startTransition(async () => {
      for (const key in classifications) {
        filters.types.push(classifications[key]);
      }
      await axios
        .post("/api/events", { filters })
        .then((res) => {
          setItems(res.data._embedded.events);
        })
        .catch((e) => {});
    });
  };

  return (
    <div>
      <div className="grid gap-3 mb-3">
        <Title text="Events" className="items-start" />
        <Input
          startContent={
            <MagnifyingGlassIcon className="text-black/50 mb-0.5 dark:text-white/90 text-slate-400 pointer-events-none flex-shrink-0" />
          }
          size="md"
          radius="none"
          type="text"
          placeholder="Search"
          fullWidth
          isClearable
          onValueChange={(e) => {
            setFilters((prevFilters) => ({
              ...prevFilters,
              keyword: e,
            }));
          }}
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select
            size="sm"
            fullWidth
            radius="none"
            label="Sort By"
            disabledKeys={[filters.sortedBy]}
            defaultSelectedKeys={[filters.sortedBy]}
            onChange={(e) => {
              setFilters((prevFilters) => ({
                ...prevFilters,
                sortedBy: e.target.value,
              }));
            }}
          >
            {sortBy.map((i) => (
              <SelectItem key={i.key}>{i.label}</SelectItem>
            ))}
          </Select>
          <Select
            size="sm"
            fullWidth
            radius="none"
            label="Type"
            className=" overflow-x-hidden overflow-hidden"
            // disabledKeys={[filters.sortedBy]}
            // defaultSelectedKeys={[filters.sortedBy]}
            selectionMode="multiple"
            selectedKeys={classifications}
            onSelectionChange={setClassifications}
          >
            {classificationsTypes.map((i) => (
              <SelectItem key={i.key} value={i.key} startContent={i.icon}>
                {i.label}
              </SelectItem>
            ))}
          </Select>
          <DatePicker
            size="sm"
            label="Date"
            color="default"
            fullWidth
            radius="none"
            minValue={today(getLocalTimeZone())}
            onChange={(date) => {
              const m = `${date?.month <= 9 ? "0" : ""}${date?.month}`;
              const d = `${date?.day <= 9 ? "0" : ""}${date?.day}`;
              setFilters((prevFilters) => ({
                ...prevFilters,
                startDate: `${date?.year}-${m}-${d}`,
              }));
            }}
          />
        </div>
      </div>

      {isPending ? (
        <div className="w-full  items-center justify-center flex">
          <Spinner
            label="Loading..."
            color="default"
            labelColor="default"
            size="lg"
          />
        </div>
      ) : (
        <>
          <div className="w-full flex justify-between mb-3">
            <div>
              <small className="w-full flex justify-center text-foreground">
                {items?.length} events found
              </small>
            </div>

            <div className="flex items-center text-foreground text-sm">
              <Switch
                isSelected={gridView}
                onValueChange={setGridView}
                size="sm"
                thumbIcon={({ isSelected, className }) =>
                  isSelected ? (
                    <GridIcon className="w-2.5 h-2.5 text-foreground" />
                  ) : (
                    <RowsIcon className="w-2.5 h-2.5 text-foreground" />
                  )
                }
              />
            </div>
          </div>

          {gridView ? (
            <div
              className="max-w-full grid gap-2 md:gap-3 lg:gap-4 xl:gap-5
        grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 "
            >
              {items?.map((item) => (
                <ItemGrid item={item} key={item.id} />
              ))}
            </div>
          ) : (
            <div className="max-w-full grid gap-2 grid-cols-1">
              {items?.map((item) => (
                <ItemList item={item} key={item.id} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EventsPage;
