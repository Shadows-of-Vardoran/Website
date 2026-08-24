<script lang="ts">
  import { onMount } from 'svelte';

  // Season 3 start: August 1, 2026, 00:00 UTC. One Advancement Pool point is
  // minted per character every 10 days from this instant, for the life of the season.
  const SEASON_START = Date.UTC(2026, 7, 1, 0, 0, 0);
  const DAY_MS = 24 * 60 * 60 * 1000;
  const CYCLE_MS = 10 * DAY_MS;

  // Every new character starts with 2 specialty levels already granted at
  // whitelist, on top of whatever the Advancement Pool has minted since.
  const STARTING_LEVELS = 2;

  let poolCount = $state(0);
  let countdownLabel = $state('');

  function update() {
    const now = Date.now();
    const elapsed = Math.max(0, now - SEASON_START);
    poolCount = Math.floor(elapsed / CYCLE_MS);

    const nextMint = SEASON_START + (poolCount + 1) * CYCLE_MS;
    const remaining = Math.max(0, nextMint - now);

    const days = Math.floor(remaining / DAY_MS);
    const hours = Math.floor((remaining % DAY_MS) / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));

    countdownLabel = `${days}d ${hours}h ${minutes}m`;
  }

  onMount(() => {
    update();
    const interval = setInterval(update, 30 * 1000);
    return () => clearInterval(interval);
  });
</script>

<div class="grid grid-cols-3 max-md:grid-cols-1 gap-3 mt-2">
  <div class="flex flex-col items-center justify-center text-center px-3 py-4 rounded border border-gold-700/30 bg-background-900/50">
    <div class="text-[0.7rem] font-cinzel uppercase tracking-wider text-tprimary-500 mb-1">Advancement Pool</div>
    <div class="text-3xl font-cinzel font-bold text-gold-300 leading-none">{poolCount}</div>
    <div class="text-xs text-tprimary-600 mt-1.5">point{poolCount === 1 ? '' : 's'} minted per character so far</div>
  </div>
  <div class="flex flex-col items-center justify-center text-center px-3 py-4 rounded border border-gold-700/30 bg-background-900/50">
    <div class="text-[0.7rem] font-cinzel uppercase tracking-wider text-tprimary-500 mb-1">Total Levels Possible</div>
    <div class="text-3xl font-cinzel font-bold text-gold-300 leading-none">{poolCount + STARTING_LEVELS}</div>
    <div class="text-xs text-tprimary-600 mt-1.5">2 starting levels, plus every Advancement Pool point earned since</div>
  </div>
  <div class="flex flex-col items-center justify-center text-center px-3 py-4 rounded border border-gold-700/30 bg-background-900/50">
    <div class="text-[0.7rem] font-cinzel uppercase tracking-wider text-tprimary-500 mb-1">Next Point In</div>
    <div class="text-3xl font-cinzel font-bold text-gold-300 leading-none">{countdownLabel}</div>
    <div class="text-xs text-tprimary-600 mt-1.5">the season clock never stops</div>
  </div>
</div>
