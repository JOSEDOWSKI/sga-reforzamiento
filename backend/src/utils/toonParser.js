/**
 * TOON (Token-Oriented Object Notation) Parser and Serializer
 * Optimizado para reducir tokens en comunicación con LLMs
 * 
 * Especificación TOON:
 * - Usa indentación para estructura (similar a YAML)
 * - Elimina llaves, corchetes y comillas innecesarias
 * - Reduce tokens en 30-60% vs JSON
 */

class ToonParser {
    /**
     * Convertir objeto JavaScript a formato TOON
     * @param {any} obj - Objeto a convertir
     * @param {number} indent - Nivel de indentación actual
     * @returns {string} - String en formato TOON
     */
    static stringify(obj, indent = 0) {
        if (obj === null) return 'null';
        if (obj === undefined) return '';
        
        const indentStr = '  '.repeat(indent);
        const nextIndent = indent + 1;
        const nextIndentStr = '  '.repeat(nextIndent);
        
        // Primitivos
        if (typeof obj === 'string') {
            // Escapar caracteres especiales
            if (obj.includes(':') || obj.includes('\n') || obj.includes('"') || obj.trim() !== obj) {
                return `"${obj.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`;
            }
            return obj;
        }
        
        if (typeof obj === 'number' || typeof obj === 'boolean') {
            return String(obj);
        }
        
        // Arrays
        if (Array.isArray(obj)) {
            if (obj.length === 0) return '[]';
            
            const items = obj.map(item => {
                const serialized = this.stringify(item, nextIndent);
                // Si es un objeto o array, necesita indentación
                if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
                    return `- ${serialized}`;
                } else if (Array.isArray(item)) {
                    return `- ${serialized}`;
                } else {
                    return `- ${serialized}`;
                }
            }).join('\n' + nextIndentStr);
            
            return items;
        }
        
        // Objetos
        if (typeof obj === 'object') {
            const keys = Object.keys(obj);
            if (keys.length === 0) return '{}';
            
            const pairs = keys.map(key => {
                const value = obj[key];
                const serializedValue = this.stringify(value, nextIndent);
                
                // Si el valor es un objeto o array, ponerlo en nueva línea con indentación
                if (typeof value === 'object' && value !== null) {
                    if (Array.isArray(value) && value.length > 0) {
                        return `${key}:\n${nextIndentStr}${serializedValue}`;
                    } else if (!Array.isArray(value) && Object.keys(value).length > 0) {
                        return `${key}:\n${nextIndentStr}${serializedValue}`;
                    }
                }
                
                return `${key}: ${serializedValue}`;
            }).join('\n' + indentStr);
            
            return pairs;
        }
        
        return String(obj);
    }
    
    /**
     * Convertir string TOON a objeto JavaScript
     * @param {string} toon - String en formato TOON
     * @returns {any} - Objeto JavaScript
     */
    static parse(toon) {
        if (!toon || toon.trim() === '') return null;
        
        const lines = toon.split('\n');
        const result = this._parseLines(lines, 0);
        return result.value;
    }
    
    /**
     * Parsear líneas recursivamente
     * @private
     */
    static _parseLines(lines, startIndex, currentIndent = 0) {
        const result = {};
        let i = startIndex;
        
        while (i < lines.length) {
            const line = lines[i];
            const trimmed = line.trim();
            
            // Línea vacía
            if (trimmed === '') {
                i++;
                continue;
            }
            
            // Calcular indentación
            const indent = line.match(/^(\s*)/)[1].length;
            
            // Si la indentación es menor, hemos terminado este nivel
            if (indent < currentIndent) {
                break;
            }
            
            // Si es un item de array (empieza con -)
            if (trimmed.startsWith('- ')) {
                const value = trimmed.substring(2).trim();
                const parsed = this._parseValue(value);
                
                // Si el siguiente elemento tiene más indentación, es un objeto/array
                if (i + 1 < lines.length) {
                    const nextIndent = lines[i + 1].match(/^(\s*)/)[1].length;
                    if (nextIndent > indent) {
                        const subResult = this._parseLines(lines, i + 1, nextIndent);
                        if (subResult.value !== null) {
                            parsed.push ? parsed.push(subResult.value) : parsed = [parsed, subResult.value];
                        }
                        i = subResult.nextIndex;
                        continue;
                    }
                }
                
                // Agregar a array temporal
                if (!result._array) result._array = [];
                result._array.push(parsed);
                i++;
                continue;
            }
            
            // Es un par clave:valor
            const colonIndex = trimmed.indexOf(':');
            if (colonIndex === -1) {
                i++;
                continue;
            }
            
            const key = trimmed.substring(0, colonIndex).trim();
            const valueStr = trimmed.substring(colonIndex + 1).trim();
            
            // Si el siguiente elemento tiene más indentación, es un objeto/array anidado
            if (i + 1 < lines.length) {
                const nextIndent = lines[i + 1].match(/^(\s*)/)[1].length;
                if (nextIndent > indent) {
                    const subResult = this._parseLines(lines, i + 1, nextIndent);
                    result[key] = subResult.value;
                    i = subResult.nextIndex;
                    continue;
                }
            }
            
            // Valor simple
            result[key] = this._parseValue(valueStr);
            i++;
        }
        
        // Si tenemos un array, devolverlo
        if (result._array) {
            return { value: result._array, nextIndex: i };
        }
        
        return { value: Object.keys(result).length > 0 ? result : null, nextIndex: i };
    }
    
    /**
     * Parsear valor primitivo
     * @private
     */
    static _parseValue(value) {
        if (value === '') return null;
        if (value === 'null') return null;
        if (value === 'true') return true;
        if (value === 'false') return false;
        
        // Número
        if (/^-?\d+\.?\d*$/.test(value)) {
            return parseFloat(value);
        }
        
        // String con comillas
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
            return value.slice(1, -1).replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
        }
        
        // String sin comillas
        return value;
    }
    
    /**
     * Comparar tamaño en tokens (aproximado)
     * @param {any} obj - Objeto a comparar
     * @returns {{json: number, toon: number, reduction: number, reductionPercent: number}}
     */
    static compareSize(obj) {
        const json = JSON.stringify(obj);
        const toon = this.stringify(obj);
        
        // Aproximación de tokens (1 token ≈ 4 caracteres en promedio)
        const jsonTokens = Math.ceil(json.length / 4);
        const toonTokens = Math.ceil(toon.length / 4);
        const reduction = jsonTokens - toonTokens;
        const reductionPercent = ((reduction / jsonTokens) * 100).toFixed(1);
        
        return {
            json: jsonTokens,
            toon: toonTokens,
            reduction: reduction,
            reductionPercent: parseFloat(reductionPercent),
            jsonSize: json.length,
            toonSize: toon.length
        };
    }
}

module.exports = ToonParser;

