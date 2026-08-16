# Reproducible coverage benchmark

The scanner performs deterministic literal-character matching. Its benchmark goal is exact reporting and conservative cleaning, not AI authorship classification.

| Category | Expected behavior |
| --- | --- |
| Zero-width characters | Report and remove supported code points |
| Directional controls | Report and remove supported code points |
| Unicode tag characters | Report and remove supported code points |
| Soft hyphens and byte-order marks | Report and remove |
| Special spaces and invisible fillers | Report and normalize conservatively |
| Mixed-script lookalikes | Report for review and do not rewrite |
| Statistical provider watermarks | Return no authorship conclusion |

Run `npm test` to reproduce the included fixtures. The versioned public fixture set and rendered results are available at https://aitextwatermark.com/benchmarks/artifact-coverage. Browser answer-selection fixtures and limitations are published at https://aitextwatermark.com/extension/compatibility.
