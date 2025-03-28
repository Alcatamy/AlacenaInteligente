import axios from 'axios';

// URL base de la API de Open Food Facts
const OPEN_FOOD_FACTS_API = 'https://world.openfoodfacts.org/api/v0';

// Servicio para acceder a la API de Open Food Facts
const openFoodFactsAPI = {
  // Buscar producto por código de barras
  getProductByBarcode: async (barcode) => {
    try {
      const response = await axios.get(`${OPEN_FOOD_FACTS_API}/product/${barcode}.json`);
      
      // Verificar si se encontró el producto
      if (response.data.status === 1) {
        const product = response.data.product;
        
        // Extraer la información relevante
        return {
          barcode,
          name: product.product_name || 'Producto desconocido',
          brand: product.brands || '',
          quantity: product.quantity || '',
          image: product.image_url || null,
          ingredients: product.ingredients_text || '',
          allergens: product.allergens_tags 
            ? product.allergens_tags.map(a => a.replace('en:', '')) 
            : [],
          nutritionalInfo: {
            energy: product.nutriments?.energy || 0,
            proteins: product.nutriments?.proteins || 0,
            carbohydrates: product.nutriments?.carbohydrates || 0,
            fat: product.nutriments?.fat || 0,
            fiber: product.nutriments?.fiber || 0,
            salt: product.nutriments?.salt || 0,
          },
          category: mapCategoryFromOFF(product.categories_tags),
        };
      } else {
        throw new Error('Producto no encontrado');
      }
    } catch (error) {
      console.error('Error al buscar producto por código de barras:', error);
      throw new Error('No se pudo obtener información del producto');
    }
  },
  
  // Buscar productos por nombre
  searchProductsByName: async (name) => {
    try {
      const response = await axios.get(`${OPEN_FOOD_FACTS_API}/search.json`, {
        params: {
          search_terms: name,
          page_size: 10,
          json: true
        }
      });
      
      if (response.data.products && response.data.products.length > 0) {
        return response.data.products.map(product => ({
          barcode: product.code,
          name: product.product_name || 'Producto desconocido',
          brand: product.brands || '',
          image: product.image_url || null,
          category: mapCategoryFromOFF(product.categories_tags),
        }));
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error al buscar productos por nombre:', error);
      return [];
    }
  }
};

// Función para mapear categorías de Open Food Facts a nuestras categorías
function mapCategoryFromOFF(categoriesTags) {
  if (!categoriesTags || categoriesTags.length === 0) {
    return 'Otros';
  }
  
  // Mapeo básico de categorías
  const categoryMapping = {
    'milk': 'Lácteos',
    'dairy': 'Lácteos',
    'cheese': 'Lácteos',
    'yogurt': 'Lácteos',
    'fruit': 'Frutas',
    'vegetable': 'Verduras',
    'meat': 'Carnes',
    'poultry': 'Carnes',
    'seafood': 'Pescados',
    'fish': 'Pescados',
    'cereal': 'Cereales',
    'bread': 'Panadería',
    'pastry': 'Panadería',
    'pasta': 'Cereales',
    'legume': 'Legumbres',
    'bean': 'Legumbres',
    'canned': 'Enlatados',
    'preserved': 'Enlatados',
    'spice': 'Especias',
    'herb': 'Especias',
    'beverage': 'Bebidas',
    'drink': 'Bebidas',
    'snack': 'Snacks',
    'frozen': 'Congelados',
    'sauce': 'Salsas',
    'condiment': 'Salsas'
  };
  
  // Buscar coincidencias en las categorías de OFF
  for (const tag of categoriesTags) {
    const lowercaseTag = tag.toLowerCase();
    for (const [key, value] of Object.entries(categoryMapping)) {
      if (lowercaseTag.includes(key)) {
        return value;
      }
    }
  }
  
  return 'Otros';
}

export default openFoodFactsAPI; 