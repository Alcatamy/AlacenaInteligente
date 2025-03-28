import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import shoppingListAPI from '../../api/shoppingListAPI';

// Estado inicial
const initialState = {
  items: [],
  filteredItems: [],
  activeFilters: {
    category: null,
    purchased: null,
    search: '',
    sortBy: 'category',
  },
  isLoading: false,
  error: null,
};

// Thunks
export const fetchShoppingList = createAsyncThunk(
  'shoppingList/fetchShoppingList',
  async (_, { rejectWithValue }) => {
    try {
      // Obtener todos los artículos de la lista de compras
      const items = await shoppingListAPI.getAllItems();
      return items;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener lista de compras');
    }
  }
);

export const addShoppingItem = createAsyncThunk(
  'shoppingList/addShoppingItem',
  async (itemData, { rejectWithValue }) => {
    try {
      // Añadir artículo a la lista de compras
      const newItem = await shoppingListAPI.addItem(itemData);
      
      // Obtener lista completa actualizada
      const items = await shoppingListAPI.getAllItems();
      
      return { item: newItem, items };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al añadir artículo');
    }
  }
);

export const updateShoppingItem = createAsyncThunk(
  'shoppingList/updateShoppingItem',
  async ({ itemId, itemData }, { rejectWithValue }) => {
    try {
      // Actualizar artículo en la lista de compras
      const updatedItem = await shoppingListAPI.updateItem(itemId, itemData);
      
      // Obtener lista completa actualizada
      const items = await shoppingListAPI.getAllItems();
      
      return { item: updatedItem, items };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al actualizar artículo');
    }
  }
);

export const deleteShoppingItem = createAsyncThunk(
  'shoppingList/deleteShoppingItem',
  async (itemId, { rejectWithValue }) => {
    try {
      // Eliminar artículo de la lista de compras
      await shoppingListAPI.deleteItem(itemId);
      
      // Obtener lista completa actualizada
      const items = await shoppingListAPI.getAllItems();
      
      return { itemId, items };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al eliminar artículo');
    }
  }
);

export const togglePurchased = createAsyncThunk(
  'shoppingList/togglePurchased',
  async ({ itemId, purchased }, { rejectWithValue }) => {
    try {
      // Marcar artículo como comprado/no comprado
      await shoppingListAPI.markAsPurchased(itemId, purchased);
      
      // Obtener lista completa actualizada
      const items = await shoppingListAPI.getAllItems();
      
      return { itemId, purchased, items };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al actualizar estado de compra');
    }
  }
);

export const clearPurchasedItems = createAsyncThunk(
  'shoppingList/clearPurchasedItems',
  async (_, { rejectWithValue }) => {
    try {
      // Eliminar todos los artículos marcados como comprados
      await shoppingListAPI.clearPurchased();
      
      // Obtener lista actualizada
      const items = await shoppingListAPI.getAllItems();
      
      return items;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al eliminar artículos comprados');
    }
  }
);

export const generateFromInventory = createAsyncThunk(
  'shoppingList/generateFromInventory',
  async (_, { rejectWithValue }) => {
    try {
      // Generar lista de compras a partir del inventario bajo
      await shoppingListAPI.generateFromLowInventory();
      
      // Obtener lista generada
      const items = await shoppingListAPI.getAllItems();
      
      return items;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al generar lista desde inventario');
    }
  }
);

export const generateFromRecipes = createAsyncThunk(
  'shoppingList/generateFromRecipes',
  async (recipeIds, { rejectWithValue }) => {
    try {
      // Generar lista de compras a partir de recetas seleccionadas
      await shoppingListAPI.generateFromRecipes(recipeIds);
      
      // Obtener lista generada
      const items = await shoppingListAPI.getAllItems();
      
      return items;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al generar lista desde recetas');
    }
  }
);

export const addFromInventory = createAsyncThunk(
  'shoppingList/addFromInventory',
  async (inventoryItemIds, { rejectWithValue }) => {
    try {
      // Añadir artículos desde el inventario
      await shoppingListAPI.addFromInventory(inventoryItemIds);
      
      // Obtener lista actualizada
      const items = await shoppingListAPI.getAllItems();
      
      return items;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al añadir desde inventario');
    }
  }
);

export const clearAllItems = createAsyncThunk(
  'shoppingList/clearAllItems',
  async (_, { rejectWithValue }) => {
    try {
      // Eliminar todos los artículos de la lista de compras
      await shoppingListAPI.clearAll();
      
      return [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al vaciar lista de compras');
    }
  }
);

// Slice
const shoppingListSlice = createSlice({
  name: 'shoppingList',
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

        // Filtro de comprados/no comprados
        if (state.activeFilters.purchased === true &&
            !item.purchased) {
          return false;
        }

        if (state.activeFilters.purchased === false &&
            item.purchased) {
          return false;
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
          } else if (state.activeFilters.sortBy === 'category') {
            return a.category.localeCompare(b.category);
          } else if (state.activeFilters.sortBy === 'quantity') {
            return b.quantity - a.quantity;
          } else if (state.activeFilters.sortBy === 'date') {
            return new Date(b.createdAt) - new Date(a.createdAt);
          }
          return 0;
        });
      }
    },
    resetFilters: (state) => {
      state.activeFilters = {
        category: null,
        purchased: null,
        search: '',
        sortBy: 'category',
      };
      state.filteredItems = state.items;
    },
    resetError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Shopping List
      .addCase(fetchShoppingList.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchShoppingList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
        state.filteredItems = action.payload;
      })
      .addCase(fetchShoppingList.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Add Shopping Item
      .addCase(addShoppingItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addShoppingItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items;
        state.filteredItems = action.payload.items;
      })
      .addCase(addShoppingItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update Shopping Item
      .addCase(updateShoppingItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateShoppingItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items;
        state.filteredItems = action.payload.items;
      })
      .addCase(updateShoppingItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Delete Shopping Item
      .addCase(deleteShoppingItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteShoppingItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items;
        state.filteredItems = action.payload.items;
      })
      .addCase(deleteShoppingItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Toggle Purchased
      .addCase(togglePurchased.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(togglePurchased.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items;
        state.filteredItems = action.payload.items;
      })
      .addCase(togglePurchased.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Clear Purchased Items
      .addCase(clearPurchasedItems.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(clearPurchasedItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
        state.filteredItems = action.payload;
      })
      .addCase(clearPurchasedItems.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Generate From Inventory
      .addCase(generateFromInventory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generateFromInventory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
        state.filteredItems = action.payload;
      })
      .addCase(generateFromInventory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Generate From Recipes
      .addCase(generateFromRecipes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generateFromRecipes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
        state.filteredItems = action.payload;
      })
      .addCase(generateFromRecipes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Add From Inventory
      .addCase(addFromInventory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addFromInventory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
        state.filteredItems = action.payload;
      })
      .addCase(addFromInventory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Clear All Items
      .addCase(clearAllItems.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(clearAllItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
        state.filteredItems = action.payload;
      })
      .addCase(clearAllItems.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setFilter, resetFilters, resetError } = shoppingListSlice.actions;
export default shoppingListSlice.reducer; 