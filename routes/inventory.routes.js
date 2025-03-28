const express = require('express');
const inventoryController = require('../controllers/inventory.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(verifyToken);

// Obtener estadísticas
router.get('/stats', inventoryController.getInventoryStats);

// Obtener información de producto por código de barras
router.get('/barcode/:barcode', inventoryController.getProductInfoByBarcode);

// Rutas CRUD
router.get('/', inventoryController.getInventory);
router.get('/:id', inventoryController.getInventoryItem);
router.post('/', inventoryController.createInventoryItem);
router.put('/:id', inventoryController.updateInventoryItem);
router.delete('/:id', inventoryController.deleteInventoryItem);

// Marcar como consumido/agotado
router.patch('/:id/finish', inventoryController.finishInventoryItem);

module.exports = router; 