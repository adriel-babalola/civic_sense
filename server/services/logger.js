const LOG_LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const LEVEL = (LOG_LEVELS[process.env.LOG_LEVEL] ?? 2);

function timestamp() {
  return new Date().toISOString();
}

export const logger = {
  error: (...args) => { if (LEVEL >= 0) console.error(`[${timestamp()}] [ERROR]`, ...args); },
  warn:  (...args) => { if (LEVEL >= 1) console.warn(`[${timestamp()}] [WARN]`, ...args); },
  info:  (...args) => { if (LEVEL >= 2) console.log(`[${timestamp()}] [INFO]`, ...args); },
  debug: (...args) => { if (LEVEL >= 3) console.log(`[${timestamp()}] [DEBUG]`, ...args); },
};
