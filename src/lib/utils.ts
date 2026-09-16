import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import os from 'os';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const RESERVED_ALIASES = new Set([
  'api',
  'dashboard',
  'login',
  'signup',
  '404',
  '500',
  'terms',
  'privacy',
  'settings',
  'links',
  'analytics',
  'admin',
  'auth',
  'favicon.ico',
  'robots.txt',
  'sitemap.xml',
  'about',
  'contact',
  'help',
  'faq',
]);

function getLocalNetworkIp(): string | null {
  if (typeof window !== 'undefined') return null;
  try {
    const interfaces = os.networkInterfaces();
    for (const devName in interfaces) {
      const iface = interfaces[devName];
      if (!iface) continue;
      for (const alias of iface) {
        if (alias.family === 'IPv4' && !alias.internal) {
          return alias.address;
        }
      }
    }
  } catch {
    // ignore
  }
  return null;
}

function headerValue(req: any, key: string): string | null {
  if (!req?.headers) return null;
  try {
    const raw = req.headers.get
      ? req.headers.get(key)
      : req.headers[key] ?? req.headers[key.toLowerCase()];
    if (!raw) return null;
    const value = Array.isArray(raw) ? raw[0] : String(raw);
    return value.split(',')[0].trim() || null;
  } catch {
    return null;
  }
}

function hostnameOf(hostOrUrl: string): string {
  const trimmed = hostOrUrl.trim();
  try {
    const withProto = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `http://${trimmed.replace(/^\/\//, '')}`;
    return new URL(withProto).hostname.replace(/^\[|\]$/g, '').toLowerCase();
  } catch {
    return trimmed.split('/')[0].split(':')[0].toLowerCase();
  }
}

/** True for localhost, loopback, and local virtual hostnames. */
export function isLoopbackHost(hostOrUrl: string): boolean {
  const host = hostnameOf(hostOrUrl);
  if (!host) return true;
  return (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '0.0.0.0' ||
    host === '::1' ||
    host === '::' ||
    host.endsWith('.localhost') ||
    host.endsWith('.local')
  );
}

function toOrigin(raw: string, protoHint?: string | null): string | null {
  if (!raw?.trim()) return null;
  let value = raw.trim().replace(/\/+$/, '');
  if (value.includes(',')) value = value.split(',')[0].trim();
  if (!/^https?:\/\//i.test(value)) {
    const host = value.replace(/^\/\//, '');
    const proto = protoHint || (isLoopbackHost(host) ? 'http' : 'https');
    value = `${proto}://${host}`;
  }
  try {
    const parsed = new URL(value);
    return `${parsed.protocol}//${parsed.host}`.replace(/\/+$/, '');
  } catch {
    return null;
  }
}

function publicOrigin(raw: string | null | undefined, protoHint?: string | null): string | null {
  if (!raw) return null;
  const origin = toOrigin(raw, protoHint);
  if (!origin || isLoopbackHost(origin)) return null;
  return origin;
}

/**
 * Public site origin used in copied/shared short links.
 * Priority:
 * 1. NEXT_PUBLIC_APP_URL / APP_URL env vars
 * 2. Vercel deployment variables (VERCEL_PROJECT_PRODUCTION_URL, VERCEL_URL)
 * 3. Dynamic HTTP request host (if not localhost)
 * 4. Local network IP address (for testing across devices on same Wi-Fi)
 * 5. Fallback
 */
export function getBaseUrl(req?: any): string {
  const proto = headerValue(req, 'x-forwarded-proto');
  const host = headerValue(req, 'x-forwarded-host') || headerValue(req, 'host');

  const publicCandidates = [
    publicOrigin(process.env.NEXT_PUBLIC_APP_URL),
    publicOrigin(process.env.APP_URL),
    publicOrigin(host, proto),
    publicOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL),
    publicOrigin(process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL),
    publicOrigin(process.env.NEXT_PUBLIC_VERCEL_URL),
    publicOrigin(process.env.VERCEL_URL),
  ].filter((value): value is string => Boolean(value));

  if (publicCandidates.length > 0) {
    return publicCandidates[0];
  }

  const localFromRequest = host ? toOrigin(host, proto) : null;
  if (localFromRequest && !isLoopbackHost(localFromRequest)) {
    return localFromRequest;
  }

  // If host is localhost or missing, attempt to use local Wi-Fi / Ethernet IPv4 address so other LAN devices can connect
  const localIp = getLocalNetworkIp();
  if (localIp) {
    const port = host?.includes(':') ? host.split(':')[1] : '3000';
    return `http://${localIp}:${port}`;
  }

  if (typeof window !== 'undefined' && window.location?.origin && !isLoopbackHost(window.location.origin)) {
    return window.location.origin.replace(/\/+$/, '');
  }

  return 'http://localhost:3000';
}

export function buildShortUrl(shortCode: string, req?: any): string {
  return `${getBaseUrl(req)}/${shortCode}`;
}

/**
 * Validate URL string (Must be valid HTTP or HTTPS)
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Ensure URL has valid http:// or https:// prefix
 */
export function normalizeUrl(url: string): string {
  let trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }
  return trimmed;
}

/**
 * Generate a random short code (default 6 characters)
 */
export function generateShortCode(length = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  const bytes = new Uint8Array(length);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
    for (let i = 0; i < length; i++) {
      result += chars[bytes[i] % chars.length];
    }
  } else {
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }
  return result;
}

/**
 * Validate custom alias rules
 */
export function validateCustomAlias(alias: string): { valid: boolean; error?: string } {
  const trimmed = alias.trim().toLowerCase();
  
  if (trimmed.length < 3) {
    return { valid: false, error: 'Alias must be at least 3 characters long.' };
  }
  if (trimmed.length > 30) {
    return { valid: false, error: 'Alias cannot exceed 30 characters.' };
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return { valid: false, error: 'Alias can only contain letters, numbers, hyphens, and underscores.' };
  }
  if (RESERVED_ALIASES.has(trimmed)) {
    return { valid: false, error: 'This alias is reserved by the system.' };
  }
  return { valid: true };
}

/**
 * Format date for display
 */
export function formatDate(dateString: string | Date): string {
  const d = new Date(dateString);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format date and time
 */
export function formatDateTime(dateString: string | Date): string {
  const d = new Date(dateString);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
