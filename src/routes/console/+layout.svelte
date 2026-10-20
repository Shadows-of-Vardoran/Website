<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import { getSession, getDashboardAuthed, restoreSession, login, logout } from '$lib/stores/dashboard.svelte';

  let username = $state('');
  let password = $state('');
  let loginError = $state('');
  let loading = $state(false);

  const isCommands = $derived(page.url.pathname.startsWith('/console/commands'));
  const isAdmins = $derived(page.url.pathname === '/console' && page.url.searchParams.get('view') === 'admins');
  const isOverview = $derived(!isCommands && !isAdmins);

  onMount(() => {
    restoreSession();
  });

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

  function navClass(active: boolean): string {
    return `px-3 py-1.5 text-xs font-cinzel rounded cursor-pointer ${active ? 'bg-info-800 text-white' : 'bg-background-800 text-tprimary-400 hover:text-tprimary-200'}`;
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
        <button onclick={() => goto(resolve('/console'))} class={navClass(isOverview)}> Overview </button>
        <button onclick={() => goto(resolve('/console/commands'))} class={navClass(isCommands)}> Commands </button>
        {#if getSession()?.isMaster}
          <button onclick={() => goto(`${resolve('/console')}?view=admins`)} class={navClass(isAdmins)}> Admins </button>
        {/if}
        <button onclick={handleLogout} class="px-3 py-1.5 text-xs bg-error-900 hover:bg-error-800 text-white font-cinzel rounded cursor-pointer border border-error-700">
          Sign out
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto xl:overflow-hidden">
      <slot />
    </div>
  {/if}
</div>
