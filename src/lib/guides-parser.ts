interface Guide {
  slug: string;
  title: string;
  description: string;
  content: string;
}

const GUIDE_RE = /<!--\s*guide:([a-z0-9-]+)\s*-->([\s\S]*?)<!--\s*\/guide\s*-->/g;
const TITLE_RE = /<!--\s*title:\s*(.*?)\s*-->/;
const DESC_RE = /<!--\s*description:\s*(.*?)\s*-->/;
const CONTENT_RE = /<!--\s*content\s*-->/;

export function parseGuides(raw: string): Guide[] {
  const guides: Guide[] = [];
  let match;
  while ((match = GUIDE_RE.exec(raw)) !== null) {
    const slug = match[1];
    const inner = match[2];

    const titleMatch = inner.match(TITLE_RE);
    const descMatch = inner.match(DESC_RE);
    const contentMatch = inner.match(CONTENT_RE);

    let content = '';
    if (contentMatch && contentMatch.index !== undefined) {
      const afterContent = inner.slice(contentMatch.index + contentMatch[0].length);
      content = afterContent.trim();
    }

    guides.push({
      slug,
      title: titleMatch ? titleMatch[1].trim() : '',
      description: descMatch ? descMatch[1].trim() : '',
      content,
    });
  }
  return guides;
}

export function reconstructGuides(guides: Guide[]): string {
  return guides
    .map((g) => {
      let section = `<!-- guide:${g.slug} -->\n`;
      section += `<!-- title: ${g.title} -->\n`;
      section += `<!-- description: ${g.description} -->\n`;
      section += `<!-- content -->\n\n`;
      section += g.content.trim();
      section += `\n\n<!-- /guide -->`;
      return section;
    })
    .join('\n\n');
}

export function buildEditableContent(guide: Guide): string {
  let content = `<!-- title: ${guide.title} -->\n`;
  content += `<!-- description: ${guide.description} -->\n`;
  content += `<!-- content -->\n\n`;
  content += guide.content.trim();
  return content;
}

export function parseEditableContent(raw: string): { title: string; description: string; content: string } {
  const titleMatch = raw.match(TITLE_RE);
  const descMatch = raw.match(DESC_RE);
  const contentMatch = raw.match(CONTENT_RE);

  let content = '';
  if (contentMatch && contentMatch.index !== undefined) {
    const afterContent = raw.slice(contentMatch.index + contentMatch[0].length);
    content = afterContent.trim();
  }

  return {
    title: titleMatch ? titleMatch[1].trim() : '',
    description: descMatch ? descMatch[1].trim() : '',
    content,
  };
}
