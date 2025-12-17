<script>
  // import fancyBorderLeft from '$lib/assets/fancy_border_left.png';
  // import fancyBorderMiddle from '$lib/assets/fancy_border_middle.png';
  // import fancyBorderRight from '$lib/assets/fancy_border_right.png';
  import verticalSeparator1 from '$lib/assets/vertical_separator_1.png';
  import teethLogo from '$lib/assets/teeth_logo.png';
</script>

<div class="flex flex-col items-center justify-center w-full h-full">
  <div class="flex flex-col items-center justify-center w-4/5 h-full">
    <div class="text-5xl text-tprimary font-cinzel">Shadows of Vardoran</div>
    <div class="text-2xl text-tsecondary font-cinzel">In the darkness, we rise</div>

    <div class="text-center w-full text-lg pb-5 pt-16 px-2 fade-background-up relative">
      Step into the shadows and stake your claim in Shadows of Vardoran, an immersive Roleplay server set in the world of V Rising! Whether you're a noble vampire lord, rogue
      bloodmage, or exiled alchemist, your story begins here.

      <div class="fancy-bottom-border">
        <div class="border-left"></div>
        <div class="border-middle"></div>
        <div class="border-right"></div>
      </div>
    </div>

    <div class="grid grid-cols-[2fr_240px_2fr] max-lg:flex max-lg:flex-col w-full mt-10">
      <div class="flex flex-col fade-background-left py-2 px-3 -ml-20 pl-20">
        <div class="text-3xl text-tprimary font-cinzel mb-4">Server Features</div>
        <div class="flex flex-col gap-1 text-lg text-tsecondary">
          <div>- Dark Fantasy RP | Lore-Driven Worldbuilding</div>
          <div>- Fully RP-Enforced Environment</div>
          <div>- Handpicked Mods for Immersion & Balance</div>
          <div>- PvP-Enabled with Political Intrigue</div>
          <div>- Community Events, Storylines, and Seasonal Play</div>
        </div>
      </div>

      <div class="flex items-center max-lg:hidden" style="contain: size;">
        <img src={verticalSeparator1} alt="Separator" class="left-vertical-separator" />
        <div class="grow">
          <img src={teethLogo} alt="Teeth Logo" class="mx-auto w-48 h-48 object-contain" />
        </div>
        <img src={verticalSeparator1} alt="Separator" class="right-vertical-separator" />
      </div>

      <div class="flex justify-center fade-background-right py-2 px-3 -mr-20 pr-20">
        Imagine something cool here
        <!-- <img src={communityImage} alt="Community Image" class="rounded-lg shadow-lg max-w-full h-auto" /> -->
      </div>
    </div>

    <div class="text-center w-full text-lg pt-5 mt-5 pb-16 px-2 fade-background-down relative">
      Join Now, Before the Shadows Fall... Whether you're a seasoned roleplayer or new to the dark gift, our staff and community will help you sink your fangs in quickly.

      <div class="fancy-top-border">
        <div class="border-left"></div>
        <div class="border-middle"></div>
        <div class="border-right"></div>
      </div>
    </div>

    <div class="mt-8">
      <a href="https://discord.gg/shadowsofvardoran" target="_blank" rel="noopener noreferrer">
        <button class="cursor-pointer bg-red-900 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg text-xl shadow-lg hover:shadow-xl transition duration-200">
          Join Our Discord
        </button>
      </a>
    </div>
  </div>
</div>

<style>
  .fancy-bottom-border {
    position: absolute;
    bottom: -32px;
    left: -40px;
    right: -40px;
    height: 64px;
    display: flex;
    pointer-events: none;
    filter: invert(90%);
  }

  .fancy-top-border {
    position: absolute;
    top: -32px;
    left: -40px;
    right: -40px;
    height: 64px;
    display: flex;
    pointer-events: none;
    filter: invert(90%);
  }

  .fancy-top-border .border-left,
  .fancy-top-border .border-middle,
  .fancy-top-border .border-right {
    transform: scaleY(-1);
  }

  .border-left,
  .border-right {
    width: 64px;
    height: 64px;
    background-size: 64px 64px;
    background-repeat: no-repeat;
    background-position: bottom;
    flex-shrink: 0;
  }

  .border-left {
    background-image: url('/src/lib/assets/fancy_border_left.png');
  }

  .border-middle {
    flex: 1 1 auto;
    height: 64px;
    background-image: url('/src/lib/assets/fancy_border_middle.png');
    background-repeat: repeat-x;
    background-size: auto 64px;
    background-position: bottom;
  }

  .border-right {
    background-image: url('/src/lib/assets/fancy_border_right.png');
  }

  .fade-background-up {
    background: linear-gradient(to top, var(--color-background-900), transparent 100%);
    border-radius: 20px;
  }

  .fade-background-down {
    background: linear-gradient(to bottom, var(--color-background-900), transparent 100%);
    border-radius: 20px;
  }

  .fade-background-right {
    background: linear-gradient(to right, var(--color-background-900), transparent 100%);
    border-bottom-right-radius: 20px;
    border-top-right-radius: 20px;
  }

  .fade-background-left {
    background: linear-gradient(to left, var(--color-background-900), transparent 100%);
    border-bottom-left-radius: 20px;
    border-top-left-radius: 20px;
  }

  .left-vertical-separator {
    filter: invert(90%);
    height: auto;
    max-height: 100%;
    width: auto;
    object-fit: contain;
    display: block;
    transform: rotate(180deg);
  }

  .right-vertical-separator {
    filter: invert(90%);
    height: auto;
    max-height: 100%;
    width: auto;
    object-fit: contain;
    display: block;
  }
</style>
