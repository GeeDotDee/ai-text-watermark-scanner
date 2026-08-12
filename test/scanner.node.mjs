import assert from "node:assert/strict";
import test from "node:test";
import { scanText } from "../src/index.mjs";

test("reports and cleans literal artifacts", () => {
  const result = scanText("hello\u200B world\u00AD");
  assert.equal(result.totalArtifacts, 2);
  assert.equal(result.cleanedText, "hello world");
  assert.deepEqual(result.findings.map((finding) => finding.kind), ["zero-width", "soft-hyphen"]);
});

test("does not replace mixed-script lookalikes", () => {
  const text = "p\u0430y";
  const result = scanText(text);
  assert.equal(result.cleanedText, text);
  assert.equal(result.findings[0].removable, false);
});
