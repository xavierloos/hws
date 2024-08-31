"use client";
import { Title } from "@/components/title";
import { TableItems } from "@/components/tableItems";
import axios from "axios";
import { useEffect, useState, useTransition } from "react";

const EventsPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const initialCols = ["name", "onSale", "priceRanges", "actions"];
  const [isPending, startTransition] = useTransition();
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
  const [classifications, setClassifications] = useState<Selection>(
    new Set([])
  );
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
    startTransition(async () => {
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
        type="events"
        // onDelete={onDelete}
        // onSubmit={onSubmit}
        isPending={isPending}
        statusOptions={statusOptions}
      />
    </div>
  );
};

export default EventsPage;
