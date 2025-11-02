/**
 * Logger utility para producción
 * En desarrollo muestra todos los logs, en producción solo errores críticos
 */
const isDevelopment = import.meta.env.DEV;

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log('[WEEKLY]', ...args);
    }
  },
  
  error: (...args: any[]) => {
    // Los errores siempre se muestran
    console.error('[WEEKLY ERROR]', ...args);
  },
  
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn('[WEEKLY WARN]', ...args);
    }
  },
  
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info('[WEEKLY INFO]', ...args);
    }
  }
};

