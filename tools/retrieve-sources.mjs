import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const accessDate = new Date().toISOString().slice(0, 10);
const sources = JSON.parse(await readFile("data/sources.json", "utf8"));
const outDir = "research/source-cards";

await mkdir(outDir, { recursive: true });

const stripTags = (html) => html
  .replace(/<script[\s\S]*?<\/script>/gi, " ")
  .replace(/<style[\s\S]*?<\/style>/gi, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/&nbsp;/g, " ")
  .replace(/&amp;/g, "&")
  .replace(/&quot;/g, "\"")
  .replace(/&#39;/g, "'")
  .replace(/\s+/g, " ")
  .trim();

const extractFirst = (html, pattern) => {
  const match = html.match(pattern);
  return match ? stripTags(match[1]).slice(0, 300) : "";
};

const extractMetaDescription = (html) => {
  const match = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["'][^>]*>/i);
  return match ? stripTags(match[1]).slice(0, 300) : "";
};

const extractHeadings = (html) => {
  const headings = [];
  const re = /<h([1-3])[^>]*>([\s\S]*?)<\/h\1>/gi;
  let match;
  while ((match = re.exec(html)) && headings.length < 30) {
    const text = stripTags(match[2]);
    if (text && text.length <= 180) headings.push({ level: Number(match[1]), text });
  }
  return headings;
};

const slugify = (value) => value
  .toLowerCase()
  .replace(/https?:\/\//, "")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "")
  .slice(0, 80);

const safeFetch = async (source) => {
  const startedAt = Date.now();
  try {
    const response = await fetch(source.url, {
      redirect: "follow",
      headers: {
        "user-agent": "TeenHealthAwarenessHub/1.0 (+source metadata curation; contact repo owner)"
      }
    });
    const contentType = response.headers.get("content-type") || "";
    const finalUrl = response.url;
    const bytes = Number(response.headers.get("content-length") || 0);

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        statusText: response.statusText,
        finalUrl,
        contentType,
        bytes,
        elapsedMs: Date.now() - startedAt,
        error: `HTTP ${response.status} ${response.statusText}`
      };
    }

    if (!contentType.includes("text/html")) {
      return {
        ok: true,
        status: response.status,
        finalUrl,
        contentType,
        bytes,
        elapsedMs: Date.now() - startedAt,
        note: "Non-HTML resource; metadata recorded without copying content."
      };
    }

    const html = await response.text();
    return {
      ok: true,
      status: response.status,
      finalUrl,
      contentType,
      bytes: html.length,
      elapsedMs: Date.now() - startedAt,
      title: extractFirst(html, /<title[^>]*>([\s\S]*?)<\/title>/i),
      h1: extractFirst(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i),
      description: extractMetaDescription(html),
      headings: extractHeadings(html)
    };
  } catch (error) {
    return {
      ok: false,
      elapsedMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

const cardFor = (source, result) => {
  const headingLines = (result.headings || [])
    .map((heading) => `${"  ".repeat(heading.level - 1)}- ${heading.text}`)
    .join("\n");

  return `# ${source.title}

URL: ${source.url}
Access date: ${accessDate}
Fetch status: ${result.ok ? "ok" : "failed"}${result.status ? ` (${result.status})` : ""}
Final URL: ${result.finalUrl || "n/a"}
Content type: ${result.contentType || "unknown"}

## Repository Summary

${source.summary}

## Tags

${source.tags.map((tag) => `- ${tag}`).join("\n")}

## Retrieved Metadata

- Page title: ${result.title || "not retrieved"}
- H1: ${result.h1 || "not retrieved"}
- Meta description: ${result.description || "not retrieved"}
- Size recorded: ${result.bytes || 0} bytes
- Retrieval time: ${result.elapsedMs} ms

## Retrieved Headings

${headingLines || "No headings retrieved. The page may be non-HTML, JavaScript-rendered, blocked, or a document file."}

## Notes

${result.note || result.error || "Content was summarised by metadata/headings only; do not copy full source text into this repository."}
`;
};

const results = [];

for (const source of sources) {
  const result = await safeFetch(source);
  const slugBase = slugify(source.title) || createHash("sha1").update(source.url).digest("hex").slice(0, 10);
  const file = `${outDir}/${slugBase}.md`;
  await writeFile(file, cardFor(source, result));
  results.push({ ...source, retrieval: result, card: file });
}

const index = `# Retrieved Source Pack

Access date: ${accessDate}

This folder stores source cards generated from the public links in \`data/sources.json\`.

The cards intentionally record metadata, redirects, headings, and short repository summaries rather than copying full page text.

## Cards

${results.map((item) => `- [${item.title}](source-cards/${item.card.split("/").pop()}) - ${item.retrieval.ok ? "ok" : "failed"}${item.retrieval.status ? ` (${item.retrieval.status})` : ""}`).join("\n")}
`;

await writeFile("research/index.md", index);
await writeFile("research/retrieval-report.json", JSON.stringify({ accessDate, results }, null, 2));

const okCount = results.filter((item) => item.retrieval.ok).length;
console.log(`Retrieved ${okCount}/${results.length} sources into research/`);
