#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { scanText } from "./index.mjs";

const input = process.argv[2] ? await readFile(process.argv[2], "utf8") : await new Promise((resolve) => {
  let value = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (chunk) => { value += chunk; });
  process.stdin.on("end", () => resolve(value));
});
process.stdout.write(`${JSON.stringify(scanText(input), null, 2)}\n`);
