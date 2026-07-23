<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import brBorderDecoration2 from '$lib/assets/br_border_decoration_2.png';
  import { useMarked } from '$lib/useMarked';
  const { parse, slugify } = useMarked();

  import { getIsAdmin, getCmsPat } from '$lib/stores/admin.svelte';
  import { parseGuides, reconstructGuides, buildEditableContent, parseEditableContent } from '$lib/guides-parser';
  import { saveContent } from '$lib/github-save';
  import { fetchContent } from '$lib/fetchContent';

  import { EditorView, basicSetup } from 'codemirror';
  import { EditorState } from '@codemirror/state';
  import { markdown } from '@codemirror/lang-markdown';
  import { oneDark } from '@codemirror/theme-one-dark';

  interface Guide {
    slug: string;
    title: string;
    description: string;
    content: string;
    parsedContent: string;
  }

  let guides: Guide[] = $state([]);
  let expandedGuide: number | null = $state(null);
  let editing = $state(false);
  let editorContent = $state('');
  let editorEl: HTMLDivElement | undefined = $state();
  let editorView: EditorView | null = null;
  let isAdmin = $state(false);
  let errorMsg = $state('');
  let successMsg = $state('');
  let saving = $state(false);
  let creatingGuide = $state(false);
  let newSlug = $state('');
  let gridEl: HTMLDivElement | undefined = $state();

  $effect(() => {
    isAdmin = getIsAdmin();
  });

  $effect(() => {
    const msg = successMsg || errorMsg;
    if (msg) {
      const timer = setTimeout(() => {
        successMsg = '';
        errorMsg = '';
      }, 3000);
      return () => clearTimeout(timer);
    }
  });

  function expandGuide(i: number) {
    editing = false;
    expandedGuide = i;
    window.location.hash = guides[i].slug;
    if (gridEl) gridEl.scrollTop = 0;
  }

  function closeGuide() {
    if (editing) editing = false;
    expandedGuide = null;
    window.location.hash = '';
  }

  function startEditing() {
    if (expandedGuide === null) return;
    editorContent = buildEditableContent(guides[expandedGuide]);
    editing = true;
  }

  async function handleSave() {
    const i = expandedGuide;
    if (i === null) return;

    const parsed = parseEditableContent(editorContent);

    let newSlugVal = slugify(parsed.title);
    if (!newSlugVal) newSlugVal = guides[i].slug;

    if (newSlugVal !== guides[i].slug && guides.find((g) => g.slug === newSlugVal)) {
      errorMsg = 'A guide with that slug already exists';
      return;
    }

    const updatedGuides = guides.map((g, idx) => {
      if (idx === i) {
        return { ...g, slug: newSlugVal, title: parsed.title, description: parsed.description, content: parsed.content, parsedContent: '' };
      }
      return g;
    });

    const raw = reconstructGuides(updatedGuides);
    const pat = getCmsPat();
    if (!pat) {
      errorMsg = 'No PAT configured';
      return;
    }

    saving = true;
    const result = await saveContent('static/content/guides/page.md', raw, 'CMS: update guide: ' + guides[i].slug, pat);
    saving = false;

    if (!result.ok) {
      errorMsg = result.error || 'Save failed';
      return;
    }

    const rendered = await parse(parsed.content);
    updatedGuides[i].parsedContent = rendered;
    guides = updatedGuides;
    editing = false;

    if (window.location.hash === '#' + guides[i].slug) {
      window.location.hash = newSlugVal;
    }

    successMsg = 'Guide saved';
  }

  function handleCancel() {
    editing = false;
  }

  async function handleDelete() {
    const i = expandedGuide;
    if (i === null) return;
    if (!confirm('Delete this guide? This cannot be undone.')) return;

    const updated = guides.filter((_, idx) => idx !== i);
    const raw = reconstructGuides(updated);
    const pat = getCmsPat();
    if (!pat) {
      errorMsg = 'No PAT configured';
      return;
    }

    saving = true;
    const result = await saveContent('static/content/guides/page.md', raw, 'CMS: delete guide: ' + guides[i].slug, pat);
    saving = false;

    if (!result.ok) {
      errorMsg = result.error || 'Failed to delete guide';
      return;
    }

    guides = updated;
    editing = false;
    expandedGuide = null;
    successMsg = 'Guide deleted';
  }

  async function moveGuide(i: number, direction: 'up' | 'down') {
    const newIndex = direction === 'up' ? i - 1 : i + 1;
    if (newIndex < 0 || newIndex >= guides.length) return;

    const updated = [...guides];
    [updated[i], updated[newIndex]] = [updated[newIndex], updated[i]];

    const raw = reconstructGuides(updated);
    const pat = getCmsPat();
    if (!pat) {
      errorMsg = 'No PAT configured';
      return;
    }

    saving = true;
    const result = await saveContent('static/content/guides/page.md', raw, 'CMS: reorder guides', pat);
    saving = false;

    if (!result.ok) {
      errorMsg = result.error || 'Failed to reorder';
      return;
    }

    guides = updated;
    if (expandedGuide === i) expandedGuide = newIndex;
    else if (expandedGuide === newIndex) expandedGuide = i;
    successMsg = 'Guides reordered';
  }

  async function handleCreateGuide() {
    const slug = newSlug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '');
    if (!slug) return;
    if (guides.find((g) => g.slug === slug)) {
      errorMsg = 'A guide with this slug already exists';
      return;
    }

    const newGuide: Guide = {
      slug,
      title: titleCase(slug.replace(/-/g, ' ')),
      description: 'Guide description goes here.',
      content: '\n\nWelcome to your guide! Replace this content with the actual guide information.\n\n',
      parsedContent: '',
    };

    const updated = [...guides, newGuide];
    const raw = reconstructGuides(updated);
    const pat = getCmsPat();
    if (!pat) {
      errorMsg = 'No PAT configured';
      return;
    }

    saving = true;
    const result = await saveContent('static/content/guides/page.md', raw, 'CMS: add guide: ' + slug, pat);
    saving = false;

    if (!result.ok) {
      errorMsg = result.error || 'Failed to create guide';
      return;
    }

    guides = updated;
    expandedGuide = guides.length - 1;
    editorContent = buildEditableContent(newGuide);
    editing = true;
    creatingGuide = false;
    newSlug = '';
    successMsg = 'Guide created';
  }

  function titleCase(s: string) {
    return s.replace(/\b\w/g, (c) => c.toUpperCase());
  }

  onMount(async () => {
    const res = await fetchContent('guides/page.md');
    const raw = await res.text();
    const parsed = parseGuides(raw);

    const withRendered = await Promise.all(
      parsed.map(async (g) => {
        const rendered = await parse(g.content);
        return { ...g, parsedContent: rendered };
      })
    );

    guides = withRendered;

    if (window.location.hash) {
      const hashSlug = window.location.hash.replace('#', '');
      const idx = guides.findIndex((g) => g.slug === hashSlug);
      if (idx !== -1) expandGuide(idx);
    }
  });

  $effect(() => {
    if (editing && editorEl) {
      const doc = untrack(() => editorContent);

      editorView = new EditorView({
        state: EditorState.create({
          doc,
          extensions: [
            basicSetup,
            markdown(),
            oneDark,
            EditorView.lineWrapping,
            EditorView.updateListener.of((update) => {
              if (update.docChanged) {
                editorContent = update.state.doc.toString();
              }
            }),
          ],
        }),
        parent: editorEl,
      });

      return () => {
        editorView?.destroy();
        editorView = null;
      };
    }
  });
</script>

<div class="w-full h-full relative">
  {#if errorMsg}
    <div class="absolute bottom-4 right-[274px] max-md:right-4 z-50 px-4 py-2 bg-red-800 text-white font-cinzel text-xs rounded shadow-lg">
      {errorMsg}
      <button onclick={() => (errorMsg = '')} class="ml-2 text-white/70 hover:text-white">&times;</button>
    </div>
  {/if}
  {#if successMsg}
    <div class="absolute bottom-4 right-[274px] max-md:right-4 z-50 px-4 py-2 bg-green-800 text-white font-cinzel text-xs rounded shadow-lg">
      {successMsg}
      <button onclick={() => (successMsg = '')} class="ml-2 text-white/70 hover:text-white">&times;</button>
    </div>
  {/if}

  <div bind:this={gridEl} class="flex flex-wrap gap-4 h-full pt-6 pb-3 px-3 max-md:px-2 overflow-y-auto scrollbar-hidden">
    {#each guides as guide, i}
      <div
        class="w-64 h-64 max-md:w-[calc(50%-0.5rem)] max-md:h-56 opacity-100 animate {expandedGuide === i
          ? 'absolute inset-0 w-full h-full z-10 pt-6 pb-3 px-3 max-md:px-2 max-md:!w-full max-md:!h-full'
          : 'relative'} {expandedGuide !== null && expandedGuide !== i ? 'opacity-0!' : ''}"
      >
        <button onclick={() => expandGuide(i)} class="absolute cursor-pointer inset-0 animate opacity-100 {expandedGuide === i ? 'opacity-0! pointer-events-none!' : ''}">
          <div class="flex flex-col bg-background-900/60 hover:bg-background-800/30 h-full px-3 py-4 card-border border-2">
            <div class="text-2xl font-cinzel card-title text-white">{guide.title}</div>
            <div class="text-lg grow mt-6 text-left">{guide.description}</div>
            <img
              src={brBorderDecoration2}
              alt="Bottom Right Border Decoration"
              class="absolute bottom-0 right-0 w-26 border-decoration-color translate-x-[2px] translate-y-[3px] pointer-events-none z-30"
            />
          </div>
        </button>

        {#if isAdmin && expandedGuide !== i}
          <div class="absolute top-1 right-1 z-20 flex gap-0.5">
            <button
              title="Move up"
              onclick={(e) => {
                e.stopPropagation();
                moveGuide(i, 'up');
              }}
              disabled={i === 0 || saving}
              class="px-1 py-0.5 bg-background-800/60 hover:bg-background-700 text-tprimary text-xs rounded cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <i class="mdi mdi-chevron-up"></i>
            </button>
            <button
              title="Move down"
              onclick={(e) => {
                e.stopPropagation();
                moveGuide(i, 'down');
              }}
              disabled={i === guides.length - 1 || saving}
              class="px-1 py-0.5 bg-background-800/60 hover:bg-background-700 text-tprimary text-xs rounded cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <i class="mdi mdi-chevron-down"></i>
            </button>
          </div>
        {/if}

        {#if expandedGuide === i}
          {#if editing}
            <div
              class="flex flex-col w-full h-full relative px-4 py-3 content-border border-2 bg-linear-330 from-3% from-transparent via-4% via-background-900/95 to-transparent to-300%"
            >
              <div class="flex max-md:flex-col max-md:gap-2 justify-between items-center border-b-2 border-background-200 pb-2 mb-2">
                <div class="flex max-md:flex-col max-md:gap-1 items-center">
                  <span class="text-xs font-mono text-tprimary-400">{guide.slug}</span>
                  <span class="text-xs text-red-400 ml-1 max-md:ml-0">(changing the title will update the slug)</span>
                </div>
                <div class="flex gap-2 ml-auto max-md:ml-0 max-md:flex-wrap">
                  <button
                    onclick={handleSave}
                    disabled={saving}
                    class="px-2 py-1 min-h-10 bg-success-800 hover:bg-success-700 disabled:opacity-50 text-white font-cinzel text-xs rounded cursor-pointer disabled:cursor-not-allowed"
                  >
                    <i class="mdi mdi-content-save mr-1"></i>Save
                  </button>
                  <button
                    onclick={handleCancel}
                    disabled={saving}
                    class="px-2 py-1 min-h-10 bg-background-700 hover:bg-background-600 text-tprimary font-cinzel text-xs rounded cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onclick={handleDelete}
                    disabled={saving}
                    class="px-2 py-1 min-h-10 bg-red-800 hover:bg-red-700 disabled:opacity-50 text-white font-cinzel text-xs rounded cursor-pointer disabled:cursor-not-allowed"
                  >
                    <i class="mdi mdi-delete mr-1"></i>Delete
                  </button>
                  <button onclick={closeGuide} class="min-h-10 min-w-10 flex items-center justify-center text-tprimary/70 hover:text-white font-cinzel text-xs rounded cursor-pointer" aria-label="Close guide"> <i class="mdi mdi-close"></i> </button>
                </div>
              </div>
              <div bind:this={editorEl} class="flex-grow border border-tprimary-700 rounded overflow-y-auto"></div>
            </div>
          {:else}
            <div
              class="flex flex-col w-full h-full relative px-4 py-3 content-border border-2 bg-linear-330 from-3% from-transparent via-4% via-background-900/95 to-transparent to-300%"
            >
              <div class="flex max-md:flex-col max-md:gap-2 justify-between items-center border-b-2 border-background-200 pb-2">
                <h2 class="text-2xl max-md:text-xl font-bold text-white font-cinzel">{guide.title}</h2>
                <div class="flex gap-2">
                  {#if isAdmin}
                    <button onclick={startEditing} class="px-2 py-1 min-h-12 bg-background-800/80 hover:bg-info-800 text-tprimary font-cinzel text-xs rounded cursor-pointer">
                      <i class="mdi mdi-pencil mr-1"></i>Edit
                    </button>
                  {/if}
                  <button onclick={closeGuide} class="min-h-12 min-w-12 flex items-center justify-center text-white text-2xl z-10 cursor-pointer font-cinzel hover:text-red-500/90 transition-colors duration-300" aria-label="Close guide"> <i class="mdi mdi-close"></i> </button>
                </div>
              </div>
              <div class="flex-grow min-h-0 overflow-y-auto scrollbar-hidden marked pt-2">{@html guide.parsedContent}</div>
              <img
                src={brBorderDecoration2}
                alt="Bottom Right Border Decoration"
                class="absolute bottom-0 right-0 w-26 border-decoration-color translate-x-[4px] translate-y-[5px] pointer-events-none z-30"
              />
            </div>
          {/if}
        {/if}
      </div>

      {#if expandedGuide === i}
        <div class="w-64 h-64 max-md:hidden"></div>
      {/if}
    {/each}
  </div>

  {#if isAdmin}
    <div class="absolute bottom-4 right-[152px] max-md:right-4 max-md:left-4 flex items-center gap-3 max-md:flex-wrap">
      {#if creatingGuide}
        <input
          bind:value={newSlug}
          placeholder="guide-slug-name"
          class="px-2 py-1 bg-background-800 border border-tprimary-700 text-tprimary text-sm font-mono rounded outline-none focus:border-tprimary-500"
        />
        <button
          onclick={handleCreateGuide}
          disabled={saving}
          class="px-3 py-1.5 bg-success-800 hover:bg-success-700 disabled:opacity-50 text-white font-cinzel text-xs rounded cursor-pointer disabled:cursor-not-allowed"
        >
          Create
        </button>
        <button
          onclick={() => {
            creatingGuide = false;
            newSlug = '';
          }}
          class="px-3 py-1.5 bg-background-700 hover:bg-background-600 text-tprimary font-cinzel text-xs rounded cursor-pointer"
        >
          Cancel
        </button>
      {:else}
        <button
          onclick={() => {
            creatingGuide = true;
          }}
          class="px-3 py-2 bg-info-800 hover:bg-info-700 text-white font-cinzel text-xs rounded cursor-pointer"
        >
          <i class="mdi mdi-plus mr-1"></i>New Guide
        </button>
      {/if}
    </div>
  {/if}
</div>

<style>
  .animate {
    transition:
      width 0.3s ease-in-out,
      height 0.3s ease-in-out,
      opacity 0.6s ease-in-out;
  }

  .border-decoration-color {
    filter: invert(70%);
    transition: filter 0.3s ease-in-out;
  }

  .card-border {
    border-image: linear-gradient(-45deg, transparent 10%, var(--color-tprimary-900) 14%, transparent 75%) 1;
    transition:
      background 0.3s ease-in-out,
      border-image 0.3s ease-in-out;
  }

  .card-title {
    transition: color 0.3s ease-in-out;
  }

  .card-border:hover {
    .card-title {
      color: var(--color-red-500);
    }
  }

  .content-border {
    border-image: linear-gradient(-45deg, transparent 2%, var(--color-tprimary-900) 3%, transparent 75%) 1;
  }

  .content-background {
    background: linear-gradient(-45deg, transparent 2%, var(--color-background-900) 5%, var(--color-background-900) 95%, transparent 98%);
  }

  :global(.cm-editor .cm-scroller) {
    font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace;
    font-size: 13px;
    line-height: 1.6;
  }

  :global(.cm-editor .cm-gutters) {
    border-right: 1px solid rgba(255, 255, 255, 0.08);
  }

  :global(.cm-editor.cm-focused) {
    outline: none;
  }
</style>
