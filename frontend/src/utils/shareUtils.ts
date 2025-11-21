/**
 * Utilidades para compartir contenido
 */

/**
 * Compartir usando Web Share API (nativo) o fallback a copiar al portapapeles
 */
export const shareService = async (
  title: string,
  text: string,
  url: string
): Promise<boolean> => {
  // Intentar usar Web Share API si está disponible (móviles principalmente)
  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text,
        url
      });
      return true;
    } catch (error: any) {
      // El usuario canceló o hubo un error
      if (error.name !== 'AbortError') {
        console.error('Error compartiendo:', error);
      }
      // Continuar con fallback
    }
  }

  // Fallback: copiar URL al portapapeles
  try {
    await navigator.clipboard.writeText(url);
    
    // Mostrar notificación temporal (puedes personalizar esto)
    if (typeof window !== 'undefined') {
      const notification = document.createElement('div');
      notification.textContent = '¡Enlace copiado al portapapeles!';
      notification.style.cssText = `
        position: fixed;
        bottom: 2rem;
        left: 50%;
        transform: translateX(-50%);
        background: #16A34A;
        color: white;
        padding: 1rem 2rem;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        font-family: 'Inter', sans-serif;
        font-weight: 600;
        animation: slideUp 0.3s ease-out;
      `;
      
      // Agregar animación
      const style = document.createElement('style');
      style.textContent = `
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `;
      document.head.appendChild(style);
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.style.animation = 'slideUp 0.3s ease-out reverse';
        setTimeout(() => {
          document.body.removeChild(notification);
          document.head.removeChild(style);
        }, 300);
      }, 2000);
    }
    
    return true;
  } catch (error) {
    console.error('Error copiando al portapapeles:', error);
    
    // Último fallback: mostrar URL en un prompt
    alert(`Comparte este enlace:\n${url}`);
    return false;
  }
};

/**
 * Generar URL completa para compartir
 */
export const getShareUrl = (path: string): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}${path}`;
};

