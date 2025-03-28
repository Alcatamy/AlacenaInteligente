const jwt = require('jsonwebtoken');
const { User } = require('../models');
const config = require('../config/config');

// Middleware para verificar token JWT
const verifyToken = async (req, res, next) => {
  try {
    // Obtener el token del header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No se proporcionó token de autenticación' });
    }
    
    // Extraer token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Token de autenticación inválido' });
    }
    
    // Verificar token
    const decoded = jwt.verify(token, config.JWT.SECRET);
    
    // Buscar usuario en la base de datos
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }
    
    if (!user.isActive) {
      return res.status(403).json({ message: 'Usuario inactivo o bloqueado' });
    }
    
    // Guardar usuario en el objeto request para uso posterior
    req.user = user;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token de autenticación expirado' });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token de autenticación inválido' });
    }
    
    console.error('Error en autenticación:', error);
    return res.status(500).json({ message: 'Error al verificar autenticación' });
  }
};

// Middleware para verificar roles
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  
  return res.status(403).json({ message: 'Acceso denegado: se requieren privilegios de administrador' });
};

// Middleware para verificar propiedad de un recurso
const isOwner = (model) => async (req, res, next) => {
  try {
    const resourceId = req.params.id;
    if (!resourceId) {
      return res.status(400).json({ message: 'ID de recurso no proporcionado' });
    }
    
    const resource = await model.findByPk(resourceId);
    
    if (!resource) {
      return res.status(404).json({ message: 'Recurso no encontrado' });
    }
    
    // Comprobar si el usuario es propietario del recurso
    if (resource.userId !== req.user.id) {
      // Si el usuario es admin, permitir acceso
      if (req.user.role === 'admin') {
        return next();
      }
      
      return res.status(403).json({ message: 'Acceso denegado: no eres propietario de este recurso' });
    }
    
    next();
  } catch (error) {
    console.error('Error al verificar propiedad:', error);
    return res.status(500).json({ message: 'Error al verificar propiedad del recurso' });
  }
};

module.exports = {
  verifyToken,
  isAdmin,
  isOwner
}; 