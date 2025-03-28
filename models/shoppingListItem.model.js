module.exports = (sequelize, DataTypes) => {
  const ShoppingListItem = sequelize.define('ShoppingListItem', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    shoppingListId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'shopping_lists',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 1
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'unidad'
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true
    },
    notes: {
      type: DataTypes.STRING,
      allowNull: true
    },
    priority: {
      type: DataTypes.ENUM('baja', 'media', 'alta'),
      defaultValue: 'media'
    },
    isPurchased: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    inventoryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'inventory',
        key: 'id'
      }
    },
    recipeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'recipes',
        key: 'id'
      }
    },
    position: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    timestamps: true,
    tableName: 'shopping_list_items',
    indexes: [
      {
        name: 'shopping_list_item_list_id_idx',
        fields: ['shoppingListId']
      },
      {
        name: 'shopping_list_item_inventory_id_idx',
        fields: ['inventoryId']
      },
      {
        name: 'shopping_list_item_recipe_id_idx',
        fields: ['recipeId']
      }
    ]
  });

  return ShoppingListItem;
}; 