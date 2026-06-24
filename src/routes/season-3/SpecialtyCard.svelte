<script lang="ts">
  import type { Specialty } from './types';
  import { getTheme } from './colorThemes';

  let { specialty }: { specialty: Specialty } = $props();

  let expanded = $state(false);
  let scrollEl: HTMLDivElement | undefined = $state();
  let theme = $derived(getTheme(specialty.colorKey));

  function toggle() {
    expanded = !expanded;
    if (expanded) {
      requestAnimationFrame(() => {
        scrollEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }
  }
</script>

<div bind:this={scrollEl} class="rounded-lg border-2 overflow-hidden transition-all duration-300 {expanded ? 'col-span-full md:col-span-2 lg:col-span-3' : ''} {theme.border}">
  <button onclick={toggle} class="w-full text-left cursor-pointer group h-full">
    <div class="h-full bg-background-800/60 hover:bg-background-700/60 transition-colors p-4 flex flex-col items-center text-center gap-3">
      <div class="text-3xl">{specialty.icon}</div>
      <div class="text-sm font-cinzel font-bold {theme.accent}">{specialty.name}</div>
      {#if expanded}
        <div class="text-xs text-tprimary-500 mt-auto">
          <i class="mdi mdi-chevron-up mr-1"></i>Close
        </div>
      {:else}
        <div class="text-xs text-tprimary-500 mt-auto">
          <i class="mdi mdi-chevron-down mr-1"></i>Expand
        </div>
      {/if}
    </div>
  </button>

  {#if expanded}
    <div class="bg-background-900/90 p-5 border-t border-tprimary-900/30">
      <div class="text-tprimary-200 leading-relaxed mb-4 text-sm">
        {specialty.blurb}
      </div>

      <div class="space-y-1.5">
        <div class="text-xs font-cinzel text-tprimary-500 uppercase tracking-wider mb-2">Features</div>
        {#each specialty.features as feature}
          <div class="flex items-start gap-2 text-sm text-tprimary-300">
            <span class="w-1.5 h-1.5 rounded-full {theme.accentDot} flex-shrink-0 mt-1.5"></span>
            <span>{feature}</span>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>
