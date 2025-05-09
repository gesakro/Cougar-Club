<script>
import axios from 'axios';
import AuthService from '../../services/authService.js';
import AppNavbar from '@/components/layout/AppNavbar.vue';
import AppFooter from '@/components/layout/AppFooter.vue';

// API base URL - mejor práctica para mantenimiento
const API_URL = 'http://localhost:5000/api';

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
      // Archivos de imágenes para compañía
      companyImageFiles: {
        imagenBanner: null,
        imagenPerfil: null
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
      // Archivo de imagen para producto
      productImageFile: null,
      
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
    
    // Método centralizado para manejo de errores
    handleError(error, defaultMessage) {
      console.error(defaultMessage, error);
      const errorMessage = error.response?.data?.message || defaultMessage;
      if (this.$toast) {
        this.$toast.error(errorMessage);
      } else {
        console.error(errorMessage);
      }
    },
    
    // Métodos para gestión de imágenes
    handleImageChange(event, target, property) {
      const file = event.target.files[0];
      if (!file) return;
      
      // Crear URL temporal para previsualización
      const tempUrl = URL.createObjectURL(file);
      
      if (target === 'company') {
        this.companyImageFiles[property] = file;
        this.currentCompany[property] = tempUrl;
      } else if (target === 'product') {
        this.productImageFile = file;
        this.currentProduct.imagen = tempUrl;
      }
    },
    
    // Método para subir imágenes con manejo de errores mejorado
    async uploadImages(type) {
      try {
        const token = localStorage.getItem('token');
        const headers = {
          'Content-Type': 'multipart/form-data',
          ...(token && { 'Authorization': `Bearer ${token}` })
        };
        
        if (type === 'company') {
          // Si no hay archivos nuevos, devolver URLs existentes
          if (!this.companyImageFiles.imagenBanner && !this.companyImageFiles.imagenPerfil) {
            return { 
              imagenBannerUrl: this.currentCompany.imagenBanner, 
              imagenPerfilUrl: this.currentCompany.imagenPerfil 
            };
          }
          
          const formData = new FormData();
          
          if (this.companyImageFiles.imagenBanner) {
            formData.append('imagenBanner', this.companyImageFiles.imagenBanner);
          }
          
          if (this.companyImageFiles.imagenPerfil) {
            formData.append('imagenPerfil', this.companyImageFiles.imagenPerfil);
          }
          
          const response = await axios.post(`${API_URL}/companies/upload-images`, formData, { headers });
          
          return {
            imagenBannerUrl: response.data.imagenBannerUrl || this.currentCompany.imagenBanner,
            imagenPerfilUrl: response.data.imagenPerfilUrl || this.currentCompany.imagenPerfil
          };
        } else if (type === 'product') {
          if (!this.productImageFile) {
            return { imagenUrl: this.currentProduct.imagen };
          }
          
          const formData = new FormData();
          formData.append('imagen', this.productImageFile);
          
          const response = await axios.post(`${API_URL}/products/upload-image`, formData, { headers });
          
          return { 
            imagenUrl: response.data.imagenUrl || this.currentProduct.imagen 
          };
        }
      } catch (error) {
        this.handleError(error, `Error al subir imágenes de ${type === 'company' ? 'la compañía' : 'producto'}`);
        throw error;
      }
    },
    
    // Métodos para la compañía
    async fetchCompanyData() {
      this.loading = true;
      try {
        // Obtener los datos de la compañía del gerente
        const response = await axios.get(`${API_URL}/companies/${this.currentUserCompanyId}`);
        this.company = response.data;
        
        // Obtener productos de la compañía
        await this.fetchCompanyProducts();
        
        // Obtener marcas de la compañía
        await this.fetchCompanyBrands();
      } catch (error) {
        this.handleError(error, 'Error al cargar datos de la compañía');
      } finally {
        this.loading = false;
      }
    },
    
    openCompanyModal() {
      this.currentCompany = { ...this.company };
      
      // Reiniciar los archivos de imagen
      this.companyImageFiles = {
        imagenBanner: null,
        imagenPerfil: null
      };
      
      this.showCompanyModal = true;
    },
    
    closeCompanyModal() {
      // Liberar URLs temporales
      if (this.companyImageFiles.imagenBanner) {
        URL.revokeObjectURL(this.currentCompany.imagenBanner);
      }
      if (this.companyImageFiles.imagenPerfil) {
        URL.revokeObjectURL(this.currentCompany.imagenPerfil);
      }
      this.showCompanyModal = false;
    },
    
    async saveCompany() {
      try {
        // Subir imágenes si se han seleccionado nuevas
        if (this.companyImageFiles.imagenBanner || this.companyImageFiles.imagenPerfil) {
          try {
            const imageUrls = await this.uploadImages('company');
            
            // Actualizar URLs
            if (imageUrls.imagenBannerUrl) {
              this.currentCompany.imagenBanner = imageUrls.imagenBannerUrl;
            }
            if (imageUrls.imagenPerfilUrl) {
              this.currentCompany.imagenPerfil = imageUrls.imagenPerfilUrl;
            }
          } catch {
            // Error ya manejado en uploadImages
            return;
          }
        }
        
        // Actualizar compañía existente
        await axios.put(`${API_URL}/companies/${this.currentUserCompanyId}`, this.currentCompany);
        
        if (this.$toast) {
          this.$toast.success('Compañía actualizada con éxito');
        }
        
        // Actualizar datos locales
        this.company = { ...this.currentCompany };
        
        // Cerrar el modal
        this.closeCompanyModal();
      } catch (error) {
        this.handleError(error, 'Error al guardar la compañía');
      }
    },
    
    // Métodos para productos
    async fetchCompanyProducts() {
      this.loadingProducts = true;
      try {
        const response = await axios.get(`${API_URL}/products?compania_id=${this.currentUserCompanyId}`);
        this.companyProducts = response.data;
      } catch (error) {
        this.handleError(error, 'Error al cargar productos');
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
      
      // Reiniciar archivo de imagen
      this.productImageFile = null;
      
      this.showProductModal = true;
    },
    
    closeProductModal() {
      // Liberar URL temporal si existe
      if (this.productImageFile) {
        URL.revokeObjectURL(this.currentProduct.imagen);
      }
      this.showProductModal = false;
    },
    
    async saveProduct() {
      try {
        // Asegurar que el producto esté asociado a la compañía correcta
        this.currentProduct.compania_id = this.currentUserCompanyId;
        
        // Subir imagen si se ha seleccionado una nueva
        if (this.productImageFile) {
          try {
            const imageUrl = await this.uploadImages('product');
            if (imageUrl.imagenUrl) {
              this.currentProduct.imagen = imageUrl.imagenUrl;
            }
          } catch {
            // Error ya manejado en uploadImages
            return;
          }
        }
        
        if (this.isEditModeProduct) {
          // Actualizar producto existente
          await axios.put(`${API_URL}/products/${this.currentProduct._id}`, this.currentProduct);
          
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
          const response = await axios.post(`${API_URL}/products`, this.currentProduct);
          
          if (this.$toast) {
            this.$toast.success('Producto creado con éxito');
          }
          
          // Añadir a la lista local
          this.companyProducts.push(response.data);
        }
        
        // Cerrar el modal
        this.closeProductModal();
      } catch (error) {
        this.handleError(error, 'Error al guardar el producto');
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
        const response = await axios.get(`${API_URL}/brands?compania=${this.currentUserCompanyId}`);
        this.companyBrands = response.data;
      } catch (error) {
        this.handleError(error, 'Error al cargar marcas');
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
          await axios.put(`${API_URL}/brands/${this.currentBrand._id}`, this.currentBrand);
          
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
          const response = await axios.post(`${API_URL}/brands`, this.currentBrand);
          
          if (this.$toast) {
            this.$toast.success('Marca creada con éxito');
          }
          
          // Añadir a la lista local
          this.companyBrands.push(response.data);
        }
        
        // Cerrar el modal
        this.closeBrandModal();
      } catch (error) {
        this.handleError(error, 'Error al guardar la marca');
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
          const response = await axios.delete(`${API_URL}/products/${this.itemToDelete._id}`);
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
          const response = await axios.delete(`${API_URL}/brands/${this.itemToDelete._id}`);
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
        this.handleError(error, `Error al eliminar ${this.deleteType === 'product' ? 'el producto' : 'la marca'}`);
        
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
            <label for="company-banner">Imagen de banner</label>
            <div class="image-upload-container">
              <div class="current-image" v-if="currentCompany.imagenBanner">
                <img :src="currentCompany.imagenBanner" alt="Banner actual" class="image-preview">
              </div>
              <input 
                type="file"
                id="company-banner"
                accept="image/*"
                @change="handleImageChange($event, 'company', 'imagenBanner')"
                class="file-input"
              >
              <label for="company-banner" class="file-input-label">
                <i class="fas fa-upload"></i> 
                {{ currentCompany.imagenBanner ? 'Cambiar imagen' : 'Subir imagen' }}
              </label>
            </div>
          </div>
          
          <div class="form-group">
            <label for="company-profile">Imagen de perfil</label>
            <div class="image-upload-container">
              <div class="current-image" v-if="currentCompany.imagenPerfil">
                <img :src="currentCompany.imagenPerfil" alt="Perfil actual" class="image-preview profile-image-preview">
              </div>
              <input 
                type="file"
                id="company-profile"
                accept="image/*"
                @change="handleImageChange($event, 'company', 'imagenPerfil')"
                class="file-input"
              >
              <label for="company-profile" class="file-input-label">
                <i class="fas fa-upload"></i> 
                {{ currentCompany.imagenPerfil ? 'Cambiar imagen' : 'Subir imagen' }}
              </label>
            </div>
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
              iid="product-description" 
              v-model="currentProduct.descripcion" 
              placeholder="Descripción detallada del producto"
              rows="3"
            ></textarea>
          </div>
          
          <div class="form-group">
            <label for="product-image">Imagen del producto</label>
            <div class="image-upload-container">
              <div class="current-image" v-if="currentProduct.imagen">
                <img :src="currentProduct.imagen" alt="Imagen actual" class="image-preview">
              </div>
              <input 
                type="file"
                id="product-image"
                accept="image/*"
                @change="handleImageChange($event, 'product', 'imagen')"
                class="file-input"
              >
              <label for="product-image" class="file-input-label">
                <i class="fas fa-upload"></i> 
                {{ currentProduct.imagen ? 'Cambiar imagen' : 'Subir imagen' }}
              </label>
            </div>
          </div>
          
          <div class="modal-footer">
            <button class="btn-secondary" @click="closeProductModal">Cancelar</button>
            <button class="btn-primary" @click="saveProduct">
              {{ isEditModeProduct ? 'Actualizar Producto' : 'Crear Producto' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal de Marca -->
    <div class="modal" v-if="showBrandModal" @click.self="closeBrandModal">
      <div class="modal-content">
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
              {{ isEditModeBrand ? 'Actualizar Marca' : 'Crear Marca' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal de Confirmación para Eliminar -->
    <div class="modal" v-if="showDeleteModal" @click.self="showDeleteModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Confirmar Eliminación</h2>
          <button class="close-button" @click="showDeleteModal = false">×</button>
        </div>
        <div class="modal-body">
          <p>
            ¿Estás seguro de que deseas eliminar 
            {{ deleteType === 'product' ? 'el producto' : 'la marca' }}
            <strong>{{ itemToDelete ? itemToDelete.nombre : '' }}</strong>?
          </p>
          <p v-if="deleteType === 'brand'">
            <strong>Nota:</strong> Si la marca tiene productos asociados, no podrá ser eliminada. 
            Deberá actualizar o eliminar los productos primero.
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

<style scoped>
/* Estilos generales */
.commerce-management {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
}

/* Encabezado de página */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e1e1e1;
}

.company-info {
  display: flex;
  align-items: center;
}

.company-logo {
  width: 80px;
  height: 80px;
  margin-right: 1rem;
  border-radius: 50%;
  overflow: hidden;
  border: 1px solid #e1e1e1;
}

.company-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.company-details h1 {
  margin: 0;
  font-size: 1.8rem;
  color: #333;
}

.company-email {
  margin: 0.2rem 0;
  color: #666;
}

.company-plan {
  display: inline-block;
  background-color: #e9f5ff;
  color: #0077cc;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.85rem;
}

/* Estadísticas */
.stats-section {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.stat-card {
  flex: 1;
  background-color: #fff;
  border-radius: 8px;
  padding: 1.5rem;
  margin: 0 0.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.stat-card:first-child {
  margin-left: 0;
}

.stat-card:last-child {
  margin-right: 0;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #0077cc;
  margin-bottom: 0.2rem;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
}

/* Secciones */
.section-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background-color: #f9f9f9;
  border-bottom: 1px solid #e1e1e1;
}

.section-header h2 {
  margin: 0;
  font-size: 1.2rem;
  color: #333;
}

/* Tablas */
.table-container {
  padding: 1rem;
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th, 
.data-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #e1e1e1;
  text-align: left;
}

.data-table th {
  background-color: #f5f5f5;
  font-weight: 600;
  color: #333;
}

.product-img-cell {
  width: 70px;
}

.product-thumbnail {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
}

.actions-column {
  width: 100px;
  text-align: right;
}

.empty-message,
.loading-message {
  padding: 2rem;
  text-align: center;
  color: #666;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  font-size: 1.2rem;
  color: #666;
}

.access-denied {
  text-align: center;
  padding: 3rem 1rem;
}

/* Botones */
.btn-primary,
.btn-secondary,
.btn-danger {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background-color: #0077cc;
  color: white;
}

.btn-primary:hover {
  background-color: #0066b3;
}

.btn-secondary {
  background-color: #e1e1e1;
  color: #333;
}

.btn-secondary:hover {
  background-color: #d1d1d1;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #c82333;
}

.btn-action {
  background: none;
  border: none;
  cursor: pointer;
  margin-left: 0.5rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.btn-action.edit {
  color: #0077cc;
}

.btn-action.delete {
  color: #dc3545;
}

.btn-action:hover {
  background-color: #f1f1f1;
}

/* Modales */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e1e1e1;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.2rem;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 1rem 0 0;
  gap: 0.5rem;
}

/* Formularios */
.form-group {
  margin-bottom: 1rem;
}

.form-row {
  display: flex;
  margin: 0 -0.5rem 1rem;
}

.form-group.half {
  flex: 1;
  padding: 0 0.5rem;
}

label {
  display: block;
  margin-bottom: 0.3rem;
  font-weight: 500;
  color: #333;
}

input[type="text"],
input[type="email"],
input[type="number"],
select,
textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}

textarea {
  resize: vertical;
  min-height: 100px;
}

.note {
  font-size: 0.85rem;
  color: #666;
  font-style: italic;
}

/* Subida de imágenes */
.image-upload-container {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.current-image {
  margin-right: 1rem;
  margin-bottom: 1rem;
}

.image-preview {
  max-width: 150px;
  max-height: 150px;
  border-radius: 4px;
  border: 1px solid #e1e1e1;
}

.profile-image-preview {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
}

.file-input {
  display: none;
}

.file-input-label {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: #f1f1f1;
  border-radius: 4px;
  cursor: pointer;
  font-weight: normal;
  color: #333;
}

.file-input-label i {
  margin-right: 0.5rem;
}

.file-input-label:hover {
  background-color: #e1e1e1;
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .page-header button {
    margin-top: 1rem;
    align-self: flex-start;
  }
  
  .stats-section {
    flex-direction: column;
  }
  
  .stat-card {
    margin: 0 0 1rem 0;
  }
  
  .form-row {
    flex-direction: column;
    margin: 0 0 1rem;
  }
  
  .form-group.half {
    padding: 0;
    margin-bottom: 1rem;
  }
}
</style>