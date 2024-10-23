import {hc} from "hono/client";
import {AppType} from "@/app/api/[[...route]]/route";

export const rpc = hc<AppType>(process.env.API_URL || "http://localhost:3000");