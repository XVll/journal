import {hc} from "hono/client";
import {AppType} from "@/app/api/[[...route]]/route";

console.log(process.env.API_URL)
export const rpc = hc<AppType>(process.env.API_URL || "http://localhost:3000");