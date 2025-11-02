const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getTenantDatabase } = require('../config/tenantDatabase');

/**
 * Controlador de autenticación universal
 * Permite login desde cualquier dominio sin necesidad de saber el subdominio del tenant
 */
class UniversalAuthController {
    /**
     * Login universal - busca el usuario en todas las bases de datos de tenants
     */
    static async universalLogin(req, res) {
        try {
            const { email, password } = req.body;
            
            if (!email || !password) {
                return res.status(400).json({
                    error: 'Validation Error',
                    message: 'Email y contraseña son requeridos'
                });
            }
            
            const normalizedEmail = email.toLowerCase().trim();
            console.log(`[UNIVERSAL LOGIN] Intentando login universal para: ${normalizedEmail}`);
            
            // Conectar a BD global para buscar el mapeo email → tenant
            const { Pool } = require('pg');
            const dbHost = process.env.DB_HOST || (process.env.NODE_ENV === 'production' ? 'srv-captain--weekly-postgres' : 'localhost');
            const globalDbConfig = {
                user: process.env.DB_USER || 'postgres',
                host: dbHost,
                database: 'weekly_global',
                password: process.env.DB_PASSWORD || 'postgres',
                port: parseInt(process.env.DB_PORT) || 5432,
            };
            
            const globalPool = new Pool(globalDbConfig);
            let tenantName = null;
            
            try {
                // Buscar en la tabla de mapeo
                const mappingResult = await globalPool.query(
                    'SELECT tenant_name FROM email_tenant_mapping WHERE email = $1',
                    [normalizedEmail]
                );
                
                if (mappingResult.rows.length > 0) {
                    tenantName = mappingResult.rows[0].tenant_name;
                    console.log(`[UNIVERSAL LOGIN] Mapeo encontrado: ${normalizedEmail} → ${tenantName}`);
                } else {
                    // Si no hay mapeo, verificar si es usuario global
                    const globalUserResult = await globalPool.query(
                        'SELECT * FROM usuarios_global WHERE email = $1 AND activo = true',
                        [normalizedEmail]
                    );
                    
                    if (globalUserResult.rows.length > 0) {
                        // Es usuario global (super admin)
                        const user = globalUserResult.rows[0];
                        const isValidPassword = await bcrypt.compare(password, user.password_hash);
                        
                        if (!isValidPassword) {
                            await globalPool.end();
                            return res.status(401).json({
                                error: 'Authentication Error',
                                message: 'Credenciales inválidas'
                            });
                        }
                        
                        // Actualizar último acceso
                        await globalPool.query(
                            'UPDATE usuarios_global SET ultimo_acceso = CURRENT_TIMESTAMP WHERE id = $1',
                            [user.id]
                        );
                        
                        // Generar token
                        const token = jwt.sign(
                            {
                                userId: user.id,
                                email: user.email,
                                rol: user.rol,
                                userType: 'global',
                                tenant: 'global'
                            },
                            process.env.JWT_SECRET,
                            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
                        );
                        
                        const { password_hash, ...userWithoutPassword } = user;
                        
                        await globalPool.end();
                        return res.json({
                            message: 'Login exitoso',
                            token,
                            user: {
                                ...userWithoutPassword,
                                userType: 'global'
                            },
                            tenant: 'global',
                            redirectTo: 'https://panel.weekly.pe' // Redirigir al panel global
                        });
                    }
                    
                    await globalPool.end();
                    return res.status(401).json({
                        error: 'Authentication Error',
                        message: 'Credenciales inválidas'
                    });
                }
            } finally {
                if (!globalPool.ended) {
                    await globalPool.end();
                }
            }
            
            // Si encontramos el tenant, hacer login en su BD
            if (tenantName) {
                // Obtener conexión a la BD del tenant
                const tenantPool = await getTenantDatabase(tenantName);
                
                // Buscar usuario en la BD del tenant
                const query = 'SELECT * FROM usuarios WHERE email = $1 AND activo = true';
                const result = await tenantPool.query(query, [normalizedEmail]);
                
                if (result.rows.length === 0) {
                    return res.status(401).json({
                        error: 'Authentication Error',
                        message: 'Credenciales inválidas'
                    });
                }
                
                const user = result.rows[0];
                
                // Verificar contraseña
                const isValidPassword = await bcrypt.compare(password, user.password_hash);
                
                if (!isValidPassword) {
                    return res.status(401).json({
                        error: 'Authentication Error',
                        message: 'Credenciales inválidas'
                    });
                }
                
                // Actualizar último acceso
                await tenantPool.query(
                    'UPDATE usuarios SET ultimo_acceso = CURRENT_TIMESTAMP WHERE id = $1',
                    [user.id]
                );
                
                // Generar JWT token
                const token = jwt.sign(
                    {
                        userId: user.id,
                        email: user.email,
                        rol: user.rol,
                        tenant: tenantName
                    },
                    process.env.JWT_SECRET,
                    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
                );
                
                const { password_hash, ...userWithoutPassword } = user;
                
                console.log(`[UNIVERSAL LOGIN] ✅ Login exitoso para: ${normalizedEmail} en tenant: ${tenantName}`);
                
                return res.json({
                    message: 'Login exitoso',
                    token,
                    user: userWithoutPassword,
                    tenant: tenantName,
                    redirectTo: `https://${tenantName}.weekly.pe` // Redirigir al panel del tenant
                });
            }
            
            return res.status(401).json({
                error: 'Authentication Error',
                message: 'Credenciales inválidas'
            });
            
        } catch (error) {
            console.error('Error en login universal:', error);
            res.status(500).json({
                error: 'Internal Server Error',
                message: 'Error interno del servidor'
            });
        }
    }
}

module.exports = UniversalAuthController;

