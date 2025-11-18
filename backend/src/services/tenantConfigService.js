/**
 * Servicio para manejar configuración personalizada de tenants
 * Proporciona valores por defecto y helpers para acceder a la configuración
 */

/**
 * Obtiene la configuración por defecto para un tenant
 * @returns {Object} Configuración por defecto
 */
function getDefaultConfig() {
    return {
        entityNames: {
            colaboradores: "colaboradores",
            establecimientos: "establecimientos",
            clientes: "clientes",
            reservas: "reservas",
            recursos: "recursos"
        },
        features: {
            servicios: true,        // Usar tabla de servicios/establecimientos
            categorias: true,       // Usar categorías
            recursos_fisicos: false, // Usar recursos físicos (canchas, sillones, etc.)
            colaboradores: true      // Usar colaboradores/staff (canchas, empleados, etc.)
        },
        reservationMode: "servicio", // "servicio" | "recurso" | "servicio_recurso"
        uiLabels: {
            colaborador: "Colaborador",
            colaboradores: "Colaboradores",
            establecimiento: "Establecimiento",
            establecimientos: "Establecimientos",
            cliente: "Cliente",
            clientes: "Clientes",
            reserva: "Reserva",
            reservas: "Reservas",
            recurso: "Recurso",
            recursos: "Recursos"
        }
    };
}

/**
 * Obtiene la configuración de un tenant, fusionando con valores por defecto
 * @param {Object} tenantConfig - Configuración del tenant desde la BD (puede ser null o parcial)
 * @returns {Object} Configuración completa con valores por defecto
 */
function getTenantConfig(tenantConfig) {
    const defaultConfig = getDefaultConfig();
    
    if (!tenantConfig || !tenantConfig.config || typeof tenantConfig.config !== 'object') {
        return defaultConfig;
    }

    // Fusionar config del tenant con valores por defecto
    return {
        entityNames: {
            ...defaultConfig.entityNames,
            ...(tenantConfig.config.entityNames || {})
        },
        features: {
            ...defaultConfig.features,
            ...(tenantConfig.config.features || {})
        },
        reservationMode: tenantConfig.config.reservationMode || defaultConfig.reservationMode,
        uiLabels: {
            ...defaultConfig.uiLabels,
            ...(tenantConfig.config.uiLabels || {})
        }
    };
}

/**
 * Obtiene el nombre personalizado de una entidad
 * @param {Object} tenantConfig - Configuración del tenant
 * @param {string} entityKey - Clave de la entidad (ej: "colaboradores")
 * @returns {string} Nombre personalizado o el por defecto
 */
function getEntityName(tenantConfig, entityKey) {
    const config = getTenantConfig(tenantConfig);
    return config.entityNames[entityKey] || entityKey;
}

/**
 * Obtiene la etiqueta UI personalizada
 * @param {Object} tenantConfig - Configuración del tenant
 * @param {string} labelKey - Clave de la etiqueta (ej: "colaboradores")
 * @returns {string} Etiqueta personalizada o la por defecto
 */
function getUILabel(tenantConfig, labelKey) {
    const config = getTenantConfig(tenantConfig);
    return config.uiLabels[labelKey] || labelKey;
}

/**
 * Verifica si una característica está habilitada
 * @param {Object} tenantConfig - Configuración del tenant
 * @param {string} featureKey - Clave de la característica (ej: "servicios")
 * @returns {boolean} true si está habilitada
 */
function isFeatureEnabled(tenantConfig, featureKey) {
    const config = getTenantConfig(tenantConfig);
    return config.features[featureKey] !== false; // Por defecto true
}

/**
 * Obtiene el modo de reserva del tenant
 * @param {Object} tenantConfig - Configuración del tenant
 * @returns {string} Modo de reserva: "servicio" | "recurso" | "servicio_recurso"
 */
function getReservationMode(tenantConfig) {
    const config = getTenantConfig(tenantConfig);
    return config.reservationMode || "servicio";
}

/**
 * Valida y normaliza la configuración antes de guardarla
 * @param {Object} config - Configuración a validar
 * @returns {Object} Configuración validada y normalizada
 */
function validateAndNormalizeConfig(config) {
    const defaultConfig = getDefaultConfig();
    const normalized = {
        entityNames: {},
        features: {},
        reservationMode: "servicio",
        uiLabels: {}
    };

    // Validar entityNames
    if (config.entityNames && typeof config.entityNames === 'object') {
        Object.keys(defaultConfig.entityNames).forEach(key => {
            if (config.entityNames[key] && typeof config.entityNames[key] === 'string') {
                normalized.entityNames[key] = config.entityNames[key].trim();
            }
        });
    }

    // Validar features
    if (config.features && typeof config.features === 'object') {
        Object.keys(defaultConfig.features).forEach(key => {
            normalized.features[key] = config.features[key] !== false;
        });
    }

    // Validar reservationMode
    const validModes = ["servicio", "recurso", "servicio_recurso"];
    if (config.reservationMode && validModes.includes(config.reservationMode)) {
        normalized.reservationMode = config.reservationMode;
    }

    // Validar uiLabels
    if (config.uiLabels && typeof config.uiLabels === 'object') {
        Object.keys(defaultConfig.uiLabels).forEach(key => {
            if (config.uiLabels[key] && typeof config.uiLabels[key] === 'string') {
                normalized.uiLabels[key] = config.uiLabels[key].trim();
            }
        });
    }

    return normalized;
}

module.exports = {
    getDefaultConfig,
    getTenantConfig,
    getEntityName,
    getUILabel,
    isFeatureEnabled,
    getReservationMode,
    validateAndNormalizeConfig
};


