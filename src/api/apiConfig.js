import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// URL base para las solicitudes API
const API_URL = __DEV__ 
  ? 'http://localhost:5000/api'  // URL de desarrollo
  : 'https://alacena-inteligente-api.herokuapp.com/api';  // URL de producción

// Crear instancia de axios con configuración común
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000 // 10 segundos
});

// Interceptor para añadir token de autenticación a todas las solicitudes
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error al recuperar token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores comunes
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Si el error es 401 (No autorizado) y no es un intento de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Intentar refrescar el token
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No hay refresh token disponible');
        }
        
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken
        });
        
        // Guardar el nuevo token
        const { token, refreshToken: newRefreshToken } = response.data;
        await AsyncStorage.setItem('auth_token', token);
        await AsyncStorage.setItem('refresh_token', newRefreshToken);
        
        // Actualizar el token en la solicitud original y reintentarla
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Si falla el refresh, limpiar tokens y redirigir a login
        await AsyncStorage.removeItem('auth_token');
        await AsyncStorage.removeItem('refresh_token');
        // Aquí deberíamos tener un mecanismo para navegar al login
        // Por ejemplo, emitir un evento global que el componente App pueda escuchar
        return Promise.reject(refreshError);
      }
    }
    
    // Para otros errores, simplemente los rechazamos
    return Promise.reject(error);
  }
);

export default api; 