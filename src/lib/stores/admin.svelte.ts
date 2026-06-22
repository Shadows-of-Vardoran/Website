import { browser } from '$app/environment';

let isAdmin = $state(false);

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function getStoredHash(): Promise<string | null> {
  if (!browser) return null;
  try {
    return import.meta.env.VITE_CMS_PASSWORD_HASH || sessionStorage.getItem('cms_hash') || null;
  } catch {
    return sessionStorage.getItem('cms_hash') || null;
  }
}

function getPat(): string | null {
  if (!browser) return null;
  try {
    return import.meta.env.VITE_CMS_PAT || null;
  } catch {
    return null;
  }
}

export function getIsAdmin(): boolean {
  return isAdmin;
}

export async function tryUnlock(password: string): Promise<boolean> {
  const storedHash = await getStoredHash();
  if (!storedHash) return false;

  const inputHash = await sha256(password);
  if (inputHash.toLowerCase() !== storedHash.toLowerCase()) return false;

  isAdmin = true;
  sessionStorage.setItem('cms_hash', storedHash);
  return true;
}

export function lock(): void {
  isAdmin = false;
  if (browser) {
    sessionStorage.removeItem('cms_hash');
  }
}

export function getCmsPat(): string | null {
  return getPat();
}

export function restoreSession(): void {
  if (!browser) return;
  const hash = sessionStorage.getItem('cms_hash');
  if (hash) {
    isAdmin = true;
  }
}

export function isCmsConfigured(): boolean {
  try {
    return !!(import.meta.env.VITE_CMS_PAT && import.meta.env.VITE_CMS_PASSWORD_HASH);
  } catch {
    return false;
  }
}
