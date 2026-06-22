export function splitSections(md: string): Record<string, string> {
  const result: Record<string, string> = {};
  const parts = md.split(/<!--\s*section:([a-z0-9-]+)\s*-->/g);
  for (let i = 1; i < parts.length; i += 2) {
    const key = parts[i];
    const content = (parts[i + 1] || '').trim();
    result[key] = content;
  }
  return result;
}

export function reconstructContent(sections: Record<string, string>, sectionOrder: string[]): string {
  return sectionOrder
    .filter((key) => sections[key] !== undefined && sections[key] !== '')
    .map((key) => `<!-- section:${key} -->\n${sections[key]}`)
    .join('\n\n');
}
