<script lang="ts">
  import type { Nation } from './types';
  import { getTheme } from './colorThemes';
  import brBorderDecoration2 from '$lib/assets/br_border_decoration_2.png';
  import { useMarked } from '$lib/useMarked';
  import EditableSection from '$lib/components/EditableSection.svelte';

  let {
    nation,
    onclose,
    onsave,
  }: {
    nation: Nation;
    onclose?: () => void;
    onsave?: (sectionKey: string, content: string) => void;
  } = $props();

  let theme = $derived(getTheme(nation.colorKey));
  let { parse } = useMarked();
  let descriptionHtml = $derived(parse(nation.description));

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) onclose?.();
  }
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && onclose?.()} />

<div role="presentation" onclick={handleBackdropClick} class="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
  <div role="dialog" aria-modal="true" aria-label={nation.name} class="{theme.modalBg} border-2 border-testing w-[95vw] max-w-6xl max-h-[90vh] relative flex flex-col">
    <div class="flex flex-1 min-h-0 overflow-hidden">
      <div class="bg-linear-to-b {theme.gradient} w-52 flex-shrink-0 flex flex-col items-center justify-center text-center p-6">
        <div class="w-20 h-20 rounded-full bg-background-900/50 flex items-center justify-center text-4xl font-cinzel font-bold {theme.accent} mb-4">
          {nation.name.charAt(0)}
        </div>
        <div class="text-xl font-cinzel font-bold text-tprimary">{nation.name}</div>
        <div class="text-sm text-tprimary-400 italic mt-2">
          <EditableSection filePath="static/content/season-3/nations.json" sectionKey="{nation.name}.tagline" rawContent={nation.tagline} onsave={onsave}>
            {nation.tagline}
          </EditableSection>
        </div>
      </div>

      <div class="flex-1 p-6 overflow-y-auto relative">
        <button onclick={onclose} aria-label="Close" class="absolute top-4 right-4 text-tprimary-500 hover:text-white text-2xl cursor-pointer z-10 transition-colors">
          <i class="mdi mdi-close"></i>
        </button>
        <EditableSection filePath="static/content/season-3/nations.json" sectionKey="{nation.name}.description" rawContent={nation.description} onsave={onsave}>
          <div class="text-tprimary-200 leading-relaxed marked pr-8">
            {@html descriptionHtml}
          </div>
        </EditableSection>
      </div>
    </div>

    <img
      src={brBorderDecoration2}
      alt="Bottom Left Border Decoration"
      class="absolute bottom-0 left-0 w-26 border-decoration-color -scale-x-100 -translate-x-[4px] translate-y-[5px] pointer-events-none z-30"
    />
  </div>
</div>

<style>
  .border-decoration-color {
    filter: invert(70%);
  }

  .border-testing {
    border-image: linear-gradient(45deg, transparent 4%, var(--color-tprimary-900) 5%, transparent 75%) 1;
  }
</style>
