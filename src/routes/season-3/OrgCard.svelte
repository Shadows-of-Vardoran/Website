<script lang="ts">
  import type { Organization } from './types';
  import { getTheme } from './colorThemes';
  import { orgSvgs } from './orgSvgs';

  let {
    org,
    onclick,
  }: {
    org: Organization;
    onclick?: () => void;
  } = $props();

  let theme = $derived(getTheme(org.colorKey));
</script>

<button {onclick} class="rounded-lg border-2 overflow-hidden cursor-pointer group text-left {theme.border} hover:brightness-125 transition-all">
  <div class="bg-linear-to-r {theme.gradient} p-4 flex items-center gap-4 transition-all group-hover:brightness-125">
    <div class="org-icon min-w-12 h-12 rounded-full bg-background-900/50 flex items-center justify-center {theme.accent}">
      {#if orgSvgs[org.name]}
        {@html orgSvgs[org.name]}
      {:else}
        <span class="text-xl font-cinzel font-bold">{org.name.charAt(0)}</span>
      {/if}
    </div>
    <div class="flex-1">
      <div class="text-xl font-cinzel font-bold text-tprimary">{org.name}</div>
      <div class="text-base text-tprimary-400 italic">{org.tagline}</div>
    </div>
    <div class="text-tprimary-500 text-lg">
      <i class="mdi mdi-chevron-right text-xl"></i>
    </div>
  </div>
</button>

<style>
  .org-icon :global(svg) {
    width: 36px;
    height: 36px;
  }

  .org-icon :global(svg [fill='#ffffff']) {
    fill: currentColor;
  }

  .org-icon :global(svg [stroke='#ffffff']) {
    stroke: currentColor;
  }
</style>
