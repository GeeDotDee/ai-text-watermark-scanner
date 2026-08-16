# AI Text Watermark Scanner

A dependency-free, local-first JavaScript scanner for literal hidden Unicode and removable formatting artifacts. It reports exact code points and locations, creates a conservative cleaned copy, and makes no authorship claim.

## Install

```bash
npm install ai-text-watermark-scanner
```

## JavaScript

```js
import { scanText } from "ai-text-watermark-scanner";

const result = scanText("copied text");
console.log(result.findings);
console.log(result.cleanedText);
```

## CLI

```bash
ai-watermark-scan draft.txt
```

The package does not detect or claim to remove statistical model-level watermarks such as deployed provider token-sampling signals. Use [AI Text Watermark Remover](https://aitextwatermark.com) for the hosted scanner, reports, batch workflows, browser tools, and current provider guidance.
