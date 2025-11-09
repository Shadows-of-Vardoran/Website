<script lang="ts">
  import { onMount } from 'svelte';
  import { marked } from 'marked';

  let html: string | Promise<string> = '';
  let headings: { text: string; id: string; level: number }[] = [];

  function slugify(text: string) {
    return text
      .toLowerCase()
      .replace(/[^\w]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  onMount(async () => {
    const res = await fetch('/content/rules.md');
    const md = await res.text();

    // Extract headings for sidebar
    headings = [];
    const headingRegex = /^(#{1,6})\s+(.*)$/gm;
    let match;
    while ((match = headingRegex.exec(md))) {
      const level = match[1].length;
      const text = match[2].replace(/\*\*|\*/g, '').trim();
      const id = slugify(text);
      headings.push({ text, id, level });
    }

    // Custom renderer to add IDs to headings
    const renderer = new marked.Renderer();
    renderer.heading = ({ tokens, depth }) => {
      // tokens is an array of inline tokens; join their raw text
      const safeText = tokens
        .map((t) => t.raw || '')
        .join('')
        .replace(/\*\*|\*/g, '')
        .trim();
      const id = slugify(safeText);
      return `<h${depth} id="${id}">${safeText}</h${depth}>`;
    };

    html = marked(md, { renderer });
  });
</script>

<div class="flex h-full">
  <aside class="p-4 min-w-[220px]">
    <nav>
      {#each headings as h}
        <div style="margin-left: {(h.level - 1) * 12}px;">
          <a href={'#' + h.id} class="block py-1 hover:text-tprimary">{h.text}</a>
        </div>
      {/each}
    </nav>
  </aside>

  <main class="flex flex-col p-8 overflow-y-auto">
    {@html html}
  </main>
</div>
