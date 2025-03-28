import api from './apiConfig';

// Servicio para la gestión del inventario de alimentos
const inventoryAPI = {
  // Obtener todos los alimentos del inventario
  getAllFoods: async () => {
    const response = await api.get('/inventory');
    return response.data;
  },
  
  // Obtener un alimento específico por ID
  getFoodById: async (foodId) => {
    const response = await api.get(`/inventory/${foodId}`);
    return response.data;
  },
  
  // Añadir un nuevo alimento al inventario
  addFood: async (foodData) => {
    const response = await api.post('/inventory', foodData);
    return response.data;
  },
  
  // Actualizar un alimento existente
  updateFood: async (foodId, foodData) => {
    const response = await api.put(`/inventory/${foodId}`, foodData);
    return response.data;
  },
  
  // Eliminar un alimento del inventario
  deleteFood: async (foodId) => {
    const response = await api.delete(`/inventory/${foodId}`);
    return response.data;
  },
  
  // Buscar alimentos por nombre o categoría
  searchFoods: async (query) => {
    const response = await api.get(`/inventory/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },
  
  // Filtrar alimentos por categoría
  filterByCategory: async (category) => {
    const response = await api.get(`/inventory/category/${category}`);
    return response.data;
  },
  
  // Filtrar alimentos por ubicación
  filterByLocation: async (location) => {
    const response = await api.get(`/inventory/location/${location}`);
    return response.data;
  },
  
  // Obtener alimentos próximos a caducar
  getExpiringSoon: async (days = 7) => {
    const response = await api.get(`/inventory/expiring?days=${days}`);
    return response.data;
  },
  
  // Obtener alimentos caducados
  getExpired: async () => {
    const response = await api.get('/inventory/expired');
    return response.data;
  },
  
  // Obtener estadísticas del inventario
  getStats: async () => {
    const response = await api.get('/inventory/stats');
    return response.data;
  },
  
  // Buscar alimento por código de barras
  searchByBarcode: async (barcode) => {
    const response = await api.get(`/inventory/barcode/${barcode}`);
    return response.data;
  },
  
  // Subir imagen de un alimento
  uploadFoodImage: async (foodId, imageFile) => {
    const formData = new FormData();
    formData.append('image', {
      uri: imageFile.uri,
      type: imageFile.type,
      name: imageFile.fileName || 'food.jpg',
    });
    
    const response = await api.post(`/inventory/${foodId}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  }
};

export default inventoryAPI; 