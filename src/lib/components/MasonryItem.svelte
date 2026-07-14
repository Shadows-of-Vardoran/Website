<script lang="ts">
  import type { MediaItem } from './types';

  let { item }: { item: MediaItem } = $props();

  function observeVideo(node: HTMLVideoElement) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          node.play().catch(() => {});
        } else {
          node.pause();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(node);
    return { destroy: () => observer.disconnect() };
  }
</script>

{#if item.type === 'video'}
  <div class="masonry-item relative overflow-visible cursor-pointer group">
    <div class="masonry-media-wrap">
      <video src={item.src} poster={item.poster} muted loop playsinline class="w-full h-full object-cover" use:observeVideo></video>
    </div>
    <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
      <i class="mdi mdi-play-circle-outline text-4xl text-white/70"></i>
    </div>
    <img src="/assets/image_tl_corner.png" alt="" class="masonry-corner-tl pointer-events-none" />
    <img src="/assets/image_br_corner.png" alt="" class="masonry-corner-br pointer-events-none" />
    {#if item.caption}
      <div
        class="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300 flex items-start justify-center p-3 opacity-0 group-hover:opacity-100 pointer-events-none"
      >
        <span class="text-tprimary-50 text-sm font-cinzel">{item.caption}</span>
      </div>
    {/if}
    {#if item.author}
      <div class="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm rounded px-2 py-0.5 pointer-events-none z-10">
        <span class="text-xs text-white/90 font-cinzel">by {item.author}</span>
      </div>
    {/if}
  </div>
{:else}
  <div class="masonry-item relative overflow-visible cursor-pointer group">
    <div class="masonry-media-wrap">
      <img src={item.src} alt={item.alt} class="w-full h-full object-cover" loading="lazy" />
    </div>
    <img src="/assets/image_tl_corner.png" alt="" class="masonry-corner-tl pointer-events-none" />
    <img src="/assets/image_br_corner.png" alt="" class="masonry-corner-br pointer-events-none" />
    {#if item.caption}
      <div
        class="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300 flex items-start justify-center p-3 opacity-0 group-hover:opacity-100 pointer-events-none"
      >
        <span class="text-tprimary-50 text-sm font-cinzel">{item.caption}</span>
      </div>
    {/if}
    {#if item.author}
      <div class="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm rounded px-2 py-0.5 pointer-events-none z-10">
        <span class="text-xs text-white/90 font-cinzel">by {item.author}</span>
      </div>
    {/if}
  </div>
{/if}

<style>
  .masonry-item {
    border: 3px solid;
    border-image: linear-gradient(to bottom right, transparent 5%, white 6%, white 94%, transparent 95%) 1;
  }

  .masonry-media-wrap {
    max-height: 400px;
    overflow: hidden;
  }

  .masonry-corner-tl {
    position: absolute;
    width: 60px;
    top: -6px;
    left: -6px;
    filter: invert(90%);
  }

  .masonry-corner-br {
    position: absolute;
    width: 60px;
    bottom: -6px;
    right: -6px;
    filter: invert(90%);
  }
</style>
