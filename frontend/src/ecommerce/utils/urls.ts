/**
 * Utilidades para generar URLs del ecommerce
 * Estructura: weekly.pe/:ciudad/:categoria/:negocio-slug/:accion
 */

export const generarSlug = (texto: string): string => {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/[^a-z0-9]+/g, '-') // Reemplazar caracteres especiales con guiones
    .replace(/^-+|-+$/g, ''); // Eliminar guiones al inicio y final
};

export const generarUrlNegocio = (
  ciudad: string,
  categoria: string,
  aliadoId: number,
  nombre: string
): string => {
  const slug = generarSlug(nombre);
  return `/${ciudad}/${categoria}/${aliadoId}-${slug}`;
};

export const generarUrlReserva = (
  ciudad: string,
  categoria: string,
  aliadoId: number,
  nombre: string
): string => {
  const baseUrl = generarUrlNegocio(ciudad, categoria, aliadoId, nombre);
  return `${baseUrl}/booking`;
};

export const parsearUrl = (pathname: string): {
  ciudad?: string;
  categoria?: string;
  aliadoId?: number;
  accion?: string;
} => {
  const partes = pathname.split('/').filter(Boolean);

  if (partes.length === 0) {
    return {};
  }

  const resultado: {
    ciudad?: string;
    categoria?: string;
    aliadoId?: number;
    accion?: string;
  } = {};

  // weekly.pe/lima
  if (partes.length >= 1) {
    resultado.ciudad = partes[0];
  }

  // weekly.pe/lima/peluqueria
  if (partes.length >= 2) {
    resultado.categoria = partes[1];
  }

  // weekly.pe/lima/peluqueria/123-salon-bella-vista
  if (partes.length >= 3) {
    const aliadoPart = partes[2];
    const match = aliadoPart.match(/^(\d+)-/);
    if (match) {
      resultado.aliadoId = parseInt(match[1], 10);
    }
  }

  // weekly.pe/lima/peluqueria/123-salon-bella-vista/booking
  if (partes.length >= 4) {
    resultado.accion = partes[3];
  }

  return resultado;
};

