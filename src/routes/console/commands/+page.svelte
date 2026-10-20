<script lang="ts">
  import { getDashboardAuthed } from '$lib/stores/dashboard.svelte';
  import { buildCommandString, commandSearchText, getMod, loadCommandCatalog } from '$lib/command-catalog';
  import type { CatalogCommand, CatalogMod, CommandParam, CommandVariant } from '$lib/command-catalog';

  let catalog = $state<{ mods: CatalogMod[]; commands: CatalogCommand[] } | null>(null);
  let searchIndex = $state<Map<string, string>>(new Map());
  let loading = $state(true);
  let loadError = $state('');

  let search = $state('');
  let filterMod = $state('all');
  let filterCategory = $state('all');
  let adminFilter = $state<'all' | 'admin' | 'player'>('all');
  let paramsOnly = $state(false);
  let sortMode = $state<'alpha' | 'category'>('category');

  let expanded = $state<Record<string, boolean>>({});
  let values = $state<Record<string, string>>({});
  let copiedKey = $state<string | null>(null);
  let copyTimer: ReturnType<typeof setTimeout> | null = null;

  $effect(() => {
    if (!getDashboardAuthed() || catalog) return;
    void load();
  });

  async function load() {
    loading = true;
    loadError = '';
    try {
      const data = await loadCommandCatalog();
      const index = new Map<string, string>();
      for (const command of data.commands) index.set(command.id, commandSearchText(command));
      catalog = data;
      searchIndex = index;
    } catch (e) {
      loadError = e instanceof Error ? e.message : 'Failed to load commands.';
    } finally {
      loading = false;
    }
  }

  const categories = $derived.by(() => {
    if (!catalog) return [] as string[];
    return [...new Set(catalog.commands.map((c) => c.category))].sort((a, b) => a.localeCompare(b));
  });

  const filtered = $derived.by(() => {
    if (!catalog) return [] as CatalogCommand[];
    const query = search.trim().toLowerCase();
    const tokens = query.split(/\s+/).filter(Boolean);
    return catalog.commands.filter((command) => {
      if (filterMod !== 'all' && command.mod !== filterMod) return false;
      if (filterCategory !== 'all' && command.category !== filterCategory) return false;
      if (adminFilter === 'admin' && !command.adminOnly) return false;
      if (adminFilter === 'player' && command.adminOnly) return false;
      if (paramsOnly && !command.variants.some((v) => v.params.length > 0)) return false;
      if (tokens.length) {
        const text = searchIndex.get(command.id) ?? '';
        if (!tokens.every((t) => text.includes(t))) return false;
      }
      return true;
    });
  });

  const adminCount = $derived(filtered.filter((c) => c.adminOnly).length);

  function byName(a: CatalogCommand, b: CatalogCommand): number {
    return a.name.localeCompare(b.name);
  }

  interface CommandGroup {
    category: string | null;
    commands: CatalogCommand[];
  }

  const groups = $derived.by<CommandGroup[]>(() => {
    if (sortMode === 'alpha') {
      return [{ category: null, commands: [...filtered].sort(byName) }];
    }
    const map = new Map<string, CatalogCommand[]>();
    for (const command of filtered) {
      const list = map.get(command.category) ?? [];
      list.push(command);
      map.set(command.category, list);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([category, commands]) => ({ category, commands: commands.sort(byName) }));
  });

  function variantKey(command: CatalogCommand, variant: CommandVariant): string {
    return `${command.id}#${variant.index}`;
  }

  function valueKey(command: CatalogCommand, variant: CommandVariant, param: CommandParam): string {
    return `${variantKey(command, variant)}:${param.name}`;
  }

  function toggleBuild(key: string) {
    expanded = { ...expanded, [key]: !expanded[key] };
  }

  function datalistId(command: CatalogCommand, variant: CommandVariant, param: CommandParam): string {
    return `dl-${`${command.id}-${variant.index}-${param.name}`.replace(/[^a-zA-Z0-9-]/g, '_')}`;
  }

  function inputId(command: CatalogCommand, variant: CommandVariant, param: CommandParam): string {
    return `${datalistId(command, variant, param)}-input`;
  }

  function variantValues(command: CatalogCommand, variant: CommandVariant): Record<string, string> {
    const result: Record<string, string> = {};
    for (const param of variant.params) {
      result[param.name] = values[valueKey(command, variant, param)] ?? '';
    }
    return result;
  }

  function placeholderFor(param: CommandParam): string {
    if (param.defaultValue !== undefined && param.defaultValue !== null && param.defaultValue !== '') {
      return `${param.name} (default ${param.defaultValue})`;
    }
    if (param.description) return param.description;
    return param.name;
  }

  function resetValues(command: CatalogCommand, variant: CommandVariant) {
    const next = { ...values };
    for (const param of variant.params) delete next[valueKey(command, variant, param)];
    values = next;
  }

  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const area = document.createElement('textarea');
      area.value = text;
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      document.body.removeChild(area);
    }
    copiedKey = key;
    if (copyTimer) clearTimeout(copyTimer);
    copyTimer = setTimeout(() => (copiedKey = null), 1500);
  }

  function modFor(command: CatalogCommand): CatalogMod | undefined {
    return catalog ? getMod(catalog, command.mod) : undefined;
  }
</script>

<div class="h-full flex flex-col gap-4 p-4">
  <div class="flex flex-wrap items-center gap-3">
    <h2 class="text-2xl font-cinzel font-bold text-tprimary">Command Reference</h2>
    {#if catalog}
      <span class="text-xs text-tprimary-500">
        {filtered.length} of {catalog.commands.length} commands. {adminCount} admin.
      </span>
    {/if}
  </div>

  <div class="flex flex-wrap items-center gap-2">
    <input
      bind:value={search}
      placeholder="Search commands, descriptions, parameters"
      autocomplete="off"
      class="flex-1 min-w-64 px-3 py-2 text-sm bg-background-800 text-tprimary border border-tprimary-700 rounded outline-none focus:border-tprimary-500"
    />
    {#if search}
      <button onclick={() => (search = '')} class="px-3 py-2 text-xs bg-background-800 hover:bg-background-700 text-tprimary-300 rounded cursor-pointer"> Clear </button>
    {/if}
    <div class="relative inline-flex items-center">
      <select
        bind:value={sortMode}
        class="appearance-none pl-2 pr-7 py-2 text-sm bg-background-800 text-tprimary border border-tprimary-700 rounded outline-none focus:border-tprimary-500 cursor-pointer"
      >
        <option value="category">Sort: category</option>
        <option value="alpha">Sort: A to Z</option>
      </select>
      <i class="mdi mdi-chevron-down pointer-events-none absolute right-2 text-tprimary-500 text-sm"></i>
    </div>
  </div>

  <div class="flex flex-wrap items-center gap-2 text-xs">
    <div class="relative inline-flex items-center">
      <select
        bind:value={filterMod}
        class="appearance-none pl-2 pr-7 py-1.5 bg-background-800 text-tprimary border border-tprimary-700 rounded outline-none focus:border-tprimary-500 cursor-pointer"
      >
        <option value="all">All mods</option>
        {#each catalog?.mods ?? [] as mod (mod.id)}
          <option value={mod.id}>{mod.name}</option>
        {/each}
      </select>
      <i class="mdi mdi-chevron-down pointer-events-none absolute right-2 text-tprimary-500 text-sm"></i>
    </div>

    <div class="relative inline-flex items-center">
      <select
        bind:value={filterCategory}
        class="appearance-none pl-2 pr-7 py-1.5 bg-background-800 text-tprimary border border-tprimary-700 rounded outline-none focus:border-tprimary-500 cursor-pointer"
      >
        <option value="all">All categories</option>
        {#each categories as category (category)}
          <option value={category}>{category}</option>
        {/each}
      </select>
      <i class="mdi mdi-chevron-down pointer-events-none absolute right-2 text-tprimary-500 text-sm"></i>
    </div>

    <div class="flex items-center gap-1 rounded bg-background-800 p-0.5">
      {#each [{ id: 'all', label: 'All' }, { id: 'player', label: 'Player' }, { id: 'admin', label: 'Admin' }] as option (option.id)}
        <button
          onclick={() => (adminFilter = option.id as 'all' | 'admin' | 'player')}
          class="px-2.5 py-1 font-cinzel rounded cursor-pointer {adminFilter === option.id ? 'bg-info-800 text-white' : 'text-tprimary-400 hover:text-tprimary-200'}"
        >
          {option.label}
        </button>
      {/each}
    </div>

    <label class="flex items-center gap-1.5 text-tprimary-500 cursor-pointer select-none">
      <input type="checkbox" bind:checked={paramsOnly} class="accent-info-800 cursor-pointer" />
      Has parameters
    </label>
  </div>

  {#if loadError}
    <div class="px-4 py-2 bg-error-900/40 border border-error-700 text-error-0 text-sm rounded">{loadError}</div>
  {/if}

  <div class="flex-1 min-h-0 overflow-y-auto scrollbar-hidden">
    {#if loading}
      <p class="text-sm text-tprimary-500">Loading commands.</p>
    {:else if filtered.length === 0}
      <p class="text-sm text-tprimary-500">No commands match.</p>
    {:else}
      <div class="flex flex-col gap-4">
        {#each groups as group (group.category ?? '')}
          <div class="flex flex-col gap-3">
            {#if group.category}
              <div class="sticky top-0 z-10 bg-background-900/95 backdrop-blur-sm py-1 pl-3 flex items-center gap-2 border-b border-tprimary-800/60">
                <span class="font-cinzel text-tprimary">{group.category}</span>
                <span class="text-xs text-tprimary-500">{group.commands.length} {group.commands.length === 1 ? 'command' : 'commands'}</span>
              </div>
            {/if}
            {#each group.commands as command (command.id)}
              {@const mod = modFor(command)}
              <section class="bg-background-900/60 border border-tprimary-800 rounded-lg p-3">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="font-cinzel font-semibold text-tprimary">{command.name}</span>
                  {#if command.alias}
                    <span class="px-1.5 py-0.5 text-[10px] bg-background-700 text-tprimary-300 rounded font-mono">alias {command.alias}</span>
                  {/if}
                  <span class="px-1.5 py-0.5 text-[10px] bg-background-700 text-tprimary-300 rounded">{command.category}</span>
                  {#if mod}
                    <span class="px-1.5 py-0.5 text-[10px] bg-info-900/70 text-info-100 rounded">{mod.name}</span>
                  {/if}
                  {#if command.adminOnly}
                    <span class="px-1.5 py-0.5 text-[10px] bg-gold-800/70 text-gold-100 rounded">Admin</span>
                  {/if}
                </div>

                {#if command.description}
                  <p class="mt-1 text-sm text-tprimary-400">{command.description}</p>
                {/if}

                <div class="mt-2 flex flex-col gap-2">
                  {#each command.variants as variant (variant.index)}
                    {@const key = variantKey(command, variant)}
                    <div class="bg-background-800/50 border border-tprimary-900/40 rounded p-2">
                      <div class="flex flex-wrap items-center gap-2">
                        <code class="font-mono text-sm text-gold-300">{variant.usage}</code>
                        {#if variant.adminOnly && !command.adminOnly}
                          <span class="px-1.5 py-0.5 text-[10px] bg-gold-800/70 text-gold-100 rounded">Admin</span>
                        {/if}
                        <div class="flex items-center gap-1.5 ml-auto">
                          {#if variant.params.length > 0}
                            <button
                              onclick={() => toggleBuild(key)}
                              class="px-2 py-0.5 text-[11px] bg-background-700 hover:bg-background-600 text-tprimary-200 rounded cursor-pointer"
                            >
                              {expanded[key] ? 'Hide builder' : 'Build'}
                            </button>
                          {/if}
                          <button
                            onclick={() => copy(variant.usage, `${key}-usage`)}
                            class="px-2 py-0.5 text-[11px] bg-info-800 hover:bg-info-700 text-white rounded cursor-pointer"
                          >
                            {copiedKey === `${key}-usage` ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                      </div>

                      {#if variant.description && variant.description !== command.description}
                        <p class="mt-1 text-xs text-tprimary-500">{variant.description}</p>
                      {/if}

                      {#if expanded[key]}
                        <div class="mt-2 border-t border-tprimary-900/40 pt-2 flex flex-col gap-2">
                          {#if variant.params.length === 0}
                            <p class="text-xs text-tprimary-500">This command takes no parameters.</p>
                          {:else}
                            {#each variant.params as param (param.name)}
                              <div class="flex flex-col gap-1">
                                <label for={inputId(command, variant, param)} class="text-[11px] text-tprimary-500">
                                  {param.name}
                                  {#if param.required}<span class="text-error-0">*</span>{/if}
                                  <span class="text-tprimary-600">({param.type})</span>
                                </label>
                                <input
                                  id={inputId(command, variant, param)}
                                  list={param.values ? datalistId(command, variant, param) : undefined}
                                  placeholder={placeholderFor(param)}
                                  bind:value={values[valueKey(command, variant, param)]}
                                  class="px-2 py-1 text-sm bg-background-800 text-tprimary border border-tprimary-700 rounded outline-none focus:border-tprimary-500"
                                />
                                {#if param.values}
                                  <datalist id={datalistId(command, variant, param)}>
                                    {#each param.values as value (value)}
                                      <option {value}></option>
                                    {/each}
                                  </datalist>
                                {/if}
                                {#if param.description && !param.values}
                                  <span class="text-[11px] text-tprimary-600">{param.description}</span>
                                {/if}
                              </div>
                            {/each}
                          {/if}

                          <div class="flex flex-wrap items-center gap-2">
                            <code class="font-mono text-xs text-tprimary-300 bg-background-900/70 px-2 py-1 rounded break-all"
                              >{buildCommandString(mod ?? { id: '', name: '', prefix: 'sov', group: '', shorthands: [] }, command, variant, variantValues(command, variant))}</code
                            >
                            <div class="flex items-center gap-1.5 ml-auto">
                              <button
                                onclick={() => resetValues(command, variant)}
                                class="px-2 py-0.5 text-[11px] bg-background-700 hover:bg-background-600 text-tprimary-200 rounded cursor-pointer"
                              >
                                Reset
                              </button>
                              <button
                                onclick={() =>
                                  copy(
                                    buildCommandString(mod ?? { id: '', name: '', prefix: 'sov', group: '', shorthands: [] }, command, variant, variantValues(command, variant)),
                                    `${key}-built`
                                  )}
                                class="px-2 py-0.5 text-[11px] bg-success-800 hover:bg-success-700 text-white rounded cursor-pointer"
                              >
                                {copiedKey === `${key}-built` ? 'Copied' : 'Copy filled'}
                              </button>
                            </div>
                          </div>
                        </div>
                      {/if}
                    </div>
                  {/each}
                </div>

                {#if command.examples.length > 0}
                  <div class="mt-2 flex flex-col gap-1">
                    {#each command.examples as example (example)}
                      <div class="flex items-center gap-2">
                        <span class="text-[11px] text-tprimary-600">Example</span>
                        <code class="font-mono text-xs text-tprimary-300">{example}</code>
                      </div>
                    {/each}
                  </div>
                {/if}
              </section>
            {/each}
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
