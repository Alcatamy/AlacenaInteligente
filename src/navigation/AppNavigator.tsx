import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { View, Text } from 'react-native';

// Importar pantallas
import HomeScreen from '../screens/HomeScreen';
import InventoryScreen from '../screens/InventoryScreen';
import RecipesScreen from '../screens/RecipesScreen';
import ShoppingListScreen from '../screens/ShoppingListScreen';
import BarcodeScanner from '../components/BarcodeScanner';
import FoodDetailScreen from '../screens/FoodDetailScreen';
// import RecipeDetailScreen from '../screens/RecipeDetailScreen';

// Componente temporal para RecipeDetailScreen
const TempRecipeDetailScreen = () => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    <Text>Detalles de Receta (en desarrollo)</Text>
  </View>
);

// Crear navegadores
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Navegador de inventario
const InventoryStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="InventoryList" 
        component={InventoryScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="FoodDetail" 
        component={FoodDetailScreen} 
        options={{ title: 'Detalle del Alimento' }}
      />
      <Stack.Screen 
        name="Scanner" 
        component={BarcodeScanner} 
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

// Navegador de recetas
const RecipesStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="RecipesList" 
        component={RecipesScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="RecipeDetail" 
        component={TempRecipeDetailScreen}
        options={{ title: 'Detalle de Receta' }}
      />
    </Stack.Navigator>
  );
};

// Tab Navigator
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#757575',
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Inicio',
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Inventory"
        component={InventoryStackNavigator}
        options={{
          tabBarLabel: 'Inventario',
          tabBarIcon: ({ color, size }) => (
            <Icon name="kitchen" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Scan"
        component={BarcodeScanner}
        options={{
          tabBarLabel: 'Escanear',
          tabBarIcon: ({ color, size }) => (
            <Icon name="qr-code-scanner" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Recipes"
        component={RecipesStackNavigator}
        options={{
          tabBarLabel: 'Recetas',
          tabBarIcon: ({ color, size }) => (
            <Icon name="restaurant" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="ShoppingList"
        component={ShoppingListScreen}
        options={{
          tabBarLabel: 'Compras',
          tabBarIcon: ({ color, size }) => (
            <Icon name="shopping-cart" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Navegador principal
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <TabNavigator />
    </NavigationContainer>
  );
};

export default AppNavigator; 