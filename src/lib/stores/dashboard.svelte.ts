import { browser } from '$app/environment';
import * as api from '$lib/game-api';

export interface DashboardSession {
  token: string;
  username: string;
  isMaster: boolean;
}

let session = $state<DashboardSession | null>(null);

export function getSession(): DashboardSession | null {
  return session;
}

export function getDashboardAuthed(): boolean {
  return session !== null;
}

export function restoreSession(): void {
  if (!browser) return;
  const raw = sessionStorage.getItem('dashboard_session');
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw) as DashboardSession;
    if (parsed && parsed.token) {
      session = parsed;
      api.setToken(parsed.token);
    }
  } catch {
    sessionStorage.removeItem('dashboard_session');
  }
}

export async function login(username: string, password: string): Promise<string | null> {
  try {
    const res = await api.login(username, password);
    const next: DashboardSession = { token: res.token, username: res.username, isMaster: res.isMaster };
    session = next;
    api.setToken(next.token);
    if (browser) {
      sessionStorage.setItem('dashboard_session', JSON.stringify(next));
    }
    return null;
  } catch (e) {
    return e instanceof Error ? e.message : 'Login failed';
  }
}

export function logout(): void {
  api.logoutReq().catch(() => {});
  clearSession();
}

export function clearSession(): void {
  session = null;
  api.setToken(null);
  if (browser) {
    sessionStorage.removeItem('dashboard_session');
  }
}

api.setUnauthorizedHandler(() => {
  clearSession();
});
