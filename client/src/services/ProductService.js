// 3. Crear un servicio para gestionar productos
// src/services/ProductService.js
import { db, storage } from '@/firebase/config';
import { 
  collection, 
  getDocs, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { 
  ref as storageRef, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';

const productsCollection = collection(db, 'products');

export default {
  // Obtener todos los productos
  async getAllProducts() {
    const snapshot = await getDocs(productsCollection);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },
  
  // Obtener productos por categoría
  async getProductsByCategory(category) {
    const q = query(productsCollection, where("category", "==", category));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },
  
  // Buscar productos por texto
  async searchProducts(searchText) {
    // Nota: Firestore no tiene búsqueda de texto completo incorporada
    // Aquí obtenemos todos y filtramos en el cliente, pero para producción
    // deberías considerar Algolia u otra solución de búsqueda
    const snapshot = await getDocs(productsCollection);
    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return products.filter(product => 
      product.name.toLowerCase().includes(searchText.toLowerCase()) ||
      product.description.toLowerCase().includes(searchText.toLowerCase())
    );
  },
  
  // Subir imagen y crear producto
  async createProduct(productData, imageFile) {
    try {
      // 1. Subir imagen a Storage
      const imagePath = `products/${Date.now()}_${imageFile.name}`;
      const imageRef = storageRef(storage, imagePath);
      await uploadBytes(imageRef, imageFile);
      
      // 2. Obtener URL de la imagen
      const imageUrl = await getDownloadURL(imageRef);
      
      // 3. Guardar producto en Firestore con la URL de la imagen
      const newProduct = {
        ...productData,
        image: imageUrl,
        imagePath: imagePath, // Guardamos la ruta para poder eliminarla después si es necesario
        createdAt: new Date()
      };
      
      const docRef = await addDoc(productsCollection, newProduct);
      return { id: docRef.id, ...newProduct };
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  },
  
  // Actualizar producto existente (con o sin nueva imagen)
  async updateProduct(productId, productData, imageFile = null) {
    try {
      const productRef = doc(db, 'products', productId);
      let updatedData = { ...productData };
      
      // Si hay una nueva imagen, subir y actualizar URL
      if (imageFile) {
        // Si existe una imagen anterior, eliminarla
        if (productData.imagePath) {
          const oldImageRef = storageRef(storage, productData.imagePath);
          try {
            await deleteObject(oldImageRef);
          } catch (error) {
            console.error("Error deleting old image:", error);
            // Continuar aunque falle la eliminación de la imagen antigua
          }
        }
        
        // Subir nueva imagen
        const imagePath = `products/${Date.now()}_${imageFile.name}`;
        const imageRef = storageRef(storage, imagePath);
        await uploadBytes(imageRef, imageFile);
        
        // Obtener URL
        const imageUrl = await getDownloadURL(imageRef);
        
        // Actualizar datos con nueva imagen
        updatedData = {
          ...updatedData,
          image: imageUrl,
          imagePath: imagePath
        };
      }
      
      // Actualizar documento en Firestore
      await updateDoc(productRef, updatedData);
      return { id: productId, ...updatedData };
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  },
  
  // Eliminar producto
  async deleteProduct(productId, imagePath) {
    try {
      // Eliminar imagen de Storage si existe
      if (imagePath) {
        const imageRef = storageRef(storage, imagePath);
        try {
          await deleteObject(imageRef);
        } catch (error) {
          console.error("Error deleting image:", error);
          // Continuar aunque falle la eliminación de la imagen
        }
      }
      
      // Eliminar documento de Firestore
      await deleteDoc(doc(db, 'products', productId));
      return true;
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  }
};