const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

// Importar definiciones de modelos
const User = require('./user.model')(sequelize, DataTypes);
const Inventory = require('./inventory.model')(sequelize, DataTypes);
const Recipe = require('./recipe.model')(sequelize, DataTypes);
const RecipeIngredient = require('./recipeIngredient.model')(sequelize, DataTypes);
const ShoppingList = require('./shoppingList.model')(sequelize, DataTypes);
const ShoppingListItem = require('./shoppingListItem.model')(sequelize, DataTypes);

// Definir relaciones
// Un usuario tiene muchos items en su inventario
User.hasMany(Inventory, { as: 'inventory', foreignKey: 'userId' });
Inventory.belongsTo(User, { foreignKey: 'userId' });

// Un usuario tiene muchas recetas
User.hasMany(Recipe, { as: 'recipes', foreignKey: 'userId' });
Recipe.belongsTo(User, { foreignKey: 'userId' });

// Una receta tiene muchos ingredientes
Recipe.hasMany(RecipeIngredient, { as: 'ingredients', foreignKey: 'recipeId' });
RecipeIngredient.belongsTo(Recipe, { foreignKey: 'recipeId' });

// Un ingrediente de receta puede estar relacionado con un item del inventario
RecipeIngredient.belongsTo(Inventory, { foreignKey: 'inventoryId', as: 'inventoryItem' });

// Un usuario tiene muchas listas de compras
User.hasMany(ShoppingList, { as: 'shoppingLists', foreignKey: 'userId' });
ShoppingList.belongsTo(User, { foreignKey: 'userId' });

// Una lista de compras tiene muchos items
ShoppingList.hasMany(ShoppingListItem, { as: 'items', foreignKey: 'shoppingListId' });
ShoppingListItem.belongsTo(ShoppingList, { foreignKey: 'shoppingListId' });

// Un item de la lista de compras puede estar relacionado con un item del inventario
ShoppingListItem.belongsTo(Inventory, { foreignKey: 'inventoryId', as: 'inventoryItem' });

// Exportar modelos y conexión
module.exports = {
  sequelize,
  User,
  Inventory,
  Recipe,
  RecipeIngredient,
  ShoppingList,
  ShoppingListItem
}; 