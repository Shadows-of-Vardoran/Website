<script lang="ts">
  import { onMount } from 'svelte';

  import ScrollIndicator from '$lib/components/ScrollIndicator.svelte';
  import brBorderDecoration2 from '$lib/assets/br_border_decoration_2.png';
  import separator3 from '$lib/assets/separator_3.png';

  import { useMarked } from '$lib/useMarked';
  const { parse, slugify } = useMarked();

  // Static import of tab definitions (replace with dynamic import if needed)
  // If you have a helper to load YAML, use that instead.
  const loreTabs = [
    {
      name: 'history-of-vardoran',
      label: 'History of Vardoran',
      path: '/content/lore-history-of-vardoran.md',
      scrambled: false,
    },
    {
      name: 'species',
      label: 'Species',
      path: '/content/lore-species.md',
      scrambled: true,
    },
    {
      name: 'beyond-vardoran',
      label: 'Beyond Vardoran',
      path: '/content/lore-beyond-vardoran.md',
      scrambled: true,
    },
    {
      name: 'religions',
      label: 'Religions',
      path: '/content/lore-religions.md',
      scrambled: true,
    },
    {
      name: 'realms',
      label: 'Realms',
      path: '/content/lore-realms.md',
      scrambled: true,
    },
  ];

  let selectedTab = loreTabs[0];
  let content = '';
  let headings: { text: string; id: string; level: number }[] = [];
  let scrollElement: HTMLElement | null = null;
  let scrambled = false; // Set to true to apply 'font-aelfa' class

  async function loadContent(tab: any) {
    const res = await fetch(tab.path);
    let md = await res.text();

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

    content = await parse(md);
    scrambled = tab.scrambled;
  }

  onMount(() => {
    loadContent(selectedTab);
  });

  function selectTab(tab: any) {
    selectedTab = tab;
    loadContent(tab);
  }
</script>

<div class="flex flex-col h-full w-full bg-background-900/50">
  <!-- Tab Navigation -->
  <div class="relative px-8 mt-3">
    <div class="flex gap-4 mb-4 px-10">
      {#each loreTabs as tab}
        <button
          class="px-4 font-semibold rounded-t bg-gray-800 text-white hover:bg-gray-700 transition-colors cursor-pointer {tab.scrambled ? 'font-aelfa' : ''}"
          class:selected={tab === selectedTab}
          on:click={() => selectTab(tab)}
        >
          {tab.label}
        </button>
      {/each}
    </div>

    <div class="flex justify-center border-b-6 border-background-300 rounded-4xl h-10 -mt-[47px]">
      <img src={separator3} alt="Separator" class="tabs-separator h-8 mt-[35px]" />
    </div>
  </div>

  <div class="flex flex-1 overflow-hidden">
    <div class="flex flex-col relative w-full {scrambled ? 'font-aelfa' : ''}">
      {#if scrollElement}
        <ScrollIndicator {scrollElement} direction="up" />
      {/if}
      <div bind:this={scrollElement} class="overflow-y-auto p-8 scrollbar-hidden marked">
        {@html content}
      </div>
      {#if scrollElement}
        <ScrollIndicator {scrollElement} direction="down" />
      {/if}
    </div>

    <!-- Right Nav Bar -->
    <aside class="min-w-60 z-40 relative mt-5 mr-5 mb-5 border-b-2 border-l-2 border-testing right-nav {scrambled ? 'font-aelfa' : ''}">
      <nav class="scrollbar-left h-full p-4 pb-24 rounded-lg bg-background-0/10 z-10 overflow-y-auto relative">
        {#each headings as h}
          <div style="margin-left: {(h.level - 1) * 12}px;">
            <a href={'#' + h.id} class="block py-1 text-tprimary-800 hover:text-tprimary {h.level == 3 ? 'text-md' : ''}">
              {h.text}
            </a>
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
</div>

<style>
  button.selected {
    background-color: #222;
    border-bottom: 2px solid #e53e3e;
    color: #e53e3e;
  }

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

  .tabs-separator {
    filter: invert(70%);
  }
</style>
