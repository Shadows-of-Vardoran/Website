let contentVersion = Date.now();

const CONTENT_BASE = import.meta.env.VITE_CONTENT_BASE || '/content/';

export function bumpContentVersion() {
  contentVersion = Date.now();
}

export function fetchContent(path: string): Promise<Response> {
  const base = CONTENT_BASE.endsWith('/') ? CONTENT_BASE : CONTENT_BASE + '/';
  return fetch(`${base}${path}?v=${contentVersion}`);
}
