import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from 'redux';
import authReducer from './slices/authSlice';
import inventoryReducer from './slices/inventorySlice';
import recipesReducer from './slices/recipesSlice';
import shoppingListReducer from './slices/shoppingListSlice';

// Configuración de persistencia
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'inventory', 'recipes', 'shoppingList'], // Solo estos reducers serán persistidos
};

// Combinar todos los reducers
const rootReducer = combineReducers({
  auth: authReducer,
  inventory: inventoryReducer,
  recipes: recipesReducer,
  shoppingList: shoppingListReducer,
});

// Crear el reducer persistente
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configurar el store con el reducer persistente
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Desactivar comprobación de serializabilidad para Redux Persist
    }),
});

// Crear el persistor
export const persistor = persistStore(store);

export default store; 