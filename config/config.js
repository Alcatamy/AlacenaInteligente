require('dotenv').config();

const config = {
  // Entorno
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Servidor
  PORT: process.env.PORT || 3000,
  
  // Base de datos
  DB: {
    HOST: process.env.DB_HOST || 'localhost',
    USER: process.env.DB_USER || 'root',
    PASSWORD: process.env.DB_PASSWORD || '',
    NAME: process.env.DB_NAME || 'alacena_inteligente',
    DIALECT: 'mysql',
    POOL: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  
  // JWT
  JWT: {
    SECRET: process.env.JWT_SECRET || 'alacena-super-secret-key-2025',
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || '30d'
  },
  
  // Email
  EMAIL: {
    HOST: process.env.EMAIL_HOST,
    PORT: process.env.EMAIL_PORT || 587,
    USER: process.env.EMAIL_USER,
    PASSWORD: process.env.EMAIL_PASSWORD,
    FROM: process.env.EMAIL_FROM || 'noreply@alacenainteligente.com'
  },
  
  // Open Food Facts API
  OPEN_FOOD_FACTS_API: {
    BASE_URL: 'https://world.openfoodfacts.org/api/v0'
  },
  
  // Cache
  CACHE: {
    TTL: 60 * 60 * 2 // 2 horas en segundos
  }
};

module.exports = config; 