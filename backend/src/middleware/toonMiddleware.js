/**
 * Middleware para manejar TOON (Token-Oriented Object Notation)
 * Permite recibir y enviar datos en formato TOON
 */

const ToonParser = require('../utils/toonParser');

/**
 * Middleware para parsear requests en formato TOON
 */
const toonParser = (req, res, next) => {
    // Solo procesar si el Content-Type es application/toon
    if (req.get('Content-Type') === 'application/toon' || 
        req.get('Content-Type') === 'text/toon') {
        
        let data = '';
        
        req.on('data', chunk => {
            data += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                req.body = ToonParser.parse(data);
                req.toonFormat = true;
                next();
            } catch (error) {
                console.error('Error parsing TOON:', error);
                res.status(400).json({
                    success: false,
                    error: 'Invalid TOON format',
                    message: error.message
                });
            }
        });
    } else {
        next();
    }
};

/**
 * Middleware para enviar respuestas en formato TOON
 * Detecta automáticamente si el cliente acepta TOON
 */
const toonResponse = (req, res, next) => {
    const originalJson = res.json.bind(res);
    
    // Verificar si el cliente acepta TOON
    const acceptHeader = req.get('Accept') || '';
    const acceptsToon = acceptHeader.includes('application/toon') || 
                       acceptHeader.includes('text/toon') ||
                       req.query.format === 'toon' ||
                       req.headers['x-response-format'] === 'toon';
    
    // Sobrescribir res.json para enviar TOON si se acepta
    res.json = function(data) {
        if (acceptsToon) {
            res.setHeader('Content-Type', 'application/toon; charset=utf-8');
            const toonData = ToonParser.stringify(data);
            return res.send(toonData);
        } else {
            // Comportamiento normal JSON
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            return originalJson(data);
        }
    };
    
    next();
};

module.exports = {
    toonParser,
    toonResponse
};

