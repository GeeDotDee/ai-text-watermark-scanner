import { scanText } from "ai-text-watermark-scanner";

const text = "Copied\u200B text with a hidden zero-width space.";
const result = scanText(text);

console.log({
  artifacts: result.totalArtifacts,
  codePoints: result.findings.flatMap((finding) => finding.codePoints),
  cleanedText: result.cleanedText,
  changed: result.changed,
});
