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
import { fetchInventory, setFilter, resetFilters } from '../store/slices/inventorySlice';

const InventoryScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [searchText, setSearchText] = useState('');
  
  // Seleccionar datos del estado
  const { 
    filteredItems, 
    categories, 
    locations, 
    activeFilters, 
    isLoading 
  } = useSelector(state => state.inventory);
  
  // Cargar datos al montar el componente
  useEffect(() => {
    dispatch(fetchInventory());
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
  
  // Manejar filtro por ubicación
  const handleLocationFilter = (location) => {
    const newValue = activeFilters.location === location ? null : location;
    dispatch(setFilter({ key: 'location', value: newValue }));
  };
  
  // Resetear filtros
  const handleResetFilters = () => {
    setSearchText('');
    dispatch(resetFilters());
  };
  
  // Abrir escáner
  const handleScanPress = () => {
    navigation.navigate('Scanner', {
      onCodeScanned: (barcode) => {
        // Aquí se manejaría el código escaneado, por ejemplo añadiendo un producto
        console.log('Código escaneado:', barcode);
      }
    });
  };
  
  // Abrir detalle de alimento
  const handleFoodPress = (foodId) => {
    navigation.navigate('FoodDetail', { foodId });
  };
  
  // Renderizar elemento de lista
  const renderFoodItem = ({ item }) => {
    // Calcular días hasta caducidad
    const today = new Date();
    const expirationDate = new Date(item.expirationDate);
    const daysLeft = Math.ceil((expirationDate - today) / (1000 * 60 * 60 * 24));
    
    // Determinar color según días restantes
    let daysColor = '#4CAF50'; // verde por defecto
    if (daysLeft < 0) {
      daysColor = '#F44336'; // rojo si ha caducado
    } else if (daysLeft <= 3) {
      daysColor = '#FFC107'; // amarillo si está por caducar
    }
    
    return (
      <TouchableOpacity 
        style={styles.foodItem}
        onPress={() => handleFoodPress(item.id)}
      >
        <Image 
          source={{ uri: item.imageUrl || 'https://via.placeholder.com/60' }} 
          style={styles.foodImage} 
        />
        <View style={styles.foodInfo}>
          <Text style={styles.foodName}>{item.name}</Text>
          <View style={styles.foodTags}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{item.category}</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{item.location}</Text>
            </View>
          </View>
          <Text style={[styles.daysLeft, { color: daysColor }]}>
            {daysLeft < 0
              ? `Caducado hace ${Math.abs(daysLeft)} días`
              : daysLeft === 0
              ? 'Caduca hoy'
              : `Caduca en ${daysLeft} días`}
          </Text>
        </View>
        <Icon name="chevron-right" size={24} color="#BDBDBD" />
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
    
    if (filteredItems.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Icon name="kitchen" size={64} color="#BDBDBD" />
          <Text style={styles.emptyText}>No hay alimentos en tu inventario</Text>
          {(activeFilters.category || activeFilters.location || activeFilters.search) && (
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
        data={filteredItems}
        renderItem={renderFoodItem}
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
        
        <Text style={styles.filterTitle}>Ubicaciones:</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterScrollView}
        >
          {locations.map((location) => (
            <TouchableOpacity
              key={location}
              style={[
                styles.filterChip,
                activeFilters.location === location && styles.activeFilterChip,
              ]}
              onPress={() => handleLocationFilter(location)}
            >
              <Text 
                style={[
                  styles.filterChipText,
                  activeFilters.location === location && styles.activeFilterChipText,
                ]}
              >
                {location}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mi Inventario</Text>
        <TouchableOpacity style={styles.scanButton} onPress={handleScanPress}>
          <Icon name="qr-code-scanner" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={24} color="#BDBDBD" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar alimentos..."
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
      
      {/* Lista de alimentos */}
      {renderContent()}
      
      {/* Botón flotante para añadir */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => navigation.navigate('FoodDetail', { isNew: true })}
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
  scanButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
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
  list: {
    padding: 16,
  },
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    elevation: 2,
  },
  foodImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
  },
  foodTags: {
    flexDirection: 'row',
    marginTop: 4,
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
  daysLeft: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: 'bold',
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

export default InventoryScreen; 