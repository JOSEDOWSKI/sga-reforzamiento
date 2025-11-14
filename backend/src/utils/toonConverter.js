/**
 * Utilidades para conversión entre JSON y TOON
 * Útil para migración gradual y compatibilidad
 */

const ToonParser = require('./toonParser');

class ToonConverter {
    /**
     * Convertir JSON string a TOON
     */
    static jsonToToon(jsonString) {
        try {
            const obj = JSON.parse(jsonString);
            return ToonParser.stringify(obj);
        } catch (error) {
            throw new Error(`Error converting JSON to TOON: ${error.message}`);
        }
    }
    
    /**
     * Convertir TOON string a JSON
     */
    static toonToJson(toonString) {
        try {
            const obj = ToonParser.parse(toonString);
            return JSON.stringify(obj, null, 2);
        } catch (error) {
            throw new Error(`Error converting TOON to JSON: ${error.message}`);
        }
    }
    
    /**
     * Analizar reducción de tokens
     */
    static analyze(obj) {
        const comparison = ToonParser.compareSize(obj);
        const json = JSON.stringify(obj);
        const toon = ToonParser.stringify(obj);
        
        return {
            ...comparison,
            jsonPreview: json.substring(0, 200) + (json.length > 200 ? '...' : ''),
            toonPreview: toon.substring(0, 200) + (toon.length > 200 ? '...' : ''),
            recommendation: comparison.reductionPercent > 20 
                ? 'TOON recommended (significant token reduction)'
                : comparison.reductionPercent > 10
                ? 'TOON optional (moderate token reduction)'
                : 'JSON acceptable (minimal benefit from TOON)'
        };
    }
}

module.exports = ToonConverter;

