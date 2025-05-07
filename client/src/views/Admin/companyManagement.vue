<script>
import axios from 'axios';
import AuthService from '../../services/authService.js';
import AppNavbar from '@/components/layout/AppNavbar.vue';
import AppFooter from '@/components/layout/AppFooter.vue';

export default {
  name: 'CompanyManagement',
  components: {
    AppNavbar,
    AppFooter
  },
  data() {
    return {
      // Datos principales
      companies: [],
      loading: true,
      searchQuery: '',
      
      // Modal de compañía
      showCompanyModal: false,
      isEditMode: false,
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
      selectedCompanyId: null,
      selectedCompanyName: '',
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
      deleteType: '', // 'company', 'product' o 'brand'
      itemToDelete: null
    };
  },
  
  computed: {
    filteredCompanies() {
      if (!this.searchQuery) {
        return this.companies;
      }
      
      const query = this.searchQuery.toLowerCase();
      return this.companies.filter(company => 
        company.nombre.toLowerCase().includes(query) ||
        company.email.toLowerCase().includes(query)
      );
    },
    
    userRole() {
      return AuthService.getUserRole();
    },
    
    currentUserCompanyId() {
      return localStorage.getItem('companyId') || null;
    },
    
    canManageProducts() {
      if (this.hasPermission('Administrador')) return true;
      if (this.hasPermission('Gerente') && this.selectedCompanyId === this.currentUserCompanyId) return true;
      return false;
    },
    
    planOptions() {
      return ['Mensual', 'Anual'];
    }
  },
  
  created() {
    this.fetchCompanies();
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
    
    hasPermission(role) {
      if (Array.isArray(role)) {
        return role.includes(this.userRole);
      }
      return this.userRole === role;
    },
    
    canEditCompany(companyId) {
      if (this.hasPermission('Administrador')) return true;
      if (this.hasPermission('Gerente') && companyId === this.currentUserCompanyId) return true;
      return false;
    },
    
    // Métodos para compañías
    async fetchCompanies() {
      this.loading = true;
      try {
        const response = await axios.get('http://localhost:5000/api/companies');
        this.companies = response.data;
      } catch (error) {
        console.error('Error al cargar compañías:', error);
        this.$toast.error('Error al cargar las compañías');
      } finally {
        this.loading = false;
      }
    },
    
    openCompanyModal(company = null) {
      if (company) {
        // Modo edición
        this.isEditMode = true;
        this.currentCompany = { ...company };
      } else {
        // Modo creación
        this.isEditMode = false;
        this.currentCompany = {
          nombre: '',
          email: '',
          plan: 'Mensual',
          imagenBanner: '',
          imagenPerfil: '',
          productos: []
        };
      }
      this.showCompanyModal = true;
    },
    
    closeCompanyModal() {
      this.showCompanyModal = false;
    },
    
    async saveCompany() {
      try {
        if (this.isEditMode) {
          // Actualizar compañía existente
          await axios.put(`http://localhost:5000/api/companies/${this.currentCompany._id}`, this.currentCompany);
          this.$toast.success('Compañía actualizada con éxito');
          
          // Actualizar la lista de compañías
          const index = this.companies.findIndex(c => c._id === this.currentCompany._id);
          if (index !== -1) {
            this.companies[index] = { ...this.currentCompany };
          }
        } else {
          // Crear nueva compañía
          const response = await axios.post('http://localhost:5000/api/companies', this.currentCompany);
          this.$toast.success('Compañía creada con éxito');
          
          // Añadir la nueva compañía a la lista
          this.companies.push(response.data);
        }
        
        // Cerrar el modal
        this.closeCompanyModal();
      } catch (error) {
        console.error('Error al guardar compañía:', error);
        this.$toast.error(error.response?.data?.message || 'Error al guardar la compañía');
      }
    },
    
    confirmDelete(company) {
      this.deleteType = 'company';
      this.itemToDelete = company;
      this.showDeleteModal = true;
    },
    
    async executeDelete() {
      try {
        if (this.deleteType === 'company') {
          // Eliminar compañía
          await axios.delete(`http://localhost:5000/api/companies/${this.itemToDelete._id}`);
          this.$toast.success('Compañía eliminada con éxito');
          
          // Eliminar de la lista local
          this.companies = this.companies.filter(c => c._id !== this.itemToDelete._id);
        } else if (this.deleteType === 'product') {
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
        if (this.deleteType === 'company') itemType = 'la compañía';
        else if (this.deleteType === 'product') itemType = 'el producto';
        else if (this.deleteType === 'brand') itemType = 'la marca';
        
        this.$toast.error(error.response?.data?.message || `Error al eliminar ${itemType}`);
      }
    },
    
    // Métodos para productos
    async viewProducts(companyId) {
      this.selectedCompanyId = companyId;
      this.loadingProducts = true;
      
      // Encontrar el nombre de la compañía
      const company = this.companies.find(c => c._id === companyId);
      this.selectedCompanyName = company ? company.nombre : 'Compañía';
      
      try {
        // Cargar productos de la compañía seleccionada
        const response = await axios.get(`http://localhost:5000/api/products?compania_id=${companyId}`);
        this.companyProducts = response.data;
        
        // También cargar las marcas para esta compañía
        await this.fetchBrands(companyId);
        
        this.showProductsModal = true;
      } catch (error) {
        console.error('Error al cargar productos:', error);
        this.$toast.error('Error al cargar los productos');
      } finally {
        this.loadingProducts = false;
      }
    },
    
    closeProductsModal() {
      this.showProductsModal = false;
      this.selectedCompanyId = null;
      this.companyProducts = [];
      this.companyBrands = [];
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
          compania_id: this.selectedCompanyId,
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
        this.currentProduct.compania_id = this.selectedCompanyId;
        
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
    async fetchBrands(companyId) {
      this.loadingBrands = true;
      try {
        const response = await axios.get(`http://localhost:5000/api/brands?compania=${companyId}`);
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
          compania: this.selectedCompanyId
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
        this.currentBrand.compania = this.selectedCompanyId;
        
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
    }
  }
};
</script>

<template>
  <div>
    <AppNavbar />
    
    <div class="company-management">
      <!-- Encabezado de página -->
      <div class="page-header">
        <h1>Gestión de Compañías</h1>
        <button v-if="hasPermission('Administrador')" class="btn-primary" @click="openCompanyModal()">
          <i class="fas fa-plus"></i> Nueva Compañía
        </button>
      </div>
      
      <!-- Filtros -->
      <div class="filters-section">
        <div class="search-container">
          <button class="search-button">
            <i class="fas fa-search"></i>
          </button>
          <input 
            type="text" 
            class="search-input" 
            placeholder="Buscar compañía..." 
            v-model="searchQuery"
          >
        </div>
      </div>
      
      <!-- Tabla de compañías -->
      <div class="table-container">
        <table class="data-table" v-if="!loading && filteredCompanies.length">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Plan</th>
              <th>Fecha de registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="company in filteredCompanies" :key="company._id">
              <td>{{ company.nombre }}</td>
              <td>{{ company.email }}</td>
              <td>{{ company.plan }}</td>
              <td>{{ formatDate(company.createdAt) }}</td>
              <td class="actions-column">
                <button class="btn-action view" @click="viewProducts(company._id)">
                  <i class="fas fa-box"></i>
                </button>
                <button 
                  v-if="canEditCompany(company._id)" 
                  class="btn-action edit" 
                  @click="openCompanyModal(company)"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button 
                  v-if="hasPermission('Administrador')" 
                  class="btn-action delete" 
                  @click="confirmDelete(company)"
                >
                  <i class="fas fa-trash-alt"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div v-else-if="loading" class="loading-message">
          <i class="fas fa-spinner fa-spin"></i> Cargando compañías...
        </div>
        
        <div v-else class="empty-message">
          No se encontraron compañías que coincidan con la búsqueda.
        </div>
      </div>
    </div>
    
    <!-- Modal de Compañía -->
    <div class="modal" v-if="showCompanyModal" @click.self="closeCompanyModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ isEditMode ? 'Editar Compañía' : 'Nueva Compañía' }}</h2>
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
            <label for="company-plan">Plan</label>
            <select id="company-plan" v-model="currentCompany.plan">
              <option v-for="option in planOptions" :key="option" :value="option">
                {{ option }}
              </option>
            </select>
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
          
          <div class="modal-footer">
            <button class="btn-secondary" @click="closeCompanyModal">Cancelar</button>
            <button class="btn-primary" @click="saveCompany">
              {{ isEditMode ? 'Actualizar' : 'Crear' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal de Productos -->
    <div class="modal" v-if="showProductsModal" @click.self="closeProductsModal">
      <div class="modal-content modal-lg">
        <div class="modal-header">
          <h2>Productos de {{ selectedCompanyName }}</h2>
          <button class="close-button" @click="closeProductsModal">×</button>
        </div>
        <div class="modal-body">
          <div class="products-header" v-if="canManageProducts">
            <button class="btn-primary" @click="openProductModal()">
              <i class="fas fa-plus"></i> Nuevo Producto
            </button>
            <button class="btn-secondary" @click="openBrandModal()" style="margin-left: 10px;">
              <i class="fas fa-tag"></i> Nueva Marca
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
                    <button 
                      v-if="canManageProducts" 
                      class="btn-action edit" 
                      @click="openProductModal(product)"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button 
                      v-if="canManageProducts" 
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
              Esta compañía no tiene productos registrados.
            </div>
          </div>
          
          <h3 style="margin-top: 30px; margin-bottom: 15px;">Marcas</h3>
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
                      v-if="canManageProducts" 
                      class="btn-action edit" 
                      @click="openBrandModal(brand)"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button 
                      v-if="canManageProducts" 
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
              Esta compañía no tiene marcas registradas.
            </div>
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
                deleteType === 'company' ? itemToDelete.nombre : 
                deleteType === 'product' ? itemToDelete.nombre :
                deleteType === 'brand' ? itemToDelete.nombre : ''
              }}
            </strong>?
          </p>
          <p class="warning-text" v-if="deleteType === 'company'">
            Esta acción eliminará todos los productos y marcas asociados a esta compañía.
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
  
<style>

/* CompanyManagement.css - Estilos para la gestión de compañías */

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

/* Estilos globales */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-family);
  color: var(--color-text);
  background-color: var(--color-accent-light);
  line-height: 1.6;
  font-size: 16px;
}

/* Contenedor principal */
.company-management {
  max-width: 1280px;
  margin: 1.5rem auto;
  padding: 0 1rem;
}

/* Encabezado de página */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--color-accent);
}

.page-header h1 {
  color: var(--color-primary-dark);
  font-weight: 600;
  font-size: 1.8rem;
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

/* Sección de filtros */
.filters-section {
  margin-bottom: 1.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.search-container {
  position: relative;
  flex: 1;
  min-width: 200px;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border-radius: var(--border-radius);
  border: 1px solid var(--color-accent);
  background-color: var(--color-white);
  font-size: 0.9rem;
  transition: var(--transition);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary-light);
  box-shadow: 0 0 0 3px rgba(166, 124, 82, 0.2);
}

.search-button {
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--color-gray-dark);
  font-size: 1rem;
}

/* Tabla de datos */
.table-container {
  width: 100%;
  overflow-x: auto;
  background-color: var(--color-white);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
  margin-bottom: 1.5rem;
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
  padding: 2rem;
  color: var(--color-gray-dark);
  font-style: italic;
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

.modal-lg {
  max-width: 800px;
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

/* Cabecera de productos */
.products-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1.5rem;
}

/* Texto de advertencia */
.warning-text {
  color: var(--color-danger);
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

/* Estilos específicos para los modales de producto y marca */
h3 {
  color: var(--color-primary-dark);
  font-size: 1.2rem;
  font-weight: 600;
  margin-top: 2rem;
  margin-bottom: 1rem;
}

/* Responsividad */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .page-header h1 {
    font-size: 1.5rem;
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
  
  .btn-action {
    width: 28px;
    height: 28px;
  }
  
  .btn-primary, .btn-secondary, .btn-danger {
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
  }
  
  .products-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .products-header button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .company-management {
    padding: 0 0.5rem;
    margin: 1rem auto;
  }
  
  .modal-body {
    padding: 1rem;
  }
  
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  
  .form-group.half {
    width: 100%;
  }
  
  .search-container {
    max-width: 100%;
  }
}
</style>
