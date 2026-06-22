<script lang="ts">
  import { onMount } from 'svelte';
  import { useMarked } from '$lib/useMarked';
  import EditableSection from '$lib/components/EditableSection.svelte';
  import { getCmsPat } from '$lib/stores/admin.svelte';
  import { saveContent, buildCommitMessage } from '$lib/github-save';
  import verticalSeparator1 from '$lib/assets/vertical_separator_1.png';
  import teethLogo from '$lib/assets/teeth_logo.png';
  import buttonImage from '$lib/assets/button_image.png';

  const { parse } = useMarked();

  let sections = $state<Record<string, string>>({});
  let heroHtml = $state('');
  let featuresHtml = $state('');
  let settingsHtml = $state('');
  let joinHtml = $state('');

  let saveError = $state('');

  const FILE_PATH = 'static/content/home/page.md';

  function splitSections(md: string): Record<string, string> {
    const result: Record<string, string> = {};
    const lines = md.split('\n');
    let currentKey = 'hero';
    let currentLines: string[] = [];

    for (const line of lines) {
      const m = line.match(/^## (.+)$/);
      if (m) {
        result[currentKey] = currentLines.join('\n').trim();
        currentKey = m[1].toLowerCase().replace(/\s+/g, '-');
        currentLines = [];
      } else {
        currentLines.push(line);
      }
    }
    result[currentKey] = currentLines.join('\n').trim();

    return result;
  }

  function reconstructContent(secs: Record<string, string>): string {
    const parts: string[] = [];
    if (secs.hero) parts.push(secs.hero);
    if (secs.features) parts.push('## Features\n' + secs.features);
    if (secs.settings) parts.push('## Settings\n' + secs.settings);
    if (secs.join) parts.push('## Join\n' + secs.join);
    return parts.join('\n\n');
  }

  async function renderSections(secs: Record<string, string>) {
    if (secs.hero) heroHtml = await parse(secs.hero);
    if (secs.features) featuresHtml = await parse(secs.features);
    if (secs.settings) settingsHtml = await parse(secs.settings);
    if (secs.join) joinHtml = await parse(secs.join);
  }

  async function renderSection(key: string, md: string) {
    if (key === 'hero') heroHtml = await parse(md);
    else if (key === 'features') featuresHtml = await parse(md);
    else if (key === 'settings') settingsHtml = await parse(md);
    else if (key === 'join') joinHtml = await parse(md);
  }

  async function loadContent() {
    const res = await fetch('/content/home/page.md');
    if (!res.ok) return;
    const raw = await res.text();
    sections = splitSections(raw);
    await renderSections(sections);
  }

  async function onSectionSave(key: string, md: string) {
    sections[key] = md;
    await renderSection(key, md);

    const full = reconstructContent(sections);

    if (import.meta.env.DEV) {
      await fetch('/__cms-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: FILE_PATH, content: full }),
      });
      return;
    }

    const pat = getCmsPat();
    if (pat) {
      const msg = buildCommitMessage(FILE_PATH);
      const result = await saveContent(FILE_PATH, full, msg, pat);
      if (result.ok) {
        saveError = '';
      } else {
        saveError = result.error || 'Save failed';
        setTimeout(() => {
          saveError = '';
        }, 6000);
      }
    }
  }

  onMount(() => {
    loadContent();
  });
</script>

<div class="flex flex-col items-center w-full h-full overflow-y-auto scrollbar-hidden">
  <div class="flex flex-col items-center justify-center max-lg:justify-start mt-10 w-4/5 h-fit pb-10">
    <div class="text-5xl text-tprimary font-cinzel text-center">Shadows of Vardoran</div>
    <div class="text-2xl text-tsecondary font-cinzel text-center">In the darkness, we rise</div>

    <div class="w-full pb-5 pt-16 px-2 fade-background-up relative marked">
      <EditableSection filePath={FILE_PATH} sectionKey="hero" rawContent={sections.hero || ''} onsave={onSectionSave}>
        {#if heroHtml}
          {@html heroHtml}
        {/if}
      </EditableSection>

      <div class="fancy-bottom-border">
        <div class="border-left"></div>
        <div class="border-middle"></div>
        <div class="border-right"></div>
      </div>
    </div>

    <div class="grid grid-cols-[2fr_240px_2fr] max-lg:flex max-lg:flex-col w-full mt-10">
      <div class="flex flex-col fade-background-left py-2 px-3 -ml-20 pl-20 max-lg:border-r-2 max-lg:border-tprimary-0">
        <div class="text-3xl text-tprimary text-right font-cinzel mb-4">Server Features</div>
        <EditableSection filePath={FILE_PATH} sectionKey="features" rawContent={sections.features || ''} onsave={onSectionSave}>
          {#if featuresHtml}
            {@html featuresHtml}
          {/if}
        </EditableSection>
      </div>

      <div class="flex items-center max-lg:hidden" style="contain: size;">
        <img src={verticalSeparator1} alt="Separator" class="left-vertical-separator" />
        <div class="grow">
          <img src={teethLogo} alt="Teeth Logo" class="mx-auto w-48 h-48 object-contain" />
        </div>
        <img src={verticalSeparator1} alt="Separator" class="right-vertical-separator" />
      </div>

      <div class="flex flex-col justify-center fade-background-right py-2 px-3 -mr-20 pr-20 max-lg:border-l-2 max-lg:border-tprimary-0 max-lg:mt-6">
        <div class="text-3xl text-tprimary font-cinzel mb-4">Server Settings</div>
        <EditableSection filePath={FILE_PATH} sectionKey="settings" rawContent={sections.settings || ''} onsave={onSectionSave}>
          {#if settingsHtml}
            {@html settingsHtml}
          {/if}
        </EditableSection>
      </div>
    </div>

    <div class="flex flex-col items-center w-full pt-5 mt-8 px-2 fade-background-down relative">
      <div class="mb-6 marked">
        <EditableSection filePath={FILE_PATH} sectionKey="join" rawContent={sections.join || ''} onsave={onSectionSave}>
          {#if joinHtml}
            {@html joinHtml}
          {/if}
        </EditableSection>
      </div>

      <div>
        <a href="https://discord.gg/shadowsofvardoran" target="_blank" rel="noopener noreferrer">
          <button class="relative bg-transparent border-0 p-0 cursor-pointer discord-button">
            <img src={buttonImage} alt="Join Discord Button" class="w-80 h-auto button-image" />
            <span class="absolute inset-0 flex items-center justify-center text-tprimary font-cinzel text-xl pointer-events-none"> Join Discord </span>
          </button>
        </a>
      </div>

      <div class="fancy-top-border">
        <div class="border-left"></div>
        <div class="border-middle"></div>
        <div class="border-right"></div>
      </div>
    </div>
  </div>
</div>

{#if saveError}
  <div class="fixed bottom-20 right-4 z-50 px-4 py-2 bg-error-900 text-white text-sm rounded shadow-lg border border-error-700 max-w-sm">
    <i class="mdi mdi-alert-circle mr-1"></i>Save failed: {saveError}
  </div>
{/if}

<style>
  .fancy-bottom-border {
    position: absolute;
    bottom: -32px;
    left: -40px;
    right: -40px;
    height: 64px;
    display: flex;
    pointer-events: none;
    filter: invert(90%);
  }

  .fancy-top-border {
    position: absolute;
    top: -32px;
    left: -40px;
    right: -40px;
    height: 64px;
    display: flex;
    pointer-events: none;
    filter: invert(90%);
  }

  .fancy-top-border .border-left,
  .fancy-top-border .border-middle,
  .fancy-top-border .border-right {
    transform: scaleY(-1);
  }

  .border-left,
  .border-right {
    width: 64px;
    height: 64px;
    background-size: 64px 64px;
    background-repeat: no-repeat;
    background-position: bottom;
    flex-shrink: 0;
  }

  .border-left {
    background-image: url('/src/lib/assets/fancy_border_left.png');
  }

  .border-middle {
    flex: 1 1 auto;
    height: 64px;
    background-image: url('/src/lib/assets/fancy_border_middle.png');
    background-repeat: repeat-x;
    background-size: auto 64px;
    background-position: bottom;
  }

  .border-right {
    background-image: url('/src/lib/assets/fancy_border_right.png');
  }

  .fade-background-up {
    background: linear-gradient(to top, var(--color-background-900), transparent 100%);
    border-radius: 20px;
  }

  .fade-background-down {
    background: linear-gradient(to bottom, var(--color-background-900), transparent 100%);
    border-radius: 20px;
  }

  .fade-background-right {
    background: linear-gradient(to right, var(--color-background-900), transparent 100%);
    border-bottom-right-radius: 20px;
    border-top-right-radius: 20px;
  }

  .fade-background-left {
    background: linear-gradient(to left, var(--color-background-900), transparent 100%);
    border-bottom-left-radius: 20px;
    border-top-left-radius: 20px;
  }

  .left-vertical-separator {
    filter: invert(90%);
    height: auto;
    max-height: 100%;
    width: auto;
    object-fit: contain;
    display: block;
    transform: rotate(180deg);
  }

  .right-vertical-separator {
    filter: invert(90%);
    height: auto;
    max-height: 100%;
    width: auto;
    object-fit: contain;
    display: block;
  }

  .button-image {
    filter: invert(80%);
  }

  .discord-button span {
    font-family: 'Cinzel', serif;
    transition:
      filter 0.3s,
      color 0.3s;
    filter: drop-shadow(0px 0px -0px var(--color-red-900)) drop-shadow(0px 0px 0px var(--color-red-900));
  }

  .discord-button:hover span {
    filter: drop-shadow(0px 0px 16px var(--color-red-500)) drop-shadow(0px 0px 16px var(--color-red-900));
  }
</style>
