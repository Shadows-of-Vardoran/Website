<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { scale } from 'svelte/transition';
  import brBorderDecoration2 from '$lib/assets/br_border_decoration_2.png';

  import { useMarked } from '$lib/useMarked';
  const { parse, slugify } = useMarked();

  interface Guide {
    title: string;
    description: string;
    content: string;
    slug: string;
  }

  let guides: Guide[] = [];
  let expandedGuide: number | null = null;
  let contentDiv: HTMLDivElement | null = null;

  function expandGuide(i: number) {
    expandedGuide = i;
    window.location.hash = guides[i].slug;
    tick().then(() => {
      if (contentDiv) {
        contentDiv.innerHTML = guides[i].content;
      }
    });
  }

  function closeGuide() {
    expandedGuide = null;
    window.location.hash = '';
  }

  onMount(async () => {
    const indexRes = await fetch('/content/guides/guides-index.json');
    const guideFiles: string[] = await indexRes.json();

    guides = await Promise.all(
      guideFiles.map(async (filename) => {
        const slug = filename.replace(/\.json$/, '');
        const res = await fetch(`/content/guides/${filename}`);
        const data = await res.json();
        data.content = parse(data.content);
        return { ...data, slug };
      })
    );

    // If hash is present, select corresponding guide
    if (window.location.hash) {
      const hashSlug = window.location.hash.replace('#', '');
      const idx = guides.findIndex((g) => g.slug === hashSlug);
      if (idx !== -1) expandGuide(idx);
    }
  });
</script>

<div class="w-full h-full relative">
  <div class="flex flex-wrap gap-4 h-full pt-6 pb-3 px-3">
    {#each guides as guide, i}
      <div
        class="w-64 h-64 opacity-100 animate {expandedGuide === i ? 'absolute inset-0 w-full h-full z-10 pt-6 pb-3 px-3' : 'relative'} {expandedGuide !== null &&
        expandedGuide !== i
          ? 'opacity-0!'
          : ''}"
      >
        <button on:click={() => expandGuide(i)} class="absolute inset-0 animate opacity-100 {expandedGuide === i ? 'opacity-0! px-3 py-6' : ''}">
          <div class="flex flex-col bg-background-900/60 h-full px-3 py-4 card-border border-2">
            <div class="text-2xl">{guide.title}</div>
            <div class="text-lg grow mt-6 text-left">{guide.description}</div>
            <img
              src={brBorderDecoration2}
              alt="Bottom Right Border Decoration"
              class="absolute bottom-0 right-0 w-26 border-decoration-color translate-x-[2px] translate-y-[3px] pointer-events-none z-30"
            />
          </div>
        </button>

        {#if expandedGuide === i}
          <div
            class="flex flex-col w-full h-full relative px-4 py-3 content-border border-2 bg-linear-330 from-3% from-transparent via-4% via-background-900/95 to-transparent to-300%"
          >
            <div class="flex justify-between items-center border-b-2 border-background-200 pb-2">
              <h2 class="text-2xl font-bold text-white">{guide.title}</h2>
              <button on:click={closeGuide} class="text-white text-2xl z-10">close</button>
            </div>
            <div class="overflow-y-auto scrollbar-hidden marked pt-2">{@html guide.content}</div>
            <img
              src={brBorderDecoration2}
              alt="Bottom Right Border Decoration"
              class="absolute bottom-0 right-0 w-26 border-decoration-color translate-x-[4px] translate-y-[5px] pointer-events-none z-30"
            />
          </div>
        {/if}
      </div>

      {#if expandedGuide === i}
        <div class="w-64 h-64"></div>
      {/if}
    {/each}
  </div>
</div>

<!-- <div class="w-64 h-64 bg-red-500 opacity-100 animate {expandedGuide === i ? 'absolute w-full h-full z-10 py-6 px-3' : 'relative'}">
  <button on:click={() => expandGuide(i)} class="absolute inset-0 bg-info-0 opacity-100 {expandedGuide === i ? 'opacity-0!' : ''}"> testing thing </button>
  {#if expandedGuide === i}
    <div class="flex flex-col bg-background-900 w-full h-full relative px-4 py-3">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold text-white">{guide.title}</h2>
        <button on:click={closeGuide} class="text-white text-2xl z-10">close</button>
      </div>
      <div bind:this={contentDiv}></div>
    </div>
  {/if}
</div> -->

<style>
  .animate {
    transition:
      width 0.3s ease-in-out,
      height 0.3s ease-in-out,
      opacity 0.6s ease-in-out;
  }

  .border-decoration-color {
    filter: invert(70%);
  }

  .card-border {
    border-image: linear-gradient(-45deg, transparent 10%, var(--color-tprimary-900) 14%, transparent 75%) 1;
  }

  .content-border {
    border-image: linear-gradient(-45deg, transparent 2%, var(--color-tprimary-900) 3%, transparent 75%) 1;
  }

  .content-background {
    background: linear-gradient(-45deg, transparent 2%, var(--color-background-900) 5%, var(--color-background-900) 95%, transparent 98%);
  }
</style>
