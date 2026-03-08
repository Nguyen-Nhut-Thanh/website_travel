import "dotenv/config";
import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import { connectPG, connectMG } from "./apps/config/connectdb.js";

await connectPG();

await connectMG();
