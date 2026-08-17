import assert from "node:assert/strict";
import test from "node:test";
import { scanText, toSarif } from "../src/index.mjs";

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

test("exports valid SARIF findings with exact locations", () => {
  const text = "first line\nhello\u200B world";
  const sarif = toSarif(scanText(text), { uri: "sample.txt", sourceText: text });
  assert.equal(sarif.version, "2.1.0");
  assert.equal(sarif.runs[0].results[0].ruleId, "ai-text-artifact/zero-width");
  assert.equal(sarif.runs[0].results[0].locations[0].physicalLocation.artifactLocation.uri, "sample.txt");
  assert.deepEqual(sarif.runs[0].results[0].locations[0].physicalLocation.region, { startLine: 2, startColumn: 6 });
});
