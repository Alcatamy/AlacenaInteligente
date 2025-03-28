import api from './apiConfig';

// Servicio para la gestión de listas de compras
const shoppingListAPI = {
  // Obtener la lista de compras actual del usuario
  getShoppingList: async () => {
    const response = await api.get('/shopping-list');
    return response.data;
  },
  
  // Añadir un artículo a la lista de compras
  addItem: async (itemData) => {
    const response = await api.post('/shopping-list/items', itemData);
    return response.data;
  },
  
  // Actualizar un artículo existente en la lista de compras
  updateItem: async (itemId, itemData) => {
    const response = await api.put(`/shopping-list/items/${itemId}`, itemData);
    return response.data;
  },
  
  // Eliminar un artículo de la lista de compras
  deleteItem: async (itemId) => {
    const response = await api.delete(`/shopping-list/items/${itemId}`);
    return response.data;
  },
  
  // Marcar un artículo como comprado
  markAsPurchased: async (itemId, purchased = true) => {
    const response = await api.put(`/shopping-list/items/${itemId}/purchased`, { 
      purchased 
    });
    return response.data;
  },
  
  // Obtener todos los artículos de la lista de compras
  getAllItems: async () => {
    const response = await api.get('/shopping-list/items');
    return response.data;
  },
  
  // Obtener solo los artículos no comprados
  getPendingItems: async () => {
    const response = await api.get('/shopping-list/items/pending');
    return response.data;
  },
  
  // Obtener solo los artículos comprados
  getPurchasedItems: async () => {
    const response = await api.get('/shopping-list/items/purchased');
    return response.data;
  },
  
  // Generar lista de compras basada en inventario bajo
  generateFromLowInventory: async () => {
    const response = await api.post('/shopping-list/generate-from-inventory');
    return response.data;
  },
  
  // Generar lista de compras basada en recetas seleccionadas
  generateFromRecipes: async (recipeIds) => {
    const response = await api.post('/shopping-list/generate-from-recipes', { 
      recipeIds 
    });
    return response.data;
  },
  
  // Crear una nueva lista de compras
  createShoppingList: async (listData) => {
    const response = await api.post('/shopping-list', listData);
    return response.data;
  },
  
  // Obtener una lista de compras por ID
  getShoppingListById: async (listId) => {
    const response = await api.get(`/shopping-list/${listId}`);
    return response.data;
  },
  
  // Actualizar una lista de compras
  updateShoppingList: async (listId, listData) => {
    const response = await api.put(`/shopping-list/${listId}`, listData);
    return response.data;
  },
  
  // Eliminar una lista de compras
  deleteShoppingList: async (listId) => {
    const response = await api.delete(`/shopping-list/${listId}`);
    return response.data;
  },
  
  // Añadir artículos del inventario a la lista de compras
  addFromInventory: async (inventoryItemIds) => {
    const response = await api.post('/shopping-list/add-from-inventory', { 
      inventoryItemIds 
    });
    return response.data;
  },
  
  // Limpiar todos los artículos comprados
  clearPurchased: async () => {
    const response = await api.delete('/shopping-list/items/purchased');
    return response.data;
  },
  
  // Vaciar completamente la lista de compras
  clearAll: async () => {
    const response = await api.delete('/shopping-list/items');
    return response.data;
  }
};

export default shoppingListAPI; 