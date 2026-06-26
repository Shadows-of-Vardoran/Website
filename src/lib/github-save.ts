import { dev } from '$app/environment';
import { bumpContentVersion } from './fetchContent';

const OWNER = 'Shadows-of-Vardoran';
const REPO = 'Website';
const API_BASE = `https://api.github.com/repos/${OWNER}/${REPO}`;

interface GitHubFile {
  sha: string;
  content: string;
}

async function getFileSha(path: string, pat: string): Promise<string | null> {
  const res = await fetch(`${API_BASE}/contents/${path}`, {
    headers: { Authorization: `Bearer ${pat}` },
  });
  if (!res.ok) return null;
  const data: GitHubFile = await res.json();
  return data.sha;
}

export async function saveContent(filePath: string, content: string, commitMessage: string, pat: string): Promise<{ ok: boolean; error?: string }> {
  if (dev) {
    try {
      const res = await fetch('/__cms-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath, content }),
      });
      const result = await res.json();
      if (result.ok) bumpContentVersion();
      return result;
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  }

  try {
    const sha = await getFileSha(filePath, pat);

    const encoder = new TextEncoder();
    const bytes = encoder.encode(content);
    let binary = '';
    for (let i = 0; i < bytes.length; i += 0xffff) {
      binary += String.fromCharCode(...bytes.subarray(i, i + 0xffff));
    }

    const body: Record<string, string> = {
      message: commitMessage,
      content: btoa(binary),
    };
    if (sha) {
      body.sha = sha;
    }

    const res = await fetch(`${API_BASE}/contents/${filePath}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${pat}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      return { ok: false, error: err.message || 'Unknown error' };
    }

    bumpContentVersion();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function uploadFile(filePath: string, base64Content: string, commitMessage: string, pat: string): Promise<{ ok: boolean; error?: string }> {
  if (dev) {
    try {
      const res = await fetch('/__cms-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath, content: base64Content }),
      });
      const result = await res.json();
      if (result.ok) bumpContentVersion();
      return result;
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  }

  try {
    const sha = await getFileSha(filePath, pat);

    const body: Record<string, string> = {
      message: commitMessage,
      content: base64Content,
    };
    if (sha) {
      body.sha = sha;
    }

    const res = await fetch(`${API_BASE}/contents/${filePath}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${pat}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      return { ok: false, error: err.message || 'Unknown error' };
    }

    bumpContentVersion();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export function buildCommitMessage(filePath: string): string {
  const fileName = filePath.split('/').pop() || filePath;
  return `CMS: update ${fileName}`;
}
