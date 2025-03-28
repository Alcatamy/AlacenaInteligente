module.exports = (sequelize, DataTypes) => {
  const Inventory = sequelize.define('Inventory', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    barcode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    category: {
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
    expirationDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    purchaseDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'despensa'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    nutritionalInfo: {
      type: DataTypes.JSON,
      allowNull: true
    },
    isFinished: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    timestamps: true,
    tableName: 'inventory',
    indexes: [
      {
        name: 'inventory_user_id_idx',
        fields: ['userId']
      },
      {
        name: 'inventory_barcode_idx',
        fields: ['barcode']
      },
      {
        name: 'inventory_category_idx',
        fields: ['category']
      },
      {
        name: 'inventory_expiration_idx',
        fields: ['expirationDate']
      }
    ]
  });

  return Inventory;
}; 