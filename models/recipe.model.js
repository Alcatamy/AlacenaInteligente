module.exports = (sequelize, DataTypes) => {
  const Recipe = sequelize.define('Recipe', {
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
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    instructions: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    preparationTime: {
      type: DataTypes.INTEGER, // Tiempo en minutos
      allowNull: true
    },
    servings: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    difficulty: {
      type: DataTypes.ENUM('fácil', 'medio', 'difícil'),
      defaultValue: 'medio'
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    categories: {
      type: DataTypes.JSON, // Array de categorías ["desayuno", "vegetariano"]
      defaultValue: []
    },
    isFavorite: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    nutritionalInfo: {
      type: DataTypes.JSON,
      allowNull: true
    },
    source: {
      type: DataTypes.STRING, // URL o descripción de donde se obtuvo la receta
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    timestamps: true,
    tableName: 'recipes',
    indexes: [
      {
        name: 'recipe_user_id_idx',
        fields: ['userId']
      },
      {
        name: 'recipe_title_idx',
        fields: ['title']
      }
    ]
  });

  return Recipe;
}; 