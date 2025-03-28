import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import inventoryAPI from '../../api/inventoryAPI';
import openFoodFactsAPI from '../../api/openFoodFactsAPI';

// Estado inicial
const initialState = {
  items: [],
  filteredItems: [],
  activeFilters: {
    category: null,
    location: null,
    expiration: null,
    search: '',
    sortBy: 'expirationDate',
  },
  locations: ['Refrigerador', 'Congelador', 'Despensa', 'Alacena', 'Otro'],
  categories: [
    'Lácteos', 'Frutas', 'Verduras', 'Carnes', 'Pescados',
    'Cereales', 'Legumbres', 'Enlatados', 'Especias', 'Bebidas',
    'Snacks', 'Congelados', 'Panadería', 'Salsas', 'Otros'
  ],
  stats: {
    total: 0,
    expired: 0,
    aboutToExpire: 0,
    byCategory: {},
    byLocation: {},
  },
  isLoading: false,
  error: null,
};

// Thunks
export const fetchInventory = createAsyncThunk(
  'inventory/fetchInventory',
  async (_, { rejectWithValue }) => {
    try {
      // Obtener todos los alimentos del inventario desde la API
      const items = await inventoryAPI.getAllFoods();
      
      // Obtener las estadísticas desde la API
      const stats = await inventoryAPI.getStats();
      
      return { items, stats };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener inventario');
    }
  }
);

export const addFoodItem = createAsyncThunk(
  'inventory/addFoodItem',
  async (foodItem, { rejectWithValue }) => {
    try {
      // Añadir el alimento a través de la API
      const newItem = await inventoryAPI.addFood(foodItem);
      
      // Obtener estadísticas actualizadas
      const stats = await inventoryAPI.getStats();
      
      // Obtener lista completa actualizada
      const items = await inventoryAPI.getAllFoods();
      
      return { item: newItem, items, stats };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al añadir alimento');
    }
  }
);

export const updateFoodItem = createAsyncThunk(
  'inventory/updateFoodItem',
  async (foodItem, { rejectWithValue }) => {
    try {
      // Actualizar el alimento a través de la API
      const updatedItem = await inventoryAPI.updateFood(foodItem.id, foodItem);
      
      // Obtener estadísticas actualizadas
      const stats = await inventoryAPI.getStats();
      
      // Obtener lista completa actualizada
      const items = await inventoryAPI.getAllFoods();
      
      return { item: updatedItem, items, stats };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al actualizar alimento');
    }
  }
);

export const deleteFoodItem = createAsyncThunk(
  'inventory/deleteFoodItem',
  async (id, { rejectWithValue }) => {
    try {
      // Eliminar el alimento a través de la API
      await inventoryAPI.deleteFood(id);
      
      // Obtener estadísticas actualizadas
      const stats = await inventoryAPI.getStats();
      
      // Obtener lista completa actualizada
      const items = await inventoryAPI.getAllFoods();
      
      return { id, items, stats };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al eliminar alimento');
    }
  }
);

export const searchFoodByBarcode = createAsyncThunk(
  'inventory/searchFoodByBarcode',
  async (barcode, { rejectWithValue }) => {
    try {
      // Primero, intentar buscar en nuestro inventario
      try {
        const result = await inventoryAPI.searchByBarcode(barcode);
        if (result) {
          return result;
        }
      } catch (err) {
        // Si no se encuentra en nuestra base de datos, continuamos con OpenFoodFacts
        console.log('No encontrado en nuestra base de datos, buscando en OpenFoodFacts...');
      }
      
      // Si no está en nuestra base de datos, buscar en OpenFoodFacts
      const openFoodFactsResult = await openFoodFactsAPI.getProductByBarcode(barcode);
      
      return {
        name: openFoodFactsResult.name,
        brand: openFoodFactsResult.brand,
        quantity: 1,
        unit: openFoodFactsResult.quantity || 'unidad',
        category: openFoodFactsResult.category,
        expirationDate: null, // El usuario deberá especificarlo
        barcode: barcode,
        nutritionalInfo: openFoodFactsResult.nutritionalInfo,
        image: openFoodFactsResult.image,
        isNew: true, // Indicar que es un producto nuevo
      };
    } catch (error) {
      // Si no se encuentra ni en nuestra BD ni en OpenFoodFacts, devolver info mínima
      return {
        barcode,
        isNew: true,
      };
    }
  }
);

export const uploadFoodImage = createAsyncThunk(
  'inventory/uploadFoodImage',
  async ({ foodId, imageFile }, { rejectWithValue }) => {
    try {
      const result = await inventoryAPI.uploadFoodImage(foodId, imageFile);
      return { foodId, imageUrl: result.imageUrl };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al subir imagen');
    }
  }
);

// Slice
const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    setFilter: (state, action) => {
      const { type, value } = action.payload;
      state.activeFilters[type] = value;

      // Aplicar filtros
      state.filteredItems = state.items.filter(item => {
        // Filtro de categoría
        if (state.activeFilters.category &&
            item.category !== state.activeFilters.category) {
          return false;
        }

        // Filtro de ubicación
        if (state.activeFilters.location &&
            item.location !== state.activeFilters.location) {
          return false;
        }

        // Filtro de caducidad
        const now = new Date();
        const expirationDate = new Date(item.expirationDate);

        if (state.activeFilters.expiration === 'expired' &&
            expirationDate >= now) {
          return false;
        }

        if (state.activeFilters.expiration === 'valid' &&
            expirationDate < now) {
          return false;
        }

        if (state.activeFilters.expiration === 'soon') {
          const oneWeekLater = new Date();
          oneWeekLater.setDate(oneWeekLater.getDate() + 7);

          if (!(expirationDate >= now && expirationDate <= oneWeekLater)) {
            return false;
          }
        }

        // Filtro de búsqueda
        if (state.activeFilters.search &&
            !item.name.toLowerCase().includes(
              state.activeFilters.search.toLowerCase()
            )) {
          return false;
        }

        return true;
      });

      // Aplicar ordenamiento
      if (state.activeFilters.sortBy) {
        state.filteredItems.sort((a, b) => {
          if (state.activeFilters.sortBy === 'name') {
            return a.name.localeCompare(b.name);
          } else if (state.activeFilters.sortBy === 'expirationDate') {
            return new Date(a.expirationDate) - new Date(b.expirationDate);
          } else if (state.activeFilters.sortBy === 'category') {
            return a.category.localeCompare(b.category);
          } else if (state.activeFilters.sortBy === 'location') {
            return a.location.localeCompare(b.location);
          }
          return 0;
        });
      }
    },
    resetFilters: (state) => {
      state.activeFilters = {
        category: null,
        location: null,
        expiration: null,
        search: '',
        sortBy: 'expirationDate',
      };
      state.filteredItems = state.items;
    },
    resetError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Inventory
      .addCase(fetchInventory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items;
        state.filteredItems = action.payload.items;
        state.stats = action.payload.stats;
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Add Food Item
      .addCase(addFoodItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addFoodItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items;
        state.filteredItems = action.payload.items;
        state.stats = action.payload.stats;
      })
      .addCase(addFoodItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update Food Item
      .addCase(updateFoodItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateFoodItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items;
        state.filteredItems = action.payload.items;
        state.stats = action.payload.stats;
      })
      .addCase(updateFoodItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Delete Food Item
      .addCase(deleteFoodItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteFoodItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items;
        state.filteredItems = action.payload.items;
        state.stats = action.payload.stats;
      })
      .addCase(deleteFoodItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Search Food by Barcode
      .addCase(searchFoodByBarcode.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchFoodByBarcode.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(searchFoodByBarcode.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Upload Food Image
      .addCase(uploadFoodImage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadFoodImage.fulfilled, (state, action) => {
        state.isLoading = false;
        // Actualizar la URL de la imagen en el elemento correspondiente
        const foodIndex = state.items.findIndex(item => item.id === action.payload.foodId);
        if (foodIndex !== -1) {
          state.items[foodIndex].image = action.payload.imageUrl;
          
          // También actualizar en filteredItems si existe
          const filteredIndex = state.filteredItems.findIndex(item => item.id === action.payload.foodId);
          if (filteredIndex !== -1) {
            state.filteredItems[filteredIndex].image = action.payload.imageUrl;
          }
        }
      })
      .addCase(uploadFoodImage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setFilter, resetFilters, resetError } = inventorySlice.actions;

export default inventorySlice.reducer; 