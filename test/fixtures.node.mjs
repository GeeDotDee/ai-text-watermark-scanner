import assert from "node:assert/strict";
import test from "node:test";
import { scanText } from "../src/index.mjs";

/**
 * Deterministic test fixtures for Unicode artifacts and hidden characters.
 * Each fixture verifies:
 * - Specific code points detected
 * - Classification category (kind)
 * - Removability status (removable vs non-removable)
 * - Expected cleaned text output
 * - Context extraction and metadata
 */
const UNICODE_FIXTURES = [
  {
    name: "Unicode tag characters (U+E0001 - U+E007F)",
    description: "Invisible language tag / formatting characters used to conceal payloads or metadata.",
    input: "Clean\u{E0001}text\u{E0020}with\u{E007F}tags",
    expectedCleaned: "Cleantextwithtags",
    expectedKinds: ["unicode-tag"],
    expectedCodePoints: ["U+E0001", "U+E0020", "U+E007F"],
    removable: true,
    safetyRationale: "Tag characters are non-rendering format controls safe to strip without altering visual content."
  },
  {
    name: "Directional isolate and override marks (Bidi)",
    description: "Bi-directional formatting characters (RLO U+202E, PDF U+202C, RLI U+2067, PDI U+2069).",
    input: "Safe\u202Ereversed\u202C\u2067isolated\u2069content",
    expectedCleaned: "Safereversedisolatedcontent",
    expectedKinds: ["directional"],
    expectedCodePoints: ["U+202E", "U+202C", "U+2067", "U+2069"],
    removable: true,
    safetyRationale: "Directional overrides can obscure spoofed file extensions or text order; stripping neutralizes bidi spoofing."
  },
  {
    name: "Hidden control codes and ASCII escapes",
    description: "C0 control characters (BEL U+0007, ESC U+001B, VT U+000B, FF U+000C).",
    input: "Header\u0007\u001B\u000B\u000CBody",
    expectedCleaned: "HeaderBody",
    expectedKinds: ["control"],
    expectedCodePoints: ["U+0007", "U+001B", "U+000B", "U+000C"],
    removable: true,
    safetyRationale: "Non-printable C0 control characters are non-essential for standard text and safe to remove."
  },
  {
    name: "Zero-width spaces, joiners, and word joiner",
    description: "Zero-width space (U+200B), non-joiner (U+200C), joiner (U+200D), and word joiner (U+2060).",
    input: "Zero\u200BWidth\u200CNonJoiner\u200DJoiner\u2060WordJoiner",
    expectedCleaned: "ZeroWidthNonJoinerJoinerWordJoiner",
    expectedKinds: ["zero-width"],
    expectedCodePoints: ["U+200B", "U+200C", "U+200D", "U+2060"],
    removable: true,
    safetyRationale: "Zero-width format characters carry no visual glyph representation and are frequently used for stealth tagging."
  },
  {
    name: "Standard and supplementary variation selectors",
    description: "Variation Selector-1 (U+FE00), Variation Selector-16 (U+FE0F), and VS-17 (U+E0100).",
    input: "Text\uFE00Variant\uFE0FSupplementary\u{E0100}",
    expectedCleaned: "TextVariantSupplementary",
    expectedKinds: ["variation-selector"],
    expectedCodePoints: ["U+FE00", "U+FE0F", "U+E0100"],
    removable: true,
    safetyRationale: "Variation selectors modify font glyph presentation; removing them preserves the underlying base character."
  },
  {
    name: "Invisible fillers (Hangul Filler U+3164 and Braille Blank U+2800)",
    description: "Characters that render as blank space across platforms and can encode binary patterns.",
    input: "WordA\u3164WordB\u2800WordC",
    expectedCleaned: "WordA WordB WordC",
    expectedKinds: ["invisible-filler"],
    expectedCodePoints: ["U+3164", "U+2800"],
    removable: true,
    safetyRationale: "Invisible fillers substitute for whitespace; normalizing them to standard ASCII spaces preserves readability."
  },
  {
    name: "Byte Order Mark (U+FEFF)",
    description: "Zero-width non-breaking space / UTF-8 BOM embedded within body text.",
    input: "Line1\uFEFFLine2",
    expectedCleaned: "Line1Line2",
    expectedKinds: ["bom"],
    expectedCodePoints: ["U+FEFF"],
    removable: true,
    safetyRationale: "Mid-stream BOMs are spurious artifacts from file concatenations or copy-paste operations."
  },
  {
    name: "Non-breaking space (U+00A0) and narrow NBSP (U+202F)",
    description: "Fixed spaces used for formatting that can hide trailing differences.",
    input: "Price:\u00A0100\u202FEUR",
    expectedCleaned: "Price: 100 EUR",
    expectedKinds: ["non-breaking-space"],
    expectedCodePoints: ["U+00A0", "U+202F"],
    removable: true,
    safetyRationale: "Converting non-breaking spaces to standard spaces prevents invisible whitespace mismatches."
  },
  {
    name: "Homoglyph mixed-script characters (e.g. Cyrillic in Latin)",
    description: "Cyrillic Small Letter A (U+0430) and O (U+043E) embedded in Latin script.",
    input: "p\u0430ssw\u043Erd",
    expectedCleaned: "p\u0430ssw\u043Erd",
    expectedKinds: ["homoglyph"],
    expectedCodePoints: ["U+0430", "U+043E"],
    removable: false,
    safetyRationale: "Homoglyphs represent visible characters; automated removal would corrupt word spelling, so they are flagged as non-removable."
  }
];

for (const fixture of UNICODE_FIXTURES) {
  test(`fixture: ${fixture.name}`, () => {
    const result = scanText(fixture.input);

    assert.equal(
      result.cleanedText,
      fixture.expectedCleaned,
      `Cleaned text mismatch for ${fixture.name}`
    );

    const foundKinds = result.findings.map((f) => f.kind);
    for (const expectedKind of fixture.expectedKinds) {
      assert.ok(
        foundKinds.includes(expectedKind),
        `Expected kind ${expectedKind} in findings: ${foundKinds.join(", ")}`
      );
    }

    const finding = result.findings.find((f) => fixture.expectedKinds.includes(f.kind));
    assert.ok(finding, `Finding not found for ${fixture.name}`);
    assert.equal(
      finding.removable,
      fixture.removable,
      `Removability mismatch for ${fixture.name}`
    );

    for (const expectedCodePoint of fixture.expectedCodePoints) {
      assert.ok(
        finding.codePoints.includes(expectedCodePoint),
        `Code point ${expectedCodePoint} missing from finding codePoints: ${finding.codePoints.join(", ")}`
      );
    }
  });
}
