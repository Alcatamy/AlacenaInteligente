import api from './apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Servicio de autenticación
const authAPI = {
  // Iniciar sesión
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Registrar nuevo usuario
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Cerrar sesión
  logout: async () => {
    try {
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('refresh_token');
    } catch (error) {
      console.error('Error durante logout:', error);
      // Limpiar tokens incluso si falla la llamada API
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('refresh_token');
    }
  },

  // Verificar token actual
  verifyToken: async () => {
    const response = await api.get('/auth/verify');
    return response.data;
  },
  
  // Obtener perfil del usuario 
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
  
  // Actualizar perfil del usuario
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },
  
  // Cambiar contraseña
  changePassword: async (passwordData) => {
    const response = await api.put('/auth/password', passwordData);
    return response.data;
  },
  
  // Solicitar restablecimiento de contraseña
  requestPasswordReset: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },
  
  // Restablecer contraseña con token
  resetPassword: async (resetData) => {
    const response = await api.post('/auth/reset-password', resetData);
    return response.data;
  }
};

export default authAPI; 