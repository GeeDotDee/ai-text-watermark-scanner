#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { scanText, toSarif } from "./index.mjs";

const args = process.argv.slice(2);
const sarif = args.includes("--sarif");
const filePath = args.find((arg) => !arg.startsWith("--"));
const input = filePath ? await readFile(filePath, "utf8") : await new Promise((resolve) => {
  let value = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (chunk) => { value += chunk; });
  process.stdin.on("end", () => resolve(value));
});
const result = scanText(input);
const output = sarif ? toSarif(result, { uri: filePath || "stdin.txt", sourceText: input }) : result;
process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
