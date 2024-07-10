import axios from "axios";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    const res = await axios.get(
      `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${process.env.TICKETMASTER_API_KEY}`
    );

    console.log(res.data);

    return NextResponse.json(res.data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong with events" },
      { status: 500 }
    );
  }
};
