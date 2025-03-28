import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  addFoodItem,
  updateFoodItem,
  deleteFoodItem,
} from '../store/slices/inventorySlice';

const FoodDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  // Determinar si es un nuevo elemento o una edición
  const isNew = route.params?.isNew || false;
  const foodId = !isNew ? route.params?.foodId : null;
  
  // Obtener los datos del estado
  const { items, categories, locations, isLoading } = useSelector(state => state.inventory);
  
  // Encontrar el elemento en el inventario si es una edición
  const foodItem = !isNew ? items.find(item => item.id === foodId) : null;
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    name: '',
    quantity: '1',
    unit: 'unidad',
    category: '',
    location: '',
    expirationDate: new Date(),
    imageUrl: '',
    notes: '',
  });
  
  // Estado auxiliar de la interfaz
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  
  // Cargar datos del elemento si es una edición
  useEffect(() => {
    if (!isNew && foodItem) {
      setFormData({
        name: foodItem.name,
        quantity: foodItem.quantity.toString(),
        unit: foodItem.unit,
        category: foodItem.category,
        location: foodItem.location,
        expirationDate: new Date(foodItem.expirationDate),
        imageUrl: foodItem.imageUrl,
        notes: foodItem.notes || '',
      });
    }
  }, [isNew, foodItem]);
  
  // Actualizar campo del formulario
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };
  
  // Manejar selección de fecha
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      handleChange('expirationDate', selectedDate);
    }
  };
  
  // Formatear fecha para mostrar
  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };
  
  // Seleccionar imagen de la galería
  const handleSelectImage = () => {
    Alert.alert(
      'Seleccionar imagen',
      '¿Cómo deseas añadir una imagen?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cámara',
          onPress: () => captureImage(),
        },
        {
          text: 'Galería',
          onPress: () => pickImageFromGallery(),
        },
      ],
    );
  };
  
  // Abrir la cámara
  const captureImage = () => {
    launchCamera(
      {
        mediaType: 'photo',
        quality: 0.8,
      },
      (response) => {
        if (response.didCancel) {
          return;
        }
        
        if (response.assets && response.assets.length > 0) {
          handleChange('imageUrl', response.assets[0].uri);
        }
      },
    );
  };
  
  // Seleccionar imagen de la galería
  const pickImageFromGallery = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
      },
      (response) => {
        if (response.didCancel) {
          return;
        }
        
        if (response.assets && response.assets.length > 0) {
          handleChange('imageUrl', response.assets[0].uri);
        }
      },
    );
  };
  
  // Abrir el escáner de códigos de barras
  const handleScanBarcode = () => {
    navigation.navigate('Scanner', {
      onCodeScanned: (barcode) => {
        // Aquí se procesaría el código para buscar información del producto
        console.log('Código escaneado:', barcode);
        // Por ejemplo, se podría buscar en una API y autocompletar campos
        Alert.alert('Código escaneado', `Código: ${barcode}`);
      },
    });
  };
  
  // Validar formulario
  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'El nombre del alimento es obligatorio');
      return false;
    }
    
    if (!formData.category) {
      Alert.alert('Error', 'Debes seleccionar una categoría');
      return false;
    }
    
    if (!formData.location) {
      Alert.alert('Error', 'Debes seleccionar una ubicación');
      return false;
    }
    
    return true;
  };
  
  // Guardar cambios
  const handleSave = () => {
    if (!validateForm()) return;
    
    const data = {
      ...formData,
      quantity: parseInt(formData.quantity, 10) || 1,
    };
    
    if (isNew) {
      dispatch(addFoodItem(data));
    } else {
      dispatch(updateFoodItem({ id: foodId, changes: data }));
    }
    
    navigation.goBack();
  };
  
  // Eliminar elemento
  const handleDelete = () => {
    Alert.alert(
      'Eliminar alimento',
      '¿Estás seguro de que deseas eliminar este alimento?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          onPress: () => {
            dispatch(deleteFoodItem(foodId));
            navigation.goBack();
          },
          style: 'destructive',
        },
      ],
    );
  };
  
  // Renderizar selector de categoría
  const renderCategoryPicker = () => {
    if (!showCategoryPicker) return null;
    
    return (
      <View style={styles.pickerContainer}>
        <ScrollView style={styles.pickerList}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.pickerItem,
                formData.category === category && styles.pickerItemSelected,
              ]}
              onPress={() => {
                handleChange('category', category);
                setShowCategoryPicker(false);
              }}
            >
              <Text
                style={[
                  styles.pickerItemText,
                  formData.category === category && styles.pickerItemTextSelected,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };
  
  // Renderizar selector de ubicación
  const renderLocationPicker = () => {
    if (!showLocationPicker) return null;
    
    return (
      <View style={styles.pickerContainer}>
        <ScrollView style={styles.pickerList}>
          {locations.map((location) => (
            <TouchableOpacity
              key={location}
              style={[
                styles.pickerItem,
                formData.location === location && styles.pickerItemSelected,
              ]}
              onPress={() => {
                handleChange('location', location);
                setShowLocationPicker(false);
              }}
            >
              <Text
                style={[
                  styles.pickerItemText,
                  formData.location === location && styles.pickerItemTextSelected,
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
  
  // Mostrar indicador de carga mientras se obtiene la información
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }
  
  // Si no se encuentra el elemento en modo edición, mostrar mensaje de error
  if (!isNew && !foodItem) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="error-outline" size={64} color="#F44336" />
        <Text style={styles.errorText}>No se encontró el alimento</Text>
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
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backIcon}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#212121" />
        </TouchableOpacity>
        <Text style={styles.title}>
          {isNew ? 'Nuevo Alimento' : 'Editar Alimento'}
        </Text>
        {!isNew && (
          <TouchableOpacity
            style={styles.deleteIcon}
            onPress={handleDelete}
          >
            <Icon name="delete-outline" size={24} color="#F44336" />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Sección de imagen */}
      <TouchableOpacity
        style={styles.imageContainer}
        onPress={handleSelectImage}
      >
        {formData.imageUrl ? (
          <Image
            source={{ uri: formData.imageUrl }}
            style={styles.foodImage}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Icon name="add-a-photo" size={48} color="#BDBDBD" />
            <Text style={styles.imagePlaceholderText}>Añadir foto</Text>
          </View>
        )}
      </TouchableOpacity>
      
      {/* Botón para escanear código de barras */}
      <TouchableOpacity
        style={styles.scanButton}
        onPress={handleScanBarcode}
      >
        <Icon name="qr-code-scanner" size={24} color="#FFFFFF" />
        <Text style={styles.scanButtonText}>Escanear código de barras</Text>
      </TouchableOpacity>
      
      {/* Formulario */}
      <View style={styles.form}>
        {/* Nombre */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Nombre</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => handleChange('name', text)}
            placeholder="Nombre del alimento"
          />
        </View>
        
        {/* Cantidad y unidad */}
        <View style={styles.formRow}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>Cantidad</Text>
            <TextInput
              style={styles.input}
              value={formData.quantity}
              onChangeText={(text) => handleChange('quantity', text)}
              keyboardType="numeric"
              placeholder="1"
            />
          </View>
          <View style={[styles.formGroup, { flex: 2 }]}>
            <Text style={styles.label}>Unidad</Text>
            <TextInput
              style={styles.input}
              value={formData.unit}
              onChangeText={(text) => handleChange('unit', text)}
              placeholder="unidad, kg, litro, etc."
            />
          </View>
        </View>
        
        {/* Categoría */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Categoría</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowCategoryPicker(!showCategoryPicker)}
          >
            <Text style={formData.category ? styles.inputText : styles.placeholder}>
              {formData.category || 'Seleccionar categoría'}
            </Text>
            <Icon name="arrow-drop-down" size={24} color="#757575" />
          </TouchableOpacity>
          {renderCategoryPicker()}
        </View>
        
        {/* Ubicación */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Ubicación</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowLocationPicker(!showLocationPicker)}
          >
            <Text style={formData.location ? styles.inputText : styles.placeholder}>
              {formData.location || 'Seleccionar ubicación'}
            </Text>
            <Icon name="arrow-drop-down" size={24} color="#757575" />
          </TouchableOpacity>
          {renderLocationPicker()}
        </View>
        
        {/* Fecha de caducidad */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Fecha de caducidad</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.inputText}>
              {formatDate(formData.expirationDate)}
            </Text>
            <Icon name="event" size={24} color="#757575" />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={formData.expirationDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
        </View>
        
        {/* Notas */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Notas</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.notes}
            onChangeText={(text) => handleChange('notes', text)}
            placeholder="Notas adicionales"
            multiline
            textAlignVertical="top"
            numberOfLines={4}
          />
        </View>
      </View>
      
      {/* Botón de guardar */}
      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}
      >
        <Text style={styles.saveButtonText}>
          {isNew ? 'Añadir alimento' : 'Guardar cambios'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
  },
  backIcon: {
    padding: 8,
  },
  deleteIcon: {
    padding: 8,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  foodImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    marginTop: 8,
    color: '#757575',
    fontSize: 16,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  form: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 8,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#212121',
  },
  inputText: {
    fontSize: 16,
    color: '#212121',
  },
  placeholder: {
    fontSize: 16,
    color: '#9E9E9E',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginTop: 8,
    backgroundColor: '#FFFFFF',
  },
  pickerList: {
    maxHeight: 200,
  },
  pickerItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  pickerItemSelected: {
    backgroundColor: '#E8F5E9',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#212121',
  },
  pickerItemTextSelected: {
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
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
});

export default FoodDetailScreen; 