<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  import brBorderDecoration2 from '$lib/assets/br_border_decoration_2.png';
  import ScrollIndicator from '$lib/components/ScrollIndicator.svelte';
  import { useMarked } from '$lib/useMarked';
  import { splitSections, reconstructContent } from '$lib/split-sections';
  import EditableSection from '$lib/components/EditableSection.svelte';
  import { getCmsPat } from '$lib/stores/admin.svelte';
  import { saveContent, buildCommitMessage } from '$lib/github-save';
  import { fetchContent, bumpContentVersion } from '$lib/fetchContent';

  import RaceCard from './RaceCard.svelte';
  import RaceModal from './RaceModal.svelte';
  import { getTheme } from './colorThemes';
  import NationCard from './NationCard.svelte';
  import NationModal from './NationModal.svelte';
  import OrgCard from './OrgCard.svelte';
  import OrgModal from './OrgModal.svelte';
  import type { Race, Specialty, Nation, Organization } from './types';

  const { parse } = useMarked();

  const FILE_PATH = 'static/content/season-3/page.md';

  const sectionNavItems = [
    { id: 'landing', label: 'The World Has Changed' },
    { id: 'nations', label: 'Nations' },
    { id: 'organizations', label: 'Organizations' },
    { id: 'playable-races', label: 'Playable Races' },
    { id: 'citizenship', label: 'Citizenship' },
    { id: 'specialties', label: 'Specialties' },
    { id: 'mortality-contract', label: 'Mortality Contract' },
    { id: 'magic-tech-ceiling', label: 'Magic & Tech' },
    { id: 'commands', label: 'Commands' },
  ];

  let loading = $state(true);
  let scrollElement = $state<HTMLElement | null>(null);
  let saveError = $state('');
  let activeSection = $state('');

  let sections = $state<Record<string, string>>({});
  let landingHtml = $state('');
  let citizenshipHtml = $state('');
  let mortalityHtml = $state('');
  let magicTechHtml = $state('');
  let nationsIntroHtml = $state('');
  let orgsIntroHtml = $state('');
  let racesIntroHtml = $state('');
  let specsIntroHtml = $state('');
  let specsTechHtml = $state('');
  let commandsHtml = $state('');

  let expandedRace: number | null = $state(null);
  let expandedNation: number | null = $state(null);
  let nationSections: Record<string, string> = $state({});
  let nationDescriptions: Record<string, string> = $state({});
  let expandedOrg: number | null = $state(null);
  let orgSections: Record<string, string> = $state({});
  let orgDescriptions: Record<string, string> = $state({});
  let specSections: Record<string, string> = $state({});
  let specDescriptions: Record<string, string> = $state({});
  let selectedSpecialty: number = $state(0);
  let selectedSpecHtml = $state('');
  let mapExpanded = $state(false);
  let expandedHeight = $state(200);
  let mapAspect = $state(0);
  let mapImgEl: HTMLImageElement | undefined = $state();
  let mapScale = $state(1);
  let mapX = $state(0);
  let mapY = $state(0);
  let mapPanning = $state(false);
  let mapPanStart = $state({ x: 0, y: 0, sx: 0, sy: 0 });

  function onMapImgLoad(e: Event) {
    const img = e.currentTarget as HTMLImageElement;
    mapAspect = img.naturalHeight / img.naturalWidth;
    if (mapExpanded && img.clientWidth) {
      expandedHeight = Math.round(img.clientWidth * mapAspect);
    }
  }

  function toggleMap() {
    if (!mapExpanded && mapAspect && mapImgEl) {
      expandedHeight = Math.round(mapImgEl.clientWidth * mapAspect);
    }
    mapExpanded = !mapExpanded;
    if (!mapExpanded) {
      mapScale = 1;
      mapX = 0;
      mapY = 0;
    }
  }

  function onMapWheel(e: WheelEvent) {
    if (!mapExpanded) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    mapScale = Math.max(1, Math.min(8, mapScale + delta));
  }

  function onMapPointerDown(e: PointerEvent) {
    if (!mapExpanded) return;
    mapPanning = true;
    mapPanStart = { x: e.clientX, y: e.clientY, sx: mapX, sy: mapY };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onMapPointerMove(e: PointerEvent) {
    if (!mapPanning) return;
    mapX = mapPanStart.sx + (e.clientX - mapPanStart.x);
    mapY = mapPanStart.sy + (e.clientY - mapPanStart.y);
  }

  function onMapPointerUp() {
    mapPanning = false;
  }
  let races: Race[] = $state([]);
  let raceDescriptions: Record<string, string> = $state({});
  let raceSections: Record<string, string> = $state({});
  let specialties: Specialty[] = $state([]);
  let nations: Nation[] = $state([]);
  let organizations: Organization[] = $state([]);

  async function renderSection(key: string, md: string) {
    if (key === 'landing') landingHtml = await parse(md);
    else if (key === 'citizenship') citizenshipHtml = await parse(md);
    else if (key === 'mortality-contract') mortalityHtml = await parse(md);
    else if (key === 'magic-tech-ceiling') magicTechHtml = await parse(md);
    else if (key === 'nations-intro') nationsIntroHtml = await parse(md);
    else if (key === 'organizations-intro') orgsIntroHtml = await parse(md);
    else if (key === 'races-intro') racesIntroHtml = await parse(md);
    else if (key === 'specialties-intro') specsIntroHtml = await parse(md);
    else if (key === 'specialties-tech-details') specsTechHtml = await parse(md);
    else if (key === 'commands') commandsHtml = await parse(md);
  }

  async function renderSpecHtml() {
    if (specialties.length > 0 && specialties[selectedSpecialty]) {
      const key = specKey(specialties[selectedSpecialty].name);
      selectedSpecHtml = specDescriptions[key] || '';
    }
  }

  function specKey(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '-');
  }

  function orgKey(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/'/g, '');
  }

  function nationKey(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/'/g, '');
  }

  async function loadContent() {
    try {
      const [pageRes, racesRes, racesMdRes, specsRes, specsMdRes, nationsRes, nationsMdRes, orgsRes, orgsMdRes] = await Promise.all([
        fetchContent('season-3/page.md'),
        fetchContent('season-3/races.json'),
        fetchContent('season-3/races.md'),
        fetchContent('season-3/specialties.json'),
        fetchContent('season-3/specialties.md'),
        fetchContent('season-3/nations.json'),
        fetchContent('season-3/nations.md'),
        fetchContent('season-3/organizations.json'),
        fetchContent('season-3/organizations.md'),
      ]);

      if (pageRes.ok) {
        const raw = await pageRes.text();
        sections = splitSections(raw);
        await Promise.all(Object.entries(sections).map(([key, md]) => renderSection(key, md)));
      }

      if (racesRes.ok) races = await racesRes.json();
      if (racesMdRes.ok) {
        const raw = await racesMdRes.text();
        raceSections = splitSections(raw);
        const parsed: Record<string, string> = {};
        await Promise.all(
          Object.entries(raceSections).map(async ([key, md]) => {
            parsed[key] = await parse(md);
          })
        );
        raceDescriptions = parsed;
      }
      if (specsRes.ok) specialties = await specsRes.json();
      if (specsMdRes.ok) {
        const raw = await specsMdRes.text();
        specSections = splitSections(raw);
        const parsed: Record<string, string> = {};
        await Promise.all(
          Object.entries(specSections).map(async ([key, md]) => {
            parsed[key] = await parse(md);
          })
        );
        specDescriptions = parsed;
      }
      if (nationsRes.ok) nations = await nationsRes.json();
      if (nationsMdRes.ok) {
        const raw = await nationsMdRes.text();
        nationSections = splitSections(raw);
        const parsed: Record<string, string> = {};
        await Promise.all(
          Object.entries(nationSections).map(async ([key, md]) => {
            parsed[key] = await parse(md);
          })
        );
        nationDescriptions = parsed;
      }
      if (orgsRes.ok) organizations = await orgsRes.json();
      if (orgsMdRes.ok) {
        const raw = await orgsMdRes.text();
        orgSections = splitSections(raw);
        const parsed: Record<string, string> = {};
        await Promise.all(
          Object.entries(orgSections).map(async ([key, md]) => {
            parsed[key] = await parse(md);
          })
        );
        orgDescriptions = parsed;
      }
      await renderSpecHtml();
    } catch {
      // Graceful degradation
    } finally {
      loading = false;
    }
  }

  async function onSectionSave(key: string, md: string) {
    sections[key] = md;
    await renderSection(key, md);

    const full = reconstructContent(sections, [
      'landing',
      'nations-intro',
      'organizations-intro',
      'races-intro',
      'specialties-intro',
      'specialties-tech-details',
      'citizenship',
      'mortality-contract',
      'magic-tech-ceiling',
      'commands',
    ]);

    if (import.meta.env.DEV) {
      await fetch('/__cms-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: FILE_PATH, content: full }),
      });
      bumpContentVersion();
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

  const RACES_MD_PATH = 'static/content/season-3/races.md';
  const RACES_SECTION_ORDER = ['vampire', 'human', 'werewolf', 'mytt', 'talam'];

  const SPECS_MD_PATH = 'static/content/season-3/specialties.md';
  const SPECS_SECTION_ORDER = [
    'blood-magic',
    'unholy-magic',
    'storm-magic',
    'frost-magic',
    'illusion-magic',
    'chaos-magic',
    'light-magic',
    'shadow-magic',
    'elemental-magic',
    'druidic-magic',
    'architect',
    'blacksmith',
    'tailor',
    'alchemy',
    'ritualism',
    'martial-arts',
    'doctor',
    'engineer',
  ];

  const ORGS_MD_PATH = 'static/content/season-3/organizations.md';
  const ORGS_SECTION_ORDER = ['church-of-luminance', 'the-archivum', 'transcendum', 'noctum', 'vampire-hunters-guild'];

  const NATIONS_MD_PATH = 'static/content/season-3/nations.md';
  const NATIONS_SECTION_ORDER = [
    'vardoran',
    'aetheria',
    'ajania',
    'alinar',
    'frankleburg',
    'hafjallheim',
    'the-hallowed-mountains',
    'lakkrah',
    'norus',
    'nova-franka',
    'novosvet',
    'omen-plateau',
    'pisciv-vol',
    'qalidran',
    'suluun',
  ];

  async function onRaceSave(sectionKey: string, content: string) {
    const key = sectionKey
      .replace(/^.*?\./, '')
      .toLowerCase()
      .replace(/\s+/g, '-');
    raceSections[key] = content;
    raceDescriptions[key] = await parse(content);

    const full = reconstructContent(raceSections, RACES_SECTION_ORDER);

    if (import.meta.env.DEV) {
      await fetch('/__cms-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: RACES_MD_PATH, content: full }),
      });
      bumpContentVersion();
      return;
    }

    const pat = getCmsPat();
    if (pat) {
      const msg = buildCommitMessage(RACES_MD_PATH);
      const result = await saveContent(RACES_MD_PATH, full, msg, pat);
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

  async function onSpecSave(sectionKey: string, content: string) {
    const key = sectionKey
      .replace(/^.*?\./, '')
      .toLowerCase()
      .replace(/\s+/g, '-');
    specSections[key] = content;
    specDescriptions[key] = await parse(content);
    await renderSpecHtml();

    const full = reconstructContent(specSections, SPECS_SECTION_ORDER);

    if (import.meta.env.DEV) {
      await fetch('/__cms-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: SPECS_MD_PATH, content: full }),
      });
      bumpContentVersion();
      return;
    }

    const pat = getCmsPat();
    if (pat) {
      const msg = buildCommitMessage(SPECS_MD_PATH);
      const result = await saveContent(SPECS_MD_PATH, full, msg, pat);
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

  async function onNationSave(sectionKey: string, content: string) {
    const key = sectionKey
      .replace(/^.*?\./, '')
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/'/g, '');
    nationSections[key] = content;
    nationDescriptions[key] = await parse(content);

    const full = reconstructContent(nationSections, NATIONS_SECTION_ORDER);

    if (import.meta.env.DEV) {
      await fetch('/__cms-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: NATIONS_MD_PATH, content: full }),
      });
      bumpContentVersion();
      return;
    }

    const pat = getCmsPat();
    if (pat) {
      const msg = buildCommitMessage(NATIONS_MD_PATH);
      const result = await saveContent(NATIONS_MD_PATH, full, msg, pat);
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

  async function onOrgSave(sectionKey: string, content: string) {
    const key = sectionKey
      .replace(/^.*?\./, '')
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/'/g, '');
    orgSections[key] = content;
    orgDescriptions[key] = await parse(content);

    const full = reconstructContent(orgSections, ORGS_SECTION_ORDER);

    if (import.meta.env.DEV) {
      await fetch('/__cms-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: ORGS_MD_PATH, content: full }),
      });
      bumpContentVersion();
      return;
    }

    const pat = getCmsPat();
    if (pat) {
      const msg = buildCommitMessage(ORGS_MD_PATH);
      const result = await saveContent(ORGS_MD_PATH, full, msg, pat);
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

  function scrollToSection(id: string) {
    activeSection = id;
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', `#${id}`);
    }
  }

  function handleScroll() {
    if (!scrollElement) return;
    const container = scrollElement;
    const items = sectionNavItems.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    let current = '';
    for (const el of items) {
      if (el.offsetTop - container.offsetTop <= container.scrollTop + 100) {
        current = el.id;
      }
    }
    activeSection = current;
  }

  $effect(() => {
    if (!loading && specialties.length > 0) {
      renderSpecHtml();
    }
  });

  $effect(() => {
    if (!loading && browser) {
      const hash = window.location.hash.slice(1);
      if (hash) {
        requestAnimationFrame(() => {
          const el = document.getElementById(hash);
          if (el && scrollElement) {
            scrollElement.scrollTop = el.offsetTop - scrollElement.offsetTop;
            activeSection = hash;
          }
        });
      }
    }
  });

  onMount(() => {
    loadContent();
  });
</script>

<div class="flex w-full h-full bg-background-900/50 overflow-hidden">
  <main class="flex flex-col relative w-full">
    {#if scrollElement}
      <ScrollIndicator {scrollElement} direction="up" />
    {/if}

    <div bind:this={scrollElement} onscroll={handleScroll} class="flex flex-col overflow-y-auto p-8 scrollbar-hidden marked">
      {#if loading}
        <div class="flex items-center justify-center h-64">
          <div class="text-tprimary-500 font-cinzel text-lg animate-pulse">Loading Season 3...</div>
        </div>
      {:else}
        <!-- Page Title -->
        <div class="text-center mb-8 mt-4">
          <h1 class="text-5xl font-cinzel font-bold text-tprimary tracking-wide">Season 3 Lore & Information</h1>
        </div>

        <!-- Section 1: Landing -->
        <section id="landing" class="mb-12 scroll-mt-8">
          <div class="fade-background-up p-4 rounded-lg">
            <h2 class="text-3xl font-cinzel font-bold text-tprimary mb-3">The World Has Changed</h2>
            <EditableSection filePath={FILE_PATH} sectionKey="landing" rawContent={sections.landing || ''} onsave={onSectionSave}>
              {#if landingHtml}
                {@html landingHtml}
              {:else}
                <div class="text-tprimary-500 italic">Landing content coming soon.</div>
              {/if}
            </EditableSection>
          </div>
        </section>

        <div
          role="button"
          tabindex="0"
          class="w-full mb-4 relative group rounded-lg border border-tprimary-900/50 cursor-pointer select-none"
          style:height={mapExpanded ? expandedHeight + 'px' : '200px'}
          style:transition={mapScale === 1 && !mapPanning ? 'height 0.5s ease' : 'none'}
          onclick={() => {
            if (!mapExpanded) toggleMap();
          }}
          onkeydown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggleMap();
            }
          }}
          onwheel={onMapWheel}
          onpointerdown={onMapPointerDown}
          onpointermove={onMapPointerMove}
          onpointerup={onMapPointerUp}
        >
          <div class="w-full h-full overflow-hidden relative">
            <img
              bind:this={mapImgEl}
              src="/assets/Shadows_of_Vardoran_S3_Map_Reduced.webp"
              alt="Shadows of Vardoran Season 3 Map"
              class="w-full h-full"
              style:object-fit="cover"
              style:object-position="center"
              style:transform={mapExpanded ? 'translate(' + mapX + 'px, ' + mapY + 'px) scale(' + mapScale + ')' : 'none'}
              style:transform-origin="center center"
              style:cursor={mapExpanded ? 'grab' : 'pointer'}
              onload={onMapImgLoad}
              draggable="false"
            />
            {#if !mapExpanded}
              <div class="absolute inset-0 flex items-center justify-center bg-background-900/70 group-hover:bg-sky-900/25 transition-colors pointer-events-none">
                <span class="font-cinzel text-5xl font-bold text-tprimary-100 tracking-widest" style:text-shadow="0 0 20px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.6)"
                  >View World Map</span
                >
              </div>
            {:else}
              <div class="absolute top-3 right-3 flex items-center gap-2">
                {#if mapScale > 1}
                  <button
                    type="button"
                    class="flex items-center gap-1.5 px-3 py-1.5 rounded bg-background-900/70 hover:bg-tprimary-900/50 transition-colors text-tprimary-300 text-sm cursor-pointer"
                    onclick={(e) => {
                      e.stopPropagation();
                      mapScale = 1;
                      mapX = 0;
                      mapY = 0;
                    }}
                    onpointerdown={(e) => e.stopPropagation()}
                  >
                    <i class="mdi mdi-magnify-minus text-base"></i>
                    <span class="font-cinzel text-xs uppercase tracking-wider">Reset Position</span>
                  </button>
                {/if}
                <button
                  type="button"
                  class="flex items-center gap-1.5 px-3 py-1.5 rounded bg-background-900/70 hover:bg-tprimary-900/50 transition-colors text-tprimary-300 text-sm cursor-pointer"
                  onclick={(e) => {
                    e.stopPropagation();
                    mapExpanded = false;
                    mapScale = 1;
                    mapX = 0;
                    mapY = 0;
                  }}
                  onpointerdown={(e) => e.stopPropagation()}
                >
                  <i class="mdi mdi-chevron-up text-base"></i>
                  <span class="font-cinzel text-xs uppercase tracking-wider">Collapse</span>
                </button>
              </div>
            {/if}
          </div>
        </div>

        <!-- Section 2: Nations -->
        <section id="nations" class="mb-12 scroll-mt-8">
          <div class="fade-background-up p-4 rounded-lg">
            <h2 class="text-3xl font-cinzel font-bold text-tprimary mb-2">Nations and Regions of the World</h2>
            <EditableSection filePath={FILE_PATH} sectionKey="nations-intro" rawContent={sections['nations-intro'] || ''} onsave={onSectionSave}>
              {#if nationsIntroHtml}
                <div class="mb-6">{@html nationsIntroHtml}</div>
              {:else}
                <div class="mb-6 italic">Nation introductions coming soon.</div>
              {/if}
            </EditableSection>
            {#if nations.length > 0}
              {@const vardoran = nations[0]}
              {@const rest = nations.slice(1)}
              <div class="mb-6" style="filter: drop-shadow(0 0 1.5px #92400e) drop-shadow(0 0 1.5px #92400e);">
                <button
                  onclick={() => (expandedNation = 0)}
                  class="w-full cursor-pointer group text-left"
                  style="clip-path: polygon(0% 0%, 21% 0%, 26% 16px, 74% 16px, 79% 0%, 100% 0%, 100% 100%, 79% 100%, 74% calc(100% - 16px), 26% calc(100% - 16px), 21% 100%, 0% 100%);"
                >
                  <div class="bg-linear-to-r from-black/80 via-gold-700/50 to-black/80 p-6 flex items-center gap-6 transition-all group-hover:brightness-125">
                    <div
                      class="min-w-16 h-16 rounded-full bg-background-900/50 flex items-center justify-center text-2xl font-cinzel font-bold {getTheme(vardoran.colorKey)
                        .accent} ring-2 {getTheme(vardoran.colorKey).border}"
                    >
                      <span style="font-family: 'Eagle Lake', serif; font-size: 2em;">{vardoran.name.charAt(0)}</span>
                    </div>
                    <div class="flex-1 text-center">
                      <div class="text-2xl font-cinzel font-bold text-tprimary">{vardoran.name}</div>
                      <div class="text-base text-tprimary-400 italic">{vardoran.tagline}</div>
                    </div>
                    <div
                      class="min-w-16 h-16 rounded-full bg-background-900/50 flex items-center justify-center text-2xl font-cinzel font-bold {getTheme(vardoran.colorKey)
                        .accent} ring-2 {getTheme(vardoran.colorKey).border}"
                    >
                      <span style="font-family: 'Eagle Lake', serif; font-size: 2em;">{vardoran.name.charAt(0)}</span>
                    </div>
                  </div>
                </button>
              </div>
              {#if rest.length > 0}
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {#each rest as nation, i}
                    <NationCard {nation} onclick={() => (expandedNation = i + 1)} />
                  {/each}
                </div>
              {/if}
            {:else}
              <div class="text-tprimary-500 italic p-4">Nation information coming soon.</div>
            {/if}
          </div>
        </section>

        <!-- Section 3: Organizations -->
        <section id="organizations" class="mb-12 scroll-mt-8">
          <div class="fade-background-up p-4 rounded-lg">
            <h2 class="text-3xl font-cinzel font-bold text-tprimary mb-2">Organizations</h2>
            <EditableSection filePath={FILE_PATH} sectionKey="organizations-intro" rawContent={sections['organizations-intro'] || ''} onsave={onSectionSave}>
              {#if orgsIntroHtml}
                <div class="mb-6">{@html orgsIntroHtml}</div>
              {:else}
                <div class="mb-6 italic">Organization introductions coming soon.</div>
              {/if}
            </EditableSection>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              {#each organizations as org, i}
                <OrgCard {org} onclick={() => (expandedOrg = i)} />
              {/each}
            </div>
            {#if organizations.length === 0}
              <div class="text-tprimary-500 italic p-4">Organization information coming soon.</div>
            {/if}
          </div>
        </section>

        <!-- Section 4: Playable Races -->
        <section id="playable-races" class="mb-12 scroll-mt-8">
          <div class="fade-background-up p-4 rounded-lg">
            <h2 class="text-3xl font-cinzel font-bold text-tprimary mb-2">Playable Races</h2>
            <EditableSection filePath={FILE_PATH} sectionKey="races-intro" rawContent={sections['races-intro'] || ''} onsave={onSectionSave}>
              {#if racesIntroHtml}
                <div class="mb-6">{@html racesIntroHtml}</div>
              {:else}
                <div class="mb-6 italic">Race introductions coming soon.</div>
              {/if}
            </EditableSection>
            <div class="flex flex-row gap-4">
              {#each races as race, i}
                <RaceCard {race} onclick={() => (expandedRace = i)} />
              {/each}
            </div>
            {#if races.length === 0}
              <div class="text-tprimary-500 italic p-4">Race information coming soon.</div>
            {/if}
          </div>
        </section>

        <!-- Section 5: Citizenship -->
        <section id="citizenship" class="mb-12 scroll-mt-8">
          <div class="fade-background-up p-4 rounded-lg">
            <h2 class="text-3xl font-cinzel font-bold text-tprimary mb-3">Citizenship</h2>
            <EditableSection filePath={FILE_PATH} sectionKey="citizenship" rawContent={sections.citizenship || ''} onsave={onSectionSave}>
              {#if citizenshipHtml}
                {@html citizenshipHtml}
              {:else}
                <div class="text-tprimary-500 italic">Citizenship information coming soon.</div>
              {/if}
            </EditableSection>
          </div>
        </section>

        <!-- Section 6: Specialties -->
        <section id="specialties" class="mb-12 scroll-mt-8">
          <div class="fade-background-up p-4 rounded-lg">
            <h2 class="text-3xl font-cinzel font-bold text-tprimary mb-3">Specialties</h2>
            <div class="grid grid-cols-1 md:grid-cols-[1fr_380px] gap-4">
              <EditableSection filePath={FILE_PATH} sectionKey="specialties-intro" rawContent={sections['specialties-intro'] || ''} onsave={onSectionSave}>
                {@html specsIntroHtml}
              </EditableSection>
              <div class="p-5 rounded border border-tprimary-900/30 bg-background-800/60 self-start">
                <div class="text-lg font-cinzel uppercase tracking-wider text-tprimary-500 mb-3">Technical Details</div>
                <EditableSection filePath={FILE_PATH} sectionKey="specialties-tech-details" rawContent={sections['specialties-tech-details'] || ''} onsave={onSectionSave}>
                  {#if specsTechHtml}
                    <div class="marked text-[1.05rem]" style="--dot-color: var(--color-tprimary-500)">{@html specsTechHtml}</div>
                  {:else}
                    <div class="text-tprimary-500 italic">Technical details coming soon.</div>
                  {/if}
                </EditableSection>
              </div>
            </div>

            <hr class="border-tprimary-900/30 my-6" />

            {#if specialties.length > 0}
              {@const magical = specialties.filter((s) => s.category === 'magical')}
              {@const profession = specialties.filter((s) => s.category === 'profession')}
              {@const selected = specialties[selectedSpecialty]}
              {@const selectedTheme = getTheme(selected.colorKey)}

              <div class="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-4">
                <!-- Left: Category lists -->
                <div class="flex flex-col gap-3">
                  <div>
                    <div class="text-xs font-cinzel text-tprimary-500 uppercase tracking-wider mb-1.5">Magical</div>
                    <div class="flex flex-col gap-0.5">
                      {#each magical as spec, i}
                        {@const specIdx = specialties.indexOf(spec)}
                        {@const theme = getTheme(spec.colorKey)}
                        <button
                          onclick={() => (selectedSpecialty = specIdx)}
                          class="flex items-center gap-2 px-2 py-0.5 rounded text-left transition-colors cursor-pointer {selectedSpecialty === specIdx
                            ? 'bg-background-700/60 ' + theme.accent
                            : 'hover:bg-background-800/40'}"
                        >
                          <i class="mdi mdi-{spec.icon} text-lg {selectedSpecialty !== specIdx ? theme.accent : ''}"></i>
                          <span class="text-base font-cinzel {selectedSpecialty !== specIdx ? 'text-tprimary-400 hover:text-tprimary-100' : ''}">{spec.name}</span>
                        </button>
                      {/each}
                    </div>
                  </div>
                  <div>
                    <div class="text-xs font-cinzel text-tprimary-500 uppercase tracking-wider mb-1.5">Profession</div>
                    <div class="flex flex-col gap-0.5">
                      {#each profession as spec, i}
                        {@const specIdx = specialties.indexOf(spec)}
                        {@const theme = getTheme(spec.colorKey)}
                        <button
                          onclick={() => (selectedSpecialty = specIdx)}
                          class="flex items-center gap-2 px-2 py-0.5 rounded text-left transition-colors cursor-pointer {selectedSpecialty === specIdx
                            ? 'bg-background-700/60 ' + theme.accent
                            : 'hover:bg-background-800/40'}"
                        >
                          <i class="mdi mdi-{spec.icon} text-lg {selectedSpecialty !== specIdx ? theme.accent : ''}"></i>
                          <span class="text-base font-cinzel {selectedSpecialty !== specIdx ? 'text-tprimary-400 hover:text-tprimary-100' : ''}">{spec.name}</span>
                        </button>
                      {/each}
                    </div>
                  </div>
                </div>

                <!-- Right: Detail panel -->
                <div class="marked rounded-lg border {selectedTheme.border} p-5 bg-background-900/60 text-[1.125rem]" style="--dot-color: {selectedTheme.accentDotVar}">
                  <div class="flex items-center gap-3 mb-4">
                    <i class="mdi mdi-{selected.icon} text-3xl leading-none {selectedTheme.accent}"></i>
                    <span class="text-xl font-cinzel font-bold leading-none {selectedTheme.accent}">{selected.name}</span>
                    <span
                      class="text-xs font-cinzel uppercase tracking-wider px-2 py-0.5 rounded leading-none {selected.category === 'magical'
                        ? 'bg-cyan-900/40 text-cyan-300'
                        : 'bg-amber-900/40 text-amber-300'}">{selected.category}</span
                    >
                  </div>

                  <EditableSection filePath={SPECS_MD_PATH} sectionKey="spec.{specKey(selected.name)}" rawContent={specSections[specKey(selected.name)] || ''} onsave={onSpecSave}>
                    {#if selectedSpecHtml}
                      {@html selectedSpecHtml}
                    {:else}
                      <div class="text-tprimary-500 italic">Specialty details coming soon.</div>
                    {/if}
                  </EditableSection>
                </div>
              </div>
            {:else}
              <div class="text-tprimary-500 italic p-4">Specialty information coming soon.</div>
            {/if}
          </div>
        </section>

        <!-- Section 7: Mortality Contract -->
        <section id="mortality-contract" class="mb-12 scroll-mt-8">
          <div class="fade-background-up p-4 rounded-lg">
            <h2 class="text-3xl font-cinzel font-bold text-tprimary mb-3">Mortality Contract</h2>
            <EditableSection filePath={FILE_PATH} sectionKey="mortality-contract" rawContent={sections['mortality-contract'] || ''} onsave={onSectionSave}>
              {#if mortalityHtml}
                {@html mortalityHtml}
              {:else}
                <div class="text-tprimary-500 italic">Mortality Contract details coming soon.</div>
              {/if}
            </EditableSection>
          </div>
        </section>

        <!-- Section 8: Magic & Technology Ceiling -->
        <section id="magic-tech-ceiling" class="mb-12 scroll-mt-8">
          <div class="fade-background-up p-4 rounded-lg">
            <h2 class="text-3xl font-cinzel font-bold text-tprimary mb-3">Magic & Technology Ceiling</h2>
            <EditableSection filePath={FILE_PATH} sectionKey="magic-tech-ceiling" rawContent={sections['magic-tech-ceiling'] || ''} onsave={onSectionSave}>
              {#if magicTechHtml}
                {@html magicTechHtml}
              {:else}
                <div class="text-tprimary-500 italic">Magic and technology guidelines coming soon.</div>
              {/if}
            </EditableSection>
          </div>
        </section>

        <!-- Section 9: Commands -->
        <section id="commands" class="mb-12 scroll-mt-8">
          <div class="fade-background-up p-4 rounded-lg">
            <h2 class="text-3xl font-cinzel font-bold text-tprimary mb-3">Commands</h2>
            <EditableSection filePath={FILE_PATH} sectionKey="commands" rawContent={sections.commands || ''} onsave={onSectionSave}>
              {#if commandsHtml}
                <div class="marked text-[0.925rem]">{@html commandsHtml}</div>
              {:else}
                <div class="text-tprimary-500 italic">Commands coming soon.</div>
              {/if}
            </EditableSection>
          </div>
        </section>
      {/if}
    </div>

    {#if scrollElement}
      <ScrollIndicator {scrollElement} direction="down" />
    {/if}
  </main>

  <!-- Right Nav -->
  <aside class="min-w-60 z-40 relative mt-5 mb-5 border-b-2 border-l-2 border-testing right-nav">
    <nav class="scrollbar-left h-full p-4 pb-24 rounded-lg bg-background-0/10 z-10 overflow-y-auto relative">
      {#each sectionNavItems as item}
        <button
          onclick={() => scrollToSection(item.id)}
          class="block w-full text-left py-1.5 px-2 rounded text-sm transition-colors cursor-pointer {activeSection === item.id
            ? 'text-tprimary bg-background-800/40'
            : 'text-tprimary-800 hover:text-tprimary hover:bg-background-800/20'}"
        >
          {item.label}
        </button>
      {/each}
    </nav>
    <div class="pointer-events-none absolute left-0 right-0 bottom-0 h-26 z-20 fade-bottom"></div>
    <img
      src={brBorderDecoration2}
      alt="Bottom Right Border Decoration"
      class="absolute bottom-0 left-0 w-26 border-decoration-color -scale-x-100 -translate-x-[4px] translate-y-[5px] pointer-events-none z-30"
    />
  </aside>
</div>

{#if expandedRace !== null}
  <RaceModal
    race={races[expandedRace]}
    descriptionHtml={raceDescriptions[races[expandedRace].name.toLowerCase().replace(/\s+/g, '-')] || ''}
    rawContent={raceSections[races[expandedRace].name.toLowerCase().replace(/\s+/g, '-')] || ''}
    onclose={() => (expandedRace = null)}
    onsave={onRaceSave}
  />
{/if}

{#if expandedNation !== null}
  <NationModal
    nation={nations[expandedNation]}
    descriptionHtml={nationDescriptions[nationKey(nations[expandedNation].name)] || ''}
    rawContent={nationSections[nationKey(nations[expandedNation].name)] || ''}
    onclose={() => (expandedNation = null)}
    onsave={onNationSave}
  />
{/if}

{#if expandedOrg !== null}
  <OrgModal
    org={organizations[expandedOrg]}
    descriptionHtml={orgDescriptions[orgKey(organizations[expandedOrg].name)] || ''}
    rawContent={orgSections[orgKey(organizations[expandedOrg].name)] || ''}
    onclose={() => (expandedOrg = null)}
    onsave={onOrgSave}
  />
{/if}

{#if saveError}
  <div class="fixed bottom-20 right-4 z-50 px-4 py-2 bg-error-900 text-white text-sm rounded shadow-lg border border-error-700 max-w-sm">
    <i class="mdi mdi-alert-circle mr-1"></i>Save failed: {saveError}
  </div>
{/if}

<style>
  .border-decoration-color {
    filter: invert(70%);
  }

  .border-testing {
    border-image: linear-gradient(50deg, transparent 6%, var(--color-tprimary-900) 7%, transparent 75%) 1;
  }

  .scrollbar-left {
    direction: rtl;
  }

  .scrollbar-left > * {
    direction: ltr;
    text-align: left;
  }

  .fade-bottom {
    background: linear-gradient(to bottom, transparent, black);
  }

  .fade-background-up {
    background: linear-gradient(to top, var(--color-background-900), transparent 100%);
    border-radius: 20px;
  }

  @media (max-width: 1340px) {
    .right-nav {
      display: none;
    }
  }
</style>
