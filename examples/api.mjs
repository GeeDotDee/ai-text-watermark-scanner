const response = await fetch("https://aitextwatermark.com/api/v1/scan", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ text: "Copied\u200B text" }),
});

if (!response.ok) throw new Error(`Scan failed: ${response.status}`);

const result = await response.json();
console.log(result);
