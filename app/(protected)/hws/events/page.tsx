"use client";
import { Title } from "@/components/title";
import { TableItems } from "@/components/tableItems";
import axios from "axios";
import { useEffect, useState } from "react";

const EventsPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const initialCols = ["name", "onSale", "priceRanges", "actions"];

  const cols = [
    { name: "EVENT", uid: "name", sortable: true },
    { name: "CATEGORY", uid: "category", sortable: false },
    { name: "PRICE", uid: "priceRanges", sortable: false },
    { name: "ON SALE", uid: "onSale", sortable: false },
    { name: "ACTIONS", uid: "actions" },
  ];

  const statusOptions = [
    { name: "On Sale", uid: "true" },
    { name: "No Active", uid: "false" },
  ];

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    await axios
      .get("/api/events")
      .then((res) => {
        setData(res.data._embedded.events);
        setLoading(false);
      })
      .catch((e) => {
        setLoading(false);
      });
  };

  return (
    <div>
      <TableItems
        data={data}
        cols={cols}
        initialCols={initialCols}
        type="events"
        // onDelete={onDelete}
        // onSubmit={onSubmit}
        loading={loading}
        statusOptions={statusOptions}
      />
    </div>
  );
};

export default EventsPage;
