export const logger = {
  info: (msg: string, data?: unknown) =>
    console.log(`[INFO] ${new Date().toISOString()} ${msg}`, data || ''),
  error: (msg: string, error?: unknown) =>
    console.error(`[ERROR] ${new Date().toISOString()} ${msg}`, error || ''),
  warn: (msg: string, data?: unknown) =>
    console.warn(`[WARN] ${new Date().toISOString()} ${msg}`, data || ''),
};
