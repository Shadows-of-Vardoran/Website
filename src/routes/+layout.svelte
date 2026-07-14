<script lang="ts">
  import '../app.css';
  import tower from '$lib/assets/tower.png';
  import moon from '$lib/assets/moon.png';
  import teethLogo from '$lib/assets/SoV_logo_2.png';
  import darkCastle from '$lib/assets/dark_castle.png';
  import brBorderDecoration1 from '$lib/assets/br_border_decoration_1.png';
  import tlBorderDecoration1 from '$lib/assets/tl_border_decoration_1.png';
  import separator1 from '$lib/assets/separator_1.png';
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { onMount } from 'svelte';
  import { restoreSession } from '$lib/stores/admin.svelte';
  import AdminUnlock from '$lib/components/AdminUnlock.svelte';
  import MobileNav from '$lib/components/MobileNav.svelte';

  let mobileNav: MobileNav;

  onMount(() => {
    restoreSession();
  });
</script>

<svelte:head>
  <!-- <link rel="icon" href={dwLogoWhite} /> -->
</svelte:head>

<div class="h-dvh w-dvw flex overflow-hidden relative max-md:flex-col">
  <img src={darkCastle} alt="Dark Castle" class="absolute top-0 left-0 object-cover w-full h-full z-0 -scale-x-100" />
  <div class="absolute inset-0 bg-black-gradient z-0"></div>

  <!-- <img src={moon} alt="Moon" class="absolute top-0 right-0 object-cover w-48 min-w-48 max-w-48 mt-4 mr-6 black-to-red" /> -->

  <!-- Mobile header bar -->
  <div class="hidden max-md:flex items-center justify-between px-4 py-2 z-2 bg-background-900/80 backdrop-blur-sm border-b border-tprimary-900/30">
    <button onclick={() => goto(resolve('/'))} class="cursor-pointer">
      <img src={teethLogo} alt="Logo" class="w-12 h-12 logo-drop-shadow" />
    </button>
    <button onclick={() => mobileNav.toggleDrawer()} class="text-tprimary hover:text-primary transition-colors duration-150 cursor-pointer p-2" aria-label="Open navigation menu">
      <i class="mdi mdi-menu text-2xl"></i>
    </button>
  </div>

  <div class="flex flex-col items-center z-2 max-md:hidden">
    <div class="min-w-38 h-fit border-testing flex flex-col gap-4 pt-10 pb-12 px-5 relative ml-5 mt-6 mr-5">
      <!-- <img src={tower} alt="Tower" class="w-full -translate-x-4" /> -->
      <div class="absolute inset-0 background-fade pointer-events-none"></div>
      <img
        src={tlBorderDecoration1}
        alt="Top Left Border Decoration"
        class="absolute top-0 left-0 w-24 h-24 border-decoration-color -translate-x-[11px] -translate-y-[18px] pointer-events-none"
      />

      <!-- <div class="absolute top-54 left-[80px] flex flex-col items-center gap-6 justify-center text-center w-16 mt-62"> -->

      <button onclick={() => goto(resolve('/'))} class="mb-2 relative">
        <img src={teethLogo} alt="Logo" class="w-32 mx-auto logo-drop-shadow" />
      </button>
      <button onclick={() => goto(resolve('/conduct'))} class="nav-tower-button">Conduct</button>
      <button onclick={() => goto(resolve('/rules'))} class="nav-tower-button">RP Rules</button>
      <button onclick={() => goto(resolve('/glossary'))} class="nav-tower-button">Glossary</button>
      <button onclick={() => goto(resolve('/guides'))} class="nav-tower-button">Guides</button>
      <button onclick={() => goto(resolve('/season-3'))} class="nav-tower-button text-gold-300! hover:text-gold-100!">Season 3</button>
      <button onclick={() => goto(resolve('/media'))} class="nav-tower-button">Media</button>
      <!-- </div> -->

      <img
        src={brBorderDecoration1}
        alt="Bottom Right Border Decoration"
        class="absolute bottom-0 right-0 w-24 h-24 border-decoration-color translate-x-[11px] translate-y-[19px] pointer-events-none"
      />
    </div>

    <div class="grow"></div>

    <div class="flex flex-col items-center mb-6">
      <div class="flex items-center gap-2 mb-1">
        <a href="https://www.youtube.com/@ShadowsOfVardoran" target="_blank" rel="noopener noreferrer" class="hover:text-red-500! transition-colors duration-150 h-7">
          <i class="mdi mdi-youtube text-2xl" aria-hidden="true"></i>
          <span class="sr-only">Youtube</span>
        </a>
        <a href="https://www.tiktok.com/@shadowsofvardoran" target="_blank" rel="noopener noreferrer" class="hover:text-red-500! transition-colors duration-150 mt-1">
          <i class="fa-brands fa-tiktok text-xl" aria-hidden="true"></i>
          <span class="sr-only">TikTok</span>
        </a>
        <a href="https://www.instagram.com/shadowsofvardoran" target="_blank" rel="noopener noreferrer" class="hover:text-red-500! transition-colors duration-150 mt-1">
          <i class="fa-brands fa-instagram text-xl" aria-hidden="true"></i>
          <span class="sr-only">Instagram</span>
        </a>
        <a href="https://medal.tv/u/ShadowsOfVardoran" target="_blank" rel="noopener noreferrer" class="hover:text-red-500! transition-colors duration-150 mt-1">
          <i class="fa-solid fa-medal text-xl" aria-hidden="true"></i>
          <span class="sr-only">Medal</span>
        </a>
        <a href="https://discord.gg/shadowsofvardoran" target="_blank" rel="noopener noreferrer" class="hover:text-red-500! transition-colors duration-150 mt-1">
          <i class="fa-brands fa-discord text-xl" aria-hidden="true"></i>
          <span class="sr-only">Discord</span>
        </a>
      </div>
      <img src={separator1} alt="Separator" class="w-38 border-decoration-color" />
    </div>
  </div>

  <div class="flex grow h-full overflow-hidden z-3 max-md:h-full">
    <slot />
  </div>

  <MobileNav bind:this={mobileNav} />
  <AdminUnlock />
</div>

<!--
  Force Tailwind JIT to generate these dynamic theme classes (referenced from colorThemes.ts):
  border-red-800/60 border-amber-800/60 border-orange-800/60 border-green-800/60 border-emerald-900/60 border-blue-900/60 border-violet-700/60 border-chaos-700/60 border-gold-700/60 border-indigo-900/60 border-yellow-900/60 border-stone-900/60 border-cyan-900/60 border-rose-900/60 border-teal-900/60 border-gray-900/60 border-sky-900/60
  text-red-500 text-amber-500 text-orange-500 text-green-500 text-emerald-500 text-blue-500 text-violet-500 text-chaos-300 text-gold-300 text-indigo-500 text-yellow-500 text-stone-400 text-cyan-500 text-rose-500 text-teal-500 text-gray-400 text-sky-400
  bg-red-600 bg-amber-600 bg-orange-600 bg-green-600 bg-emerald-600 bg-blue-600 bg-violet-600 bg-chaos-400 bg-gold-400 bg-indigo-600 bg-yellow-600 bg-stone-500 bg-cyan-600 bg-rose-600 bg-teal-600 bg-gray-500 bg-sky-600
  bg-red-500 bg-amber-500 bg-orange-500 bg-green-500 bg-emerald-500 bg-blue-500 bg-violet-500 bg-chaos-300 bg-gold-300 bg-indigo-500 bg-yellow-500 bg-stone-400 bg-cyan-500 bg-rose-500 bg-teal-500 bg-gray-400 bg-sky-400
  from-red-800/50 to-black/80 from-amber-800/50 to-black/80
  from-orange-800/50 to-black/80 from-green-800/50 to-black/80
  from-emerald-800/50 to-black/80 from-purple-900/60 to-black/80
  from-slate-900/60 to-black/80 from-lime-800/50 to-black/80
  from-blue-800/50 to-black/80 from-violet-700/50 to-black/80
  from-chaos-700/50 to-black/80
  from-gold-700/50 to-black/80
  from-black/80 via-gold-700/50 to-black/80
  from-pink-800/50 to-black/80
  from-indigo-800/50 to-black/80
  from-yellow-800/50 to-black/80
  from-stone-800/50 to-black/80
  from-cyan-800/50 to-black/80
  from-rose-800/50 to-black/80
  from-teal-800/50 to-black/80
  from-gray-800/50 to-black/80
  from-sky-800/50 to-black/80
  from-background-800 via-background-900 to-red-900/60
  from-background-800 via-background-900 to-amber-900/60
  from-background-800 via-background-900 to-orange-900/60
  from-background-800 via-background-900 to-green-900/60
  from-background-800 via-background-900 to-emerald-900/60
  from-background-800 via-background-900 to-violet-900/60
  from-background-800 via-background-900 to-chaos-900/60
  from-background-800 via-background-900 to-gold-900/60
  from-background-800 via-background-900 to-indigo-900/60
  from-background-800 via-background-900 to-yellow-900/60
  from-background-800 via-background-900 to-stone-900/60
  from-background-800 via-background-900 to-cyan-900/60
  from-background-800 via-background-900 to-rose-900/60
  from-background-800 via-background-900 to-teal-900/60
  from-background-800 via-background-900 to-gray-900/60
  from-background-800 via-background-900 to-sky-900/60
  from-background-800 via-background-900 to-blue-900/60

  Inline HTML content classes (from races.json):
  grid grid-cols-2 gap-4 mt-7
  p-4 rounded bg-background-800/60 border border-tprimary-900/30
  font-cinzel text-xs uppercase tracking-wider text-tprimary-500 block mb-2

  Inline HTML content classes (from page.md citizenship):
  grid grid-cols-3 gap-4 mt-6
  p-4 rounded border border-white/15 bg-white/5
  p-4 rounded border border-sky-900/30 bg-sky-900/15
  p-4 rounded border border-yellow-900/30 bg-yellow-900/15
  p-4 rounded border border-green-900/30 bg-green-900/15
  text-base text-tprimary-100
-->

<style>
  .bg-black-gradient {
    /* gradient from black at the bottom left to bg-background at the top right */
    background: linear-gradient(60deg, black 10%, transparent 100%);
    opacity: 0.8;
  }

  .black-to-red {
    filter: invert(7%) sepia(63%) saturate(7458%) hue-rotate(9deg) brightness(105%) contrast(115%) drop-shadow(0px 0px 60px var(--color-secondary-0))
      drop-shadow(0px 0px 1000px var(--color-secondary-0)) drop-shadow(0px 0px 2000px var(--color-secondary-0)) drop-shadow(0px 0px 3000px var(--color-secondary-0));
  }

  .border-decoration-color {
    filter: invert(90%); /* sepia(83%) saturate(7463%) hue-rotate(356deg) brightness(91%) contrast(101%); */
  }

  .border-testing {
    border: 2px solid white;
    border-image: linear-gradient(135deg, transparent 6%, white 10%, white 17%, transparent 30%, transparent 70%, white 83%, white 90%, transparent 94%) 1;
  }

  .background-fade {
    background: linear-gradient(60deg, transparent 10%, var(--color-background-0) 50%, transparent 90%);
    opacity: 0.3;
  }

  .logo-drop-shadow {
    filter: drop-shadow(0px 0px 8px var(--color-red-900)) drop-shadow(0px 0px 16px var(--color-background-900));
    transition: filter 0.3s;
  }

  .logo-drop-shadow:hover {
    filter: drop-shadow(0px 0px 16px var(--color-red-600)) drop-shadow(0px 0px 24px var(--color-background-500));
  }
</style>
