"use client";
import { useCurrentUser } from "@/hooks/use-current-user";
import { TableItems } from "./_components/TableItems";
import axios from "axios";
import { useEffect, useState, useTransition } from "react";

const EventsPage = () => {
 const [data, setData] = useState([]);
 const [isLoding, startLoading] = useTransition();
 const initialCols = ["name", "onSale", "actions"];
 const cols = [
  { name: "EVENT", uid: "name", sortable: true },
  { name: "STATUS", uid: "onSale", sortable: true },
  { name: "ACTIONS", uid: "actions" },
 ];
 const date = new Date();
 const dd = String(date.getDate()).padStart(2, "0");
 const mm = String(date.getMonth() + 1).padStart(2, "0"); //January is 0!
 const yyyy = date.getFullYear();
 const [classifications, setClassifications] = useState<Selection>(new Set([]));

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
     setData(res.data._embedded.events);
    })
    .catch((e) => {});
  });
 };

 return (
  <div>
   <TableItems
    data={data}
    cols={cols}
    initialCols={initialCols}
    isLoading={isLoding}
   />
  </div>
 );
};

export default EventsPage;
