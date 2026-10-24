export interface AnsiRun {
  text: string;
  color?: string;
  background?: string;
}

/** Parse UTF-8 artwork's SGR true-color runs as text, without interpreting HTML. */
export function parseAnsi(content: string): AnsiRun[] {
  const runs: AnsiRun[] = [];
  const sgr = /\x1b\[([\d;]*)m/g;
  let color: string | undefined;
  let background: string | undefined;
  let offset = 0;

  for (const match of content.matchAll(sgr)) {
    if (match.index > offset) runs.push({ text: content.slice(offset, match.index), color, background });
    const codes = (match[1] || "0").split(";").map(Number);
    for (let i = 0; i < codes.length; i++) {
      const code = codes[i];
      if (code === 0) { color = undefined; background = undefined; }
      else if (code === 39) color = undefined;
      else if (code === 49) background = undefined;
      else if ((code === 38 || code === 48) && codes[i + 1] === 2 && codes.length >= i + 5) {
        const channels = codes.slice(i + 2, i + 5);
        if (channels.every((channel) => channel >= 0 && channel <= 255)) {
          const value = `rgb(${channels.join(",")})`;
          if (code === 38) color = value;
          else background = value;
        }
        i += 4;
      }
    }
    offset = match.index + match[0].length;
  }
  if (offset < content.length) runs.push({ text: content.slice(offset), color, background });
  return runs;
}

/** Reuse a framed screen's own copy for a reflowing mobile layout. */
export function splitFramedAnsiPage(content: string) {
  const rawLines = content.replace(/\r\n/g, "\n").replace(/\n$/, "").split("\n");
  const lines = parseAnsi(content).map((run) => run.text).join("")
    .replace(/\r\n/g, "\n").replace(/\n$/, "").split("\n");
  const dividers = lines.flatMap((line, index) => /^╠═+╣$/.test(line) ? [index] : []);
  if (dividers.length !== 3 || !/^╔═+╗$/.test(lines[0]) || !/^╚═+╝$/.test(lines.at(-1) || "")) return null;

  const unframe = (line: string) => Array.from(line).slice(2, -2).join("").trim();
  const paragraphs: string[] = [];
  let paragraph = "";
  for (const line of lines.slice(dividers[1] + 1, dividers[2])) {
    const text = unframe(line);
    if (text) paragraph += (paragraph ? " " : "") + text;
    else if (paragraph) { paragraphs.push(paragraph); paragraph = ""; }
  }
  if (paragraph) paragraphs.push(paragraph);
  const footer = lines.slice(dividers[2] + 1, -1).map(unframe).filter(Boolean);
  const url = footer.find((line) => /^https?:\/\/\S+$/.test(line));
  if (!paragraphs.length || !url) return null;

  return {
    art: rawLines.slice(0, dividers[1] + 1).join("\n"),
    artRows: dividers[1] + 1,
    header: rawLines.slice(1, dividers[0]).join("\n"),
    headerRows: dividers[0] - 1,
    picture: rawLines.slice(dividers[0] + 1, dividers[1]).join("\n"),
    pictureRows: dividers[1] - dividers[0] - 1,
    heading: paragraphs[0],
    paragraphs: paragraphs.slice(1),
    callout: footer.find((line) => line !== url)?.replace(/^[▓▒░\s]+|[▓▒░\s]+$/g, ""),
    url,
  };
}
