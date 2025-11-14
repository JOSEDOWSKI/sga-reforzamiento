# ✅ Implementación: Backend para App Móvil

## 📋 Resumen

Backend listo para la aplicación móvil Flutter. Incluye:
- ✅ Tablas en BD global
- ✅ APIs de discovery (búsqueda de tenants)
- ✅ Autenticación móvil completa

---

## 🗄️ 1. Crear Tablas en BD Global

### Comando:
```bash
npm run create-mobile-tables
```

O dentro del contenedor Docker:
```bash
docker exec -it <container-id> npm run create-mobile-tables
```

### Tablas Creadas:
- `usuarios_movil` - Usuarios de la app móvil
- `reservas_movil` - Tracking de reservas multi-tenant
- `tenant_categorias` - Categorías para búsqueda
- `tenant_reviews` - Calificaciones (futuro)
- `tenant_favoritos` - Favoritos (futuro)

---

## 🔍 2. APIs de Discovery

### A) Buscar Tenants

**Endpoint:** `GET /api/public/tenants`

**Query Parameters:**
- `categoria` - Filtrar por categoría (ej: "peluqueria")
- `latitud` - Latitud del usuario
- `longitud` - Longitud del usuario
- `radio_km` - Radio de búsqueda en km (default: 10)
- `search` - Búsqueda de texto (nombre, dirección)
- `limit` - Límite de resultados (default: 50)
- `offset` - Offset para paginación

**Ejemplo:**
```
GET /api/public/tenants?categoria=peluqueria&latitud=-12.0464&longitud=-77.0428&radio_km=5
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "tenant_name": "peluqueria-bella-vista",
      "display_name": "Peluquería Bella Vista",
      "cliente_direccion": "Av. Principal 123, Lima",
      "latitud": "-12.0464",
      "longitud": "-77.0428",
      "distancia_km": 2.5,
      "rating": 4.5,
      "total_reviews": 23,
      "categorias": ["peluqueria", "belleza"],
      "logo_url": "https://...",
      "primary_color": "#007bff"
    }
  ],
  "metadata": {
    "total": 1,
    "filters": {...}
  }
}
```

### B) Detalles de un Tenant

**Endpoint:** `GET /api/public/tenants/:tenantName/details`

**Ejemplo:**
```
GET /api/public/tenants/peluqueria-bella-vista/details
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "tenant_name": "peluqueria-bella-vista",
    "display_name": "Peluquería Bella Vista",
    "cliente_direccion": "Av. Principal 123, Lima",
    "latitud": "-12.0464",
    "longitud": "-77.0428",
    "rating": 4.5,
    "total_reviews": 23,
    "categorias": ["peluqueria", "belleza"],
    "reviews": [
      {
        "calificacion": 5,
        "comentario": "Excelente servicio",
        "usuario_nombre": "Juan Pérez",
        "created_at": "2025-11-10T10:00:00Z"
      }
    ]
  }
}
```

### C) Categorías Disponibles

**Endpoint:** `GET /api/public/categorias`

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "categoria": "peluqueria",
      "total_tenants": 15
    },
    {
      "categoria": "gimnasio",
      "total_tenants": 8
    }
  ]
}
```

---

## 🔐 3. Autenticación Móvil

### A) Registro

**Endpoint:** `POST /api/auth/mobile/register`

**Body:**
```json
{
  "email": "usuario@example.com",
  "telefono": "+51 987 654 321",
  "nombre": "Juan Pérez",
  "password": "password123",
  "fecha_nacimiento": "1990-01-01" // Opcional
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "usuario": {
      "id": 1,
      "email": "usuario@example.com",
      "telefono": "+51 987 654 321",
      "nombre": "Juan Pérez",
      "foto_url": null
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Usuario registrado exitosamente"
}
```

### B) Login

**Endpoint:** `POST /api/auth/mobile/login`

**Body:**
```json
{
  "email": "usuario@example.com",
  "password": "password123"
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "usuario": {
      "id": 1,
      "email": "usuario@example.com",
      "telefono": "+51 987 654 321",
      "nombre": "Juan Pérez",
      "foto_url": null
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login exitoso"
}
```

### C) Obtener Perfil (Requiere Autenticación)

**Endpoint:** `GET /api/auth/mobile/profile`

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "usuario@example.com",
    "telefono": "+51 987 654 321",
    "nombre": "Juan Pérez",
    "foto_url": null,
    "fecha_nacimiento": "1990-01-01",
    "estadisticas": {
      "total_reservas": 10,
      "reservas_activas": 2,
      "reservas_completadas": 8
    }
  }
}
```

### D) Actualizar Perfil (Requiere Autenticación)

**Endpoint:** `PUT /api/auth/mobile/profile`

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "nombre": "Juan Carlos Pérez",
  "telefono": "+51 987 654 322",
  "foto_url": "https://...",
  "fecha_nacimiento": "1990-01-01"
}
```

---

## 📱 Uso en Flutter

### Ejemplo de Búsqueda de Tenants

```dart
// Buscar tenants cercanos
final response = await http.get(
  Uri.parse('https://api.weekly.pe/api/public/tenants?latitud=-12.0464&longitud=-77.0428&radio_km=5'),
);

final data = json.decode(response.body);
final tenants = data['data'] as List;
```

### Ejemplo de Autenticación

```dart
// Login
final response = await http.post(
  Uri.parse('https://api.weekly.pe/api/auth/mobile/login'),
  headers: {'Content-Type': 'application/json'},
  body: json.encode({
    'email': 'usuario@example.com',
    'password': 'password123',
  }),
);

final data = json.decode(response.body);
final token = data['data']['token'];
// Guardar token para futuras peticiones
```

### Ejemplo de Petición Autenticada

```dart
// Obtener perfil
final response = await http.get(
  Uri.parse('https://api.weekly.pe/api/auth/mobile/profile'),
  headers: {
    'Authorization': 'Bearer $token',
    'Content-Type': 'application/json',
  },
);
```

---

## 🔧 Configuración de Tenants

Para que un tenant aparezca en la búsqueda, necesita:

1. **Estado activo:**
   ```sql
   UPDATE tenants SET estado = 'activo' WHERE tenant_name = 'peluqueria';
   ```

2. **Categorías asignadas:**
   ```sql
   INSERT INTO tenant_categorias (tenant_id, categoria)
   VALUES (
     (SELECT id FROM tenants WHERE tenant_name = 'peluqueria'),
     'peluqueria'
   );
   ```

3. **Coordenadas (opcional, para búsqueda por ubicación):**
   ```sql
   UPDATE tenants 
   SET latitud = -12.0464, longitud = -77.0428
   WHERE tenant_name = 'peluqueria';
   ```

---

## 📝 Próximos Pasos

### Para el Backend:
1. ✅ Tablas creadas
2. ✅ APIs de discovery implementadas
3. ✅ Autenticación móvil implementada
4. [ ] API de reservas multi-tenant (tracking en `reservas_movil`)
5. [ ] API de mis reservas (listar todas las reservas del usuario)

### Para Flutter:
1. [ ] Setup del proyecto
2. [ ] Pantalla de login/registro
3. [ ] Pantalla de exploración (mapa + lista)
4. [ ] Pantalla de detalle de negocio
5. [ ] Pantalla de reserva
6. [ ] Pantalla de mis reservas
7. [ ] Pantalla de perfil

---

## 🔒 Seguridad

- ✅ JWT tokens con expiración
- ✅ Passwords hasheados con bcrypt
- ✅ Validación de email y teléfono únicos
- ✅ Middleware de autenticación
- ✅ Rate limiting (ya implementado globalmente)

---

## 📊 Endpoints Disponibles

### Públicos (Sin Autenticación):
- `GET /api/public/tenants` - Buscar tenants
- `GET /api/public/tenants/:tenantName/details` - Detalles de tenant
- `GET /api/public/categorias` - Categorías disponibles
- `POST /api/auth/mobile/register` - Registro
- `POST /api/auth/mobile/login` - Login

### Protegidos (Requieren Token):
- `GET /api/auth/mobile/profile` - Obtener perfil
- `PUT /api/auth/mobile/profile` - Actualizar perfil

---

**Última actualización:** 2025-11-10


