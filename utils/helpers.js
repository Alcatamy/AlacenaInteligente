const jwt = require('jsonwebtoken');
const config = require('../config/config');
const NodeCache = require('node-cache');

// Crear una instancia de cache
const cache = new NodeCache({ stdTTL: config.CACHE.TTL });

/**
 * Genera un token JWT para un usuario
 * @param {Object} user - Usuario para el que generar el token
 * @returns {String} - Token JWT
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    config.JWT.SECRET,
    { expiresIn: config.JWT.EXPIRES_IN }
  );
};

/**
 * Elimina campos sensibles del objeto usuario
 * @param {Object} user - Objeto usuario
 * @returns {Object} - Usuario sin campos sensibles
 */
const sanitizeUser = (user) => {
  const sanitized = { ...user };
  delete sanitized.password;
  delete sanitized.resetToken;
  delete sanitized.resetTokenExpiry;
  return sanitized;
};

/**
 * Calcula los días restantes hasta la fecha de caducidad
 * @param {Date} expirationDate - Fecha de caducidad
 * @returns {Number} - Días restantes (negativo si ya caducó)
 */
const calculateDaysUntilExpiration = (expirationDate) => {
  if (!expirationDate) return null;
  
  const today = new Date();
  const expDate = new Date(expirationDate);
  
  const diffTime = expDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * Determina el estado de caducidad de un producto
 * @param {Date} expirationDate - Fecha de caducidad
 * @returns {String} - Estado: 'ok', 'soon', 'expired'
 */
const getExpirationStatus = (expirationDate) => {
  if (!expirationDate) return 'unknown';
  
  const daysUntilExpiration = calculateDaysUntilExpiration(expirationDate);
  
  if (daysUntilExpiration < 0) {
    return 'expired';
  } else if (daysUntilExpiration <= 3) {
    return 'soon';
  } else {
    return 'ok';
  }
};

/**
 * Función para paginar resultados
 * @param {Array} data - Datos a paginar
 * @param {Number} page - Número de página (1-based)
 * @param {Number} limit - Número de elementos por página
 * @returns {Object} - Datos paginados
 */
const paginate = (data, page = 1, limit = 10) => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  const paginatedData = data.slice(startIndex, endIndex);
  
  const pagination = {
    totalItems: data.length,
    totalPages: Math.ceil(data.length / limit),
    currentPage: page,
    pageSize: limit,
    hasNextPage: endIndex < data.length,
    hasPrevPage: startIndex > 0
  };
  
  return { data: paginatedData, pagination };
};

/**
 * Genera un clave de cache con múltiples parámetros
 * @param {String} prefix - Prefijo para la clave
 * @param  {...any} args - Argumentos para generar la clave
 * @returns {String} - Clave de cache
 */
const generateCacheKey = (prefix, ...args) => {
  return `${prefix}:${args.join(':')}`;
};

/**
 * Obtiene datos en cache o ejecuta la función si no están disponibles
 * @param {String} key - Clave de cache
 * @param {Function} fn - Función a ejecutar si no hay datos en cache
 * @param {Number} ttl - Tiempo de vida en segundos (opcional)
 * @returns {Promise<any>} - Datos obtenidos
 */
const cacheOrFetch = async (key, fn, ttl = config.CACHE.TTL) => {
  const cachedData = cache.get(key);
  if (cachedData) {
    return cachedData;
  }
  
  const data = await fn();
  cache.set(key, data, ttl);
  return data;
};

/**
 * Elimina una entrada de la cache
 * @param {String} key - Clave de cache a eliminar
 */
const invalidateCache = (key) => {
  cache.del(key);
};

/**
 * Genera un slug desde un texto
 * @param {String} text - Texto a convertir en slug
 * @returns {String} - Slug
 */
const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

module.exports = {
  generateToken,
  sanitizeUser,
  calculateDaysUntilExpiration,
  getExpirationStatus,
  paginate,
  generateCacheKey,
  cacheOrFetch,
  invalidateCache,
  generateSlug,
  cache
}; 