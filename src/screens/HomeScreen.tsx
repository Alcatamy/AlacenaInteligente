import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { fetchInventory } from '../store/slices/inventorySlice';
import { getRecommendedRecipes } from '../store/slices/recipesSlice';

const HomeScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  // Seleccionar datos del estado
  const { stats, isLoading: inventoryLoading } = useSelector(state => state.inventory);
  const { filteredRecipes, isLoading: recipesLoading } = useSelector(state => state.recipes);
  
  // Cargar datos al montar el componente
  useEffect(() => {
    dispatch(fetchInventory());
    dispatch(getRecommendedRecipes());
  }, [dispatch]);
  
  // Navegar al escáner
  const handleScanPress = () => {
    navigation.navigate('Scan');
  };
  
  // Navegar al detalle de receta
  const handleRecipePress = (recipeId) => {
    navigation.navigate('Recipes', {
      screen: 'RecipeDetail',
      params: { recipeId },
    });
  };
  
  // Renderizar tarjeta de estadísticas
  const renderStatsCard = () => {
    if (inventoryLoading) {
      return (
        <View style={styles.statsCard}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      );
    }
    
    return (
      <View style={styles.statsCard}>
        <Text style={styles.sectionTitle}>Tu Inventario</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats?.total || 0}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#F44336' }]}>
              {stats?.expired || 0}
            </Text>
            <Text style={styles.statLabel}>Caducados</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#FFC107' }]}>
              {stats?.aboutToExpire || 0}
            </Text>
            <Text style={styles.statLabel}>Por caducar</Text>
          </View>
        </View>
      </View>
    );
  };
  
  // Renderizar recetas recomendadas
  const renderRecommendedRecipes = () => {
    if (recipesLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      );
    }
    
    if (!filteredRecipes || filteredRecipes.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Icon name="restaurant" size={48} color="#BDBDBD" />
          <Text style={styles.emptyText}>No hay recetas recomendadas</Text>
        </View>
      );
    }
    
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.recipesContainer}
      >
        {filteredRecipes.slice(0, 5).map((recipe) => (
          <TouchableOpacity
            key={recipe.id}
            style={styles.recipeCard}
            onPress={() => handleRecipePress(recipe.id)}
          >
            <Image
              source={{ uri: recipe.imageUrl || 'https://via.placeholder.com/150' }}
              style={styles.recipeImage}
            />
            <View style={styles.recipeInfo}>
              <Text style={styles.recipeTitle} numberOfLines={1}>
                {recipe.name}
              </Text>
              <Text style={styles.recipeTime}>
                <Icon name="access-time" size={14} color="#757575" /> {recipe.cookTime} min
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Alacena Inteligente</Text>
        <TouchableOpacity style={styles.scanButton} onPress={handleScanPress}>
          <Icon name="qr-code-scanner" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      {/* Estadísticas */}
      {renderStatsCard()}
      
      {/* Botones rápidos */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('Inventory')}
        >
          <Icon name="kitchen" size={24} color="#4CAF50" />
          <Text style={styles.actionText}>Inventario</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('Recipes')}
        >
          <Icon name="restaurant" size={24} color="#4CAF50" />
          <Text style={styles.actionText}>Recetas</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('ShoppingList')}
        >
          <Icon name="shopping-cart" size={24} color="#4CAF50" />
          <Text style={styles.actionText}>Compras</Text>
        </TouchableOpacity>
      </View>
      
      {/* Recetas recomendadas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recetas recomendadas</Text>
        {renderRecommendedRecipes()}
      </View>
    </ScrollView>
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
    color: '#4CAF50',
  },
  scanButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    margin: 16,
    padding: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#212121',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    margin: 16,
    padding: 16,
    elevation: 2,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  actionText: {
    fontSize: 14,
    color: '#212121',
    marginTop: 8,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    margin: 16,
    padding: 16,
    elevation: 2,
  },
  recipesContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  recipeCard: {
    width: 150,
    marginRight: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    overflow: 'hidden',
  },
  recipeImage: {
    width: 150,
    height: 100,
    resizeMode: 'cover',
  },
  recipeInfo: {
    padding: 8,
  },
  recipeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#212121',
  },
  recipeTime: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 8,
    color: '#757575',
    fontSize: 14,
  },
});

export default HomeScreen; 