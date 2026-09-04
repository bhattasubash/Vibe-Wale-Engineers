/**
 * Application Configuration & Environment Resolver.
 * Guarantees API base URL resolution across local, staging, and multi-cloud deployments.
 */

export const API_BASE_URL: string = (
  import.meta.env.VITE_API_BASE_URL || ''
).replace(/\/+$/, '');
