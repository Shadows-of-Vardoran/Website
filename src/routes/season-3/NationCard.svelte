<script lang="ts">
  import type { Nation } from './types';
  import { getTheme } from './colorThemes';

  let {
    nation,
    onclick,
  }: {
    nation: Nation;
    onclick?: () => void;
  } = $props();

  let theme = $derived(getTheme(nation.colorKey));
</script>

<button {onclick} class="w-full rounded-lg border-2 overflow-hidden cursor-pointer group text-left {theme.border} hover:brightness-125 transition-all">
  <div class="bg-linear-to-r {theme.gradient} p-4 flex items-center gap-4 transition-all group-hover:brightness-125">
    <div class="min-w-12 h-12 rounded-full bg-background-900/50 flex items-center justify-center text-xl font-cinzel font-bold {theme.accent}">
      {nation.name.charAt(0)}
    </div>
    <div class="flex-1">
      <div class="text-xl font-cinzel font-bold text-tprimary">{nation.name}</div>
      <div class="text-sm text-tprimary-400 italic">{nation.tagline}</div>
    </div>
    <div class="text-tprimary-500 text-lg">
      <i class="mdi mdi-chevron-right text-xl"></i>
    </div>
  </div>
</button>
