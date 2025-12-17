<script lang="ts">
  import '../app.css';
  import tower from '$lib/assets/tower.png';
  import moon from '$lib/assets/moon.png';
  import teethLogo from '$lib/assets/teeth_logo.png';
  import darkCastle from '$lib/assets/dark_castle.png';
  import brBorderDecoration1 from '$lib/assets/br_border_decoration_1.png';
  import tlBorderDecoration1 from '$lib/assets/tl_border_decoration_1.png';
  import separator1 from '$lib/assets/separator_1.png';
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
</script>

<svelte:head>
  <!-- <link rel="icon" href={dwLogoWhite} /> -->
</svelte:head>

<div class="h-screen w-screen flex overflow-hidden relative max-md:flex-col">
  <img src={darkCastle} alt="Dark Castle" class="absolute top-0 left-0 object-cover w-full h-full z-0 -scale-x-100" />
  <div class="absolute inset-0 bg-black-gradient z-0"></div>

  <!-- <img src={moon} alt="Moon" class="absolute top-0 right-0 object-cover w-48 min-w-48 max-w-48 mt-4 mr-6 black-to-red" /> -->

  <div class="hidden max-md:flex z-2">placeholder</div>

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

      <button on:click={() => goto(resolve('/'))} class="mb-6 relative">
        <img src={teethLogo} alt="Logo" class="w-24 mx-auto logo-drop-shadow" />
      </button>
      <button on:click={() => goto(resolve('/rules'))} class="nav-tower-button">Rules</button>
      <button on:click={() => goto(resolve('/lore'))} class="nav-tower-button">Lore</button>
      <button on:click={() => goto(resolve('/media'))} class="nav-tower-button">Media</button>
      <!-- </div> -->

      <img
        src={brBorderDecoration1}
        alt="Bottom Right Border Decoration"
        class="absolute bottom-0 right-0 w-24 h-24 border-decoration-color translate-x-[11px] translate-y-[19px] pointer-events-none"
      />
    </div>

    <div class="grow"></div>

    <div class="flex flex-col items-center mb-6">
      <div class="flex gap-2 mb-1">
        <a href="https://www.youtube.com/@ShadowsOfVardoran" target="_blank" rel="noopener noreferrer" class="hover:text-red-500! transition-colors duration-150">
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
        <a href="https://discord.gg/mQ4KXpJH83" target="_blank" rel="noopener noreferrer" class="hover:text-red-500! transition-colors duration-150 mt-1">
          <i class="fa-brands fa-discord text-xl" aria-hidden="true"></i>
          <span class="sr-only">Discord</span>
        </a>
      </div>
      <img src={separator1} alt="Separator" class="w-38 border-decoration-color" />
    </div>
  </div>

  <div class="flex grow h-full overflow-hidden z-3">
    <slot />
  </div>
</div>

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
