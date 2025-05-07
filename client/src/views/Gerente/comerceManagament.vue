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
    
    async executeDelete() {
      try {
        if (this.deleteType === 'product') {
          // Eliminar producto
          await axios.delete(`http://localhost:5000/api/products/${this.itemToDelete._id}`);
          
          if (this.$toast) {
            this.$toast.success('Producto eliminado con éxito');
          }
          
          // Eliminar de la lista local de productos
          this.companyProducts = this.companyProducts.filter(p => p._id !== this.itemToDelete._id);
        } else if (this.deleteType === 'brand') {
          // Eliminar marca
          await axios.delete(`http://localhost:5000/api/brands/${this.itemToDelete._id}`);
          
          if (this.$toast) {
            this.$toast.success('Marca eliminada con éxito');
          }
          
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
        
        const errorMessage = error.response?.data?.message || `Error al eliminar ${itemType}`;
        if (this.$toast) {
          this.$toast.error(errorMessage);
        } else {
          console.error(errorMessage);
        }
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
            <button class="btn-danger" @click="executeDelete">Eliminar</button>
          </div>
        </div>
      </div>
    </div>
    
    <AppFooter />
  </div>
</template>