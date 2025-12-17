<script lang="ts">
  import { onMount } from 'svelte';
  import { marked } from 'marked';
  import markedAlert from 'marked-alert';

  import brBorderDecoration2 from '$lib/assets/br_border_decoration_2.png';
  import ScrollIndicator from '$lib/components/ScrollIndicator.svelte';

  let html: string | Promise<string> = '';
  let headings: { text: string; id: string; level: number }[] = [];
  let scrollElement: HTMLElement | null = null;

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
    marked.use(markedAlert());
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

    // we want to replace bullet points with a custom icon
    renderer.listitem = (token) => {
      // Render the tokens as HTML
      const html = Array.isArray(token.tokens) ? marked.parser(token.tokens) : String(token.text || '');
      return `<li class="list-none flex items-start mb-2">
            <span class="inline-block w-3 h-3 mt-[0.4rem] mr-2 bg-tprimary-500 rounded-xs flex-shrink-0"></span>
            <span class="flex-grow">${html}</span>
          </li>`;
    };

    html = marked(md, { renderer });
  });
</script>

<div class="flex w-full h-full bg-background-900/50 overflow-hidden">
  <main class="flex flex-col relative w-full">
    {#if scrollElement}
      <ScrollIndicator {scrollElement} direction="up" />
    {/if}
    <div bind:this={scrollElement} class="flex flex-col overflow-y-auto p-8 scrollbar-hidden marked">
      {@html html}
    </div>
    {#if scrollElement}
      <ScrollIndicator {scrollElement} direction="down" />
    {/if}
  </main>

  <aside class="min-w-60 z-40 relative mt-5 mr-5 mb-5 border-b-2 border-l-2 border-testing right-nav">
    <nav class="scrollbar-left h-full p-4 pb-24 rounded-lg bg-background-0/10 z-10 overflow-y-auto relative">
      {#each headings as h}
        <div style="margin-left: {(h.level - 1) * 12}px;">
          <a href={'#' + h.id} class="block py-1 text-tprimary-800 hover:text-tprimary {h.level == 3 ? 'text-md' : ''}">{h.text}</a>
        </div>
      {/each}
    </nav>
    <div class="pointer-events-none absolute left-0 right-0 bottom-0 h-26 z-20 fade-bottom"></div>
    <img
      src={brBorderDecoration2}
      alt="Bottom Right Border Decoration"
      class="absolute bottom-0 left-0 w-26 border-decoration-color -scale-x-100 -translate-x-[4px] translate-y-[5px] pointer-events-none z-30"
    />
  </aside>
</div>

<style>
  .border-decoration-color {
    filter: invert(70%); /* sepia(83%) saturate(7463%) hue-rotate(356deg) brightness(91%) contrast(101%); */
  }

  .border-testing {
    border-image: linear-gradient(50deg, transparent 6%, var(--color-tprimary-900) 7%, transparent 75%) 1;
  }

  /* language: css */
  .scrollbar-left {
    direction: rtl;
  }

  .scrollbar-left > * {
    direction: ltr;
    text-align: left;
  }

  .fade-bottom {
    background: linear-gradient(to bottom, transparent, black); /* adjust color to match bg */
  }

  @media (max-width: 1340px) {
    .right-nav {
      display: none;
    }
  }
</style>
