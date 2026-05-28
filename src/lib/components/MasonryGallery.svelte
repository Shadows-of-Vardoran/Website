<script lang="ts">
  import PhotoSwipeLightbox from 'photoswipe/lightbox';
  import 'photoswipe/style.css';
  import MasonryItem from './MasonryItem.svelte';
  import type { MediaItem } from './types';

  let { items }: { items: MediaItem[] } = $props();

  let containerEl: HTMLElement;
  let containerWidth = $state(0);
  let columnCount = $derived(containerWidth < 500 ? 2 : containerWidth < 900 ? 3 : containerWidth < 1400 ? 4 : 5);
  let columns = $state<MediaItem[][]>([]);

  const GAP = 12;

  function getColumnWidth() {
    return (containerWidth - (columnCount - 1) * GAP) / columnCount;
  }

  $effect(() => {
    if (!items.length || !containerWidth) {
      columns = [];
      return;
    }
    const colWidth = getColumnWidth();
    const cols: MediaItem[][] = Array.from({ length: columnCount }, () => []);
    const colHeights = new Array(columnCount).fill(0);

    for (const item of items) {
      if (!item.width || !item.height) continue;
      const shortest = colHeights.indexOf(Math.min(...colHeights));
      const estHeight = (colWidth * item.height) / item.width + GAP;
      cols[shortest].push(item);
      colHeights[shortest] += estHeight;
    }

    columns = cols;
  });

  function initLightbox(node: HTMLElement) {
    const lightbox = new PhotoSwipeLightbox({
      gallery: node,
      children: 'a',
      pswpModule: () => import('photoswipe'),
      bgOpacity: 0.95,
      padding: { top: 60, bottom: 40, left: 40, right: 40 },
      showHideAnimationType: 'zoom',
    });

    lightbox.on('contentLoad', (e) => {
      const { content } = e;
      if (content.data?.type === 'video') {
        e.preventDefault();
        const videoEl = document.createElement('video');
        videoEl.src = content.data.element?.dataset.videoSrc || content.data.src || '';
        videoEl.poster = content.data.src || '';
        videoEl.controls = true;
        videoEl.autoplay = true;
        videoEl.style.maxWidth = '100%';
        videoEl.style.maxHeight = '100%';
        const container = document.createElement('div');
        container.className = 'pswp__video-container';
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.justifyContent = 'center';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.background = 'black';
        container.appendChild(videoEl);
        content.element = container;
        content.onLoaded();
      }
    });

    lightbox.init();

    return {
      destroy() {
        lightbox.destroy();
      },
    };
  }

  let resizeTimeout: ReturnType<typeof setTimeout>;

  $effect(() => {
    if (!containerEl) return;
    containerWidth = containerEl.clientWidth;
    const observer = new ResizeObserver((entries) => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        containerWidth = entries[0].contentRect.width;
      }, 150);
    });
    observer.observe(containerEl);
    return () => {
      observer.disconnect();
      clearTimeout(resizeTimeout);
    };
  });
</script>

<div class="flex gap-3 w-full" bind:this={containerEl} use:initLightbox>
  {#each columns as col}
    <div class="flex flex-col gap-3 flex-1 min-w-0">
      {#each col as item}
        <a
          href={item.type === 'video' ? item.poster || item.src : item.src}
          data-pswp-width={item.width || 16}
          data-pswp-height={item.height || 9}
          data-pswp-type={item.type === 'video' ? 'video' : undefined}
          data-video-src={item.type === 'video' ? item.src : undefined}
          data-pswp-caption={item.caption || undefined}
          class="block overflow-visible group"
        >
          <MasonryItem {item} />
        </a>
      {/each}
    </div>
  {/each}
</div>

<style>
  :global(.pswp__bg) {
    background: var(--color-background-0) !important;
  }

  :global(.pswp__button--arrow--left::before),
  :global(.pswp__button--arrow--right::before) {
    color: var(--color-red-500) !important;
  }

  :global(.pswp__counter) {
    color: var(--color-tprimary-50) !important;
    font-family: 'Cinzel', serif !important;
  }

  :global(.pswp__caption__center) {
    color: var(--color-tprimary-50) !important;
    font-family: 'Cinzel', serif !important;
  }

  :global(.pswp__top-bar) {
    background: rgba(13, 13, 13, 0.6) !important;
  }

  :global(.pswp__button--close) {
    color: var(--color-red-500) !important;
  }
</style>
