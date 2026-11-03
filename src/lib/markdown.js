const HEADING = /^(#{2,3})\s+(.+)$/;
const IMAGE = /^!\[([^\]]*)\]\((\S+)(?:\s+"([^"]*)")?\)$/;
const EMBED = /^@\[(video|youtube)\]\((\S+)(?:\s+([^\s"]+))?(?:\s+"([^"]*)")?\)$/;
const BULLET = /^\s*[-*]\s+/;
const NUMBERED = /^\s*\d+\.\s+/;

// Turns the Markdown subset used by posts (documented in src/data/blogData.js) into the
// block list PostContent renders. A string block is a paragraph.
export function markdownToBlocks(text = "") {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const blocks = [];
  let paragraph = [];

  const flush = () => {
    if (paragraph.length > 0) {
      blocks.push(paragraph.join(" "));
      paragraph = [];
    }
  };

  for (let i = 0; i < lines.length; i += 1) {
    const trimmed = lines[i].trim();
    let match;

    if (trimmed.startsWith("```")) {
      flush();
      const code = [];
      for (i += 1; i < lines.length && !lines[i].trim().startsWith("```"); i += 1) {
        code.push(lines[i]);
      }
      blocks.push({ type: "code", language: trimmed.slice(3).trim(), code: code.join("\n") });
    } else if (!trimmed) {
      flush();
    } else if ((match = trimmed.match(HEADING))) {
      flush();
      blocks.push({ type: match[1].length === 2 ? "h2" : "h3", text: match[2] });
    } else if ((match = trimmed.match(IMAGE))) {
      flush();
      blocks.push({ type: "image", alt: match[1], src: match[2], caption: match[3] });
    } else if ((match = trimmed.match(EMBED))) {
      flush();
      blocks.push(
        match[1] === "youtube"
          ? { type: "youtube", id: match[2], title: match[4] }
          : { type: "video", src: match[2], poster: match[3], caption: match[4] }
      );
    } else if (BULLET.test(trimmed) || NUMBERED.test(trimmed)) {
      flush();
      const marker = BULLET.test(trimmed) ? BULLET : NUMBERED;
      const items = [];
      for (; i < lines.length && marker.test(lines[i]); i += 1) {
        items.push(lines[i].replace(marker, "").trim());
      }
      i -= 1;
      blocks.push({ type: marker === BULLET ? "ul" : "ol", items });
    } else if (trimmed.startsWith(">")) {
      flush();
      const quote = [];
      for (; i < lines.length && lines[i].trim().startsWith(">"); i += 1) {
        quote.push(lines[i].trim().replace(/^>\s?/, ""));
      }
      i -= 1;
      blocks.push({ type: "quote", text: quote.join(" ") });
    } else {
      paragraph.push(trimmed);
    }
  }

  flush();
  return blocks;
}
