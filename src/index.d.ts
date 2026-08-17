export type Risk = "low" | "medium" | "high";
export type Finding = { kind: string; label: string; count: number; codePoints: string[]; removable: boolean; risk: Risk; occurrences: { index: number; codePoint: string; context: string }[] };
export type ScanResult = { findings: Finding[]; totalArtifacts: number; cleanedText: string; changed: boolean; characterCount: number; wordCount: number; risk: Risk; limitations: string[] };
export function scanText(text: string): ScanResult;
export type SarifOptions = { uri?: string; sourceText?: string };
export function toSarif(result: ScanResult, options?: SarifOptions): object;
