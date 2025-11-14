# Robots.txt Optimizado para IA Crawlers - Weekly

## Descripción

Sistema de robots.txt dinámico optimizado para permitir el crawling de páginas públicas por crawlers de IA (GPTBot, Claude, Perplexity, etc.) y motores de búsqueda tradicionales.

## Características

### 1. Robots.txt Global (weekly.pe)
- Ubicación: `frontend/public/robots.txt`
- Se sirve automáticamente desde el frontend
- Optimizado para el dominio principal

### 2. Robots.txt Dinámico por Tenant
- Endpoint: `GET /robots.txt` (backend)
- Genera robots.txt personalizado para cada tenant
- Basado en el subdominio: `{tenant}.weekly.pe`
- Incluye información del tenant (nombre, marketplace status)

## Crawlers de IA Soportados

### OpenAI
- **GPTBot**: Crawler oficial de OpenAI
- **ChatGPT-User**: Usuario de ChatGPT

### Google
- **Google-Extended**: Crawler de Google para entrenamiento de IA
- **Googlebot**: Crawler tradicional de Google

### Anthropic
- **anthropic-ai**: Crawler de Anthropic
- **Claude-Web**: Crawler de Claude

### Otros
- **CCBot**: Common Crawl
- **PerplexityBot**: Perplexity AI
- **Applebot-Extended**: Apple AI crawler

### Motores de Búsqueda
- Googlebot
- Bingbot
- Slurp (Yahoo)
- DuckDuckBot
- Baiduspider
- YandexBot

## Configuración

### Páginas Permitidas (Allow)
- `/booking` - Calendario público de reservas
- `/calendario-publico` - Calendario público alternativo
- `/login` - Página de login (pública)

### Páginas Bloqueadas (Disallow)
- `/dashboard` - Panel administrativo
- `/admin` - Área de administración
- `/api/` - API endpoints
- `/configuracion` - Configuración del tenant
- `/estadisticas` - Estadísticas privadas
- `/servicios` - Gestión de servicios (admin)
- `/staff` - Gestión de colaboradores (admin)
- `/clientes` - Gestión de clientes (admin)
- `/categorias` - Gestión de categorías (admin)

### Archivos Bloqueados
- `*.json$` - Archivos JSON
- `*.xml$` - Archivos XML
- `/_next/` - Archivos de Next.js (si aplica)
- `/static/` - Archivos estáticos técnicos

## Crawl-delay

Todos los crawlers tienen un `Crawl-delay: 1` para evitar sobrecarga del servidor.

## Sitemaps

- Global: `https://weekly.pe/sitemap.xml`
- Por tenant: `https://{tenant}.weekly.pe/sitemap.xml`

## Implementación Técnica

### Frontend
- Archivo estático: `frontend/public/robots.txt`
- Se sirve automáticamente por Vite en desarrollo y producción

### Backend
- Controlador: `backend/src/controllers/robotsController.js`
- Ruta: `GET /robots.txt` en `backend/src/index.js`
- Lógica:
  1. Detecta el subdominio del request
  2. Si es dominio principal, devuelve robots.txt global
  3. Si es tenant, consulta BD y genera robots.txt personalizado
  4. Incluye información del tenant (nombre, marketplace)

## Ejemplo de Robots.txt por Tenant

```
# Peluquería Bella Vista - Robots.txt
# Optimizado para crawlers de IA y motores de búsqueda
# Tenant: peluqueria

User-agent: *
Allow: /

User-agent: GPTBot
Allow: /
Crawl-delay: 1

[... otros crawlers ...]

Allow: /booking
Disallow: /dashboard
Disallow: /admin
[...]

Sitemap: https://peluqueria.weekly.pe/sitemap.xml
```

## Beneficios

1. **Visibilidad en IA**: Las páginas públicas aparecen en respuestas de ChatGPT, Claude, Perplexity, etc.
2. **SEO Mejorado**: Mejor indexación en motores de búsqueda
3. **Personalización**: Cada tenant tiene su propio robots.txt
4. **Control Granular**: Bloquea áreas privadas, permite áreas públicas
5. **Performance**: Crawl-delay evita sobrecarga

## Testing

### Verificar robots.txt Global
```bash
curl https://weekly.pe/robots.txt
```

### Verificar robots.txt de Tenant
```bash
curl https://peluqueria.weekly.pe/robots.txt
```

### Verificar con User-Agent de IA
```bash
curl -A "GPTBot" https://weekly.pe/robots.txt
curl -A "anthropic-ai" https://peluqueria.weekly.pe/robots.txt
```

## Notas Importantes

1. **Cache**: Los robots.txt tienen cache de 1 hora (`Cache-Control: public, max-age=3600`)
2. **Fallback**: Si hay error al generar robots.txt de tenant, se devuelve el global
3. **Seguridad**: Solo se permite acceso a páginas públicas, áreas admin están bloqueadas
4. **Marketplace**: Si un tenant tiene `show_in_marketplace=true`, se incluye nota en robots.txt

## Futuras Mejoras

- [ ] Sitemap dinámico por tenant
- [ ] Configuración personalizada de robots.txt por tenant (admin)
- [ ] Analytics de crawlers (qué crawlers acceden y con qué frecuencia)
- [ ] Rate limiting específico por tipo de crawler

---

**Última actualización**: Noviembre 2024
**Versión**: 1.0

