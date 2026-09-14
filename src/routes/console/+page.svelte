<script lang="ts">
  import { onMount } from 'svelte';
  import { getSession, getDashboardAuthed, restoreSession, login, logout } from '$lib/stores/dashboard.svelte';
  import {
    getHealth,
    getPlayers,
    getUsers,
    createUser,
    deleteUser,
    getSpawners,
    getMobStats,
    setSpawnerLevel,
    clearSpawnerLevel,
    setSpawnerStat,
    clearSpawnerStat,
    setSpawnerDisabled,
    applySpawner,
    resetSpawner,
    ApiError,
  } from '$lib/game-api';
  import type { HealthResponse, PlayersResponse, AdminUserInfo, SpawnerInfo, SpawnersResponse } from '$lib/game-api';
  import ConsoleMap from '$lib/components/ConsoleMap.svelte';

  let username = $state('');
  let password = $state('');
  let loginError = $state('');
  let loading = $state(false);

  let health = $state<HealthResponse | null>(null);
  let players = $state<PlayersResponse | null>(null);
  let users = $state<AdminUserInfo[]>([]);
  let overviewError = $state('');
  let positions = $state<Record<string, { x: number; y: number; z: number }>>({});
  let loadingPositions = $state(false);
  let positionsError = $state('');
  let mapRef = $state<{ panTo(x: number, z: number): void } | null>(null);
  let activeView = $state<'overview' | 'admins'>('overview');
  let autoFetch = $state(false);

  let mapMode = $state<'players' | 'spawners'>('players');
  let spawners = $state<SpawnersResponse | null>(null);
  let spawnersError = $state('');
  let loadingSpawners = $state(false);
  let selectedSpawnerId = $state<string | null>(null);
  let mobStats = $state<string[]>([]);
  let spawnerSearch = $state('');
  let spawnerActionError = $state('');
  let spawnerBusy = $state(false);
  let levelInput = $state(0);
  let newStat = $state('');
  let newStatValue = $state(0);

  let newUsername = $state('');
  let newPassword = $state('');
  let userError = $state('');
  let userMsg = $state('');

  onMount(() => {
    restoreSession();
  });

  $effect(() => {
    if (!getDashboardAuthed()) return;
    void refreshOverview();
    void refreshUsers();
    const id = setInterval(() => void refreshOverview(), 15000);
    return () => clearInterval(id);
  });

  $effect(() => {
    if (!getDashboardAuthed() || !autoFetch) return;
    const id = setInterval(() => void fetchPositions(), 3000);
    return () => clearInterval(id);
  });

  $effect(() => {
    if (!getDashboardAuthed() || mapMode !== 'spawners') return;
    if (!spawners && !loadingSpawners) void fetchSpawners();
    if (mobStats.length === 0) void fetchMobStats();
  });

  $effect(() => {
    const selected = spawners?.spawners.find((s) => s.id === selectedSpawnerId) ?? null;
    levelInput = selected?.unitLevelDelta ?? 0;
  });

  async function refreshOverview() {
    try {
      const [h, p] = await Promise.all([getHealth(), getPlayers()]);
      health = h;
      players = p;
      overviewError = '';
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) return;
      overviewError = e instanceof Error ? e.message : 'Failed to load server data';
    }
  }

  async function refreshUsers() {
    if (!getSession()?.isMaster) return;
    try {
      users = await getUsers();
      userError = '';
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) return;
      userError = e instanceof Error ? e.message : 'Failed to load users';
    }
  }

  async function handleLogin(e: SubmitEvent) {
    e.preventDefault();
    loading = true;
    loginError = '';
    const err = await login(username.trim(), password);
    loading = false;
    if (err) {
      loginError = err;
    } else {
      username = '';
      password = '';
    }
  }

  function handleLogout() {
    logout();
  }

  async function handleCreateUser(e: SubmitEvent) {
    e.preventDefault();
    userError = '';
    userMsg = '';
    try {
      const name = newUsername.trim();
      await createUser(name, newPassword);
      userMsg = `Created ${name}`;
      newUsername = '';
      newPassword = '';
      await refreshUsers();
    } catch (err) {
      if (err instanceof ApiError) {
        userError = err.message;
      } else {
        userError = 'Failed to create user';
      }
    }
  }

  async function handleDeleteUser(name: string) {
    if (!confirm(`Remove ${name}? This cannot be undone.`)) return;
    userError = '';
    userMsg = '';
    try {
      await deleteUser(name);
      userMsg = `Removed ${name}`;
      await refreshUsers();
    } catch (err) {
      if (err instanceof ApiError) {
        userError = err.message;
      } else {
        userError = 'Failed to remove user';
      }
    }
  }

  function formatUptime(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  }

  const serverOnline = $derived(health?.status === 'ok');

  function formatPosition(pos: { x: number; y: number; z: number }): string {
    return `${pos.x.toFixed(0)}, ${pos.y.toFixed(0)}, ${pos.z.toFixed(0)}`;
  }

  function playerKey(player: { guidHash: number; steamId: string }): string {
    return String(player.guidHash || player.steamId);
  }

  const mapDots = $derived(
    (players?.players ?? [])
      .filter((p) => positions[playerKey(p)])
      .map((p) => {
        const pos = positions[playerKey(p)];
        return {
          id: playerKey(p),
          name: p.characterName,
          x: pos.x,
          z: pos.z,
          level: p.level,
          tags: p.tags,
        };
      })
  );

  function panToPlayer(key: string) {
    const pos = positions[key];
    if (pos && mapRef) {
      mapRef.panTo(pos.x, pos.z);
    }
  }

  const SPAWNER_DOT_DEFAULT = 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.9)]';
  const SPAWNER_DOT_DISABLED = 'bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.95)]';

  const FACTION_DOT_COLORS: Record<string, string> = {
    bandits: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.9)]',
    undead: 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.9)]',
    churchoflum: 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.9)]',
    churchoflum_slaves: 'bg-yellow-600 shadow-[0_0_8px_rgba(202,138,4,0.9)]',
    militia: 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.9)]',
    werewolf: 'bg-orange-600 shadow-[0_0_8px_rgba(234,88,12,0.9)]',
    werewolfhuman: 'bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.9)]',
    wolves: 'bg-slate-400 shadow-[0_0_8px_rgba(148,163,184,0.9)]',
    spiders: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.9)]',
    gloomrot: 'bg-lime-500 shadow-[0_0_8px_rgba(132,204,22,0.9)]',
    legion: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.9)]',
    blackfangs: 'bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.9)]',
    corrupted: 'bg-fuchsia-500 shadow-[0_0_8px_rgba(217,70,239,0.9)]',
    cursed: 'bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.9)]',
    elementals: 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.9)]',
    harpy: 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.9)]',
    mutants: 'bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.9)]',
    naturespirit: 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.9)]',
    plants: 'bg-green-700 shadow-[0_0_8px_rgba(21,128,61,0.9)]',
    bear: 'bg-stone-400 shadow-[0_0_8px_rgba(168,162,158,0.9)]',
    traders_t01: 'bg-gold-400 shadow-[0_0_8px_rgba(245,158,11,0.9)]',
    traders_t02: 'bg-gold-500 shadow-[0_0_8px_rgba(217,119,6,0.9)]',
    vampirehunters: 'bg-rose-700 shadow-[0_0_8px_rgba(190,18,60,0.9)]',
    wendigo: 'bg-teal-700 shadow-[0_0_8px_rgba(15,118,110,0.9)]',
    world_prisoners: 'bg-slate-500 shadow-[0_0_8px_rgba(100,116,139,0.9)]',
  };

  const FACTION_FALLBACK_COLORS = [
    'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.9)]',
    'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.9)]',
    'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.9)]',
    'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.9)]',
    'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.9)]',
    'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.9)]',
    'bg-fuchsia-500 shadow-[0_0_8px_rgba(217,70,239,0.9)]',
  ];

  function factionColorClass(faction: string | null): string {
    if (!faction) return SPAWNER_DOT_DEFAULT;

    const key = faction.toLowerCase();
    if (FACTION_DOT_COLORS[key]) return FACTION_DOT_COLORS[key];

    let hash = 0;
    for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) | 0;
    return FACTION_FALLBACK_COLORS[Math.abs(hash) % FACTION_FALLBACK_COLORS.length];
  }

  const selectedSpawner = $derived((spawners?.spawners ?? []).find((s) => s.id === selectedSpawnerId) ?? null);

  const filteredSpawners = $derived.by(() => {
    const list = spawners?.spawners ?? [];
    const query = spawnerSearch.trim().toLowerCase();
    const seen = new Set<string>();
    const result: SpawnerInfo[] = [];

    for (const s of list) {
      if (seen.has(s.id)) continue;
      seen.add(s.id);
      if (
        query &&
        !s.prefabName.toLowerCase().includes(query) &&
        !s.id.toLowerCase().includes(query) &&
        !(s.faction ?? '').toLowerCase().includes(query) &&
        !s.mobs.some((m) => m.name.toLowerCase().includes(query))
      )
        continue;
      result.push(s);
    }

    return result;
  });

  const spawnerDots = $derived(
    (spawners?.spawners ?? []).map((s) => ({
      id: s.id,
      name: s.prefabName,
      x: s.x,
      z: s.z,
      colorClass: s.isDisabled ? SPAWNER_DOT_DISABLED : factionColorClass(s.faction) + (s.loaded ? '' : ' opacity-50'),
    }))
  );

  async function fetchSpawners() {
    loadingSpawners = true;
    spawnersError = '';
    try {
      spawners = await getSpawners();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) return;
      spawnersError = err instanceof Error ? err.message : 'Failed to load spawners';
    } finally {
      loadingSpawners = false;
    }
  }

  async function fetchMobStats() {
    try {
      mobStats = (await getMobStats()).stats;
      if (mobStats.length > 0 && !newStat) newStat = mobStats[0].toLowerCase();
    } catch {
      // Non-fatal. The stat picker stays empty.
    }
  }

  function selectSpawner(id: string) {
    selectedSpawnerId = id;
    spawnerActionError = '';
  }

  function upsertSpawner(updated: SpawnerInfo, oldId: string) {
    if (!spawners) return;
    const list = spawners.spawners.filter((s) => s.id !== oldId && s.id !== updated.id);
    list.push(updated);
    list.sort((a, b) => a.prefabName.localeCompare(b.prefabName) || a.id.localeCompare(b.id));
    spawners = { spawnerCount: list.length, spawners: list };
    selectedSpawnerId = updated.id;
  }

  async function runSpawnerAction(action: () => Promise<SpawnerInfo>) {
    const oldId = selectedSpawnerId;
    if (!oldId) return;
    spawnerBusy = true;
    spawnerActionError = '';
    try {
      const updated = await action();
      upsertSpawner(updated, oldId);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) return;
      spawnerActionError = err instanceof Error ? err.message : 'Spawner action failed';
    } finally {
      spawnerBusy = false;
    }
  }

  function setLevel() {
    const id = selectedSpawnerId;
    if (!id) return;
    void runSpawnerAction(() => setSpawnerLevel(id, levelInput));
  }

  function clearLevel() {
    const id = selectedSpawnerId;
    if (!id) return;
    void runSpawnerAction(() => clearSpawnerLevel(id));
  }

  function addStat() {
    const id = selectedSpawnerId;
    if (!id || !newStat) return;
    void runSpawnerAction(() => setSpawnerStat(id, newStat, newStatValue));
  }

  function removeStat(stat: string) {
    const id = selectedSpawnerId;
    if (!id) return;
    void runSpawnerAction(() => clearSpawnerStat(id, stat));
  }

  function toggleDisabled() {
    const id = selectedSpawnerId;
    const selected = selectedSpawner;
    if (!id || !selected) return;
    void runSpawnerAction(() => setSpawnerDisabled(id, !selected.isDisabled));
  }

  function applySpawnerNow() {
    const id = selectedSpawnerId;
    if (!id) return;
    void runSpawnerAction(() => applySpawner(id));
  }

  function resetSpawnerNow() {
    const id = selectedSpawnerId;
    if (!id) return;
    void runSpawnerAction(() => resetSpawner(id));
  }

  async function fetchPositions() {
    loadingPositions = true;
    positionsError = '';
    try {
      const res = await getPlayers();
      const next: Record<string, { x: number; y: number; z: number }> = {};
      for (const player of res.players) {
        if (player.position) {
          next[String(player.guidHash || player.steamId)] = player.position;
        }
      }
      positions = next;
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) return;
      positionsError = err instanceof Error ? err.message : 'Failed to fetch positions';
    } finally {
      loadingPositions = false;
    }
  }
</script>

<div class="w-full h-full flex flex-col overflow-hidden">
  {#if !getDashboardAuthed()}
    <div class="flex-1 flex items-center justify-center p-6">
      <form onsubmit={handleLogin} class="w-full max-w-sm bg-background-900/80 border border-tprimary-800 rounded-lg p-6 flex flex-col gap-4 shadow-xl">
        <h2 class="text-xl font-cinzel text-tprimary">Server Console</h2>
        <div class="flex flex-col gap-1">
          <label for="console-username" class="text-xs text-tprimary-500 font-cinzel">Username</label>
          <input
            id="console-username"
            bind:value={username}
            autocomplete="username"
            class="px-3 py-2 bg-background-800 text-tprimary border border-tprimary-700 rounded outline-none focus:border-tprimary-500"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label for="console-password" class="text-xs text-tprimary-500 font-cinzel">Password</label>
          <input
            id="console-password"
            type="password"
            bind:value={password}
            autocomplete="current-password"
            class="px-3 py-2 bg-background-800 text-tprimary border border-tprimary-700 rounded outline-none focus:border-tprimary-500"
          />
        </div>
        {#if loginError}
          <p class="text-error-0 text-sm">{loginError}</p>
        {/if}
        <button type="submit" disabled={loading} class="px-4 py-2 bg-success-800 hover:bg-success-700 disabled:opacity-50 text-white font-cinzel rounded cursor-pointer">
          {loading ? 'Signing in' : 'Sign in'}
        </button>
      </form>
    </div>
  {:else}
    <div class="flex items-center justify-between px-4 py-2 border-b border-tprimary-900/40 bg-background-900/70">
      <div class="flex items-center gap-3">
        <span class="text-sm font-cinzel text-tprimary">{getSession()?.username}</span>
        {#if getSession()?.isMaster}
          <span class="px-2 py-0.5 text-xs bg-gold-700/60 text-gold-100 font-cinzel rounded">Master</span>
        {:else}
          <span class="px-2 py-0.5 text-xs bg-background-700 text-tprimary-400 font-cinzel rounded">Admin</span>
        {/if}
      </div>
      <div class="flex items-center gap-2">
        <button
          onclick={() => (activeView = 'overview')}
          class="px-3 py-1.5 text-xs font-cinzel rounded cursor-pointer {activeView === 'overview'
            ? 'bg-info-800 text-white'
            : 'bg-background-800 text-tprimary-400 hover:text-tprimary-200'}"
        >
          Overview
        </button>
        {#if getSession()?.isMaster}
          <button
            onclick={() => (activeView = 'admins')}
            class="px-3 py-1.5 text-xs font-cinzel rounded cursor-pointer {activeView === 'admins'
              ? 'bg-info-800 text-white'
              : 'bg-background-800 text-tprimary-400 hover:text-tprimary-200'}"
          >
            Admins
          </button>
        {/if}
        <button onclick={handleLogout} class="px-3 py-1.5 text-xs bg-error-900 hover:bg-error-800 text-white font-cinzel rounded cursor-pointer border border-error-700">
          Sign out
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto xl:overflow-hidden">
      {#if overviewError}
        <div class="p-4 pb-0">
          <div class="px-4 py-2 bg-error-900/40 border border-error-700 text-error-0 text-sm rounded">{overviewError}</div>
        </div>
      {/if}

      {#if activeView === 'admins'}
        <div class="p-4 h-full overflow-y-auto scrollbar-hidden">
          <section class="bg-background-900/60 border border-tprimary-800 rounded-lg p-4">
            <h3 class="text-lg font-cinzel text-tprimary mb-3">Admins</h3>

            <form onsubmit={handleCreateUser} class="flex flex-col sm:flex-row gap-2 mb-4">
              <input
                bind:value={newUsername}
                placeholder="username"
                autocomplete="off"
                class="px-3 py-2 bg-background-800 text-tprimary border border-tprimary-700 rounded outline-none focus:border-tprimary-500"
              />
              <input
                bind:value={newPassword}
                type="password"
                placeholder="password"
                autocomplete="new-password"
                class="px-3 py-2 bg-background-800 text-tprimary border border-tprimary-700 rounded outline-none focus:border-tprimary-500"
              />
              <button type="submit" class="px-4 py-2 bg-success-800 hover:bg-success-700 text-white font-cinzel rounded cursor-pointer">Add admin</button>
            </form>

            {#if userError}
              <p class="mb-2 text-error-0 text-sm">{userError}</p>
            {/if}
            {#if userMsg}
              <p class="mb-2 text-success-600 text-sm">{userMsg}</p>
            {/if}

            {#if users.length > 0}
              <ul class="flex flex-col gap-2">
                {#each users as user (user.username)}
                  <li class="flex items-center justify-between gap-3 text-sm bg-background-800/60 border border-tprimary-900/40 rounded px-3 py-2">
                    <div class="flex items-center gap-3 min-w-0">
                      <span class="font-cinzel text-tprimary truncate">{user.username}</span>
                      <span class="text-tprimary-600 text-xs">created {new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                    <button
                      onclick={() => handleDeleteUser(user.username)}
                      disabled={user.username === 'admin'}
                      class="px-2 py-1 text-xs bg-error-900 hover:bg-error-800 disabled:opacity-30 text-white rounded cursor-pointer disabled:cursor-not-allowed"
                    >
                      Remove
                    </button>
                  </li>
                {/each}
              </ul>
            {:else}
              <p class="text-sm text-tprimary-600">No admin accounts yet.</p>
            {/if}
          </section>
        </div>
      {:else}
        <div class="p-4 flex flex-col gap-4 h-full">
          <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <section class="bg-background-900/60 border border-tprimary-800 rounded-lg p-4 flex items-start justify-between gap-4">
              <div>
                <h3 class="text-lg font-cinzel text-tprimary mb-2">Server Health</h3>
                <div class="flex items-center gap-2">
                  <span class="h-2 w-2 rounded-full {serverOnline ? 'bg-success-700' : 'bg-error-700'}"></span>
                  <span class="font-cinzel font-semibold {serverOnline ? 'text-success-500' : 'text-error-0'}">
                    {serverOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
              <div class="text-right text-sm text-tprimary-400">
                {#if health}
                  <div>Version {health.version}</div>
                  <div>Uptime {formatUptime(health.uptimeSeconds)}</div>
                {:else}
                  <div>Loading health.</div>
                {/if}
              </div>
            </section>

            <section class="bg-background-900/60 border border-tprimary-800 rounded-lg p-4">
              <h3 class="text-lg font-cinzel text-tprimary mb-3">Server</h3>
              <p class="text-sm text-tprimary-600">Additional server metadata coming soon.</p>
            </section>
          </div>

          <div class="grid grid-cols-1 xl:grid-cols-[1fr_320px] xl:auto-rows-fr gap-4 xl:flex-1 xl:min-h-0">
            <section class="min-w-0 min-h-[540px] flex flex-col bg-background-900/60 border border-tprimary-800 rounded-lg overflow-hidden">
              <div class="flex items-center justify-between gap-3 px-4 py-3">
                <div class="flex items-center gap-3">
                  <h3 class="text-lg font-cinzel text-tprimary">{mapMode === 'players' ? 'Player Map' : 'Spawner Map'}</h3>
                  <div class="flex items-center gap-1 rounded bg-background-800 p-0.5">
                    <button
                      onclick={() => (mapMode = 'players')}
                      class="px-2.5 py-1 text-xs font-cinzel rounded cursor-pointer {mapMode === 'players'
                        ? 'bg-info-800 text-white'
                        : 'text-tprimary-400 hover:text-tprimary-200'}"
                    >
                      Players
                    </button>
                    <button
                      onclick={() => (mapMode = 'spawners')}
                      class="px-2.5 py-1 text-xs font-cinzel rounded cursor-pointer {mapMode === 'spawners'
                        ? 'bg-info-800 text-white'
                        : 'text-tprimary-400 hover:text-tprimary-200'}"
                    >
                      Spawners
                    </button>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  {#if mapMode === 'players'}
                    {#if positionsError}
                      <span class="text-xs text-error-0">{positionsError}</span>
                    {/if}
                    <label class="flex items-center gap-1.5 text-xs text-tprimary-500 cursor-pointer select-none" title="Auto-update positions every 3 seconds">
                      <input type="checkbox" bind:checked={autoFetch} class="accent-info-800 cursor-pointer" />
                      Auto
                    </label>
                    <button
                      onclick={fetchPositions}
                      disabled={loadingPositions}
                      class="px-3 py-1.5 text-xs bg-info-800 hover:bg-info-700 disabled:opacity-50 text-white font-cinzel rounded cursor-pointer disabled:cursor-not-allowed"
                    >
                      {loadingPositions ? 'Fetching' : 'Get coordinates'}
                    </button>
                  {:else}
                    {#if spawnersError}
                      <span class="text-xs text-error-0">{spawnersError}</span>
                    {/if}
                    <button
                      onclick={fetchSpawners}
                      disabled={loadingSpawners}
                      class="px-3 py-1.5 text-xs bg-info-800 hover:bg-info-700 disabled:opacity-50 text-white font-cinzel rounded cursor-pointer disabled:cursor-not-allowed"
                    >
                      {loadingSpawners ? 'Fetching' : 'Refresh spawners'}
                    </button>
                  {/if}
                </div>
              </div>
              <div class="flex-1 min-h-0">
                {#if mapMode === 'players'}
                  <ConsoleMap bind:this={mapRef} dots={mapDots} viewHeight="fill" class="h-full min-h-0" />
                {:else}
                  <ConsoleMap bind:this={mapRef} dots={spawnerDots} selectedId={selectedSpawnerId} onSelect={selectSpawner} viewHeight="fill" class="h-full min-h-0" />
                {/if}
              </div>
            </section>

            <section class="min-w-0 min-h-[420px] flex flex-col bg-background-900/60 border border-tprimary-800 rounded-lg p-4">
              {#if mapMode === 'players'}
                <h3 class="text-lg font-cinzel text-tprimary mb-3">Online Players ({players?.playerCount ?? 0})</h3>
                {#if players && players.players.length > 0}
                  <div class="flex-1 min-h-0 max-h-[420px] xl:max-h-none overflow-y-auto scrollbar-hidden">
                    <ul class="flex flex-col gap-2">
                      {#each players.players as player (player.guidHash || player.steamId)}
                        <li class="flex flex-col gap-1 text-sm bg-background-800/60 border border-tprimary-900/40 rounded px-3 py-2">
                          <div class="flex items-center justify-between gap-3">
                            <div class="flex items-center gap-3 min-w-0">
                              <span class="font-cinzel text-tprimary truncate">{player.characterName}</span>
                            </div>
                            <span class="text-tprimary-500 whitespace-nowrap">GS {player.level}</span>
                          </div>
                          {#if player.tags.length > 0}
                            <div class="flex flex-wrap gap-1">
                              {#each player.tags as tag}
                                <span class="px-1.5 py-0.5 text-[10px] bg-background-700 text-tprimary-400 rounded">{tag}</span>
                              {/each}
                            </div>
                          {/if}
                          {#if positions[String(player.guidHash || player.steamId)]}
                            <div class="flex items-center justify-between gap-3">
                              <span class="text-xs font-mono text-tprimary-400">
                                {formatPosition(positions[String(player.guidHash || player.steamId)])}
                              </span>
                              <button
                                onclick={() => panToPlayer(String(player.guidHash || player.steamId))}
                                class="px-2 py-1 text-xs bg-info-800 hover:bg-info-700 text-white rounded cursor-pointer"
                              >
                                <i class="mdi mdi-crosshairs-gps mr-1"></i>Locate
                              </button>
                            </div>
                          {/if}
                        </li>
                      {/each}
                    </ul>
                  </div>
                {:else}
                  <p class="text-sm text-tprimary-600">No players online.</p>
                {/if}
              {:else}
                <h3 class="text-lg font-cinzel text-tprimary mb-3">Spawners ({spawners?.spawnerCount ?? 0})</h3>
                {#if !selectedSpawner}
                  <input
                    bind:value={spawnerSearch}
                    placeholder="Search by spawner or mob"
                    autocomplete="off"
                    class="mb-3 px-3 py-2 text-sm bg-background-800 text-tprimary border border-tprimary-700 rounded outline-none focus:border-tprimary-500"
                  />
                {/if}
                {#if spawnerActionError}
                  <p class="mb-2 text-error-0 text-sm">{spawnerActionError}</p>
                {/if}
                {#if selectedSpawner}
                  <div class="flex-1 min-h-0 overflow-y-auto scrollbar-hidden pr-1">
                    <div class="flex items-start justify-between gap-2 mb-3">
                      <div class="min-w-0">
                        <div class="font-cinzel text-tprimary truncate">{selectedSpawner.prefabName}</div>
                        <div class="text-[10px] text-tprimary-500">
                          {selectedSpawner.faction ?? 'Unknown faction'}
                        </div>
                      </div>
                      <button
                        onclick={() => (selectedSpawnerId = null)}
                        class="px-2 py-1 text-xs bg-background-800 hover:bg-background-700 text-tprimary-300 rounded cursor-pointer"
                      >
                        Back
                      </button>
                    </div>

                    <div class="flex flex-wrap gap-1 mb-3">
                      {#if selectedSpawner.isDisabled}
                        <span class="px-1.5 py-0.5 text-[10px] bg-gray-700 text-gray-100 rounded">Disabled</span>
                      {/if}
                      {#if selectedSpawner.hasDeltas}
                        <span class="px-1.5 py-0.5 text-[10px] bg-gold-800/70 text-gold-100 rounded">Edited</span>
                      {/if}
                      {#if !selectedSpawner.loaded}
                        <span class="px-1.5 py-0.5 text-[10px] bg-background-700 text-tprimary-300 rounded">Not loaded</span>
                      {/if}
                    </div>

                    {#if !selectedSpawner.loaded}
                      <p class="mb-3 text-xs text-tprimary-500"> No player is near this spawner right now. Changes are saved and apply when its area loads. </p>
                    {/if}

                    <div class="mb-3">
                      <div class="text-xs text-tprimary-500 mb-1">Mobs spawned</div>
                      <div class="flex flex-wrap gap-1">
                        {#each selectedSpawner.mobs as mob (mob.hash)}
                          <span class="px-1.5 py-0.5 text-[10px] bg-background-700 text-tprimary-300 rounded">{mob.name}</span>
                        {:else}
                          <span class="text-xs text-tprimary-600">None</span>
                        {/each}
                      </div>
                    </div>

                    <div class="mb-3 border-t border-tprimary-900/40 pt-3">
                      <div class="text-xs text-tprimary-500 mb-1">Unit level delta</div>
                      <div class="flex items-center gap-2">
                        <input
                          type="number"
                          bind:value={levelInput}
                          class="w-20 px-2 py-1 text-sm bg-background-800 text-tprimary border border-tprimary-700 rounded outline-none focus:border-tprimary-500"
                        />
                        <button
                          onclick={setLevel}
                          disabled={spawnerBusy}
                          class="px-2.5 py-1 text-xs bg-info-800 hover:bg-info-700 disabled:opacity-50 text-white rounded cursor-pointer disabled:cursor-not-allowed"
                        >
                          Set
                        </button>
                        <button
                          onclick={clearLevel}
                          disabled={spawnerBusy}
                          class="px-2.5 py-1 text-xs bg-background-800 hover:bg-background-700 disabled:opacity-50 text-tprimary-300 rounded cursor-pointer disabled:cursor-not-allowed"
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    <div class="mb-3 border-t border-tprimary-900/40 pt-3">
                      <div class="text-xs text-tprimary-500 mb-1">Stat deltas</div>
                      <ul class="flex flex-col gap-1 mb-2">
                        {#each Object.entries(selectedSpawner.statDeltas) as [stat, value] (stat)}
                          <li class="flex items-center justify-between gap-2 text-sm bg-background-800/60 border border-tprimary-900/40 rounded px-2 py-1">
                            <span class="text-tprimary-300 capitalize truncate">{stat}</span>
                            <div class="flex items-center gap-2">
                              <span class="text-xs font-mono {value >= 0 ? 'text-success-500' : 'text-error-0'}">{value > 0 ? '+' : ''}{value}</span>
                              <button
                                onclick={() => removeStat(stat)}
                                disabled={spawnerBusy}
                                class="px-1.5 py-0.5 text-[10px] bg-error-900 hover:bg-error-800 disabled:opacity-50 text-white rounded cursor-pointer disabled:cursor-not-allowed"
                              >
                                Clear
                              </button>
                            </div>
                          </li>
                        {:else}
                          <li class="text-xs text-tprimary-600">No stat deltas.</li>
                        {/each}
                      </ul>
                      <div class="flex items-center gap-2">
                        <select
                          bind:value={newStat}
                          class="flex-1 min-w-0 px-2 py-1 text-sm bg-background-800 text-tprimary border border-tprimary-700 rounded outline-none focus:border-tprimary-500"
                        >
                          {#each mobStats as stat (stat)}
                            <option value={stat.toLowerCase()}>{stat}</option>
                          {/each}
                        </select>
                        <input
                          type="number"
                          bind:value={newStatValue}
                          class="w-20 px-2 py-1 text-sm bg-background-800 text-tprimary border border-tprimary-700 rounded outline-none focus:border-tprimary-500"
                        />
                        <button
                          onclick={addStat}
                          disabled={spawnerBusy}
                          class="px-2.5 py-1 text-xs bg-info-800 hover:bg-info-700 disabled:opacity-50 text-white rounded cursor-pointer disabled:cursor-not-allowed"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    <div class="flex flex-wrap items-center gap-2 border-t border-tprimary-900/40 pt-3">
                      <button
                        onclick={toggleDisabled}
                        disabled={spawnerBusy}
                        class="px-2.5 py-1 text-xs {selectedSpawner.isDisabled
                          ? 'bg-success-800 hover:bg-success-700'
                          : 'bg-error-900 hover:bg-error-800'} disabled:opacity-50 text-white rounded cursor-pointer disabled:cursor-not-allowed"
                      >
                        {selectedSpawner.isDisabled ? 'Enable' : 'Disable'}
                      </button>
                      <button
                        onclick={applySpawnerNow}
                        disabled={spawnerBusy || !selectedSpawner.loaded}
                        class="px-2.5 py-1 text-xs bg-info-800 hover:bg-info-700 disabled:opacity-50 text-white rounded cursor-pointer disabled:cursor-not-allowed"
                      >
                        Apply to mobs
                      </button>
                      <button
                        onclick={resetSpawnerNow}
                        disabled={spawnerBusy}
                        class="px-2.5 py-1 text-xs bg-background-800 hover:bg-background-700 disabled:opacity-50 text-tprimary-300 rounded cursor-pointer disabled:cursor-not-allowed"
                      >
                        Reset all
                      </button>
                    </div>
                  </div>
                {:else}
                  <div class="flex-1 min-h-0 overflow-y-auto scrollbar-hidden">
                    {#if filteredSpawners.length > 0}
                      <ul class="flex flex-col gap-1">
                        {#each filteredSpawners as s (s.id)}
                          <li>
                            <button
                              onclick={() => selectSpawner(s.id)}
                              class="w-full text-left text-sm bg-background-800/60 hover:bg-background-800 border border-tprimary-900/40 rounded px-3 py-2 cursor-pointer"
                            >
                              <div class="flex items-center justify-between gap-2">
                                <span class="font-cinzel text-tprimary truncate">{s.prefabName}</span>
                                {#if s.isDisabled}
                                  <span class="shrink-0 text-[10px] text-red-400">Disabled</span>
                                {/if}
                              </div>
                              <div class="flex items-center justify-between gap-2 text-[10px] text-tprimary-500">
                                <span class="truncate">{s.faction ?? 'Unknown'}{s.loaded ? '' : ' (not loaded)'}</span>
                                <span class="shrink-0 font-mono">{s.x.toFixed(0)}, {s.z.toFixed(0)}</span>
                              </div>
                            </button>
                          </li>
                        {/each}
                      </ul>
                    {:else}
                      <p class="text-sm text-tprimary-600">{spawners ? 'No spawners match.' : 'Loading spawners.'}</p>
                    {/if}
                  </div>
                {/if}
              {/if}
            </section>
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>
