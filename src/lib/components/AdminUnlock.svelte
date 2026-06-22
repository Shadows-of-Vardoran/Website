<script lang="ts">
  import { browser } from '$app/environment';
  import { tryUnlock, getIsAdmin, lock, restoreSession } from '$lib/stores/admin.svelte';

  let showPrompt = $state(false);
  let password = $state('');
  let error = $state('');

  $effect(() => {
    if (browser) {
      restoreSession();
      if (window.location.search.includes('edit') && !getIsAdmin()) {
        showPrompt = true;
      }
    }
  });

  async function handleSubmit(e: Event) {
    e.preventDefault();
    error = '';
    const ok = await tryUnlock(password);
    if (ok) {
      showPrompt = false;
      password = '';
      const url = new URL(window.location.href);
      url.searchParams.delete('edit');
      window.history.replaceState({}, '', url);
    } else {
      error = 'Incorrect password';
    }
  }

  function handleLogout() {
    lock();
  }
</script>

{#if showPrompt}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
    <div class="bg-background-900 border border-tprimary-800 p-6 rounded-lg shadow-xl">
      <h2 class="text-xl font-cinzel text-tprimary mb-4">Admin Unlock</h2>
      <form onsubmit={handleSubmit} class="flex flex-col gap-3">
        <input
          bind:value={password}
          type="password"
          placeholder="Enter admin password"
          class="px-3 py-2 bg-background-800 text-tprimary border border-tprimary-700 rounded outline-none"
        />
        {#if error}
          <p class="text-error-0 text-sm">{error}</p>
        {/if}
        <div class="flex gap-2">
          <button type="submit" class="px-4 py-2 bg-success-800 hover:bg-success-700 text-white font-cinzel rounded cursor-pointer"> Unlock </button>
          <button
            type="button"
            onclick={() => {
              showPrompt = false;
            }}
            class="px-4 py-2 bg-background-700 hover:bg-background-600 text-tprimary font-cinzel rounded cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

{#if getIsAdmin()}
  <div class="fixed bottom-4 right-4 z-40 flex items-center gap-2 px-3 py-1.5 bg-background-800/80 rounded">
    <span class="text-xs text-tprimary-600 font-cinzel">Admin</span>
    <button onclick={handleLogout} class="px-2 py-0.5 text-xs bg-error-900 hover:bg-error-800 text-white font-cinzel rounded cursor-pointer border border-error-700">Lock</button>
  </div>
{/if}
