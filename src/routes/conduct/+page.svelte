<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  import brBorderDecoration2 from '$lib/assets/br_border_decoration_2.png';
  import ScrollIndicator from '$lib/components/ScrollIndicator.svelte';

  import { useMarked } from '$lib/useMarked';
  import { splitSections, reconstructContent } from '$lib/split-sections';
  import EditableSection from '$lib/components/EditableSection.svelte';
  import { getIsAdmin, getCmsPat } from '$lib/stores/admin.svelte';
  import { saveContent, buildCommitMessage } from '$lib/github-save';

  const { parse, slugify } = useMarked();

  let sections = $state<Record<string, string>>({});
  let rawContent = $state('');
  let html = $state('');
  let headings = $state<{ text: string; id: string; level: number }[]>([]);
  let scrollElement = $state<HTMLElement | null>(null);
  let saveError = $state('');

  const FILE_PATH = 'static/content/conduct/page.md';

  function extractHeadings(md: string): { text: string; id: string; level: number }[] {
    const result: { text: string; id: string; level: number }[] = [];
    const headingRegex = /^(#{1,6})\s+(.*)$/gm;
    let match;
    while ((match = headingRegex.exec(md))) {
      const level = match[1].length;
      const text = match[2].replace(/\*\*|\*/g, '').trim();
      const id = slugify(text);
      result.push({ text, id, level });
    }
    return result;
  }

  async function onSectionSave(key: string, md: string) {
    rawContent = md;
    html = await parse(md || '');
    headings = extractHeadings(md);

    const full = reconstructContent({ [key]: md }, [key]);

    if (import.meta.env.DEV) {
      await fetch('/__cms-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: FILE_PATH, content: full }),
      });
      return;
    }

    const pat = getCmsPat();
    if (pat) {
      const msg = buildCommitMessage(FILE_PATH);
      const result = await saveContent(FILE_PATH, full, msg, pat);
      if (result.ok) {
        saveError = '';
      } else {
        saveError = result.error || 'Save failed';
        setTimeout(() => {
          saveError = '';
        }, 6000);
      }
    }
  }

  onMount(async () => {
    const res = await fetch('/content/conduct/page.md');
    const md = await res.text();

    sections = splitSections(md);
    rawContent = sections.content || md;

    headings = extractHeadings(rawContent);

    html = await parse(rawContent || '');

    if (browser) {
      const hash = window.location.hash.slice(1);
      if (hash) {
        requestAnimationFrame(() => {
          const target = document.getElementById(hash);
          if (target && scrollElement) {
            scrollElement.scrollTop = target.offsetTop - scrollElement.offsetTop;
          }
        });
      }
    }
  });
</script>

<div class="flex w-full h-full bg-background-900/50 overflow-hidden">
  <main class="flex flex-col relative w-full">
    {#if scrollElement}
      <ScrollIndicator {scrollElement} direction="up" />
    {/if}
    <div bind:this={scrollElement} class="flex flex-col overflow-y-auto p-8 scrollbar-hidden marked">
      <EditableSection filePath={FILE_PATH} sectionKey="content" {rawContent} onsave={onSectionSave}>
        {@html html}
      </EditableSection>
    </div>
    {#if scrollElement}
      <ScrollIndicator {scrollElement} direction="down" />
    {/if}
  </main>

  <aside class="min-w-64 z-40 relative mt-5 mb-5 border-b-2 border-l-2 border-testing right-nav">
    <nav class="scrollbar-left h-full p-4 pr-6 pb-24 rounded-lg bg-background-0/10 z-10 overflow-y-auto relative">
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

{#if saveError}
  <div class="fixed bottom-20 right-4 z-50 px-4 py-2 bg-error-900 text-white text-sm rounded shadow-lg border border-error-700 max-w-sm">
    <i class="mdi mdi-alert-circle mr-1"></i>Save failed: {saveError}
  </div>
{/if}

<style>
  .border-decoration-color {
    filter: invert(70%);
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
    background: linear-gradient(to bottom, transparent, black);
  }

  @media (max-width: 1340px) {
    .right-nav {
      display: none;
    }
  }
</style>
