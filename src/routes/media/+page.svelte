<script lang="ts">
  import { onMount } from 'svelte';
  import MasonryGallery from '$lib/components/MasonryGallery.svelte';
  import type { MediaItem } from '$lib/components/types';
  import { getIsAdmin, getCmsPat } from '$lib/stores/admin.svelte';
  import { saveContent, uploadFile } from '$lib/github-save';
  import { fetchContent } from '$lib/fetchContent';

  let allItems = $state<MediaItem[]>([]);
  let measuredItems = $state<MediaItem[]>([]);
  let loading = $state(true);
  let hasMore = $state(false);
  let currentBatch = 0;
  const BATCH_SIZE = 20;

  let scrollContainerEl: HTMLElement;
  let sentinelEl: HTMLElement | undefined = $state();

  let isAdmin = $state(false);
  let showManage = $state(false);
  let saving = $state(false);
  let errorMsg = $state('');
  let successMsg = $state('');

  let showAddForm = $state(false);
  let editingIndex: number | null = $state(null);
  let editTitle = $state('');
  let editAlt = $state('');
  let editCaption = $state('');
  let editFile: File | null = $state(null);
  let previewUrl = $state('');

  $effect(() => {
    isAdmin = getIsAdmin();
    if (!isAdmin) showManage = false;
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

  function measureImage(src: string): Promise<{ w: number; h: number }> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
      img.onerror = () => resolve({ w: 16, h: 9 });
      img.src = src;
    });
  }

  async function measureBatch(startIndex: number): Promise<MediaItem[]> {
    const batch = allItems.slice(startIndex, startIndex + BATCH_SIZE);
    return Promise.all(
      batch.map(async (item) => {
        if (item.type === 'video') {
          if (item.poster) {
            const { w, h } = await measureImage(item.poster);
            return { ...item, width: w, height: h };
          }
          return { ...item, width: 16, height: 9 };
        }
        const { w, h } = await measureImage(item.src);
        return { ...item, width: w, height: h };
      })
    );
  }

  async function loadMore() {
    if (currentBatch >= allItems.length) {
      hasMore = false;
      return;
    }
    const measured = await measureBatch(currentBatch);
    measuredItems = [...measuredItems, ...measured];
    currentBatch += BATCH_SIZE;
    hasMore = currentBatch < allItems.length;
  }

  function toggleManage() {
    if (showManage) {
      measuredItems = [];
      currentBatch = 0;
      hasMore = true;
      loadMore();
    }
    showManage = !showManage;
  }

  function openAddForm() {
    editingIndex = null;
    editTitle = '';
    editAlt = '';
    editCaption = '';
    editFile = null;
    previewUrl = '';
    showAddForm = true;
  }

  function openEditForm(i: number) {
    editingIndex = i;
    const item = allItems[i];
    editTitle = item.title || '';
    editAlt = item.alt;
    editCaption = item.caption || '';
    editFile = null;
    previewUrl = '';
    showAddForm = true;
  }

  function closeForm() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    showAddForm = false;
    editingIndex = null;
    editFile = null;
    previewUrl = '';
  }

  function handleFileSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    editFile = file;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = URL.createObjectURL(file);
  }

  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  async function handleSave() {
    if (!editAlt.trim()) {
      errorMsg = 'Alt text is required';
      return;
    }

    const pat = getCmsPat();
    if (!pat) {
      errorMsg = 'No PAT configured';
      return;
    }

    saving = true;

    try {
      let src = '';
      let width: number | undefined;
      let height: number | undefined;

      if (editFile) {
        const base64 = await fileToBase64(editFile);
        const uniqueName = Date.now() + '_' + editFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const filePath = 'static/media/' + uniqueName;

        const result = await uploadFile(filePath, base64, 'CMS: upload ' + uniqueName, pat);
        if (!result.ok) {
          errorMsg = result.error || 'Upload failed';
          saving = false;
          return;
        }

        src = '/media/' + uniqueName;

        const dims = await measureImage('/media/' + uniqueName);
        width = dims.w;
        height = dims.h;
      }

      if (editingIndex !== null) {
        const i = editingIndex;
        const updated = { ...allItems[i], title: editTitle || undefined, alt: editAlt, caption: editCaption || undefined };
        if (src) {
          updated.src = src;
          updated.width = width;
          updated.height = height;
        }
        allItems[i] = updated;
      } else {
        if (!src) {
          errorMsg = 'Please select an image file';
          saving = false;
          return;
        }
        const newItem: MediaItem = {
          src,
          type: 'image',
          title: editTitle || undefined,
          alt: editAlt,
          caption: editCaption || undefined,
          width,
          height,
        };
        allItems = [...allItems, newItem];
      }

      const saveResult = await saveContent('static/content/media/media-index.json', JSON.stringify(allItems, null, 2), 'CMS: update media index', pat);

      if (!saveResult.ok) {
        errorMsg = saveResult.error || 'Failed to save index';
        saving = false;
        return;
      }

      closeForm();
      successMsg = editingIndex !== null ? 'Image updated' : 'Image added';
    } catch (e) {
      errorMsg = String(e);
    } finally {
      saving = false;
    }
  }

  function handleDelete(i: number) {
    if (!confirm('Remove this image from the gallery?')) return;
    deleteItem(i);
  }

  async function deleteItem(i: number) {
    const pat = getCmsPat();
    if (!pat) {
      errorMsg = 'No PAT configured';
      return;
    }

    saving = true;
    allItems = allItems.filter((_, idx) => idx !== i);

    const result = await saveContent('static/content/media/media-index.json', JSON.stringify(allItems, null, 2), 'CMS: remove image', pat);

    if (!result.ok) {
      errorMsg = result.error || 'Failed to delete';
      saving = false;
      return;
    }

    if (editingIndex === i) closeForm();
    saving = false;
    successMsg = 'Image removed';
  }

  async function moveItem(i: number, direction: 'up' | 'down') {
    const newIndex = direction === 'up' ? i - 1 : i + 1;
    if (newIndex < 0 || newIndex >= allItems.length) return;

    const updated = [...allItems];
    [updated[i], updated[newIndex]] = [updated[newIndex], updated[i]];

    const pat = getCmsPat();
    if (!pat) {
      errorMsg = 'No PAT configured';
      return;
    }

    saving = true;
    const result = await saveContent('static/content/media/media-index.json', JSON.stringify(updated, null, 2), 'CMS: reorder media', pat);
    saving = false;

    if (!result.ok) {
      errorMsg = result.error || 'Failed to reorder';
      return;
    }

    allItems = updated;
    if (editingIndex === i) editingIndex = newIndex;
    else if (editingIndex === newIndex) editingIndex = i;
    successMsg = 'Reordered';
  }

  onMount(async () => {
    try {
      const res = await fetchContent('media/media-index.json');
      allItems = await res.json();
      await loadMore();
    } catch {
      allItems = [];
    } finally {
      loading = false;
    }
  });

  $effect(() => {
    if (!sentinelEl || !scrollContainerEl) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { root: scrollContainerEl, rootMargin: '200px' }
    );
    observer.observe(sentinelEl);
    return () => observer.disconnect();
  });
</script>

<div class="w-full h-full overflow-y-auto scrollbar-hidden relative" bind:this={scrollContainerEl}>
  {#if isAdmin}
    <div class="sticky top-0 z-40 flex items-center justify-between px-4 py-2 bg-background-900/90 backdrop-blur border-b border-background-200">
      <div class="flex items-center gap-2">
        <button
          onclick={toggleManage}
          class="px-3 py-1.5 rounded font-cinzel text-xs cursor-pointer {showManage ? 'bg-info-800 text-white' : 'bg-background-800 text-tprimary hover:bg-background-700'}"
        >
          {showManage ? 'View Gallery' : 'Manage Gallery'}
        </button>
        {#if showManage}
          <span class="text-xs text-tprimary-400 ml-2">{allItems.length} images</span>
        {/if}
      </div>
      {#if showManage}
        <button onclick={openAddForm} class="px-3 py-1.5 bg-info-800 hover:bg-info-700 text-white font-cinzel text-xs rounded cursor-pointer">
          <i class="mdi mdi-plus mr-1"></i>Add Image
        </button>
      {/if}
    </div>
  {/if}

  {#if showManage}
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
      {#each allItems as item, i}
        <div class="relative aspect-[4/3] rounded overflow-hidden border border-tprimary-800 group bg-background-900">
          <img src={item.src} alt={item.alt} class="w-full h-full object-cover" loading="lazy" />
          <div class="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 to-transparent p-2 pt-6">
            <span class="text-xs text-white font-cinzel truncate block">{item.title || item.alt}</span>
          </div>
          <div class="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              title="Move up"
              onclick={() => moveItem(i, 'up')}
              disabled={i === 0 || saving}
              class="px-1 py-0.5 bg-background-800/80 hover:bg-background-700 text-tprimary text-xs rounded cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <i class="mdi mdi-chevron-up"></i>
            </button>
            <button
              title="Move down"
              onclick={() => moveItem(i, 'down')}
              disabled={i === allItems.length - 1 || saving}
              class="px-1 py-0.5 bg-background-800/80 hover:bg-background-700 text-tprimary text-xs rounded cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <i class="mdi mdi-chevron-down"></i>
            </button>
          </div>
          <div class="absolute bottom-1 left-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button title="Edit" onclick={() => openEditForm(i)} class="px-1.5 py-0.5 bg-background-800/80 hover:bg-info-800 text-tprimary text-xs rounded cursor-pointer">
              <i class="mdi mdi-pencil text-xs"></i>
            </button>
            <button
              title="Delete"
              onclick={() => handleDelete(i)}
              disabled={saving}
              class="px-1.5 py-0.5 bg-red-800/80 hover:bg-red-700 text-white text-xs rounded cursor-pointer disabled:opacity-30"
            >
              <i class="mdi mdi-delete text-xs"></i>
            </button>
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <div class="p-4 pt-6 min-h-full">
      {#if loading}
        <div class="w-full flex items-center justify-center h-64">
          <span class="text-2xl font-cinzel text-tprimary-600 animate-pulse">Loading</span>
        </div>
      {:else if !measuredItems.length}
        <div class="w-full flex items-center justify-center h-64">
          <span class="text-2xl font-cinzel text-tprimary-600">No media yet</span>
        </div>
      {:else}
        <MasonryGallery items={measuredItems} />
      {/if}
      <div bind:this={sentinelEl} class="h-1"></div>
    </div>
  {/if}
</div>

{#if showAddForm}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
    <div class="bg-background-900 border border-tprimary-800 rounded-lg p-6 w-full max-w-lg mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-cinzel text-white">{editingIndex !== null ? 'Edit Image' : 'Add Image'}</h3>
        <button title="Close" onclick={closeForm} class="text-tprimary/70 hover:text-white text-xl cursor-pointer">&times;</button>
      </div>

      <div class="space-y-3">
        <div>
          <label for="edit-title" class="block text-xs font-cinzel text-tprimary-400 mb-1">Title</label>
          <input
            id="edit-title"
            bind:value={editTitle}
            placeholder="Optional title"
            class="w-full px-2 py-1.5 bg-background-800 border border-tprimary-700 text-tprimary text-sm rounded outline-none focus:border-tprimary-500"
          />
        </div>

        <div>
          <label for="edit-alt" class="block text-xs font-cinzel text-tprimary-400 mb-1">Alt text *</label>
          <input
            id="edit-alt"
            bind:value={editAlt}
            placeholder="Describe the image"
            class="w-full px-2 py-1.5 bg-background-800 border border-tprimary-700 text-tprimary text-sm rounded outline-none focus:border-tprimary-500"
          />
        </div>

        <div>
          <label for="edit-caption" class="block text-xs font-cinzel text-tprimary-400 mb-1">Caption</label>
          <textarea
            id="edit-caption"
            bind:value={editCaption}
            placeholder="Optional caption"
            rows={2}
            class="w-full px-2 py-1.5 bg-background-800 border border-tprimary-700 text-tprimary text-sm rounded outline-none focus:border-tprimary-500 resize-none"
          ></textarea>
        </div>

        <div>
          <label for="edit-file" class="block text-xs font-cinzel text-tprimary-400 mb-1">
            {editingIndex !== null ? 'Replace image (optional)' : 'Image file *'}
          </label>
          <input
            id="edit-file"
            type="file"
            accept="image/*"
            onchange={handleFileSelect}
            class="w-full text-sm text-tprimary file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-cinzel file:bg-info-800 file:text-white hover:file:bg-info-700 file:cursor-pointer cursor-pointer"
          />
          {#if previewUrl}
            <img src={previewUrl} alt="Preview" class="mt-2 max-h-32 rounded object-contain bg-background-800" />
          {:else if editingIndex !== null}
            <img src={allItems[editingIndex].src} alt="Current" class="mt-2 max-h-32 rounded object-contain bg-background-800" />
          {/if}
        </div>
      </div>

      <div class="flex justify-end gap-2 mt-4">
        <button onclick={closeForm} class="px-3 py-1.5 bg-background-700 hover:bg-background-600 text-tprimary font-cinzel text-xs rounded cursor-pointer"> Cancel </button>
        <button
          onclick={handleSave}
          disabled={saving || (editingIndex === null && !editFile)}
          class="px-3 py-1.5 bg-success-800 hover:bg-success-700 disabled:opacity-50 text-white font-cinzel text-xs rounded cursor-pointer disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  </div>
{/if}

{#if errorMsg}
  <div class="absolute bottom-4 right-[152px] max-md:right-4 max-md:left-4 z-50 px-4 py-2 bg-red-800 text-white font-cinzel text-xs rounded shadow-lg">
    {errorMsg}
    <button onclick={() => (errorMsg = '')} class="ml-2 text-white/70 hover:text-white">&times;</button>
  </div>
{/if}
{#if successMsg}
  <div class="absolute bottom-4 right-[152px] max-md:right-4 max-md:left-4 z-50 px-4 py-2 bg-green-800 text-white font-cinzel text-xs rounded shadow-lg">
    {successMsg}
    <button onclick={() => (successMsg = '')} class="ml-2 text-white/70 hover:text-white">&times;</button>
  </div>
{/if}
