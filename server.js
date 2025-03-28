const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { sequelize } = require('./models');
const config = require('./config/config');

// Importar rutas
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const recipeRoutes = require('./routes/recipe.routes');
const shoppingListRoutes = require('./routes/shoppingList.routes');

// Inicializar express
const app = express();

// Configurar middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Limitar solicitudes para prevenir ataques de fuerza bruta
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limitar cada IP a 100 solicitudes por ventana
  standardHeaders: true,
  legacyHeaders: false,
});

// Solo aplicar a rutas de autenticación
app.use('/v1/auth', apiLimiter);

// Logging en desarrollo
if (config.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rutas
app.use('/v1/auth', authRoutes);
app.use('/v1/users', userRoutes);
app.use('/v1/inventory', inventoryRoutes);
app.use('/v1/recipes', recipeRoutes);
app.use('/v1/shopping-list', shoppingListRoutes);

// Ruta para verificar que el servidor está funcionando
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Middleware para manejar rutas inexistentes
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Middleware para manejar errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Error interno del servidor',
    ...(config.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Puerto
const PORT = config.PORT || 3000;

// Sincronizar modelos con la base de datos e iniciar servidor
const startServer = async () => {
  try {
    // Solo en desarrollo: { force: true } recrea todas las tablas
    await sequelize.sync({ alter: config.NODE_ENV === 'development' });
    console.log('Base de datos conectada correctamente');
    
    app.listen(PORT, () => {
      console.log(`Servidor ejecutándose en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app; // Para pruebas 