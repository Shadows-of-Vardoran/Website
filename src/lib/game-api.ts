export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export interface HealthResponse {
  status: string;
  version: string;
  uptimeSeconds: number;
}

export interface PlayerSpecialty {
  id: number;
  level: number;
}

export interface PlayerInfo {
  guidHash: number;
  characterName: string;
  steamId: string;
  level: number;
  tags: string[];
  specialties: PlayerSpecialty[];
  position?: { x: number; y: number; z: number };
}

export interface PlayersResponse {
  playerCount: number;
  players: PlayerInfo[];
}

export interface WhoAmI {
  username: string;
  isMaster: boolean;
}

export interface AdminUserInfo {
  username: string;
  createdAt: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  isMaster: boolean;
}

const API_BASE: string = (import.meta.env.VITE_BACKEND_URL as string | undefined) ?? '';

let token: string | null = null;
let unauthorizedHandler: (() => void) | null = null;

export function setToken(value: string | null): void {
  token = value;
}

export function setUnauthorizedHandler(fn: (() => void) | null): void {
  unauthorizedHandler = fn;
}

async function request<T>(method: 'GET' | 'POST' | 'DELETE', path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const data = await res.json();
      if (data && typeof data.error === 'string') {
        message = data.error;
      }
    } catch {
      // Keep status text when the body is not JSON.
    }
    if (res.status === 401) {
      unauthorizedHandler?.();
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) {
    return undefined as T;
  }
  return (await res.json()) as T;
}

export function login(username: string, password: string): Promise<LoginResponse> {
  return request('POST', '/api/auth/login', { username, password });
}

export function logoutReq(): Promise<{ success: boolean }> {
  return request('POST', '/api/auth/logout');
}

export function whoami(): Promise<WhoAmI> {
  return request('GET', '/api/whoami');
}

export function getHealth(): Promise<HealthResponse> {
  return request('GET', '/api/health');
}

export function getPlayers(): Promise<PlayersResponse> {
  return request('GET', '/api/players');
}

export function getUsers(): Promise<AdminUserInfo[]> {
  return request('GET', '/api/users');
}

export function createUser(username: string, password: string): Promise<{ status: string }> {
  return request('POST', '/api/users', { username, password });
}

export function deleteUser(username: string): Promise<{ status: string }> {
  return request('DELETE', `/api/users/${encodeURIComponent(username)}`);
}
