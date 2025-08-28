const bcrypt = require('bcryptjs');

async function generatePasswordHash() {
    const password = 'admin123'; // Contraseña por defecto
    const saltRounds = 12;
    
    try {
        const hash = await bcrypt.hash(password, saltRounds);
        console.log('Password:', password);
        console.log('Hash:', hash);
        console.log('\nPuedes usar este hash en el archivo tenant-seed.sql');
    } catch (error) {
        console.error('Error generando hash:', error);
    }
}

generatePasswordHash();