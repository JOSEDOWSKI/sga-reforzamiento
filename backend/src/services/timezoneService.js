/**
 * Servicio para manejo de zonas horarias
 * Convierte fechas/horas entre UTC y timezone del tenant
 */

/**
 * Obtiene la timezone del tenant desde la BD global
 * @param {string} tenantName - Nombre del tenant
 * @returns {Promise<string>} - Timezone (ej: "America/Lima")
 */
async function getTenantTimezone(tenantName) {
    try {
        const { Pool } = require('pg');
        const globalPool = new Pool({
            user: process.env.DB_USER || 'postgres',
            host: process.env.DB_HOST || 'localhost',
            database: 'weekly_global',
            password: process.env.DB_PASSWORD || 'postgres',
            port: parseInt(process.env.DB_PORT) || 5432,
        });

        const result = await globalPool.query(
            'SELECT timezone FROM tenants WHERE tenant_name = $1',
            [tenantName]
        );

        await globalPool.end();

        if (result.rows.length === 0) {
            return 'UTC'; // Default
        }

        return result.rows[0].timezone || 'UTC';
    } catch (error) {
        console.error('Error obteniendo timezone del tenant:', error);
        return 'UTC'; // Fallback
    }
}

/**
 * Convierte una fecha/hora UTC a la timezone del tenant
 * @param {Date|string} date - Fecha/hora en UTC
 * @param {string} timezone - Timezone del tenant (ej: "America/Lima")
 * @returns {Date} - Fecha/hora en la timezone del tenant
 */
function convertToTenantTimezone(date, timezone = 'UTC') {
    if (!date) return null;
    
    const dateObj = date instanceof Date ? date : new Date(date);
    
    if (timezone === 'UTC') {
        return dateObj;
    }

    // Usar Intl.DateTimeFormat para conversión de timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });

    const parts = formatter.formatToParts(dateObj);
    const year = parseInt(parts.find(p => p.type === 'year').value);
    const month = parseInt(parts.find(p => p.type === 'month').value) - 1;
    const day = parseInt(parts.find(p => p.type === 'day').value);
    const hour = parseInt(parts.find(p => p.type === 'hour').value);
    const minute = parseInt(parts.find(p => p.type === 'minute').value);
    const second = parseInt(parts.find(p => p.type === 'second').value);

    return new Date(year, month, day, hour, minute, second);
}

/**
 * Convierte una fecha/hora de la timezone del tenant a UTC
 * @param {Date|string} date - Fecha/hora en timezone del tenant
 * @param {string} timezone - Timezone del tenant (ej: "America/Lima")
 * @returns {Date} - Fecha/hora en UTC
 */
function convertFromTenantTimezone(date, timezone = 'UTC') {
    if (!date) return null;
    
    const dateObj = date instanceof Date ? date : new Date(date);
    
    if (timezone === 'UTC') {
        return dateObj;
    }

    // Crear fecha asumiendo que está en la timezone del tenant
    // y convertirla a UTC
    const dateStr = dateObj.toISOString();
    const utcDate = new Date(dateStr);
    
    // Obtener offset de la timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        timeZoneName: 'longOffset'
    });
    
    // Calcular offset manualmente
    const localTime = new Date(dateStr);
    const utcTime = new Date(localTime.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tenantTime = new Date(localTime.toLocaleString('en-US', { timeZone: timezone }));
    const offset = tenantTime.getTime() - utcTime.getTime();
    
    return new Date(utcDate.getTime() - offset);
}

/**
 * Genera slots de tiempo disponibles basados en horarios de atención
 * @param {Object} horario - Objeto con hora_apertura, hora_cierre, intervalo_minutos, break_start, break_end
 * @param {Date} fecha - Fecha para la cual generar slots
 * @param {string} timezone - Timezone del tenant
 * @returns {Array<{inicio: Date, fin: Date}>} - Array de slots disponibles
 */
function generateTimeSlots(horario, fecha, timezone = 'UTC') {
    const slots = [];
    
    if (horario.is_closed || !horario.activo) {
        return slots; // No hay slots si está cerrado
    }

    const fechaBase = new Date(fecha);
    fechaBase.setHours(0, 0, 0, 0);

    // Parsear horas de apertura y cierre
    const [aperturaH, aperturaM] = horario.hora_apertura.split(':').map(Number);
    const [cierreH, cierreM] = horario.hora_cierre.split(':').map(Number);

    let horaActual = new Date(fechaBase);
    horaActual.setHours(aperturaH, aperturaM, 0, 0);

    const horaCierre = new Date(fechaBase);
    horaCierre.setHours(cierreH, cierreM, 0, 0);

    const intervaloMs = horario.intervalo_minutos * 60 * 1000;

    // Si hay break, generar dos rangos
    if (horario.break_start && horario.break_end) {
        const [breakStartH, breakStartM] = horario.break_start.split(':').map(Number);
        const [breakEndH, breakEndM] = horario.break_end.split(':').map(Number);

        const breakStart = new Date(fechaBase);
        breakStart.setHours(breakStartH, breakStartM, 0, 0);

        const breakEnd = new Date(fechaBase);
        breakEnd.setHours(breakEndH, breakEndM, 0, 0);

        // Primer rango: apertura hasta break_start
        while (horaActual < breakStart) {
            const slotFin = new Date(horaActual.getTime() + intervaloMs);
            if (slotFin <= breakStart) {
                slots.push({
                    inicio: new Date(horaActual),
                    fin: new Date(slotFin)
                });
            }
            horaActual = new Date(horaActual.getTime() + intervaloMs);
        }

        // Saltar el break
        horaActual = new Date(breakEnd);

        // Segundo rango: break_end hasta cierre
        while (horaActual < horaCierre) {
            const slotFin = new Date(horaActual.getTime() + intervaloMs);
            if (slotFin <= horaCierre) {
                slots.push({
                    inicio: new Date(horaActual),
                    fin: new Date(slotFin)
                });
            }
            horaActual = new Date(horaActual.getTime() + intervaloMs);
        }
    } else {
        // Sin break: un solo rango continuo
        while (horaActual < horaCierre) {
            const slotFin = new Date(horaActual.getTime() + intervaloMs);
            if (slotFin <= horaCierre) {
                slots.push({
                    inicio: new Date(horaActual),
                    fin: new Date(slotFin)
                });
            }
            horaActual = new Date(horaActual.getTime() + intervaloMs);
        }
    }

    return slots;
}

module.exports = {
    getTenantTimezone,
    convertToTenantTimezone,
    convertFromTenantTimezone,
    generateTimeSlots
};


