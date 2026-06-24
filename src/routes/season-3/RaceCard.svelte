<script lang="ts">
  import type { Race } from './types';
  import { getTheme } from './colorThemes';

  let {
    race,
    onclick,
  }: {
    race: Race;
    onclick?: () => void;
  } = $props();

  let theme = $derived(getTheme(race.colorKey));
</script>

<button {onclick} class="flex-1 h-80 rounded-lg border-2 overflow-hidden cursor-pointer group text-left flex flex-col {theme.border} hover:brightness-125 transition-all">
  <div class="bg-linear-to-b {theme.gradient} flex flex-col items-center justify-center text-center px-3 py-6 h-full">
    <div class="w-16 h-16 rounded-full bg-background-900/50 flex items-center justify-center text-3xl font-cinzel font-bold {theme.accent} mb-3">
      {race.name.charAt(0)}
    </div>
    <div class="text-2xl font-cinzel font-bold text-tprimary">{race.name}</div>
    <div class="text-base text-tprimary-400 italic mt-1.5 leading-snug">{race.tagline}</div>
    <div class="mt-auto pt-4 text-tprimary-500">
      <i class="mdi mdi-chevron-down text-xl"></i>
    </div>
  </div>
</button>
