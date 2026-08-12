const definitions = [
  ["unicode-tag", "Invisible Unicode tags", /[\u{E0001}-\u{E007F}]/gu, "", true, "high"],
  ["directional", "Directional formatting", /[\u061C\u200E\u200F\u202A-\u202E\u2066-\u2069]/gu, "", true, "high"],
  ["control", "Hidden control characters", /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/gu, "", true, "high"],
  ["zero-width", "Zero-width characters", /[\u200B\u200C\u200D\u2060]/gu, "", true, "medium"],
  ["variation-selector", "Variation selectors", /[\uFE00-\uFE0F\u{E0100}-\u{E01EF}]/gu, "", true, "medium"],
  ["invisible-filler", "Invisible filler characters", /[\u115F\u1160\u2800\u3164]/gu, " ", true, "medium"],
  ["homoglyph", "Mixed-script lookalikes", /[\u0400-\u04FF]/gu, null, false, "high"],
  ["soft-hyphen", "Soft hyphens", /\u00AD/gu, "", true, "low"],
  ["bom", "Byte-order marks", /\uFEFF/gu, "", true, "low"],
  ["non-breaking-space", "Non-breaking spaces", /[\u00A0\u202F]/gu, " ", true, "low"]
];

const codePoint = (character) => `U+${character.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}`;

function contextAt(text, index, length) {
  const start = Math.max(0, index - 12);
  const end = Math.min(text.length, index + length + 12);
  return `${start ? "..." : ""}${text.slice(start, index)}[${codePoint(text.slice(index, index + length))}]${text.slice(index + length, end)}${end < text.length ? "..." : ""}`;
}

export function scanText(text) {
  if (typeof text !== "string") throw new TypeError("text must be a string");
  let cleanedText = text.replace(/\r\n?/g, "\n");
  const findings = [];
  for (const [kind, label, pattern, replacement, removable, risk] of definitions) {
    const matches = [...text.matchAll(new RegExp(pattern.source, pattern.flags))];
    if (!matches.length) continue;
    findings.push({
      kind,
      label,
      count: matches.length,
      codePoints: [...new Set(matches.map((match) => codePoint(match[0])))],
      removable,
      risk,
      occurrences: matches.slice(0, 5).map((match) => ({
        index: match.index,
        codePoint: codePoint(match[0]),
        context: contextAt(text, match.index, match[0].length)
      }))
    });
    if (removable) cleanedText = cleanedText.replace(new RegExp(pattern.source, pattern.flags), replacement ?? "");
  }
  const totalArtifacts = findings.reduce((total, finding) => total + finding.count, 0);
  const risk = findings.some((finding) => finding.risk === "high") ? "high" : findings.some((finding) => finding.risk === "medium") ? "medium" : "low";
  return {
    findings,
    totalArtifacts,
    cleanedText,
    changed: cleanedText !== text,
    characterCount: [...text].length,
    wordCount: text.trim() ? text.trim().split(/\s+/u).length : 0,
    risk,
    limitations: [
      "Findings are literal character artifacts, not proof of AI authorship.",
      "This scanner does not detect or certify removal of statistical model-level watermarks."
    ]
  };
}
