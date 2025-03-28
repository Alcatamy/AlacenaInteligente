import api from './apiConfig';

// Servicio para la gestión de recetas
const recipesAPI = {
  // Obtener todas las recetas
  getAllRecipes: async () => {
    const response = await api.get('/recipes');
    return response.data;
  },
  
  // Obtener una receta específica por ID
  getRecipeById: async (recipeId) => {
    const response = await api.get(`/recipes/${recipeId}`);
    return response.data;
  },
  
  // Añadir una nueva receta
  addRecipe: async (recipeData) => {
    const response = await api.post('/recipes', recipeData);
    return response.data;
  },
  
  // Actualizar una receta existente
  updateRecipe: async (recipeId, recipeData) => {
    const response = await api.put(`/recipes/${recipeId}`, recipeData);
    return response.data;
  },
  
  // Eliminar una receta
  deleteRecipe: async (recipeId) => {
    const response = await api.delete(`/recipes/${recipeId}`);
    return response.data;
  },
  
  // Buscar recetas por nombre o categoría
  searchRecipes: async (query) => {
    const response = await api.get(`/recipes/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },
  
  // Filtrar recetas por categoría
  filterByCategory: async (category) => {
    const response = await api.get(`/recipes/category/${category}`);
    return response.data;
  },
  
  // Filtrar recetas por dificultad
  filterByDifficulty: async (difficulty) => {
    const response = await api.get(`/recipes/difficulty/${difficulty}`);
    return response.data;
  },
  
  // Filtrar recetas por tiempo de preparación
  filterByTime: async (maxTime) => {
    const response = await api.get(`/recipes/time?max=${maxTime}`);
    return response.data;
  },
  
  // Obtener recetas recomendadas basadas en el inventario
  getRecommendedRecipes: async () => {
    const response = await api.get('/recipes/recommended');
    return response.data;
  },
  
  // Buscar recetas que se pueden preparar con los ingredientes disponibles
  findRecipesByIngredients: async (ingredients = []) => {
    const response = await api.post('/recipes/by-ingredients', { ingredients });
    return response.data;
  },
  
  // Obtener recetas favoritas del usuario
  getFavoriteRecipes: async () => {
    const response = await api.get('/recipes/favorites');
    return response.data;
  },
  
  // Añadir receta a favoritos
  addToFavorites: async (recipeId) => {
    const response = await api.post(`/recipes/${recipeId}/favorite`);
    return response.data;
  },
  
  // Quitar receta de favoritos
  removeFromFavorites: async (recipeId) => {
    const response = await api.delete(`/recipes/${recipeId}/favorite`);
    return response.data;
  },
  
  // Subir imagen de una receta
  uploadRecipeImage: async (recipeId, imageFile) => {
    const formData = new FormData();
    formData.append('image', {
      uri: imageFile.uri,
      type: imageFile.type,
      name: imageFile.fileName || 'recipe.jpg',
    });
    
    const response = await api.post(`/recipes/${recipeId}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  // Obtener categorías de recetas disponibles
  getCategories: async () => {
    const response = await api.get('/recipes/categories');
    return response.data;
  },
  
  // Calificar una receta
  rateRecipe: async (recipeId, rating) => {
    const response = await api.post(`/recipes/${recipeId}/rate`, { rating });
    return response.data;
  }
};

export default recipesAPI; 