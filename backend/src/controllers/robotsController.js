/**
 * Controlador para servir robots.txt dinámico por tenant
 * Permite que cada tenant tenga su propio robots.txt optimizado para IA crawlers
 */

const { Pool } = require('pg');

class RobotsController {
    /**
     * Generar robots.txt para un tenant específico
     * GET /robots.txt
     */
    async getRobots(req, res) {
        try {
            const host = req.get('host') || '';
            const subdomain = this.extractSubdomain(host);
            
            // Si es el dominio principal, usar robots.txt global
            if (!subdomain || subdomain === 'www' || subdomain === 'panel' || subdomain === 'api') {
                return this.getGlobalRobots(req, res);
            }
            
            // Obtener configuración del tenant
            const globalPool = new Pool({
                user: process.env.DB_USER || 'postgres',
                host: process.env.DB_HOST || 'localhost',
                database: 'weekly_global',
                password: process.env.DB_PASSWORD || 'postgres',
                port: parseInt(process.env.DB_PORT) || 5432,
            });

            const result = await globalPool.query(
                'SELECT tenant_name, display_name, show_in_marketplace FROM tenants WHERE tenant_name = $1 AND estado = $2',
                [subdomain, 'activo']
            );

            await globalPool.end();

            // Si el tenant no existe o no está activo, usar robots.txt global
            if (result.rows.length === 0) {
                return this.getGlobalRobots(req, res);
            }

            const tenant = result.rows[0];
            const tenantUrl = `https://${subdomain}.weekly.pe`;

            // Generar robots.txt personalizado para el tenant
            const robotsTxt = this.generateTenantRobots(tenant, tenantUrl);

            res.setHeader('Content-Type', 'text/plain');
            res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache por 1 hora
            res.send(robotsTxt);
        } catch (error) {
            console.error('Error generando robots.txt:', error);
            // En caso de error, devolver robots.txt global
            return this.getGlobalRobots(req, res);
        }
    }

    /**
     * Generar robots.txt global para weekly.pe
     */
    getGlobalRobots(req, res) {
        const robotsTxt = `# Weekly - Robots.txt Global
# Optimizado para crawlers de IA y motores de búsqueda

# Permitir todos los crawlers de IA y motores de búsqueda
User-agent: *
Allow: /

# Crawlers de IA específicos
User-agent: GPTBot
Allow: /
Crawl-delay: 1

User-agent: ChatGPT-User
Allow: /
Crawl-delay: 1

User-agent: Google-Extended
Allow: /
Crawl-delay: 1

User-agent: anthropic-ai
Allow: /
Crawl-delay: 1

User-agent: Claude-Web
Allow: /
Crawl-delay: 1

User-agent: CCBot
Allow: /
Crawl-delay: 1

User-agent: PerplexityBot
Allow: /
Crawl-delay: 1

User-agent: Applebot-Extended
Allow: /
Crawl-delay: 1

# Motores de búsqueda tradicionales
User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: Bingbot
Allow: /
Crawl-delay: 1

User-agent: Slurp
Allow: /
Crawl-delay: 1

User-agent: DuckDuckBot
Allow: /
Crawl-delay: 1

User-agent: Baiduspider
Allow: /
Crawl-delay: 1

User-agent: YandexBot
Allow: /
Crawl-delay: 1

# Permitir acceso a páginas públicas importantes
Allow: /booking
Allow: /calendario-publico
Allow: /login

# Bloquear áreas administrativas y privadas
Disallow: /dashboard
Disallow: /admin
Disallow: /api/
Disallow: /configuracion
Disallow: /estadisticas
Disallow: /servicios
Disallow: /staff
Disallow: /clientes
Disallow: /categorias

# Bloquear archivos y recursos técnicos
Disallow: /*.json$
Disallow: /*.xml$
Disallow: /api/
Disallow: /_next/
Disallow: /static/

# Sitemap
Sitemap: https://weekly.pe/sitemap.xml

# Información adicional
# Este robots.txt permite el crawling de todas las páginas públicas
# y está optimizado para crawlers de IA como GPTBot, Claude, Perplexity, etc.
# Las páginas de booking y calendario público son indexables para mejorar
# la visibilidad en motores de búsqueda y asistentes de IA.
`;

        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.send(robotsTxt);
    }

    /**
     * Generar robots.txt personalizado para un tenant
     */
    generateTenantRobots(tenant, tenantUrl) {
        const displayName = tenant.display_name || tenant.tenant_name;
        const isMarketplace = tenant.show_in_marketplace || false;

        return `# ${displayName} - Robots.txt
# Optimizado para crawlers de IA y motores de búsqueda
# Tenant: ${tenant.tenant_name}

# Permitir todos los crawlers de IA y motores de búsqueda
User-agent: *
Allow: /

# Crawlers de IA específicos
User-agent: GPTBot
Allow: /
Crawl-delay: 1

User-agent: ChatGPT-User
Allow: /
Crawl-delay: 1

User-agent: Google-Extended
Allow: /
Crawl-delay: 1

User-agent: anthropic-ai
Allow: /
Crawl-delay: 1

User-agent: Claude-Web
Allow: /
Crawl-delay: 1

User-agent: CCBot
Allow: /
Crawl-delay: 1

User-agent: PerplexityBot
Allow: /
Crawl-delay: 1

User-agent: Applebot-Extended
Allow: /
Crawl-delay: 1

# Motores de búsqueda tradicionales
User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: Bingbot
Allow: /
Crawl-delay: 1

User-agent: Slurp
Allow: /
Crawl-delay: 1

User-agent: DuckDuckBot
Allow: /
Crawl-delay: 1

User-agent: Baiduspider
Allow: /
Crawl-delay: 1

User-agent: YandexBot
Allow: /
Crawl-delay: 1

# Permitir acceso a páginas públicas del tenant
Allow: /booking
Allow: /calendario-publico
Allow: /login

# Bloquear áreas administrativas y privadas
Disallow: /dashboard
Disallow: /admin
Disallow: /api/
Disallow: /configuracion
Disallow: /estadisticas
Disallow: /servicios
Disallow: /staff
Disallow: /clientes
Disallow: /categorias

# Bloquear archivos y recursos técnicos
Disallow: /*.json$
Disallow: /*.xml$
Disallow: /api/
Disallow: /_next/
Disallow: /static/

# Sitemap del tenant
Sitemap: ${tenantUrl}/sitemap.xml

# Información adicional
# Este robots.txt permite el crawling de todas las páginas públicas del negocio
# y está optimizado para crawlers de IA como GPTBot, Claude, Perplexity, etc.
# Las páginas de booking son indexables para mejorar la visibilidad en motores
# de búsqueda y asistentes de IA.
${isMarketplace ? '# Este negocio está disponible en el marketplace de Weekly\n' : ''}
`;
    }

    /**
     * Extraer subdominio del host
     */
    extractSubdomain(host) {
        if (!host) return null;
        
        // Remover puerto si existe
        const hostWithoutPort = host.split(':')[0];
        
        // Si es localhost, no hay subdominio
        if (hostWithoutPort.includes('localhost')) {
            return null;
        }
        
        const parts = hostWithoutPort.split('.');
        
        // weekly.pe -> null (dominio principal)
        // www.weekly.pe -> null (www no cuenta como subdominio)
        // tenant.weekly.pe -> tenant
        if (parts.length >= 3) {
            const subdomain = parts[0];
            // Ignorar www
            if (subdomain === 'www') {
                return null;
            }
            return subdomain;
        }
        
        return null;
    }
}

module.exports = new RobotsController();

