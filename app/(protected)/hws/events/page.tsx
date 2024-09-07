"use client";

import { TableItems } from "./_components/TableItems";
import axios from "axios";
import { useEffect, useState, useTransition } from "react";
import { useDisclosure } from "@nextui-org/react";

const EventsPage = () => {
 const [data, setData] = useState([]);
 const [isLoding, startLoading] = useTransition();
 const initialCols = ["name", "onSale", "priceRanges", "actions"];
 const { isOpen, onOpen, onClose } = useDisclosure();
 const cols = [
  { name: "EVENT", uid: "name", sortable: true },
  { name: "CATEGORY", uid: "category", sortable: false },
  { name: "PRICE", uid: "priceRanges", sortable: false },
  { name: "ON SALE", uid: "onSale", sortable: false },
  { name: "ACTIONS", uid: "actions" },
 ];
 const date = new Date();
 const dd = String(date.getDate()).padStart(2, "0");
 const mm = String(date.getMonth() + 1).padStart(2, "0"); //January is 0!
 const yyyy = date.getFullYear();
 const [classifications, setClassifications] = useState<Selection>(new Set([]));
 const statusOptions = [
  { name: "On Sale", uid: "true" },
  { name: "No Active", uid: "false" },
 ];

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
  startLoading(async () => {
   for (const key in classifications) {
    filters.types.push(classifications[key]);
   }
   await axios
    .post("/api/events", { filters })
    .then((res) => {
     console.log(res);
     setData(res.data._embedded.events);
    })
    .catch((e) => {});
  });
 };

 const handleOnClose = () => {
  return onClose();
 };

 return (
  <div>
   <TableItems
    data={data}
    cols={cols}
    initialCols={initialCols}
    statusOptions={statusOptions}
    isLoading={isLoding}
    getData={getData}
   />
  </div>
 );
};

export default EventsPage;
