import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";

const dataDir = path.join(process.cwd(), ".data");
if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
console.log(`Database directory is ready: ${dataDir}`);
