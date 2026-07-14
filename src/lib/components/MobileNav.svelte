<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import teethLogo from '$lib/assets/SoV_logo_2.png';
  import tlBorderDecoration1 from '$lib/assets/tl_border_decoration_1.png';
  import brBorderDecoration1 from '$lib/assets/br_border_decoration_1.png';
  import separator1 from '$lib/assets/separator_1.png';
  import { fly } from 'svelte/transition';

  let open = $state(false);

  function toggle() {
    open = !open;
  }

  function close() {
    open = false;
  }

  async function navigate(path: string) {
    close();
    goto(resolve(path as any));
  }

  export function toggleDrawer() {
    toggle();
  }
</script>

{#if open}
  <div class="fixed inset-0 z-40 bg-black/60" onclick={close} onkeydown={(e) => e.key === 'Escape' && close()} role="presentation" tabindex="-1"></div>
{/if}

{#if open}
  <div transition:fly={{ x: -300, duration: 250 }} class="fixed top-0 left-0 z-50 h-dvh w-72 flex flex-col items-center border-testing bg-background-900/95 backdrop-blur-sm">
    <div class="absolute inset-0 background-fade pointer-events-none"></div>
    <img
      src={tlBorderDecoration1}
      alt="Top Left Border Decoration"
      class="absolute top-0 left-0 w-20 h-20 border-decoration-color -translate-x-[8px] -translate-y-[14px] pointer-events-none"
    />

    <button onclick={() => navigate('/')} class="mt-8 mb-4 relative">
      <img src={teethLogo} alt="Logo" class="w-26 mx-auto logo-drop-shadow" />
    </button>

    <nav class="flex flex-col items-center gap-5 px-2 w-full">
      <button onclick={() => navigate('/conduct')} class="nav-tower-button py-2 min-h-12 w-full text-center">Conduct</button>
      <button onclick={() => navigate('/rules')} class="nav-tower-button py-2 min-h-12 w-full text-center">RP Rules</button>
      <button onclick={() => navigate('/glossary')} class="nav-tower-button py-2 min-h-12 w-full text-center">Glossary</button>
      <button onclick={() => navigate('/guides')} class="nav-tower-button py-2 min-h-12 w-full text-center">Guides</button>
      <button onclick={() => navigate('/season-3')} class="nav-tower-button py-2 min-h-12 w-full text-center text-gold-300! hover:text-gold-100!">Season 3</button>
      <button onclick={() => navigate('/media')} class="nav-tower-button py-2 min-h-12 w-full text-center">Media</button>
    </nav>

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

    <img
      src={brBorderDecoration1}
      alt="Bottom Right Border Decoration"
      class="absolute bottom-0 right-0 w-20 h-20 border-decoration-color translate-x-[8px] translate-y-[15px] pointer-events-none"
    />
  </div>
{/if}

<svelte:window onkeydown={(e) => e.key === 'Escape' && close()} />

<style>
  .border-decoration-color {
    filter: invert(90%);
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
