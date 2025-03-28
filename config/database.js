const { Sequelize } = require('sequelize');
const config = require('./config');

// Crear instancia de Sequelize
const sequelize = new Sequelize(
  config.DB.NAME,
  config.DB.USER,
  config.DB.PASSWORD,
  {
    host: config.DB.HOST,
    dialect: config.DB.DIALECT,
    operatorsAliases: 0,
    pool: {
      max: config.DB.POOL.max,
      min: config.DB.POOL.min,
      acquire: config.DB.POOL.acquire,
      idle: config.DB.POOL.idle,
    },
    logging: config.NODE_ENV === 'development' ? console.log : false,
  }
);

module.exports = sequelize; 