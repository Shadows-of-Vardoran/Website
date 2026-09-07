<script lang="ts">
  import { onMount } from 'svelte';
  import { getSession, getDashboardAuthed, restoreSession, login, logout } from '$lib/stores/dashboard.svelte';
  import { getHealth, getPlayers, getUsers, createUser, deleteUser, ApiError } from '$lib/game-api';
  import type { HealthResponse, PlayersResponse, AdminUserInfo } from '$lib/game-api';
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

  async function handleGetPositions() {
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
              <div class="flex items-center justify-between px-4 py-3">
                <h3 class="text-lg font-cinzel text-tprimary">Player Map</h3>
                <div class="flex items-center gap-2">
                  {#if positionsError}
                    <span class="text-xs text-error-0">{positionsError}</span>
                  {/if}
                  <button
                    onclick={handleGetPositions}
                    disabled={loadingPositions}
                    class="px-3 py-1.5 text-xs bg-info-800 hover:bg-info-700 disabled:opacity-50 text-white font-cinzel rounded cursor-pointer disabled:cursor-not-allowed"
                  >
                    {loadingPositions ? 'Fetching' : 'Get coordinates'}
                  </button>
                </div>
              </div>
              <div class="flex-1 min-h-0">
                <ConsoleMap bind:this={mapRef} dots={mapDots} viewHeight="fill" class="h-full min-h-0" />
              </div>
            </section>

            <section class="min-w-0 min-h-[420px] flex flex-col bg-background-900/60 border border-tprimary-800 rounded-lg p-4">
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
            </section>
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>
