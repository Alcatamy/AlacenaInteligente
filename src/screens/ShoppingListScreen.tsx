import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CheckBox from '@react-native-community/checkbox';
import {
  fetchShoppingList,
  addShoppingItem,
  updateShoppingItem,
  deleteShoppingItem,
  clearAllItems,
} from '../store/slices/shoppingListSlice';

const ShoppingListScreen = () => {
  const dispatch = useDispatch();
  const [newItemText, setNewItemText] = useState('');
  
  // Seleccionar datos del estado
  const { items, filteredItems, isLoading } = useSelector(state => state.shoppingList);
  
  // Cargar datos al montar el componente
  useEffect(() => {
    dispatch(fetchShoppingList());
  }, [dispatch]);
  
  // Agregar nuevo elemento
  const handleAddItem = () => {
    if (newItemText.trim().length === 0) return;
    
    dispatch(addShoppingItem({
      name: newItemText.trim(),
      quantity: 1,
      unit: 'unidad',
      completed: false,
    }));
    
    setNewItemText('');
  };
  
  // Marcar/desmarcar elemento como completado
  const handleToggleItem = (id, completed) => {
    dispatch(updateShoppingItem({
      id,
      changes: {
        completed: !completed,
      },
    }));
  };
  
  // Eliminar elemento
  const handleDeleteItem = (id) => {
    Alert.alert(
      'Eliminar elemento',
      '¿Estás seguro de que deseas eliminar este elemento?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          onPress: () => dispatch(deleteShoppingItem(id)),
          style: 'destructive',
        },
      ],
    );
  };
  
  // Limpiar todos los elementos
  const handleClearAll = () => {
    if (items.length === 0) return;
    
    Alert.alert(
      'Limpiar lista',
      '¿Estás seguro de que deseas eliminar todos los elementos?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Limpiar',
          onPress: () => dispatch(clearAllItems()),
          style: 'destructive',
        },
      ],
    );
  };
  
  // Renderizar elemento de lista
  const renderShoppingItem = ({ item }) => {
    return (
      <View style={styles.itemContainer}>
        <CheckBox
          value={item.completed}
          onValueChange={() => handleToggleItem(item.id, item.completed)}
          tintColors={{ true: '#4CAF50', false: '#757575' }}
        />
        <View style={styles.itemDetails}>
          <Text 
            style={[
              styles.itemName,
              item.completed && styles.completedItemText,
            ]}
          >
            {item.name}
          </Text>
          <Text style={styles.itemQuantity}>
            {item.quantity} {item.unit}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteItem(item.id)}
        >
          <Icon name="delete-outline" size={24} color="#F44336" />
        </TouchableOpacity>
      </View>
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
          <Icon name="shopping-cart" size={64} color="#BDBDBD" />
          <Text style={styles.emptyText}>Tu lista de compras está vacía</Text>
        </View>
      );
    }
    
    return (
      <FlatList
        data={filteredItems}
        renderItem={renderShoppingItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    );
  };
  
  // Renderizar estadísticas
  const renderStats = () => {
    const totalItems = items.length;
    const completedItems = items.filter(item => item.completed).length;
    const pendingItems = totalItems - completedItems;
    
    if (totalItems === 0) return null;
    
    return (
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          <Text style={styles.statsHighlight}>{pendingItems}</Text> pendientes,{' '}
          <Text style={styles.statsHighlight}>{completedItems}</Text> completados
        </Text>
        <TouchableOpacity onPress={handleClearAll}>
          <Text style={styles.clearButton}>Limpiar todo</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Lista de Compras</Text>
      </View>
      
      {/* Campo para agregar elemento */}
      <View style={styles.addContainer}>
        <TextInput
          style={styles.addInput}
          placeholder="Añadir elemento..."
          value={newItemText}
          onChangeText={setNewItemText}
          onSubmitEditing={handleAddItem}
          returnKeyType="done"
        />
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddItem}
          disabled={newItemText.trim().length === 0}
        >
          <Icon name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      {/* Estadísticas */}
      {renderStats()}
      
      {/* Lista de elementos */}
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
  },
  addContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    margin: 16,
    paddingLeft: 16,
    elevation: 2,
  },
  addInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#212121',
  },
  addButton: {
    width: 48,
    height: 48,
    backgroundColor: '#4CAF50',
    borderRadius: 0,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  statsText: {
    fontSize: 14,
    color: '#757575',
  },
  statsHighlight: {
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  clearButton: {
    fontSize: 14,
    color: '#F44336',
    fontWeight: 'bold',
  },
  list: {
    padding: 16,
    paddingTop: 8,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    elevation: 2,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 8,
  },
  itemName: {
    fontSize: 16,
    color: '#212121',
  },
  completedItemText: {
    textDecorationLine: 'line-through',
    color: '#9E9E9E',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
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
});

export default ShoppingListScreen; 