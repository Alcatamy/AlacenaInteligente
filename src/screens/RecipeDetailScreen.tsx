import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { fetchRecipeById, toggleFavorite } from '../store/slices/recipesSlice';
import { addShoppingItem } from '../store/slices/shoppingListSlice';

const RecipeDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  // Determinar si es una receta nueva o existente
  const isNew = route.params?.isNew || false;
  const recipeId = !isNew ? route.params?.recipeId : null;
  
  // Estado para la receta actual y marcador de carga
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Seleccionar datos del estado
  const { items: recipes, favorites, isLoading } = useSelector(state => state.recipes);
  
  // Cargar la receta al montar el componente
  useEffect(() => {
    if (!isNew && recipeId) {
      // Si es una receta existente, buscarla en el estado
      const foundRecipe = recipes.find(r => r.id === recipeId);
      
      if (foundRecipe) {
        setRecipe(foundRecipe);
        setLoading(false);
      } else {
        // Si no está en el estado, buscarla en la API
        dispatch(fetchRecipeById(recipeId)).then((response) => {
          if (response.payload) {
            setRecipe(response.payload);
          }
          setLoading(false);
        });
      }
    } else {
      // Si es una nueva receta, inicializar con valores por defecto
      setRecipe({
        id: null,
        name: '',
        description: '',
        ingredients: [],
        steps: [],
        cookTime: 0,
        servings: 2,
        difficulty: 'Fácil',
        category: '',
        imageUrl: '',
      });
      setLoading(false);
    }
  }, [isNew, recipeId, recipes, dispatch]);
  
  // Verificar si la receta es favorita
  const isFavorite = recipeId ? favorites.some(fav => fav.id === recipeId) : false;
  
  // Alternar marcador de favorito
  const handleToggleFavorite = () => {
    if (recipeId) {
      dispatch(toggleFavorite(recipeId));
    }
  };
  
  // Agregar ingredientes a la lista de compras
  const handleAddToShoppingList = () => {
    if (!recipe || !recipe.ingredients || recipe.ingredients.length === 0) {
      Alert.alert('Error', 'No hay ingredientes para agregar a la lista de compras');
      return;
    }
    
    recipe.ingredients.forEach(ingredient => {
      dispatch(addShoppingItem({
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        completed: false,
      }));
    });
    
    Alert.alert('Éxito', 'Ingredientes agregados a la lista de compras');
  };
  
  // Renderizar componente de carga
  if (loading || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }
  
  // Si no se encuentra la receta, mostrar mensaje de error
  if (!isNew && !recipe) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="error-outline" size={64} color="#F44336" />
        <Text style={styles.errorText}>No se encontró la receta</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Cabecera con imagen */}
      <View style={styles.header}>
        {recipe.imageUrl ? (
          <Image
            source={{ uri: recipe.imageUrl }}
            style={styles.recipeImage}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Icon name="image" size={80} color="#BDBDBD" />
          </View>
        )}
        
        {/* Botones de acción */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleToggleFavorite}
          >
            <Icon
              name={isFavorite ? 'favorite' : 'favorite-border'}
              size={28}
              color={isFavorite ? '#F44336' : '#757575'}
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleAddToShoppingList}
          >
            <Icon name="add-shopping-cart" size={28} color="#757575" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={28} color="#757575" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Información de la receta */}
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeName}>{recipe.name}</Text>
        
        <View style={styles.recipeDetails}>
          <View style={styles.recipeDetail}>
            <Icon name="access-time" size={20} color="#757575" />
            <Text style={styles.recipeDetailText}>{recipe.cookTime} min</Text>
          </View>
          
          <View style={styles.recipeDetail}>
            <Icon name="restaurant" size={20} color="#757575" />
            <Text style={styles.recipeDetailText}>{recipe.servings} porc.</Text>
          </View>
          
          <View style={styles.recipeDetail}>
            <Icon name="whatshot" size={20} color="#757575" />
            <Text style={styles.recipeDetailText}>{recipe.difficulty}</Text>
          </View>
          
          {recipe.category && (
            <View style={styles.categoryTag}>
              <Text style={styles.categoryTagText}>{recipe.category}</Text>
            </View>
          )}
        </View>
        
        {recipe.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descripción</Text>
            <Text style={styles.description}>{recipe.description}</Text>
          </View>
        )}
        
        {/* Ingredientes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingredientes</Text>
          {recipe.ingredients && recipe.ingredients.length > 0 ? (
            recipe.ingredients.map((ingredient, index) => (
              <View key={index} style={styles.ingredientItem}>
                <Icon name="fiber-manual-record" size={12} color="#4CAF50" />
                <Text style={styles.ingredientText}>
                  {ingredient.quantity} {ingredient.unit} {ingredient.name}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No hay ingredientes disponibles</Text>
          )}
        </View>
        
        {/* Instrucciones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preparación</Text>
          {recipe.steps && recipe.steps.length > 0 ? (
            recipe.steps.map((step, index) => (
              <View key={index} style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No hay instrucciones disponibles</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginTop: 16,
  },
  backButton: {
    marginTop: 16,
    padding: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BDBDBD',
  },
  backButtonText: {
    color: '#616161',
    fontSize: 14,
  },
  header: {
    position: 'relative',
  },
  recipeImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: 250,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtons: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'column',
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  recipeInfo: {
    padding: 16,
  },
  recipeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 16,
  },
  recipeDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  recipeDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
    marginBottom: 8,
  },
  recipeDetailText: {
    fontSize: 14,
    color: '#757575',
    marginLeft: 4,
  },
  categoryTag: {
    backgroundColor: '#EEEEEE',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 8,
  },
  categoryTagText: {
    fontSize: 14,
    color: '#616161',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#616161',
    lineHeight: 24,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ingredientText: {
    fontSize: 16,
    color: '#616161',
    marginLeft: 8,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  stepText: {
    fontSize: 16,
    color: '#616161',
    flex: 1,
    lineHeight: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#9E9E9E',
    fontStyle: 'italic',
  },
});

export default RecipeDetailScreen; 