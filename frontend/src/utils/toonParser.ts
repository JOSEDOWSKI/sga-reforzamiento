/**
 * TOON Parser para TypeScript/JavaScript
 * Convierte strings TOON a objetos JavaScript
 */

export function parseToon(toon: string): any {
    if (!toon || toon.trim() === '') return null;
    
    const lines = toon.split('\n');
    const result = parseLines(lines, 0);
    return result.value;
}

interface ParseResult {
    value: any;
    nextIndex: number;
}

function parseLines(lines: string[], startIndex: number, currentIndent: number = 0): ParseResult {
    const result: any = {};
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
        const indentMatch = line.match(/^(\s*)/);
        const indent = indentMatch ? indentMatch[1].length : 0;
        
        // Si la indentación es menor, hemos terminado este nivel
        if (indent < currentIndent) {
            break;
        }
        
        // Si es un item de array (empieza con -)
        if (trimmed.startsWith('- ')) {
            const value = trimmed.substring(2).trim();
            const parsed = parseValue(value);
            
            // Si el siguiente elemento tiene más indentación, es un objeto/array
            if (i + 1 < lines.length) {
                const nextIndentMatch = lines[i + 1].match(/^(\s*)/);
                const nextIndent = nextIndentMatch ? nextIndentMatch[1].length : 0;
                if (nextIndent > indent) {
                    const subResult = parseLines(lines, i + 1, nextIndent);
                    if (subResult.value !== null) {
                        if (!result._array) result._array = [];
                        result._array.push(subResult.value);
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
            const nextIndentMatch = lines[i + 1].match(/^(\s*)/);
            const nextIndent = nextIndentMatch ? nextIndentMatch[1].length : 0;
            if (nextIndent > indent) {
                const subResult = parseLines(lines, i + 1, nextIndent);
                result[key] = subResult.value;
                i = subResult.nextIndex;
                continue;
            }
        }
        
        // Valor simple
        result[key] = parseValue(valueStr);
        i++;
    }
    
    // Si tenemos un array, devolverlo
    if (result._array) {
        return { value: result._array, nextIndex: i };
    }
    
    return { value: Object.keys(result).length > 0 ? result : null, nextIndex: i };
}

function parseValue(value: string): any {
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

