# Alacena Inteligente - Backend

API RESTful para la aplicación Alacena Inteligente, que permite gestionar el inventario de alimentos en el hogar, recetas y listas de compras.

## Requisitos

- Node.js (v18.0.0 o superior)
- MySQL (v8.0 o superior)

## Instalación

1. Clonar el repositorio:

```bash
git clone https://github.com/tu-usuario/alacena-inteligente-backend.git
cd alacena-inteligente-backend
```

2. Instalar dependencias:

```bash
npm install
```

3. Configurar variables de entorno:

Copia el archivo `.env.example` a `.env` y configura las variables según tu entorno:

```bash
cp .env.example .env
```

4. Crear la base de datos MySQL:

```sql
CREATE DATABASE alacena_inteligente;
```

5. Iniciar el servidor:

```bash
# Modo desarrollo
npm run dev

# Modo producción
npm start
```

## Estructura del proyecto

```
├── config/             # Configuración de la aplicación
├── controllers/        # Controladores
├── middlewares/        # Middlewares
├── models/             # Modelos de la base de datos
├── routes/             # Rutas de la API
├── utils/              # Utilidades y helpers
├── tests/              # Tests
├── .env                # Variables de entorno
├── .env.example        # Ejemplo de variables de entorno
├── server.js           # Punto de entrada de la aplicación
└── package.json        # Dependencias y scripts
```

## Características principales

- Autenticación con JWT
- Gestión de inventario de alimentos
- Información nutricional mediante API de Open Food Facts
- Sistema de alertas para productos a punto de caducar
- Gestión de recetas
- Listas de compras
- API RESTful documentada con Swagger

## Documentación de la API

La documentación de la API está disponible en `/api-docs` cuando el servidor está en ejecución.

## Desarrollo

Para ejecutar tests:

```bash
npm test
```

Para ejecutar linting:

```bash
npm run lint
```

## Licencia

ISC
