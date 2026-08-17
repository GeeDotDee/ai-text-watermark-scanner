// Run with: deno run examples/deno.ts
// Or with npm specifier: deno run npm:ai-text-watermark-scanner

import { scanText } from "../src/index.mjs";

const sample = "Copied\u200B text with invisible\uFEFF formatting and \u200Ehidden artifacts.";
const result = scanText(sample);

console.log("=== AI Text Watermark Scanner (Deno) ===");
console.log("Total Artifacts:", result.totalArtifacts);
console.log("Risk Level:", result.risk);
console.log("Exact Code Points:", result.findings.flatMap((f) => f.codePoints));
console.log("Findings Summary:");
for (const finding of result.findings) {
  console.log(` - [${finding.kind}] ${finding.label}: ${finding.codePoints.join(", ")} (count: ${finding.count}, removable: ${finding.removable})`);
}

console.log("\nCleaned Text:");
console.log(result.cleanedText);

console.log("\nLimitations Notice:");
for (const notice of result.limitations) {
  console.log(` * ${notice}`);
}
