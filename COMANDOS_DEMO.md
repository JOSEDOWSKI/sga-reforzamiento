# Comandos para Demo - Weekly Backend

## Ejecutar comandos en el backend (sin necesidad del ID del contenedor)

### Opción 1: Usar el script (recomendado)
```bash
bash backend/scripts/exec-backend.sh "npm run init-demo-complete"
```

### Opción 2: Comando directo (encuentra el contenedor automáticamente)
```bash
docker exec -it $(docker ps | grep weekly-backend | awk '{print $NF}') npm run init-demo-complete
```

## Comandos útiles para la demo

### Inicializar demo completa (TODO en uno)
```bash
docker exec -it $(docker ps | grep weekly-backend | awk '{print $NF}') npm run init-demo-complete
```

### Arreglar BD demo
```bash
docker exec -it $(docker ps | grep weekly-backend | awk '{print $NF}') npm run fix-demo-db
```

### Configurar datos de demo
```bash
docker exec -it $(docker ps | grep weekly-backend | awk '{print $NF}') npm run setup-demo-data
```

### Verificar estado de la demo
```bash
docker exec -it $(docker ps | grep weekly-backend | awk '{print $NF}') npm run check-demo-db
```

## Nota
El ID del contenedor cambia cada vez que se hace deploy o reinicio. 
Usa estos comandos que encuentran automáticamente el contenedor.
