/**
 * Minimal structured logger. In CI we emit JSON so log aggregators
 * can parse the output; locally we get human-readable lines.
 */
type Level = 'info' | 'warn' | 'error' | 'debug';

const isCi = !!process.env.CI;

function log(level: Level, message: string, meta: Record<string, unknown> = {}): void {
  const entry = { level, time: new Date().toISOString(), message, ...meta };
  const line = isCi ? JSON.stringify(entry) : `[${level.toUpperCase()}] ${message}`;
  // eslint-disable-next-line no-console
  console.log(line);
}

export const logger = {
  info: (msg: string, meta?: Record<string, unknown>) => log('info', msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => log('warn', msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => log('error', msg, meta),
  debug: (msg: string, meta?: Record<string, unknown>) => log('debug', msg, meta),
};
