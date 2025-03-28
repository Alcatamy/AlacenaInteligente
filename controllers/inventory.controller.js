const { Op } = require('sequelize');
const { Inventory } = require('../models');
const { NotFoundError, BadRequestError } = require('../utils/errorHandler');
const { getExpirationStatus, generateCacheKey, cacheOrFetch, invalidateCache } = require('../utils/helpers');
const axios = require('axios');
const config = require('../config/config');

/**
 * Obtiene todos los productos del inventario del usuario
 * @param {Object} req - Request
 * @param {Object} res - Response
 * @param {Function} next - Next middleware
 */
const getInventory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { 
      category, 
      location, 
      expirationStatus, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      page = 1,
      limit = 20
    } = req.query;
    
    // Preparar condiciones de búsqueda
    const where = { userId };
    
    if (category) {
      where.category = category;
    }
    
    if (location) {
      where.location = location;
    }
    
    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }
    
    // Filtro por estado de caducidad (calculado)
    let havingClause = {};
    if (expirationStatus) {
      if (expirationStatus === 'expired') {
        where.expirationDate = { [Op.lt]: new Date() };
      } else if (expirationStatus === 'soon') {
        const today = new Date();
        const threeDaysLater = new Date();
        threeDaysLater.setDate(today.getDate() + 3);
        
        where.expirationDate = { 
          [Op.gte]: today,
          [Op.lte]: threeDaysLater
        };
      } else if (expirationStatus === 'ok') {
        const threeDaysLater = new Date();
        threeDaysLater.setDate(new Date().getDate() + 3);
        
        where.expirationDate = { [Op.gt]: threeDaysLater };
      }
    }
    
    // No mostrar productos terminados por defecto
    if (!req.query.includeFinished) {
      where.isFinished = false;
    }
    
    // Opciones de paginación y ordenación
    const options = {
      where,
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    };
    
    // Obtener resultados
    const { count, rows } = await Inventory.findAndCountAll(options);
    
    // Agregar estado de caducidad a cada producto
    const items = rows.map(item => {
      const itemJson = item.toJSON();
      itemJson.expirationStatus = getExpirationStatus(item.expirationDate);
      return itemJson;
    });
    
    res.status(200).json({
      items,
      pagination: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        pageSize: parseInt(limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtiene un producto del inventario por su ID
 * @param {Object} req - Request
 * @param {Object} res - Response
 * @param {Function} next - Next middleware
 */
const getInventoryItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const item = await Inventory.findOne({
      where: { id, userId }
    });
    
    if (!item) {
      throw new NotFoundError('Producto no encontrado');
    }
    
    const itemJson = item.toJSON();
    itemJson.expirationStatus = getExpirationStatus(item.expirationDate);
    
    res.status(200).json({
      item: itemJson
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Crea un nuevo producto en el inventario
 * @param {Object} req - Request
 * @param {Object} res - Response
 * @param {Function} next - Next middleware
 */
const createInventoryItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      name,
      barcode,
      category,
      quantity,
      unit,
      expirationDate,
      purchaseDate,
      location,
      notes,
      imageUrl,
      nutritionalInfo
    } = req.body;
    
    // Validaciones básicas
    if (!name || !category) {
      throw new BadRequestError('Nombre y categoría son campos requeridos');
    }
    
    // Buscar información nutricional si hay código de barras y no se proporcionó
    let enrichedNutritionalInfo = nutritionalInfo;
    if (barcode && !nutritionalInfo) {
      try {
        const cacheKey = generateCacheKey('barcode', barcode);
        const productInfo = await cacheOrFetch(cacheKey, async () => {
          const response = await axios.get(`${config.OPEN_FOOD_FACTS_API.BASE_URL}/product/${barcode}.json`);
          return response.data;
        });
        
        if (productInfo && productInfo.product) {
          enrichedNutritionalInfo = {
            calories: productInfo.product.nutriments?.energy_value || null,
            proteins: productInfo.product.nutriments?.proteins || null,
            carbs: productInfo.product.nutriments?.carbohydrates || null,
            fats: productInfo.product.nutriments?.fat || null,
            ingredients: productInfo.product.ingredients_text || null
          };
        }
      } catch (error) {
        console.error('Error al obtener información del producto:', error);
        // Continuar sin información nutricional
      }
    }
    
    // Crear producto
    const item = await Inventory.create({
      userId,
      name,
      barcode,
      category,
      quantity,
      unit: unit || 'unidad',
      expirationDate,
      purchaseDate,
      location: location || 'despensa',
      notes,
      imageUrl,
      nutritionalInfo: enrichedNutritionalInfo,
      isFinished: false
    });
    
    // Actualizar cache
    invalidateCache(`inventory-${userId}`);
    
    res.status(201).json({
      message: 'Producto añadido al inventario',
      item
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Actualiza un producto del inventario
 * @param {Object} req - Request
 * @param {Object} res - Response
 * @param {Function} next - Next middleware
 */
const updateInventoryItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Buscar producto
    const item = await Inventory.findOne({
      where: { id, userId }
    });
    
    if (!item) {
      throw new NotFoundError('Producto no encontrado');
    }
    
    // Actualizar producto
    await item.update(req.body);
    
    // Actualizar cache
    invalidateCache(`inventory-${userId}`);
    
    res.status(200).json({
      message: 'Producto actualizado correctamente',
      item
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Elimina un producto del inventario
 * @param {Object} req - Request
 * @param {Object} res - Response
 * @param {Function} next - Next middleware
 */
const deleteInventoryItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Buscar producto
    const item = await Inventory.findOne({
      where: { id, userId }
    });
    
    if (!item) {
      throw new NotFoundError('Producto no encontrado');
    }
    
    // Eliminar producto
    await item.destroy();
    
    // Actualizar cache
    invalidateCache(`inventory-${userId}`);
    
    res.status(200).json({
      message: 'Producto eliminado correctamente'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Marca un producto como consumido/agotado
 * @param {Object} req - Request
 * @param {Object} res - Response
 * @param {Function} next - Next middleware
 */
const finishInventoryItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Buscar producto
    const item = await Inventory.findOne({
      where: { id, userId }
    });
    
    if (!item) {
      throw new NotFoundError('Producto no encontrado');
    }
    
    // Marcar como terminado
    await item.update({ isFinished: true });
    
    // Actualizar cache
    invalidateCache(`inventory-${userId}`);
    
    res.status(200).json({
      message: 'Producto marcado como consumido',
      item
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Recupera información nutricional desde Open Food Facts
 * @param {Object} req - Request
 * @param {Object} res - Response
 * @param {Function} next - Next middleware
 */
const getProductInfoByBarcode = async (req, res, next) => {
  try {
    const { barcode } = req.params;
    
    if (!barcode) {
      throw new BadRequestError('Código de barras requerido');
    }
    
    const cacheKey = generateCacheKey('barcode', barcode);
    const productInfo = await cacheOrFetch(cacheKey, async () => {
      const response = await axios.get(`${config.OPEN_FOOD_FACTS_API.BASE_URL}/product/${barcode}.json`);
      return response.data;
    });
    
    if (!productInfo || !productInfo.product) {
      throw new NotFoundError('Información del producto no encontrada');
    }
    
    const { product } = productInfo;
    
    // Extraer información relevante
    const result = {
      name: product.product_name_es || product.product_name,
      brand: product.brands,
      imageUrl: product.image_url,
      categories: product.categories,
      quantity: product.quantity,
      nutritionalInfo: {
        calories: product.nutriments?.energy_value || null,
        proteins: product.nutriments?.proteins || null,
        carbs: product.nutriments?.carbohydrates || null,
        fats: product.nutriments?.fat || null,
        ingredients: product.ingredients_text || null
      }
    };
    
    res.status(200).json({ productInfo: result });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtiene estadísticas del inventario
 * @param {Object} req - Request
 * @param {Object} res - Response
 * @param {Function} next - Next middleware
 */
const getInventoryStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Contar total de productos
    const totalItems = await Inventory.count({
      where: { userId, isFinished: false }
    });
    
    // Contar productos por categoría
    const itemsByCategory = await Inventory.findAll({
      attributes: ['category', [sequelize.fn('count', '*'), 'count']],
      where: { userId, isFinished: false },
      group: ['category']
    });
    
    // Contar productos por ubicación
    const itemsByLocation = await Inventory.findAll({
      attributes: ['location', [sequelize.fn('count', '*'), 'count']],
      where: { userId, isFinished: false },
      group: ['location']
    });
    
    // Contar productos caducados
    const expiredItems = await Inventory.count({
      where: {
        userId,
        isFinished: false,
        expirationDate: { [Op.lt]: new Date() }
      }
    });
    
    // Contar productos por caducar pronto
    const today = new Date();
    const threeDaysLater = new Date();
    threeDaysLater.setDate(today.getDate() + 3);
    
    const soonToExpireItems = await Inventory.count({
      where: {
        userId,
        isFinished: false,
        expirationDate: {
          [Op.gte]: today,
          [Op.lte]: threeDaysLater
        }
      }
    });
    
    res.status(200).json({
      stats: {
        totalItems,
        expiredItems,
        soonToExpireItems,
        itemsByCategory: itemsByCategory.map(c => ({
          category: c.category,
          count: c.get('count')
        })),
        itemsByLocation: itemsByLocation.map(l => ({
          location: l.location,
          count: l.get('count')
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInventory,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  finishInventoryItem,
  getProductInfoByBarcode,
  getInventoryStats
}; 