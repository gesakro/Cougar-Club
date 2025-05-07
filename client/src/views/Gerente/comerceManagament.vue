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
      // Datos de la compañía
      company: null,
      loading: true,
      currentUserCompanyId: localStorage.getItem('companyId') || null,
      
      // Modal de compañía
      showCompanyModal: false,
      currentCompany: {
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
      itemToDelete: null
    };
  },
  
  computed: {
    userRole() {
      return AuthService.getUserRole();
    },
    
    isGerente() {
      return this.userRole === 'Gerente';
    },
    
    hasCompanyAccess() {
      return this.isGerente && this.currentUserCompanyId;
    },
    
    planOptions() {
      return ['Mensual', 'Anual'];
    }
  },
  
  created() {
    this.verifyAccess();
    if (this.hasCompanyAccess) {
      this.fetchCompanyData();
    }
  },
  
  methods: {
    // Verificar acceso y redireccionar si no es gerente
    verifyAccess() {
      if (!this.isGerente || !this.currentUserCompanyId) {
        // Redirigir a página de acceso denegado o dashboard
        this.$router.push('/dashboard');
        
        // Verificar si $toast está disponible antes de usarlo
        if (this.$toast) {
          this.$toast.error('Acceso denegado. Solo los gerentes pueden acceder a esta página.');
        } else {
          console.error('Acceso denegado. Solo los gerentes pueden acceder a esta página.');
        }
      }
    },
    
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
    
    // Métodos para la compañía
    async fetchCompanyData() {
      this.loading = true;
      try {
        // Obtener los datos de la compañía del gerente
        const response = await axios.get(`http://localhost:5000/api/companies/${this.currentUserCompanyId}`);
        this.company = response.data;
        
        // Obtener productos de la compañía
        await this.fetchCompanyProducts();
        
        // Obtener marcas de la compañía
        await this.fetchCompanyBrands();
      } catch (error) {
        console.error('Error al cargar datos de la compañía:', error);
        
        // Verificar si $toast está disponible antes de usarlo
        if (this.$toast) {
          this.$toast.error('Error al cargar los datos de la compañía');
        } else {
          console.error('Error al cargar los datos de la compañía');
        }
      } finally {
        this.loading = false;
      }
    },
    
    openCompanyModal() {
      this.currentCompany = { ...this.company };
      this.showCompanyModal = true;
    },
    
    closeCompanyModal() {
      this.showCompanyModal = false;
    },
    
    async saveCompany() {
      try {
        // Actualizar compañía existente
        await axios.put(`http://localhost:5000/api/companies/${this.currentUserCompanyId}`, this.currentCompany);
        
        if (this.$toast) {
          this.$toast.success('Compañía actualizada con éxito');
        }
        
        // Actualizar datos locales
        this.company = { ...this.currentCompany };
        
        // Cerrar el modal
        this.closeCompanyModal();
      } catch (error) {
        console.error('Error al guardar compañía:', error);
        
        const errorMessage = error.response?.data?.message || 'Error al guardar la compañía';
        if (this.$toast) {
          this.$toast.error(errorMessage);
        } else {
          console.error(errorMessage);
        }
      }
    },
    
    // Métodos para productos
    async fetchCompanyProducts() {
      this.loadingProducts = true;
      try {
        const response = await axios.get(`http://localhost:5000/api/products?compania_id=${this.currentUserCompanyId}`);
        this.companyProducts = response.data;
      } catch (error) {
        console.error('Error al cargar productos:', error);
        
        if (this.$toast) {
          this.$toast.error('Error al cargar los productos');
        }
      } finally {
        this.loadingProducts = false;
      }
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
          compania_id: this.currentUserCompanyId,
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
        this.currentProduct.compania_id = this.currentUserCompanyId;
        
        if (this.isEditModeProduct) {
          // Actualizar producto existente
          await axios.put(`http://localhost:5000/api/products/${this.currentProduct._id}`, this.currentProduct);
          
          if (this.$toast) {
            this.$toast.success('Producto actualizado con éxito');
          }
          
          // Actualizar en la lista local
          const index = this.companyProducts.findIndex(p => p._id === this.currentProduct._id);
          if (index !== -1) {
            this.companyProducts[index] = { ...this.currentProduct };
          }
        } else {
          // Crear nuevo producto
          const response = await axios.post('http://localhost:5000/api/products', this.currentProduct);
          
          if (this.$toast) {
            this.$toast.success('Producto creado con éxito');
          }
          
          // Añadir a la lista local
          this.companyProducts.push(response.data);
        }
        
        // Cerrar el modal
        this.closeProductModal();
      } catch (error) {
        console.error('Error al guardar producto:', error);
        
        const errorMessage = error.response?.data?.message || 'Error al guardar el producto';
        if (this.$toast) {
          this.$toast.error(errorMessage);
        } else {
          console.error(errorMessage);
        }
      }
    },
    
    confirmDeleteProduct(product) {
      this.deleteType = 'product';
      this.itemToDelete = product;
      this.showDeleteModal = true;
    },
    
    // Métodos para marcas
    async fetchCompanyBrands() {
      this.loadingBrands = true;
      try {
        const response = await axios.get(`http://localhost:5000/api/brands?compania=${this.currentUserCompanyId}`);
        this.companyBrands = response.data;
      } catch (error) {
        console.error('Error al cargar marcas:', error);
        
        if (this.$toast) {
          this.$toast.error('Error al cargar las marcas');
        }
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
          compania: this.currentUserCompanyId
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
        this.currentBrand.compania = this.currentUserCompanyId;
        
        if (this.isEditModeBrand) {
          // Actualizar marca existente
          await axios.put(`http://localhost:5000/api/brands/${this.currentBrand._id}`, this.currentBrand);
          
          if (this.$toast) {
            this.$toast.success('Marca actualizada con éxito');
          }
          
          // Actualizar en la lista local
          const index = this.companyBrands.findIndex(b => b._id === this.currentBrand._id);
          if (index !== -1) {
            this.companyBrands[index] = { ...this.currentBrand };
          }
        } else {
          // Crear nueva marca
          const response = await axios.post('http://localhost:5000/api/brands', this.currentBrand);
          
          if (this.$toast) {
            this.$toast.success('Marca creada con éxito');
          }
          
          // Añadir a la lista local
          this.companyBrands.push(response.data);
        }
        
        // Cerrar el modal
        this.closeBrandModal();
      } catch (error) {
        console.error('Error al guardar marca:', error);
        
        const errorMessage = error.response?.data?.message || 'Error al guardar la marca';
        if (this.$toast) {
          this.$toast.error(errorMessage);
        } else {
          console.error(errorMessage);
        }
      }
    },
    
    confirmDeleteBrand(brand) {
      this.deleteType = 'brand';
      this.itemToDelete = brand;
      this.showDeleteModal = true;
    },
    
    async deleteItem() {
      try {
        if (this.deleteType === 'product') {
          // Eliminar producto
          console.log(`Intentando eliminar producto con ID: ${this.itemToDelete._id}`);
          const response = await axios.delete(`http://localhost:5000/api/products/${this.itemToDelete._id}`);
          console.log('Respuesta del servidor:', response.data);

          if (this.$toast) {
            this.$toast.success('Producto eliminado con éxito');
          }

          // Eliminar de la lista local de productos
          this.companyProducts = this.companyProducts.filter(
            (p) => p._id !== this.itemToDelete._id
          );
        } else if (this.deleteType === 'brand') {
          // Verificar si la marca tiene productos asociados
          const brandProducts = this.companyProducts.filter(
            (p) => p.marca_id === this.itemToDelete._id
          );

          if (brandProducts.length > 0) {
            throw {
              response: {
                data: {
                  message: `No se puede eliminar la marca porque tiene ${brandProducts.length} productos asociados. Actualiza o elimina estos productos primero.`
                }
              }
            };
          }

          // Eliminar marca
          const response = await axios.delete(`http://localhost:5000/api/brands/${this.itemToDelete._id}`);
          console.log('Respuesta del servidor:', response.data);

          if (this.$toast) {
            this.$toast.success('Marca eliminada con éxito');
          }

          // Eliminar de la lista local de marcas
          this.companyBrands = this.companyBrands.filter(
            (b) => b._id !== this.itemToDelete._id
          );
        }

        // Cerrar el modal de confirmación
        this.showDeleteModal = false;
      } catch (error) {
        console.error('Error al eliminar:', error);

        // Obtener mensaje de error específico del servidor si está disponible
        let errorMessage = '';
        let itemType = '';

        if (this.deleteType === 'product') {
          itemType = 'el producto';
        } else if (this.deleteType === 'brand') {
          itemType = 'la marca';
        }

        // Mostrar el mensaje detallado del error si está disponible
        if (error.response && error.response.data) {
          console.log('Detalles del error del servidor:', error.response.data);
          errorMessage = error.response.data.message || error.response.data.error || `Error al eliminar ${itemType}`;
        } else {
          errorMessage = `Error al eliminar ${itemType}: ${error.message || 'Error desconocido'}`;
        }

        if (this.$toast) {
          this.$toast.error(errorMessage);
        } else {
          console.error(errorMessage);
        }

        // Cerrar el modal después de mostrar el error
        this.showDeleteModal = false;
      }
    }
  }
};
</script>
<template>
  <div>
    <AppNavbar />
    
    <div class="commerce-management" v-if="hasCompanyAccess && !loading">
      <!-- Encabezado de página -->
      <div class="page-header">
        <div class="company-info">
          <div class="company-logo" v-if="company && company.imagenPerfil">
            <img :src="company.imagenPerfil" :alt="company.nombre" />
          </div>
          <div class="company-details">
            <h1>{{ company ? company.nombre : 'Compañía' }}</h1>
            <p class="company-email">{{ company ? company.email : '' }}</p>
            <span class="company-plan">Plan {{ company ? company.plan : 'No disponible' }}</span>
          </div>
        </div>
        <button class="btn-primary" @click="openCompanyModal()" v-if="company">
          <i class="fas fa-edit"></i> Editar Información
        </button>
      </div>
      
      <!-- Sección de estadísticas -->
      <div class="stats-section">
        <div class="stat-card">
          <div class="stat-value">{{ companyProducts.length }}</div>
          <div class="stat-label">Productos</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ companyBrands.length }}</div>
          <div class="stat-label">Marcas</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ companyProducts.reduce((sum, product) => sum + (product.stock || 0), 0) }}</div>
          <div class="stat-label">Stock Total</div>
        </div>
      </div>
      
      <!-- Panel de Productos -->
      <div class="section-container">
        <div class="section-header">
          <h2>Gestión de Productos</h2>
          <button class="btn-primary" @click="openProductModal()">
            <i class="fas fa-plus"></i> Nuevo Producto
          </button>
        </div>
        
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
                  <button class="btn-action edit" @click="openProductModal(product)">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn-action delete" @click="confirmDeleteProduct(product)">
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
            <p>No hay productos registrados.</p>
            <button class="btn-secondary" @click="openProductModal()">Agregar primer producto</button>
          </div>
        </div>
      </div>
      
      <!-- Panel de Marcas -->
      <div class="section-container">
        <div class="section-header">
          <h2>Gestión de Marcas</h2>
          <button class="btn-primary" @click="openBrandModal()">
            <i class="fas fa-plus"></i> Nueva Marca
          </button>
        </div>
        
        <div class="table-container">
          <table class="data-table" v-if="!loadingBrands && companyBrands.length">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Productos</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="brand in companyBrands" :key="brand._id">
                <td>{{ brand.nombre }}</td>
                <td>{{ companyProducts.filter(p => p.marca_id === brand._id).length }}</td>
                <td class="actions-column">
                  <button class="btn-action edit" @click="openBrandModal(brand)">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn-action delete" @click="confirmDeleteBrand(brand)">
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
            <p>No hay marcas registradas.</p>
            <button class="btn-secondary" @click="openBrandModal()">Agregar primera marca</button>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else-if="loading" class="loading-container">
      <i class="fas fa-spinner fa-spin"></i> Cargando información de la compañía...
    </div>
    
    <div v-else class="access-denied">
      <h2>Acceso Denegado</h2>
      <p>Solo los gerentes tienen acceso a esta página.</p>
    </div>
    
    <!-- Modal de Compañía -->
    <div class="modal" v-if="showCompanyModal" @click.self="closeCompanyModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Editar Información de Compañía</h2>
          <button class="close-button" @click="closeCompanyModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="company-name">Nombre de la compañía</label>
            <input 
              type="text" 
              id="company-name" 
              v-model="currentCompany.nombre" 
              placeholder="Nombre de la compañía"
            >
          </div>
          
          <div class="form-group">
            <label for="company-email">Email de contacto</label>
            <input 
              type="email" 
              id="company-email" 
              v-model="currentCompany.email" 
              placeholder="email@ejemplo.com"
            >
          </div>
          
          <div class="form-group">
            <label for="company-banner">URL de imagen de banner</label>
            <input 
              type="text" 
              id="company-banner" 
              v-model="currentCompany.imagenBanner" 
              placeholder="https://ejemplo.com/imagen.jpg"
            >
          </div>
          
          <div class="form-group">
            <label for="company-profile">URL de imagen de perfil</label>
            <input 
              type="text" 
              id="company-profile" 
              v-model="currentCompany.imagenPerfil" 
              placeholder="https://ejemplo.com/imagen.jpg"
            >
          </div>
          
          <div class="form-group">
            <p class="note">El plan de la compañía ({{ currentCompany.plan }}) solo puede ser modificado por un administrador.</p>
          </div>
          
          <div class="modal-footer">
            <button class="btn-secondary" @click="closeCompanyModal">Cancelar</button>
            <button class="btn-primary" @click="saveCompany">Guardar Cambios</button>
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
            deleteType === 'product' ? (itemToDelete ? itemToDelete.nombre : '') :
            deleteType === 'brand' ? (itemToDelete ? itemToDelete.nombre : '') : ''
          }}
        </strong>?
      </p>
      <p class="warning-text" v-if="deleteType === 'brand'">
        Esta acción podría afectar a los productos asociados a esta marca.
      </p>
      
      <div class="modal-footer">
        <button class="btn-secondary" @click="showDeleteModal = false">Cancelar</button>
        <button class="btn-danger" @click="deleteItem">Eliminar</button>
      </div>
    </div>
  </div>
</div>
    
    <AppFooter />
  </div>
</template>

<style>


:root {
  --color-primary: #8B5A2B;       /* Café principal */
  --color-primary-light: #A67C52; /* Café más claro */
  --color-primary-dark: #6A4419;  /* Café oscuro */
  --color-accent: #D2B48C;        /* Beige tostado */
  --color-accent-light: #F5EBD8;  /* Beige claro */
  --color-danger: #AF4425;        /* Rojo terroso */
  --color-white: #FFFFFF;
  --color-gray-light: #F5F5F5;
  --color-gray: #E0E0E0;
  --color-gray-dark: #707070;
  --color-text: #3C2A1E;          /* Texto principal */
  --font-family: 'Poppins', 'Segoe UI', sans-serif;
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.1);
  --border-radius: 6px;
  --transition: all 0.3s ease;
}

/* Contenedor principal */
.commerce-management {
  max-width: 1280px;
  margin: 2rem auto;
  padding: 0 1.5rem;
}

/* Encabezado de página con logo y detalles de la compañía */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid var(--color-accent);
}

.company-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.company-logo {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  background-color: var(--color-accent-light);
  border: 2px solid var(--color-accent);
  box-shadow: var(--shadow-sm);
}

.company-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.company-details h1 {
  color: var(--color-primary-dark);
  font-weight: 600;
  font-size: 1.8rem;
  margin-bottom: 0.25rem;
}

.company-email {
  color: var(--color-gray-dark);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.company-plan {
  display: inline-block;
  padding: 0.3rem 0.8rem;
  background-color: var(--color-accent);
  color: var(--color-primary-dark);
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

/* Sección de estadísticas */
.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.stat-card {
  background-color: var(--color-white);
  border-radius: var(--border-radius);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
  text-align: center;
  transition: var(--transition);
  border-bottom: 3px solid var(--color-primary);
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-md);
}

.stat-value {
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}

.stat-label {
  color: var(--color-gray-dark);
  font-size: 1rem;
  font-weight: 500;
}

/* Contenedores de secciones */
.section-container {
  background-color: var(--color-white);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-md);
  margin-bottom: 2rem;
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background-color: var(--color-accent-light);
  border-bottom: 1px solid var(--color-accent);
}

.section-header h2 {
  color: var(--color-primary-dark);
  font-size: 1.3rem;
  font-weight: 600;
}

/* Botones */
.btn-primary, .btn-secondary, .btn-danger {
  padding: 0.6rem 1.2rem;
  border-radius: var(--border-radius);
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: var(--transition);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: none;
}

.btn-primary {
  background-color: var(--color-primary);
  color: var(--color-white);
}

.btn-primary:hover {
  background-color: var(--color-primary-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.btn-secondary {
  background-color: var(--color-gray);
  color: var(--color-text);
}

.btn-secondary:hover {
  background-color: var(--color-gray-dark);
  color: var(--color-white);
}

.btn-danger {
  background-color: var(--color-danger);
  color: var(--color-white);
}

.btn-danger:hover {
  background-color: #8B351E;
}

/* Botones de acción en tabla */
.btn-action {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  border: none;
  cursor: pointer;
  transition: var(--transition);
  color: var(--color-gray-dark);
}

.btn-action.view {
  color: var(--color-primary);
}

.btn-action.edit {
  color: var(--color-primary-light);
}

.btn-action.delete {
  color: var(--color-danger);
}

.btn-action:hover {
  background-color: var(--color-accent-light);
  transform: translateY(-2px);
}

/* Tabla de datos */
.table-container {
  width: 100%;
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.data-table th {
  text-align: left;
  padding: 1rem;
  font-weight: 600;
  background-color: var(--color-accent);
  color: var(--color-text);
  position: sticky;
  top: 0;
}

.data-table td {
  padding: 0.8rem 1rem;
  border-bottom: 1px solid var(--color-gray);
  vertical-align: middle;
}

.data-table tr:last-child td {
  border-bottom: none;
}

.data-table tr:hover {
  background-color: var(--color-accent-light);
}

.actions-column {
  width: 120px;
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.loading-message, .empty-message {
  text-align: center;
  padding: 2.5rem;
  color: var(--color-gray-dark);
  font-style: italic;
}

.empty-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.loading-message i, .empty-message i {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--color-primary-light);
}

/* Imagen del producto */
.product-img-cell {
  width: 60px;
}

.product-thumbnail {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid var(--color-gray);
}

/* Modal */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background-color: var(--color-white);
  border-radius: var(--border-radius);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
  animation: modalFadeIn 0.3s;
}

.modal-sm {
  max-width: 400px;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem 1.5rem;
  border-bottom: 1px solid var(--color-gray);
  background-color: var(--color-accent-light);
  border-radius: var(--border-radius) var(--border-radius) 0 0;
}

.modal-header h2 {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--color-primary-dark);
}

.close-button {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--color-gray-dark);
  transition: var(--transition);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.close-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--color-danger);
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

/* Formularios */
.form-group {
  margin-bottom: 1.2rem;
}

.form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.form-group.half {
  flex: 1;
  min-width: 150px;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.9rem;
  color: var(--color-primary-dark);
}

input, textarea, select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-gray);
  border-radius: var(--border-radius);
  font-family: var(--font-family);
  font-size: 0.9rem;
  color: var(--color-text);
  transition: var(--transition);
  background-color: var(--color-white);
}

input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: var(--color-primary-light);
  box-shadow: 0 0 0 3px rgba(166, 124, 82, 0.2);
}

input[type="number"] {
  -moz-appearance: textfield;
}

input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Notas y advertencias */
.note {
  font-size: 0.85rem;
  color: var(--color-gray-dark);
  font-style: italic;
}

.warning-text {
  color: var(--color-danger);
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

/* Pantalla de carga y acceso denegado */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  font-size: 1.1rem;
  color: var(--color-primary-dark);
}

.loading-container i {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: var(--color-primary);
}

.access-denied {
  text-align: center;
  padding: 3rem 1rem;
  background-color: var(--color-white);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-md);
  margin: 2rem auto;
  max-width: 600px;
}

.access-denied h2 {
  color: var(--color-danger);
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

/* Responsividad */
@media (max-width: 992px) {
  .stats-section {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .commerce-management {
    margin: 1.5rem auto;
    padding: 0 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .company-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .stats-section {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .section-header button {
    width: 100%;
  }
  
  .data-table {
    font-size: 0.8rem;
  }
  
  .data-table th, .data-table td {
    padding: 0.75rem 0.5rem;
  }
  
  .actions-column {
    width: 90px;
  }
}

@media (max-width: 576px) {
  .stats-section {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .company-details h1 {
    font-size: 1.5rem;
  }
  
  .modal-content {
    max-height: 95vh;
  }
}
</style>