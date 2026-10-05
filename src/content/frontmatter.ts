/** Minimal frontmatter parser: `key: value` lines and `[a, b]` inline lists. */
export function parseFrontmatter(raw: string): {
  data: Record<string, unknown>;
  body: string;
} {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw);
  if (!m) throw new Error('missing frontmatter');
  const data: Record<string, unknown> = {};
  for (const line of (m[1] ?? '').split(/\r?\n/)) {
    if (!line.trim()) continue;
    const i = line.indexOf(':');
    if (i < 1) throw new Error(`bad frontmatter line: ${line}`);
    const key = line.slice(0, i).trim();
    const val = line
      .slice(i + 1)
      .trim()
      .replace(/^(['"])(.*)\1$/, '$2');
    data[key] =
      val.startsWith('[') && val.endsWith(']')
        ? val
            .slice(1, -1)
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : val;
  }
  return { data, body: m[2] ?? '' };
}
