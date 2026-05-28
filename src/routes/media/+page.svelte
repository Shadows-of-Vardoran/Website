<script lang="ts">
  import { onMount } from 'svelte';
  import MasonryGallery from '$lib/components/MasonryGallery.svelte';
  import type { MediaItem } from '$lib/components/types';

  let allItems = $state<MediaItem[]>([]);
  let measuredItems = $state<MediaItem[]>([]);
  let loading = $state(true);
  let hasMore = $state(false);
  let currentBatch = 0;
  const BATCH_SIZE = 20;

  let scrollContainerEl: HTMLElement;
  let sentinelEl: HTMLElement;

  function measureImage(src: string): Promise<{ w: number; h: number }> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
      img.onerror = () => resolve({ w: 16, h: 9 });
      img.src = src;
    });
  }

  async function measureBatch(startIndex: number): Promise<MediaItem[]> {
    const batch = allItems.slice(startIndex, startIndex + BATCH_SIZE);
    return Promise.all(
      batch.map(async (item) => {
        if (item.type === 'video') {
          if (item.poster) {
            const { w, h } = await measureImage(item.poster);
            return { ...item, width: w, height: h };
          }
          return { ...item, width: 16, height: 9 };
        }
        const { w, h } = await measureImage(item.src);
        return { ...item, width: w, height: h };
      })
    );
  }

  async function loadMore() {
    if (currentBatch >= allItems.length) {
      hasMore = false;
      return;
    }
    const measured = await measureBatch(currentBatch);
    measuredItems = [...measuredItems, ...measured];
    currentBatch += BATCH_SIZE;
    hasMore = currentBatch < allItems.length;
  }

  onMount(async () => {
    try {
      const res = await fetch('/content/media/media-index.json');
      allItems = await res.json();
      await loadMore();
    } catch {
      allItems = [];
    } finally {
      loading = false;
    }
  });

  $effect(() => {
    if (!sentinelEl || !scrollContainerEl) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { root: scrollContainerEl, rootMargin: '200px' }
    );
    observer.observe(sentinelEl);
    return () => observer.disconnect();
  });
</script>

<div class="w-full h-full overflow-y-auto scrollbar-hidden" bind:this={scrollContainerEl}>
  <div class="p-4 min-h-full">
    {#if loading}
      <div class="w-full flex items-center justify-center h-64">
        <span class="text-2xl font-cinzel text-tprimary-600 animate-pulse">Loading</span>
      </div>
    {:else if !measuredItems.length}
      <div class="w-full flex items-center justify-center h-64">
        <span class="text-2xl font-cinzel text-tprimary-600">No media yet</span>
      </div>
    {:else}
      <MasonryGallery items={measuredItems} />
    {/if}

    <div bind:this={sentinelEl} class="h-1"></div>
  </div>
</div>
