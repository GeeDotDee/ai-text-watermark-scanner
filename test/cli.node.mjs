import assert from "node:assert/strict";
import test from "node:test";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { writeFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const execFileAsync = promisify(execFile);
const cliPath = join(process.cwd(), "src/cli.mjs");

test("CLI handles default single text file", async () => {
  const tmpFile = join(tmpdir(), `test-single-${Date.now()}.txt`);
  writeFileSync(tmpFile, "hello\u200B world", "utf8");
  try {
    const { stdout } = await execFileAsync(process.execPath, [cliPath, tmpFile]);
    const parsed = JSON.parse(stdout);
    assert.equal(parsed.totalArtifacts, 1);
    assert.equal(parsed.cleanedText, "hello world");
  } finally {
    unlinkSync(tmpFile);
  }
});

test("CLI processes JSONL input in batch mode", async () => {
  const tmpFile = join(tmpdir(), `test-batch-${Date.now()}.jsonl`);
  const lines = [
    JSON.stringify({ text: "clean line" }),
    JSON.stringify({ text: "hidden\u200B artifact" }),
    JSON.stringify("raw string with \u00AD soft hyphen")
  ];
  writeFileSync(tmpFile, lines.join("\n") + "\n", "utf8");
  try {
    const { stdout } = await execFileAsync(process.execPath, [cliPath, tmpFile, "--jsonl"]);
    const outputLines = stdout.trim().split("\n").map((l) => JSON.parse(l));
    assert.equal(outputLines.length, 3);
    assert.equal(outputLines[0].totalArtifacts, 0);
    assert.equal(outputLines[1].totalArtifacts, 1);
    assert.equal(outputLines[1].cleanedText, "hidden artifact");
    assert.equal(outputLines[2].totalArtifacts, 1);
    assert.equal(outputLines[2].cleanedText, "raw string with  soft hyphen");
  } finally {
    unlinkSync(tmpFile);
  }
});

test("CLI reports line errors on malformed JSONL records without crashing", async () => {
  const tmpFile = join(tmpdir(), `test-malformed-${Date.now()}.jsonl`);
  const lines = [
    JSON.stringify({ text: "valid line 1" }),
    "{ malformed json",
    JSON.stringify({ otherField: 123 }),
    JSON.stringify({ text: "valid line 4" })
  ];
  writeFileSync(tmpFile, lines.join("\n"), "utf8");
  try {
    let errRes;
    try {
      await execFileAsync(process.execPath, [cliPath, tmpFile, "--jsonl"]);
    } catch (err) {
      errRes = err;
    }
    assert.ok(errRes, "Command should exit with non-zero status on malformed lines");
    assert.match(errRes.stderr, /Error on line 2/);
    assert.match(errRes.stderr, /Error on line 3/);
    const outputLines = errRes.stdout.trim().split("\n").map((l) => JSON.parse(l));
    assert.equal(outputLines.length, 2);
    assert.equal(outputLines[0].cleanedText, "valid line 1");
    assert.equal(outputLines[1].cleanedText, "valid line 4");
  } finally {
    unlinkSync(tmpFile);
  }
});
