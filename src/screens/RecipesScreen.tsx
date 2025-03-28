import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { fetchRecipes, setFilter, resetFilters } from '../store/slices/recipesSlice';

const RecipesScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [searchText, setSearchText] = useState('');
  
  // Seleccionar datos del estado
  const { 
    filteredRecipes, 
    categories, 
    isLoading, 
    favorites,
    activeFilters,
  } = useSelector(state => state.recipes);
  
  // Cargar datos al montar el componente
  useEffect(() => {
    dispatch(fetchRecipes());
  }, [dispatch]);
  
  // Manejar búsqueda
  const handleSearch = (text) => {
    setSearchText(text);
    dispatch(setFilter({ key: 'search', value: text }));
  };
  
  // Manejar filtro por categoría
  const handleCategoryFilter = (category) => {
    const newValue = activeFilters.category === category ? null : category;
    dispatch(setFilter({ key: 'category', value: newValue }));
  };
  
  // Manejar filtro de favoritos
  const handleFavoritesFilter = () => {
    const newValue = !activeFilters.favorites;
    dispatch(setFilter({ key: 'favorites', value: newValue }));
  };
  
  // Resetear filtros
  const handleResetFilters = () => {
    setSearchText('');
    dispatch(resetFilters());
  };
  
  // Navegar al detalle de receta
  const handleRecipePress = (recipeId) => {
    navigation.navigate('RecipeDetail', { recipeId });
  };
  
  // Verificar si una receta es favorita
  const isFavorite = (recipeId) => {
    return favorites.some(fav => fav.id === recipeId);
  };
  
  // Renderizar elemento de lista
  const renderRecipeItem = ({ item }) => {
    return (
      <TouchableOpacity 
        style={styles.recipeItem}
        onPress={() => handleRecipePress(item.id)}
      >
        <Image 
          source={{ uri: item.imageUrl || 'https://via.placeholder.com/150' }} 
          style={styles.recipeImage} 
        />
        
        {/* Icono de favorito */}
        {isFavorite(item.id) && (
          <View style={styles.favoriteIcon}>
            <Icon name="favorite" size={20} color="#F44336" />
          </View>
        )}
        
        <View style={styles.recipeInfo}>
          <Text style={styles.recipeName}>{item.name}</Text>
          
          <View style={styles.recipeDetails}>
            <View style={styles.recipeDetail}>
              <Icon name="access-time" size={16} color="#757575" />
              <Text style={styles.recipeDetailText}>{item.cookTime} min</Text>
            </View>
            
            <View style={styles.recipeDetail}>
              <Icon name="restaurant" size={16} color="#757575" />
              <Text style={styles.recipeDetailText}>{item.servings} porc.</Text>
            </View>
            
            <View style={styles.recipeDetail}>
              <Icon name="whatshot" size={16} color="#757575" />
              <Text style={styles.recipeDetailText}>{item.difficulty}</Text>
            </View>
          </View>
          
          {/* Etiquetas de categoría */}
          <View style={styles.recipeTags}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{item.category}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  
  // Renderizar contenido principal
  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      );
    }
    
    if (filteredRecipes.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Icon name="restaurant" size={64} color="#BDBDBD" />
          <Text style={styles.emptyText}>No se encontraron recetas</Text>
          {(activeFilters.category || activeFilters.favorites || activeFilters.search) && (
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={handleResetFilters}
            >
              <Text style={styles.resetButtonText}>Quitar filtros</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }
    
    return (
      <FlatList
        data={filteredRecipes}
        renderItem={renderRecipeItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    );
  };
  
  // Renderizar selector de filtros
  const renderFilters = () => {
    return (
      <View style={styles.filtersContainer}>
        <Text style={styles.filterTitle}>Categorías:</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterScrollView}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.filterChip,
                activeFilters.category === category && styles.activeFilterChip,
              ]}
              onPress={() => handleCategoryFilter(category)}
            >
              <Text 
                style={[
                  styles.filterChipText,
                  activeFilters.category === category && styles.activeFilterChipText,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {/* Filtro de favoritos */}
        <View style={styles.favoritesFilter}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              activeFilters.favorites && styles.activeFilterChip,
              { flexDirection: 'row', alignItems: 'center' }
            ]}
            onPress={handleFavoritesFilter}
          >
            <Icon 
              name={activeFilters.favorites ? "favorite" : "favorite-border"} 
              size={16} 
              color={activeFilters.favorites ? "#FFFFFF" : "#F44336"} 
              style={{ marginRight: 4 }}
            />
            <Text 
              style={[
                styles.filterChipText,
                activeFilters.favorites && styles.activeFilterChipText,
              ]}
            >
              Favoritos
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recetas</Text>
      </View>
      
      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={24} color="#BDBDBD" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar recetas..."
          value={searchText}
          onChangeText={handleSearch}
        />
        {searchText ? (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={() => handleSearch('')}
          >
            <Icon name="close" size={20} color="#BDBDBD" />
          </TouchableOpacity>
        ) : null}
      </View>
      
      {/* Filtros */}
      {renderFilters()}
      
      {/* Lista de recetas */}
      {renderContent()}
      
      {/* Botón flotante para añadir */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => navigation.navigate('RecipeDetail', { isNew: true })}
      >
        <Icon name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    margin: 16,
    paddingHorizontal: 16,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#212121',
  },
  clearButton: {
    padding: 8,
  },
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
    elevation: 2,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#212121',
    marginTop: 8,
    marginBottom: 8,
  },
  filterScrollView: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  filterChip: {
    backgroundColor: '#EEEEEE',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  activeFilterChip: {
    backgroundColor: '#4CAF50',
  },
  filterChipText: {
    fontSize: 14,
    color: '#616161',
  },
  activeFilterChipText: {
    color: '#FFFFFF',
  },
  favoritesFilter: {
    marginTop: 8,
    marginBottom: 8,
  },
  list: {
    padding: 16,
  },
  recipeItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
  },
  recipeImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  favoriteIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    padding: 4,
  },
  recipeInfo: {
    padding: 12,
  },
  recipeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 8,
  },
  recipeDetails: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  recipeDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  recipeDetailText: {
    fontSize: 12,
    color: '#757575',
    marginLeft: 4,
  },
  recipeTags: {
    flexDirection: 'row',
  },
  tag: {
    backgroundColor: '#EEEEEE',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#616161',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
  },
  resetButton: {
    marginTop: 16,
    padding: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BDBDBD',
  },
  resetButtonText: {
    color: '#616161',
    fontSize: 14,
  },
  addButton: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },
});

export default RecipesScreen; 