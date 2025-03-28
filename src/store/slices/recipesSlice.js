import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import recipesAPI from '../../api/recipesAPI';

// Estado inicial
const initialState = {
  recipes: [],
  filteredRecipes: [],
  currentRecipe: null,
  favorites: [],
  categories: [
    'Desayuno', 'Almuerzo', 'Cena', 'Postre', 'Merienda',
    'Bebida', 'Ensalada', 'Sopa', 'Pasta', 'Carne',
    'Pescado', 'Vegetariano', 'Vegano', 'Sin Gluten', 'Rápida',
    'Tradicional', 'Internacional', 'Saludable'
  ],
  difficultyLevels: ['Fácil', 'Media', 'Difícil'],
  activeFilters: {
    category: null,
    difficulty: null,
    time: null,
    search: '',
    onlyFavorites: false,
    onlyAvailable: false,
    sortBy: 'name',
  },
  isLoading: false,
  error: null,
};

// Thunks
export const fetchRecipes = createAsyncThunk(
  'recipes/fetchRecipes',
  async (_, { rejectWithValue }) => {
    try {
      // Obtener todas las recetas
      const recipes = await recipesAPI.getAllRecipes();
      return recipes;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener recetas');
    }
  }
);

export const fetchRecipeById = createAsyncThunk(
  'recipes/fetchRecipeById',
  async (recipeId, { rejectWithValue }) => {
    try {
      // Obtener una receta específica por ID
      const recipe = await recipesAPI.getRecipeById(recipeId);
      return recipe;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener la receta');
    }
  }
);

export const addRecipe = createAsyncThunk(
  'recipes/addRecipe',
  async (recipeData, { rejectWithValue }) => {
    try {
      // Añadir una nueva receta
      const newRecipe = await recipesAPI.addRecipe(recipeData);
      return newRecipe;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al añadir la receta');
    }
  }
);

export const updateRecipe = createAsyncThunk(
  'recipes/updateRecipe',
  async ({ recipeId, recipeData }, { rejectWithValue }) => {
    try {
      // Actualizar una receta existente
      const updatedRecipe = await recipesAPI.updateRecipe(recipeId, recipeData);
      return updatedRecipe;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al actualizar la receta');
    }
  }
);

export const deleteRecipe = createAsyncThunk(
  'recipes/deleteRecipe',
  async (recipeId, { rejectWithValue }) => {
    try {
      // Eliminar una receta
      await recipesAPI.deleteRecipe(recipeId);
      return recipeId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al eliminar la receta');
    }
  }
);

export const searchRecipes = createAsyncThunk(
  'recipes/searchRecipes',
  async (query, { rejectWithValue }) => {
    try {
      // Buscar recetas por nombre o categoría
      const recipes = await recipesAPI.searchRecipes(query);
      return recipes;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al buscar recetas');
    }
  }
);

export const fetchFavoriteRecipes = createAsyncThunk(
  'recipes/fetchFavoriteRecipes',
  async (_, { rejectWithValue }) => {
    try {
      // Obtener recetas favoritas
      const favorites = await recipesAPI.getFavoriteRecipes();
      return favorites;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener recetas favoritas');
    }
  }
);

export const toggleFavorite = createAsyncThunk(
  'recipes/toggleFavorite',
  async ({ recipeId, isFavorite }, { rejectWithValue }) => {
    try {
      if (isFavorite) {
        // Quitar de favoritos
        await recipesAPI.removeFromFavorites(recipeId);
      } else {
        // Añadir a favoritos
        await recipesAPI.addToFavorites(recipeId);
      }
      
      // Obtener lista actualizada de favoritos
      const favorites = await recipesAPI.getFavoriteRecipes();
      return { recipeId, favorites };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al actualizar favoritos');
    }
  }
);

export const getRecommendedRecipes = createAsyncThunk(
  'recipes/getRecommendedRecipes',
  async (_, { rejectWithValue }) => {
    try {
      // Obtener recetas recomendadas basadas en inventario
      const recipes = await recipesAPI.getRecommendedRecipes();
      return recipes;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener recomendaciones');
    }
  }
);

export const findRecipesByIngredients = createAsyncThunk(
  'recipes/findRecipesByIngredients',
  async (ingredients, { rejectWithValue }) => {
    try {
      // Buscar recetas por ingredientes disponibles
      const recipes = await recipesAPI.findRecipesByIngredients(ingredients);
      return recipes;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al buscar recetas por ingredientes');
    }
  }
);

export const uploadRecipeImage = createAsyncThunk(
  'recipes/uploadRecipeImage',
  async ({ recipeId, imageFile }, { rejectWithValue }) => {
    try {
      // Subir imagen de receta
      const result = await recipesAPI.uploadRecipeImage(recipeId, imageFile);
      return { recipeId, imageUrl: result.imageUrl };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al subir imagen');
    }
  }
);

export const rateRecipe = createAsyncThunk(
  'recipes/rateRecipe',
  async ({ recipeId, rating }, { rejectWithValue }) => {
    try {
      // Calificar una receta
      await recipesAPI.rateRecipe(recipeId, rating);
      
      // Obtener receta actualizada
      const updatedRecipe = await recipesAPI.getRecipeById(recipeId);
      return updatedRecipe;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al calificar la receta');
    }
  }
);

// Slice
const recipesSlice = createSlice({
  name: 'recipes',
  initialState,
  reducers: {
    setFilter: (state, action) => {
      const { type, value } = action.payload;
      state.activeFilters[type] = value;

      // Aplicar filtros
      state.filteredRecipes = state.recipes.filter(recipe => {
        // Filtro de categoría
        if (state.activeFilters.category &&
            !recipe.categories.includes(state.activeFilters.category)) {
          return false;
        }

        // Filtro de dificultad
        if (state.activeFilters.difficulty &&
            recipe.difficulty !== state.activeFilters.difficulty) {
          return false;
        }

        // Filtro de tiempo
        if (state.activeFilters.time &&
            recipe.cookingTime > parseInt(state.activeFilters.time)) {
          return false;
        }

        // Filtro de solo favoritos
        if (state.activeFilters.onlyFavorites &&
            !state.favorites.some(fav => fav.id === recipe.id)) {
          return false;
        }

        // Filtro de búsqueda
        if (state.activeFilters.search) {
          const search = state.activeFilters.search.toLowerCase();
          const nameMatch = recipe.name.toLowerCase().includes(search);
          const ingredientsMatch = recipe.ingredients.some(
            ing => ing.name.toLowerCase().includes(search)
          );
          if (!nameMatch && !ingredientsMatch) {
            return false;
          }
        }

        return true;
      });

      // Aplicar ordenamiento
      if (state.activeFilters.sortBy) {
        state.filteredRecipes.sort((a, b) => {
          if (state.activeFilters.sortBy === 'name') {
            return a.name.localeCompare(b.name);
          } else if (state.activeFilters.sortBy === 'cookingTime') {
            return a.cookingTime - b.cookingTime;
          } else if (state.activeFilters.sortBy === 'difficulty') {
            const difficultyOrder = {
              'Fácil': 1,
              'Media': 2,
              'Difícil': 3
            };
            return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
          } else if (state.activeFilters.sortBy === 'rating') {
            return b.rating - a.rating;
          }
          return 0;
        });
      }
    },
    resetFilters: (state) => {
      state.activeFilters = {
        category: null,
        difficulty: null,
        time: null,
        search: '',
        onlyFavorites: false,
        onlyAvailable: false,
        sortBy: 'name',
      };
      state.filteredRecipes = state.recipes;
    },
    resetError: (state) => {
      state.error = null;
    },
    clearCurrentRecipe: (state) => {
      state.currentRecipe = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Recipes
      .addCase(fetchRecipes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRecipes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.recipes = action.payload;
        state.filteredRecipes = action.payload;
      })
      .addCase(fetchRecipes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch Recipe By Id
      .addCase(fetchRecipeById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRecipeById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentRecipe = action.payload;
      })
      .addCase(fetchRecipeById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Add Recipe
      .addCase(addRecipe.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addRecipe.fulfilled, (state, action) => {
        state.isLoading = false;
        state.recipes.push(action.payload);
        state.filteredRecipes = state.recipes;
      })
      .addCase(addRecipe.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update Recipe
      .addCase(updateRecipe.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateRecipe.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.recipes.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.recipes[index] = action.payload;
        }
        state.filteredRecipes = state.recipes;
        
        // Si la receta actual es la actualizada, también actualizarla
        if (state.currentRecipe && state.currentRecipe.id === action.payload.id) {
          state.currentRecipe = action.payload;
        }
      })
      .addCase(updateRecipe.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Delete Recipe
      .addCase(deleteRecipe.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteRecipe.fulfilled, (state, action) => {
        state.isLoading = false;
        state.recipes = state.recipes.filter(r => r.id !== action.payload);
        state.filteredRecipes = state.filteredRecipes.filter(r => r.id !== action.payload);
        
        // Si la receta actual es la eliminada, limpiarla
        if (state.currentRecipe && state.currentRecipe.id === action.payload) {
          state.currentRecipe = null;
        }
      })
      .addCase(deleteRecipe.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Search Recipes
      .addCase(searchRecipes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchRecipes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.filteredRecipes = action.payload;
      })
      .addCase(searchRecipes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch Favorite Recipes
      .addCase(fetchFavoriteRecipes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFavoriteRecipes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.favorites = action.payload;
      })
      .addCase(fetchFavoriteRecipes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Toggle Favorite
      .addCase(toggleFavorite.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        state.isLoading = false;
        state.favorites = action.payload.favorites;
      })
      .addCase(toggleFavorite.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Get Recommended Recipes
      .addCase(getRecommendedRecipes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getRecommendedRecipes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.filteredRecipes = action.payload;
      })
      .addCase(getRecommendedRecipes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Find Recipes By Ingredients
      .addCase(findRecipesByIngredients.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(findRecipesByIngredients.fulfilled, (state, action) => {
        state.isLoading = false;
        state.filteredRecipes = action.payload;
      })
      .addCase(findRecipesByIngredients.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Upload Recipe Image
      .addCase(uploadRecipeImage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadRecipeImage.fulfilled, (state, action) => {
        state.isLoading = false;
        
        // Actualizar la imagen en la receta correspondiente
        const recipeIndex = state.recipes.findIndex(recipe => recipe.id === action.payload.recipeId);
        if (recipeIndex !== -1) {
          state.recipes[recipeIndex].image = action.payload.imageUrl;
          
          // También actualizar en filteredRecipes si existe
          const filteredIndex = state.filteredRecipes.findIndex(recipe => recipe.id === action.payload.recipeId);
          if (filteredIndex !== -1) {
            state.filteredRecipes[filteredIndex].image = action.payload.imageUrl;
          }
          
          // Y en currentRecipe si es la misma
          if (state.currentRecipe && state.currentRecipe.id === action.payload.recipeId) {
            state.currentRecipe.image = action.payload.imageUrl;
          }
        }
      })
      .addCase(uploadRecipeImage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Rate Recipe
      .addCase(rateRecipe.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(rateRecipe.fulfilled, (state, action) => {
        state.isLoading = false;
        
        // Actualizar la receta con la calificación actualizada
        const recipeIndex = state.recipes.findIndex(recipe => recipe.id === action.payload.id);
        if (recipeIndex !== -1) {
          state.recipes[recipeIndex] = action.payload;
          
          // También actualizar en filteredRecipes si existe
          const filteredIndex = state.filteredRecipes.findIndex(recipe => recipe.id === action.payload.id);
          if (filteredIndex !== -1) {
            state.filteredRecipes[filteredIndex] = action.payload;
          }
          
          // Y en currentRecipe si es la misma
          if (state.currentRecipe && state.currentRecipe.id === action.payload.id) {
            state.currentRecipe = action.payload;
          }
        }
      })
      .addCase(rateRecipe.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setFilter, resetFilters, resetError, clearCurrentRecipe } = recipesSlice.actions;
export default recipesSlice.reducer; 