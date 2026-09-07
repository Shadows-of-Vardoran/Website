<script lang="ts">
  import { onMount } from 'svelte';
  import mapImg from '$lib/assets/Vardoran_blank_release_map.png';
  import { browser } from '$app/environment';

  interface MapDot {
    id: string;
    name: string;
    x: number;
    z: number;
    level: number;
    tags: string[];
  }

  let {
    dots,
    width = 6080,
    height = 6080,
    viewHeight = '520px',
    class: className = '',
  }: {
    dots: MapDot[];
    width?: number;
    height?: number;
    viewHeight?: string;
    class?: string;
  } = $props();

  const WORLD_BOUNDS = {
    minX: -2880,
    maxX: 160,
    minZ: -2400,
    maxZ: 640,
  };

  const TAG_COLORS: Record<string, string> = {
    vampire: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.9)]',
    mytt: 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.9)]',
    talam: 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.9)]',
    werewolf: 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.9)]',
    human: 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.9)]',
  };

  const DEFAULT_DOT_COLOR = 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.9)]';

  const MIN_SCALE = 0.1;
  const MAX_SCALE = 8;

  let containerEl = $state<HTMLDivElement | null>(null);
  let scale = $state(MIN_SCALE);
  let dragging = $state(false);
  let hoveredId = $state<string | null>(null);
  let dragLast = $state<{ x: number; y: number } | null>(null);
  let showNames = $state(true);

  let isFill = $derived(viewHeight === 'fill');

  function dotColorClass(dot: MapDot): string {
    for (const tag of dot.tags) {
      const color = TAG_COLORS[tag.toLowerCase()];
      if (color) return color;
    }
    return DEFAULT_DOT_COLOR;
  }

  onMount(() => {
    if (!browser) return;
    const el = containerEl;
    if (!el) return;
    el.scrollLeft = Math.max(0, (el.scrollWidth - el.clientWidth) / 2);
    el.scrollTop = Math.max(0, (el.scrollHeight - el.clientHeight) / 2);
  });

  function worldToPx(x: number, z: number): { px: number; py: number } {
    const px = ((x - WORLD_BOUNDS.minX) / (WORLD_BOUNDS.maxX - WORLD_BOUNDS.minX)) * width;
    const py = (1 - (z - WORLD_BOUNDS.minZ) / (WORLD_BOUNDS.maxZ - WORLD_BOUNDS.minZ)) * height;
    return { px, py };
  }

  function onWheel(e: WheelEvent) {
    e.preventDefault();
    const el = containerEl;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const factor = Math.exp(-e.deltaY * 0.0015);
    const nextScale = clamp(scale * factor, MIN_SCALE, MAX_SCALE);
    if (nextScale === scale) return;

    const worldX = (mx + el.scrollLeft) / scale;
    const worldY = (my + el.scrollTop) / scale;
    scale = nextScale;
    el.scrollLeft = worldX * nextScale - mx;
    el.scrollTop = worldY * nextScale - my;
  }

  function onPointerDown(e: PointerEvent) {
    if (e.button !== 0) return;
    dragging = true;
    dragLast = { x: e.clientX, y: e.clientY };
    const el = containerEl;
    if (el) el.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: PointerEvent) {
    if (dragging && dragLast && containerEl) {
      containerEl.scrollLeft -= e.clientX - dragLast.x;
      containerEl.scrollTop -= e.clientY - dragLast.y;
      dragLast = { x: e.clientX, y: e.clientY };
    }
  }

  function onPointerEnd(e: PointerEvent) {
    dragging = false;
    dragLast = null;
    const el = containerEl;
    if (el && el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
  }

  function zoom(delta: number) {
    const el = containerEl;
    if (!el) {
      scale = clamp(scale * delta, MIN_SCALE, MAX_SCALE);
      return;
    }
    const rect = el.getBoundingClientRect();
    const mx = rect.width / 2;
    const my = rect.height / 2;
    const nextScale = clamp(scale * delta, MIN_SCALE, MAX_SCALE);
    const worldX = (mx + el.scrollLeft) / scale;
    const worldY = (my + el.scrollTop) / scale;
    scale = nextScale;
    el.scrollLeft = worldX * nextScale - mx;
    el.scrollTop = worldY * nextScale - my;
  }

  function reset() {
    const el = containerEl;
    scale = MIN_SCALE;
    if (el) {
      requestAnimationFrame(() => {
        el.scrollLeft = Math.max(0, (el.scrollWidth - el.clientWidth) / 2);
        el.scrollTop = Math.max(0, (el.scrollHeight - el.clientHeight) / 2);
      });
    }
  }

  export function panTo(worldX: number, worldZ: number) {
    const el = containerEl;
    if (!el) return;
    const px = worldToPx(worldX, worldZ).px * scale;
    const py = worldToPx(worldX, worldZ).py * scale;
    el.scrollLeft = px - el.clientWidth / 2;
    el.scrollTop = py - el.clientHeight / 2;
  }

  function clamp(v: number, lo: number, hi: number): number {
    return Math.min(hi, Math.max(lo, v));
  }

  function wheelAction(node: HTMLElement) {
    node.addEventListener('wheel', onWheel, { passive: false });
    return {
      destroy() {
        node.removeEventListener('wheel', onWheel);
      },
    };
  }
</script>

<div class="flex flex-col gap-2 {isFill ? 'min-h-0' : ''} {className}">
  <div class="flex items-center justify-between border-b border-tprimary-900/40 {isFill ? 'px-4 pt-1 pb-2' : ''}">
    <div class="flex items-center gap-4 text-xs text-tprimary-500">
      <span>Scroll or drag to pan</span>
      <span>Wheel or buttons to zoom</span>
      {#if dots.length > 0}
        <span>{dots.length} {dots.length === 1 ? 'dot' : 'dots'}</span>
      {/if}
    </div>
    <div class="flex items-center gap-1.5">
      <label class="flex items-center gap-1.5 text-xs text-tprimary-500 cursor-pointer select-none">
        <input type="checkbox" bind:checked={showNames} class="accent-info-800 cursor-pointer" />
        Names
      </label>
      <button
        onclick={() => zoom(1.25)}
        class="flex items-center justify-center w-7 h-7 rounded bg-background-800 hover:bg-background-700 text-tprimary cursor-pointer"
        aria-label="Zoom in"
      >
        <i class="mdi mdi-plus"></i>
      </button>
      <button
        onclick={() => zoom(1 / 1.25)}
        class="flex items-center justify-center w-7 h-7 rounded bg-background-800 hover:bg-background-700 text-tprimary cursor-pointer"
        aria-label="Zoom out"
      >
        <i class="mdi mdi-minus"></i>
      </button>
      <button
        onclick={reset}
        class="px-2.5 py-1 h-7 rounded bg-background-800 hover:bg-background-700 text-tprimary text-xs cursor-pointer"
      >
        Reset
      </button>
    </div>
  </div>

  <div
    bind:this={containerEl}
    use:wheelAction
    onpointerdown={onPointerDown}
    onpointermove={onPointerMove}
    onpointerup={onPointerEnd}
    onpointercancel={onPointerEnd}
    class="relative flex overflow-auto bg-background-950 select-none {isFill ? 'flex-1 min-h-0' : ''} {dragging ? 'cursor-grabbing' : 'cursor-grab'}"
    style="height: {isFill ? 'auto' : viewHeight}"
  >
    <div class="relative m-auto" style="width: {width * scale}px; height: {height * scale}px">
      <img
        src={mapImg}
        alt="Vardoran blank release map"
        class="absolute inset-0 w-full h-full object-fill"
        draggable="false"
      />

      {#each dots as dot (dot.id)}
        {@const pos = worldToPx(dot.x, dot.z)}
        <button
          onpointerdown={(e) => e.stopPropagation()}
          onpointerenter={() => (hoveredId = dot.id)}
          onpointerleave={() => hoveredId === dot.id && (hoveredId = null)}
          class="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
          style="left: {pos.px * scale}px; top: {pos.py * scale}px;"
          aria-label={dot.name}
        >
          <span
            class="block w-3.5 h-3.5 rounded-full border-2 border-white/80 transition-transform {dotColorClass(dot)} {hoveredId ===
            dot.id
              ? 'scale-150'
              : 'scale-100'}"
          ></span>

          {#if showNames}
            <span
              class="absolute left-full ml-1.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 bg-background-900/90 border border-tprimary-800 rounded text-[10px] font-cinzel text-tprimary whitespace-nowrap pointer-events-none"
            >
              {dot.name}
            </span>
          {/if}

          {#if hoveredId === dot.id}
            <span
              class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-background-900 border border-tprimary-700 rounded text-xs whitespace-nowrap pointer-events-none z-10 shadow-xl"
            >
              <span class="block font-cinzel text-tprimary">{dot.name}</span>
              <span class="block font-mono text-tprimary-400">{dot.x.toFixed(1)}, {dot.z.toFixed(1)}</span>
            </span>
          {/if}
        </button>
      {/each}
    </div>
  </div>
</div>