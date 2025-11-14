/**
 * Script de prueba para TOON Parser
 * Ejecutar con: node backend/test-toon.js
 */

const ToonParser = require('./src/utils/toonParser');
const ToonConverter = require('./src/utils/toonConverter');

console.log('🧪 Testing TOON Parser\n');

// Test 1: Objeto simple
const test1 = {
    nombre: 'Weekly',
    tipo: 'SaaS',
    activo: true
};

console.log('Test 1: Objeto simple');
console.log('JSON:', JSON.stringify(test1));
console.log('TOON:', ToonParser.stringify(test1));
console.log('Reducción:', ToonParser.compareSize(test1));
console.log('');

// Test 2: Array
const test2 = {
    features: ['reservas', 'calendario', 'multi-tenant'],
    planes: ['basico', 'premium', 'enterprise']
};

console.log('Test 2: Arrays');
console.log('JSON:', JSON.stringify(test2));
console.log('TOON:', ToonParser.stringify(test2));
console.log('Reducción:', ToonParser.compareSize(test2));
console.log('');

// Test 3: Objeto anidado
const test3 = {
    tenant: {
        id: 1,
        nombre: 'peluqueria',
        config: {
            features: {
                servicios: true,
                categorias: true
            },
            uiLabels: {
                colaborador: 'Estilista',
                colaboradores: 'Estilistas'
            }
        }
    }
};

console.log('Test 3: Objeto anidado');
console.log('JSON:', JSON.stringify(test3, null, 2));
console.log('TOON:', ToonParser.stringify(test3));
console.log('Reducción:', ToonParser.compareSize(test3));
console.log('');

// Test 4: Round-trip (parse -> stringify)
const test4 = {
    reserva: {
        id: 123,
        cliente: 'Juan Pérez',
        servicio: 'Corte de cabello',
        fecha: '2024-11-15',
        hora: '14:30'
    }
};

console.log('Test 4: Round-trip');
const toon = ToonParser.stringify(test4);
console.log('TOON:', toon);
const parsed = ToonParser.parse(toon);
console.log('Parsed:', JSON.stringify(parsed, null, 2));
console.log('Match:', JSON.stringify(test4) === JSON.stringify(parsed) ? '✅' : '❌');
console.log('');

// Test 5: Análisis completo
console.log('Test 5: Análisis completo');
const analysis = ToonConverter.analyze(test3);
console.log(JSON.stringify(analysis, null, 2));
console.log('');

console.log('✅ Tests completados');

