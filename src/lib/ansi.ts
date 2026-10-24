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
