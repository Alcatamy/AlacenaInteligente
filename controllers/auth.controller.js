const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { User } = require('../models');
const { generateToken, sanitizeUser } = require('../utils/helpers');
const { BadRequestError, UnauthorizedError, NotFoundError } = require('../utils/errorHandler');
const config = require('../config/config');
const nodemailer = require('nodemailer');

/**
 * Registra un nuevo usuario
 * @param {Object} req - Request
 * @param {Object} res - Response
 * @param {Function} next - Next middleware
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    
    // Verificar si el correo ya está registrado
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new BadRequestError('El correo electrónico ya está registrado');
    }
    
    // Crear nuevo usuario
    const user = await User.create({
      name,
      email,
      password,
      preferences: {}
    });
    
    // Generar token
    const token = generateToken(user);
    
    // Responder
    res.status(201).json({
      message: 'Usuario registrado correctamente',
      user: sanitizeUser(user.toJSON()),
      token
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Inicia sesión de usuario
 * @param {Object} req - Request
 * @param {Object} res - Response
 * @param {Function} next - Next middleware
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Verificar datos
    if (!email || !password) {
      throw new BadRequestError('Email y contraseña son requeridos');
    }
    
    // Buscar usuario
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedError('Credenciales inválidas');
    }
    
    // Verificar si está activo
    if (!user.isActive) {
      throw new UnauthorizedError('Esta cuenta está inactiva o bloqueada');
    }
    
    // Verificar contraseña
    const isPasswordValid = await user.isValidPassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Credenciales inválidas');
    }
    
    // Actualizar fecha de último login
    await user.update({ lastLogin: new Date() });
    
    // Generar token
    const token = generateToken(user);
    
    // Responder
    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      user: sanitizeUser(user.toJSON()),
      token
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtiene perfil del usuario actual
 * @param {Object} req - Request
 * @param {Object} res - Response
 * @param {Function} next - Next middleware
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }
    
    res.status(200).json({
      user: sanitizeUser(user.toJSON())
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Solicita restablecimiento de contraseña
 * @param {Object} req - Request
 * @param {Object} res - Response
 * @param {Function} next - Next middleware
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      throw new BadRequestError('Email es requerido');
    }
    
    // Buscar usuario
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Por seguridad, no decimos que el usuario no existe
      return res.status(200).json({
        message: 'Si el correo existe, recibirás instrucciones para restablecer la contraseña'
      });
    }
    
    // Generar token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora
    
    // Guardar token en BD
    await user.update({
      resetToken,
      resetTokenExpiry
    });
    
    // Crear URL de restablecimiento
    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
    
    // Enviar email (Solo si configuración de email está disponible)
    if (config.EMAIL.HOST && config.EMAIL.USER && config.EMAIL.PASSWORD) {
      const transporter = nodemailer.createTransport({
        host: config.EMAIL.HOST,
        port: config.EMAIL.PORT,
        secure: config.EMAIL.PORT === 465,
        auth: {
          user: config.EMAIL.USER,
          pass: config.EMAIL.PASSWORD
        }
      });
      
      await transporter.sendMail({
        from: config.EMAIL.FROM,
        to: user.email,
        subject: 'Restablecimiento de contraseña - Alacena Inteligente',
        html: `
          <p>Hola ${user.name},</p>
          <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace:</p>
          <p><a href="${resetUrl}">Restablecer contraseña</a></p>
          <p>El enlace es válido por 1 hora.</p>
          <p>Si no solicitaste restablecer tu contraseña, ignora este mensaje.</p>
          <p>Saludos,<br>Equipo de Alacena Inteligente</p>
        `
      });
    }
    
    res.status(200).json({
      message: 'Si el correo existe, recibirás instrucciones para restablecer la contraseña',
      ...(process.env.NODE_ENV === 'development' && { resetToken, resetUrl })
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Restablece la contraseña
 * @param {Object} req - Request
 * @param {Object} res - Response
 * @param {Function} next - Next middleware
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    if (!token || !password) {
      throw new BadRequestError('Token y nueva contraseña son requeridos');
    }
    
    // Buscar usuario con el token válido
    const user = await User.findOne({
      where: {
        resetToken: token,
        resetTokenExpiry: { [Op.gt]: new Date() }
      }
    });
    
    if (!user) {
      throw new BadRequestError('Token inválido o expirado');
    }
    
    // Actualizar contraseña y eliminar token
    await user.update({
      password,
      resetToken: null,
      resetTokenExpiry: null
    });
    
    res.status(200).json({
      message: 'Contraseña actualizada correctamente'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cambia la contraseña del usuario actual
 * @param {Object} req - Request
 * @param {Object} res - Response
 * @param {Function} next - Next middleware
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      throw new BadRequestError('Contraseña actual y nueva contraseña son requeridas');
    }
    
    // Buscar usuario
    const user = await User.findByPk(req.user.id);
    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }
    
    // Verificar contraseña actual
    const isPasswordValid = await user.isValidPassword(currentPassword);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Contraseña actual incorrecta');
    }
    
    // Actualizar contraseña
    await user.update({ password: newPassword });
    
    res.status(200).json({
      message: 'Contraseña actualizada correctamente'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  forgotPassword,
  resetPassword,
  changePassword
}; 