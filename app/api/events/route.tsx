import axios from "axios";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
  try {
    const reqJson = await req.json();

    const noInclude = "includeTBA=no&includeTBD=no&includeTest=no&";

    const res = await axios.get(
      `https://app.ticketmaster.com/discovery/v2/events.json?size=20&page=0&classificationName=${reqJson.filters.types.join(
        ","
      )}&sort=${reqJson.filters.sortedBy}&${noInclude}&keyword=${
        reqJson.filters.keyword
      }&onsaleOnStartDate=${reqJson.filters.startDate}&apikey=${
        process.env.TICKETMASTER_API_KEY
      }`
    );

    return NextResponse.json(res.data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong with events" },
      { status: 500 }
    );
  }
};
