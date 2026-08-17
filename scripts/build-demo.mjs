import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const width = 960;
const height = 540;
const frames = [
  ["Paste copied AI text", "Clean text looks normal, but may contain invisible artifacts.", "Ready to inspect"],
  ["Scan locally", "Clean text looks normal, but may contain invisible artifacts.", "1 artifact found: U+200B"],
  ["Review exact evidence", "Clean[U+200B] text looks normal, but may contain invisible artifacts.", "Zero-width space at index 5"],
  ["Copy the cleaned text", "Clean text looks normal, but may contain invisible artifacts.", "Visible wording preserved"],
];

const escape = (value) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const svgs = frames.map(([title, text, status], index) => Buffer.from(`
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" rx="28" fill="#111815"/>
  <rect x="30" y="30" width="900" height="480" rx="22" fill="#f7f5ef"/>
  <circle cx="74" cy="74" r="18" fill="#3e7558"/>
  <text x="108" y="85" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#111815">AI Text Watermark Scanner</text>
  <text x="70" y="155" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="#3e7558">STEP ${index + 1} OF 4</text>
  <text x="70" y="205" font-family="Arial, sans-serif" font-size="38" font-weight="700" fill="#111815">${escape(title)}</text>
  <rect x="70" y="245" width="820" height="120" rx="16" fill="#ffffff" stroke="#ced7d2" stroke-width="2"/>
  <text x="95" y="315" font-family="Arial, sans-serif" font-size="22" fill="#26352e">${escape(text)}</text>
  <rect x="70" y="400" width="820" height="70" rx="16" fill="#dcebe2"/>
  <text x="105" y="444" font-family="Arial, sans-serif" font-size="23" font-weight="700" fill="#25543d">${escape(status)}</text>
</svg>`));

await mkdir("assets", { recursive: true });
const canvas = sharp({ create: { width, height: height * frames.length, channels: 4, background: "#111815" } });
await canvas
  .composite(svgs.map((input, index) => ({ input, top: index * height, left: 0 })))
  .gif({ pageHeight: height, delay: [1100, 1200, 1400, 1500], loop: 0 })
  .toFile("assets/demo.gif");
