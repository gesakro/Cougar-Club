<script>
import axios from 'axios';
import AuthService from '../../services/authService.js';
import AppNavbar from '@/components/layout/AppNavbar.vue';
import AppFooter from '@/components/layout/AppFooter.vue';

export default {
  name: 'CommerceManagement',
  components: {
    AppNavbar,
    AppFooter
  },
  data() {
    return {
      // Datos del comercio
      commerce: null,
      loading: true,
      
      // Información del usuario
      userId: null,
      companyId: null,
      
      // Modal de comercio
      showCommerceModal: false,
      currentCommerce: {
        nombre: '',
        email: '',
        plan: 'Mensual',
        imagenBanner: '',
        imagenPerfil: '',
        productos: []
      },
      
      // Modal de productos
      showProductsModal: false,
      companyProducts: [],
      loadingProducts: false,
      
      // Modal de producto
      showProductModal: false,
      isEditModeProduct: false,
      currentProduct: {
        nombre: '',
        precio: 0,
        stock: 0,
        descripcion: '',
        categoria: '',
        imagen: '',
        compania_id: null,
        marca_id: null
      },
      
      // Modal de marca
      showBrandModal: false,
      isEditModeBrand: false,
      currentBrand: {
        nombre: '',
        compania: null
      },
      companyBrands: [],
      loadingBrands: false,
      
      // Modal de confirmación
      showDeleteModal: false,
      deleteType: '', // 'product' o 'brand'
      itemToDelete: null,
      
      // Opciones
      planOptions: ['Mensual', 'Anual']
    };
  },
  
  computed: {
    userRole() {
      return AuthService.getUserRole();
    },
    
    isManager() {
      return this.userRole === 'Gerente';
    },
    
    hasPermission() {
      return this.isManager && this.companyId;
    }
  },
  
  created() {
    this.getUserInfo();
  },
  
  methods: {
    // Métodos de utilidad
    formatDate(dateString) {
      if (!dateString) return 'N/D';
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
    },
    
    formatPrice(price) {
      return parseFloat(price).toFixed(2);
    },
    
    // Obtener información del usuario y su compañía
    async getUserInfo() {
      try {
        // Obtener el ID del usuario del localStorage o de donde esté almacenado
        this.userId = localStorage.getItem('userId');
        // Obtener el ID de la compañía a la que pertenece el gerente
        this.companyId = localStorage.getItem('companyId');
        
        if (!this.companyId || !this.isManager) {
          this.$router.push('/dashboard');
          this.$toast.error('No tienes permisos para acceder a esta página');
          return;
        }
        
        // Cargar los datos del comercio
        await this.fetchCommerce();
        
      } catch (error) {
        console.error('Error al obtener información del usuario:', error);
        this.$toast.error('Error al cargar los datos del usuario');
      }
    },
    
    // Métodos para el comercio
    async fetchCommerce() {
      this.loading = true;
      try {
        const response = await axios.get(`http://localhost:5000/api/companies/${this.companyId}`);
        this.commerce = response.data;
        this.loading = false;
        
        // También cargar productos y marcas
        await this.fetchProducts();
        await this.fetchBrands();
      } catch (error) {
        console.error('Error al cargar datos del comercio:', error);
        this.$toast.error('Error al cargar los datos del comercio');
        this.loading = false;
      }
    },
    
    openCommerceModal() {
      this.currentCommerce = { ...this.commerce };
      this.showCommerceModal = true;
    },
    
    closeCommerceModal() {
      this.showCommerceModal = false;
    },
    
    async saveCommerce() {
      try {
        // Actualizar comercio existente
        await axios.put(`http://localhost:5000/api/companies/${this.companyId}`, this.currentCommerce);
        this.$toast.success('Comercio actualizado con éxito');
        
        // Actualizar datos locales
        this.commerce = { ...this.currentCommerce };
        
        // Cerrar el modal
        this.closeCommerceModal();
      } catch (error) {
        console.error('Error al guardar comercio:', error);
        this.$toast.error(error.response?.data?.message || 'Error al guardar el comercio');
      }
    },
    
    // Métodos para productos
    async fetchProducts() {
      this.loadingProducts = true;
      try {
        const response = await axios.get(`http://localhost:5000/api/products?compania_id=${this.companyId}`);
        this.companyProducts = response.data;
      } catch (error) {
        console.error('Error al cargar productos:', error);
        this.$toast.error('Error al cargar los productos');
      } finally {
        this.loadingProducts = false;
      }
    },
    
    openProductsModal() {
      this.showProductsModal = true;
    },
    
    closeProductsModal() {
      this.showProductsModal = false;
    },
    
    openProductModal(product = null) {
      if (product) {
        // Modo edición
        this.isEditModeProduct = true;
        this.currentProduct = { ...product };
      } else {
        // Modo creación
        this.isEditModeProduct = false;
        this.currentProduct = {
          nombre: '',
          precio: 0,
          stock: 0,
          descripcion: '',
          categoria: '',
          imagen: '',
          compania_id: this.companyId,
          marca_id: null
        };
      }
      this.showProductModal = true;
    },
    
    closeProductModal() {
      this.showProductModal = false;
    },
    
    async saveProduct() {
      try {
        // Asegurar que el producto esté asociado a la compañía correcta
        this.currentProduct.compania_id = this.companyId;
        
        if (this.isEditModeProduct) {
          // Actualizar producto existente
          await axios.put(`http://localhost:5000/api/products/${this.currentProduct._id}`, this.currentProduct);
          this.$toast.success('Producto actualizado con éxito');
          
          // Actualizar en la lista local
          const index = this.companyProducts.findIndex(p => p._id === this.currentProduct._id);
          if (index !== -1) {
            this.companyProducts[index] = { ...this.currentProduct };
          }
        } else {
          // Crear nuevo producto
          const response = await axios.post('http://localhost:5000/api/products', this.currentProduct);
          this.$toast.success('Producto creado con éxito');
          
          // Añadir a la lista local
          this.companyProducts.push(response.data);
        }
        
        // Cerrar el modal
        this.closeProductModal();
      } catch (error) {
        console.error('Error al guardar producto:', error);
        this.$toast.error(error.response?.data?.message || 'Error al guardar el producto');
      }
    },
    
    confirmDeleteProduct(product) {
      this.deleteType = 'product';
      this.itemToDelete = product;
      this.showDeleteModal = true;
    },
    
    // Métodos para marcas
    async fetchBrands() {
      this.loadingBrands = true;
      try {
        const response = await axios.get(`http://localhost:5000/api/brands?compania=${this.companyId}`);
        this.companyBrands = response.data;
      } catch (error) {
        console.error('Error al cargar marcas:', error);
        this.$toast.error('Error al cargar las marcas');
      } finally {
        this.loadingBrands = false;
      }
    },
    
    openBrandModal(brand = null) {
      if (brand) {
        // Modo edición
        this.isEditModeBrand = true;
        this.currentBrand = { ...brand };
      } else {
        // Modo creación
        this.isEditModeBrand = false;
        this.currentBrand = {
          nombre: '',
          compania: this.companyId
        };
      }
      this.showBrandModal = true;
    },
    
    closeBrandModal() {
      this.showBrandModal = false;
    },
    
    async saveBrand() {
      try {
        // Asegurar que la marca esté asociada a la compañía correcta
        this.currentBrand.compania = this.companyId;
        
        if (this.isEditModeBrand) {
          // Actualizar marca existente
          await axios.put(`http://localhost:5000/api/brands/${this.currentBrand._id}`, this.currentBrand);
          this.$toast.success('Marca actualizada con éxito');
          
          // Actualizar en la lista local
          const index = this.companyBrands.findIndex(b => b._id === this.currentBrand._id);
          if (index !== -1) {
            this.companyBrands[index] = { ...this.currentBrand };
          }
        } else {
          // Crear nueva marca
          const response = await axios.post('http://localhost:5000/api/brands', this.currentBrand);
          this.$toast.success('Marca creada con éxito');
          
          // Añadir a la lista local
          this.companyBrands.push(response.data);
        }
        
        // Cerrar el modal
        this.closeBrandModal();
      } catch (error) {
        console.error('Error al guardar marca:', error);
        this.$toast.error(error.response?.data?.message || 'Error al guardar la marca');
      }
    },
    
    confirmDeleteBrand(brand) {
      this.deleteType = 'brand';
      this.itemToDelete = brand;
      this.showDeleteModal = true;
    },
    
    // Método para ejecutar eliminaciones
    async executeDelete() {
      try {
        if (this.deleteType === 'product') {
          // Eliminar producto
          await axios.delete(`http://localhost:5000/api/products/${this.itemToDelete._id}`);
          this.$toast.success('Producto eliminado con éxito');
          
          // Eliminar de la lista local de productos
          this.companyProducts = this.companyProducts.filter(p => p._id !== this.itemToDelete._id);
        } else if (this.deleteType === 'brand') {
          // Eliminar marca
          await axios.delete(`http://localhost:5000/api/brands/${this.itemToDelete._id}`);
          this.$toast.success('Marca eliminada con éxito');
          
          // Eliminar de la lista local de marcas
          this.companyBrands = this.companyBrands.filter(b => b._id !== this.itemToDelete._id);
        }
        
        // Cerrar el modal de confirmación
        this.showDeleteModal = false;
      } catch (error) {
        console.error('Error al eliminar:', error);
        let itemType = '';
        if (this.deleteType === 'product') itemType = 'el producto';
        else if (this.deleteType === 'brand') itemType = 'la marca';
        
        this.$toast.error(error.response?.data?.message || `Error al eliminar ${itemType}`);
      }
    }
  }
};
</script>

<template>
  <div>
    <AppNavbar />
    
    <div class="commerce-management">
      <!-- Encabezado de página -->
      <div class="page-header">
        <h1>Gestión de Mi Comercio</h1>
      </div>
      
      <!-- Información del comercio -->
      <div v-if="!loading && commerce" class="commerce-info">
        <div class="commerce-header">
          <div class="commerce-banner" :style="{ backgroundImage: `url('${commerce.imagenBanner || 'https://via.placeholder.com/1200x300'}')` }">
            <div class="commerce-profile-container">
              <img 
                :src="commerce.imagenPerfil || 'https://via.placeholder.com/150'" 
                alt="Logo del comercio" 
                class="commerce-profile"
              >
            </div>
          </div>
          
          <div class="commerce-details">
            <div class="commerce-name-section">
              <h2>{{ commerce.nombre }}</h2>
              <button v-if="hasPermission" class="btn-primary" @click="openCommerceModal()">
                <i class="fas fa-edit"></i> Editar Información
              </button>
            </div>
            
            <div class="commerce-info-grid">
              <div class="info-item">
                <div class="info-label">Email</div>
                <div class="info-value">{{ commerce.email }}</div>
              </div>
              
              <div class="info-item">
                <div class="info-label">Plan</div>
                <div class="info-value">{{ commerce.plan }}</div>
              </div>
              
              <div class="info-item">
                <div class="info-label">Fecha de registro</div>
                <div class="info-value">{{ formatDate(commerce.createdAt) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else-if="loading" class="loading-message">
        <i class="fas fa-spinner fa-spin"></i> Cargando información del comercio...
      </div>
      
      <div v-else class="empty-message">
        No se encontró información del comercio.
      </div>
      
      <!-- Sección de gestión de productos -->
      <div class="section-header">
        <h2>Gestión de Productos</h2>
        <div class="section-actions">
          <button v-if="hasPermission" class="btn-primary" @click="openProductModal()">
            <i class="fas fa-plus"></i> Nuevo Producto
          </button>
          <button v-if="hasPermission" class="btn-secondary" @click="openBrandModal()" style="margin-left: 10px;">
            <i class="fas fa-tag"></i> Nueva Marca
          </button>
        </div>
      </div>
      
      <!-- Tabla de productos -->
      <div class="table-container">
        <table class="data-table" v-if="!loadingProducts && companyProducts.length">
          <thead>
            <tr>
              <th class="product-img-cell">Imagen</th>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Categoría</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in companyProducts" :key="product._id">
              <td class="product-img-cell">
                <img 
                  :src="product.imagen || 'https://via.placeholder.com/50'" 
                  alt="Producto" 
                  class="product-thumbnail"
                >
              </td>
              <td>{{ product.nombre }}</td>
              <td>{{ formatPrice(product.precio) }} €</td>
              <td>{{ product.stock }}</td>
              <td>{{ product.categoria }}</td>
              <td class="actions-column">
                <button 
                  v-if="hasPermission" 
                  class="btn-action edit" 
                  @click="openProductModal(product)"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button 
                  v-if="hasPermission" 
                  class="btn-action delete" 
                  @click="confirmDeleteProduct(product)"
                >
                  <i class="fas fa-trash-alt"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div v-else-if="loadingProducts" class="loading-message">
          <i class="fas fa-spinner fa-spin"></i> Cargando productos...
        </div>
        
        <div v-else class="empty-message">
          No hay productos registrados en este comercio.
        </div>
      </div>
      
      <!-- Sección de marcas -->
      <div class="section-header">
        <h2>Gestión de Marcas</h2>
      </div>
      
      <!-- Tabla de marcas -->
      <div class="table-container">
        <table class="data-table" v-if="!loadingBrands && companyBrands.length">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="brand in companyBrands" :key="brand._id">
              <td>{{ brand.nombre }}</td>
              <td class="actions-column">
                <button 
                  v-if="hasPermission" 
                  class="btn-action edit" 
                  @click="openBrandModal(brand)"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button 
                  v-if="hasPermission" 
                  class="btn-action delete" 
                  @click="confirmDeleteBrand(brand)"
                >
                  <i class="fas fa-trash-alt"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div v-else-if="loadingBrands" class="loading-message">
          <i class="fas fa-spinner fa-spin"></i> Cargando marcas...
        </div>
        
        <div v-else class="empty-message">
          No hay marcas registradas en este comercio.
        </div>
      </div>
    </div>
    
    <!-- Modal de Comercio -->
    <div class="modal" v-if="showCommerceModal" @click.self="closeCommerceModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Editar Información del Comercio</h2>
          <button class="close-button" @click="closeCommerceModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="commerce-name">Nombre del comercio</label>
            <input 
              type="text" 
              id="commerce-name" 
              v-model="currentCommerce.nombre" 
              placeholder="Nombre del comercio"
            >
          </div>
          
          <div class="form-group">
            <label for="commerce-email">Email de contacto</label>
            <input 
              type="email" 
              id="commerce-email" 
              v-model="currentCommerce.email" 
              placeholder="email@ejemplo.com"
            >
          </div>
          
          <div class="form-group">
            <label for="commerce-plan">Plan</label>
            <select id="commerce-plan" v-model="currentCommerce.plan">
              <option v-for="option in planOptions" :key="option" :value="option">
                {{ option }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="commerce-banner">URL de imagen de banner</label>
            <input 
              type="text" 
              id="commerce-banner" 
              v-model="currentCommerce.imagenBanner" 
              placeholder="https://ejemplo.com/imagen.jpg"
            >
          </div>
          
          <div class="form-group">
            <label for="commerce-profile">URL de imagen de perfil</label>
            <input 
              type="text" 
              id="commerce-profile" 
              v-model="currentCommerce.imagenPerfil" 
              placeholder="https://ejemplo.com/imagen.jpg"
            >
          </div>
          
          <div class="modal-footer">
            <button class="btn-secondary" @click="closeCommerceModal">Cancelar</button>
            <button class="btn-primary" @click="saveCommerce">Actualizar</button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal de Producto -->
    <div class="modal" v-if="showProductModal" @click.self="closeProductModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ isEditModeProduct ? 'Editar Producto' : 'Nuevo Producto' }}</h2>
          <button class="close-button" @click="closeProductModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="product-name">Nombre del producto</label>
            <input 
              type="text" 
              id="product-name" 
              v-model="currentProduct.nombre" 
              placeholder="Nombre del producto"
            >
          </div>
          
          <div class="form-row">
            <div class="form-group half">
              <label for="product-price">Precio (€)</label>
              <input 
                type="number" 
                id="product-price" 
                v-model="currentProduct.precio" 
                step="0.01"
                min="0"
              >
            </div>
            
            <div class="form-group half">
              <label for="product-stock">Stock</label>
              <input 
                type="number" 
                id="product-stock" 
                v-model="currentProduct.stock" 
                min="0"
              >
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group half">
              <label for="product-category">Categoría</label>
              <input 
                type="text" 
                id="product-category" 
                v-model="currentProduct.categoria" 
                placeholder="Categoría del producto"
              >
            </div>
            
            <div class="form-group half">
              <label for="product-brand">Marca</label>
              <select id="product-brand" v-model="currentProduct.marca_id">
                <option value="">-- Sin marca --</option>
                <option 
                  v-for="brand in companyBrands" 
                  :key="brand._id" 
                  :value="brand._id"
                >
                  {{ brand.nombre }}
                </option>
              </select>
            </div>
          </div>
          
          <div class="form-group">
            <label for="product-description">Descripción</label>
            <textarea 
              id="product-description" 
              v-model="currentProduct.descripcion" 
              rows="4" 
              placeholder="Descripción del producto"
            ></textarea>
          </div>
          
          <div class="form-group">
            <label for="product-image">URL de imagen</label>
            <input 
              type="text" 
              id="product-image" 
              v-model="currentProduct.imagen" 
              placeholder="https://ejemplo.com/imagen.jpg"
            >
          </div>
          
          <div class="modal-footer">
            <button class="btn-secondary" @click="closeProductModal">Cancelar</button>
            <button class="btn-primary" @click="saveProduct">
              {{ isEditModeProduct ? 'Actualizar' : 'Crear' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal de Marca -->
    <div class="modal" v-if="showBrandModal" @click.self="closeBrandModal">
      <div class="modal-content modal-sm">
        <div class="modal-header">
          <h2>{{ isEditModeBrand ? 'Editar Marca' : 'Nueva Marca' }}</h2>
          <button class="close-button" @click="closeBrandModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="brand-name">Nombre de la marca</label>
            <input 
              type="text" 
              id="brand-name" 
              v-model="currentBrand.nombre" 
              placeholder="Nombre de la marca"
            >
          </div>
          
          <div class="modal-footer">
            <button class="btn-secondary" @click="closeBrandModal">Cancelar</button>
            <button class="btn-primary" @click="saveBrand">
              {{ isEditModeBrand ? 'Actualizar' : 'Crear' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal de Confirmación para Eliminar -->
    <div class="modal" v-if="showDeleteModal" @click.self="showDeleteModal = false">
      <div class="modal-content modal-sm">
        <div class="modal-header">
          <h2>Confirmar eliminación</h2>
          <button class="close-button" @click="showDeleteModal = false">×</button>
        </div>
        <div class="modal-body">
          <p>
            ¿Está seguro de que desea eliminar 
            <strong>
              {{ 
                deleteType === 'product' ? itemToDelete.nombre :
                deleteType === 'brand' ? itemToDelete.nombre : ''
              }}
            </strong>?
          </p>
          
          <div class="modal-footer">
            <button class="btn-secondary" @click="showDeleteModal = false">Cancelar</button>
            <button class="btn-danger" @click="executeDelete">Eliminar</button>
          </div>
        </div>
      </div>
    </div>
    
    <AppFooter />
  </div>
</template>