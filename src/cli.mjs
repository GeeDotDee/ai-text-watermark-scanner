#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { scanText, toSarif } from "./index.mjs";

const args = process.argv.slice(2);
const sarif = args.includes("--sarif");
const jsonl = args.includes("--jsonl");
const filePath = args.find((arg) => !arg.startsWith("--"));

const input = filePath ? await readFile(filePath, "utf8") : await new Promise((resolve) => {
  let value = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (chunk) => { value += chunk; });
  process.stdin.on("end", () => resolve(value));
});

if (jsonl) {
  const lines = input.split(/\r?\n/);
  // If the input ends with a trailing newline, don't process an extra empty phantom entry if file is empty or ends with newline
  const lineCount = lines.length;
  for (let i = 0; i < lineCount; i++) {
    const line = lines[i];
    if (i === lineCount - 1 && line === "") {
      continue;
    }
    const lineNum = i + 1;
    let parsed;
    try {
      parsed = JSON.parse(line);
    } catch (err) {
      process.stderr.write(`Error on line ${lineNum}: Invalid JSON record (${err.message})\n`);
      process.exitCode = 1;
      continue;
    }

    let textToScan;
    if (typeof parsed === "string") {
      textToScan = parsed;
    } else if (parsed && typeof parsed === "object" && typeof parsed.text === "string") {
      textToScan = parsed.text;
    } else if (parsed && typeof parsed === "object" && typeof parsed.content === "string") {
      textToScan = parsed.content;
    } else {
      process.stderr.write(`Error on line ${lineNum}: Expected string or object with "text" or "content" string field\n`);
      process.exitCode = 1;
      continue;
    }

    const result = scanText(textToScan);
    const output = sarif ? toSarif(result, { uri: `${filePath || "stdin.jsonl"}#L${lineNum}`, sourceText: textToScan }) : result;
    process.stdout.write(`${JSON.stringify(output)}\n`);
  }
} else {
  const result = scanText(input);
  const output = sarif ? toSarif(result, { uri: filePath || "stdin.txt", sourceText: input }) : result;
  process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
}
