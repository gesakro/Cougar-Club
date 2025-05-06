<template>
    <div class="company-management">
      <div class="page-header">
        <h1>Gestión de Compañías</h1>
        <button 
          v-if="hasPermission('Administrador')"
          class="btn-primary" 
          @click="openCompanyModal()"
        >
          <i class="fas fa-plus"></i> Nueva Compañía
        </button>
      </div>
  
      <!-- Filtros y búsqueda -->
      <div class="filters-section">
        <div class="search-container">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Buscar compañía..."
            class="search-input"
          />
          <button class="search-button" aria-label="Search">
            <span class="search-icon">🔍</span>
          </button>
        </div>
      </div>
  
      <!-- Tabla de compañías -->
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Dirección</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Fecha de Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="6" class="loading-message">Cargando compañías...</td>
            </tr>
            <tr v-else-if="filteredCompanies.length === 0">
              <td colspan="6" class="empty-message">No se encontraron compañías</td>
            </tr>
            <tr v-for="company in filteredCompanies" :key="company._id">
              <td>{{ company.nombre }}</td>
              <td>{{ company.direccion }}</td>
              <td>{{ company.telefono }}</td>
              <td>{{ company.email }}</td>
              <td>{{ formatDate(company.createdAt) }}</td>
              <td class="actions-column">
                <!-- Ver productos -->
                <button 
                  class="btn-action view" 
                  title="Ver productos"
                  @click="viewProducts(company._id)"
                >
                  <i class="fas fa-box"></i>
                </button>
                
                <!-- Editar (Admin o Gerente de esta compañía) -->
                <button 
                  v-if="canEditCompany(company._id)"
                  class="btn-action edit" 
                  title="Editar"
                  @click="openCompanyModal(company)"
                >
                  <i class="fas fa-edit"></i>
                </button>
                
                <!-- Eliminar (solo Admin) -->
                <button 
                  v-if="hasPermission('Administrador')"
                  class="btn-action delete" 
                  title="Eliminar"
                  @click="confirmDelete(company)"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <!-- Modal para crear/editar compañía -->
      <div class="modal" v-if="showCompanyModal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>{{ isEditMode ? 'Editar Compañía' : 'Nueva Compañía' }}</h2>
            <button class="close-button" @click="closeCompanyModal">&times;</button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveCompany">
              <div class="form-group">
                <label for="nombre">Nombre*:</label>
                <input 
                  type="text" 
                  id="nombre" 
                  v-model="currentCompany.nombre" 
                  required
                  placeholder="Nombre de la compañía"
                />
              </div>
              
              <div class="form-group">
                <label for="direccion">Dirección:</label>
                <input 
                  type="text" 
                  id="direccion" 
                  v-model="currentCompany.direccion" 
                  placeholder="Dirección completa"
                />
              </div>
              
              <div class="form-row">
                <div class="form-group half">
                  <label for="telefono">Teléfono:</label>
                  <input 
                    type="tel" 
                    id="telefono" 
                    v-model="currentCompany.telefono" 
                    placeholder="Número de teléfono"
                  />
                </div>
                
                <div class="form-group half">
                  <label for="email">Email*:</label>
                  <input 
                    type="email" 
                    id="email" 
                    v-model="currentCompany.email" 
                    required
                    placeholder="Email de contacto"
                  />
                </div>
              </div>
              
              <div class="form-group">
                <label for="sitio_web">Sitio Web:</label>
                <input 
                  type="url" 
                  id="sitio_web" 
                  v-model="currentCompany.sitio_web" 
                  placeholder="https://www.ejemplo.com"
                />
              </div>
              
              <div class="form-group">
                <label for="descripcion">Descripción:</label>
                <textarea 
                  id="descripcion" 
                  v-model="currentCompany.descripcion" 
                  rows="3"
                  placeholder="Breve descripción de la compañía"
                ></textarea>
              </div>
              
              <div class="modal-footer">
                <button type="button" class="btn-secondary" @click="closeCompanyModal">Cancelar</button>
                <button type="submit" class="btn-primary">
                  {{ isEditMode ? 'Actualizar' : 'Crear' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
  
      <!-- Modal para productos de la compañía -->
      <div class="modal" v-if="showProductsModal">
        <div class="modal-content modal-lg">
          <div class="modal-header">
            <h2>Productos de {{ selectedCompanyName }}</h2>
            <button class="close-button" @click="closeProductsModal">&times;</button>
          </div>
          <div class="modal-body">
            <div class="products-header">
              <button 
                v-if="canManageProducts"
                class="btn-primary" 
                @click="openProductModal()"
              >
                <i class="fas fa-plus"></i> Nuevo Producto
              </button>
            </div>
            
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Imagen</th>
                    <th>Nombre</th>
                    <th>Categoría</th>
                    <th>Precio</th>
                    <th>Stock</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="loadingProducts">
                    <td colspan="6" class="loading-message">Cargando productos...</td>
                  </tr>
                  <tr v-else-if="companyProducts.length === 0">
                    <td colspan="6" class="empty-message">No se encontraron productos</td>
                  </tr>
                  <tr v-for="product in companyProducts" :key="product._id">
                    <td class="product-img-cell">
                      <img 
                        :src="product.imagen || '/images/placeholder-product.png'" 
                        :alt="product.nombre"
                        class="product-thumbnail"
                      />
                    </td>
                    <td>{{ product.nombre }}</td>
                    <td>{{ product.categoria }}</td>
                    <td>${{ formatPrice(product.precio) }}</td>
                    <td>{{ product.stock }}</td>
                    <td class="actions-column">
                      <!-- Editar producto (Admin o Gerente de su compañía) -->
                      <button 
                        v-if="canManageProducts"
                        class="btn-action edit" 
                        title="Editar"
                        @click="openProductModal(product)"
                      >
                        <i class="fas fa-edit"></i>
                      </button>
                      
                      <!-- Eliminar producto (Admin o Gerente de su compañía) -->
                      <button 
                        v-if="canManageProducts"
                        class="btn-action delete" 
                        title="Eliminar"
                        @click="confirmDeleteProduct(product)"
                      >
                        <i class="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Modal para crear/editar producto -->
      <div class="modal" v-if="showProductModal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>{{ isEditModeProduct ? 'Editar Producto' : 'Nuevo Producto' }}</h2>
            <button class="close-button" @click="closeProductModal">&times;</button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveProduct">
              <div class="form-group">
                <label for="product-nombre">Nombre*:</label>
                <input 
                  type="text" 
                  id="product-nombre" 
                  v-model="currentProduct.nombre" 
                  required
                  placeholder="Nombre del producto"
                />
              </div>
              
              <div class="form-row">
                <div class="form-group half">
                  <label for="product-precio">Precio*:</label>
                  <input 
                    type="number" 
                    id="product-precio" 
                    v-model="currentProduct.precio" 
                    step="0.01"
                    min="0"
                    required
                    placeholder="0.00"
                  />
                </div>
                
                <div class="form-group half">
                  <label for="product-stock">Stock*:</label>
                  <input 
                    type="number" 
                    id="product-stock" 
                    v-model="currentProduct.stock" 
                    min="0"
                    required
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div class="form-group">
                <label for="product-categoria">Categoría*:</label>
                <input 
                  type="text" 
                  id="product-categoria" 
                  v-model="currentProduct.categoria" 
                  required
                  placeholder="Categoría del producto"
                />
              </div>
              
              <div class="form-group">
                <label for="product-imagen">URL de Imagen:</label>
                <input 
                  type="url" 
                  id="product-imagen" 
                  v-model="currentProduct.imagen" 
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>
              
              <div class="form-group">
                <label for="product-descripcion">Descripción:</label>
                <textarea 
                  id="product-descripcion" 
                  v-model="currentProduct.descripcion" 
                  rows="3"
                  placeholder="Descripción detallada del producto"
                ></textarea>
              </div>
              
              <div class="modal-footer">
                <button type="button" class="btn-secondary" @click="closeProductModal">Cancelar</button>
                <button type="submit" class="btn-primary">
                  {{ isEditModeProduct ? 'Actualizar' : 'Crear' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
  
      <!-- Modal de confirmación para eliminación -->
      <div class="modal" v-if="showDeleteModal">
        <div class="modal-content modal-sm">
          <div class="modal-header">
            <h2>Confirmar Eliminación</h2>
            <button class="close-button" @click="showDeleteModal = false">&times;</button>
          </div>
          <div class="modal-body">
            <p>¿Estás seguro de que deseas eliminar {{ deleteType === 'company' ? 'la compañía' : 'el producto' }} <strong>{{ itemToDelete?.nombre }}</strong>?</p>
            <p class="warning-text">Esta acción no se puede deshacer.</p>
            
            <div class="modal-footer">
              <button class="btn-secondary" @click="showDeleteModal = false">Cancelar</button>
              <button class="btn-danger" @click="executeDelete">Eliminar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  import AuthService from '../../services/authService.js';
  
  export default {
    name: 'CompanyManagement',
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
          direccion: '',
          telefono: '',
          email: '',
          sitio_web: '',
          descripcion: ''
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
        
        // Modal de confirmación
        showDeleteModal: false,
        deleteType: '', // 'company' o 'product'
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
          company.email.toLowerCase().includes(query) ||
          (company.direccion && company.direccion.toLowerCase().includes(query))
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
          const response = await axios.get('/api/companies');
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
            direccion: '',
            telefono: '',
            email: '',
            sitio_web: '',
            descripcion: ''
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
            await axios.put(`/api/companies/${this.currentCompany._id}`, this.currentCompany);
            this.$toast.success('Compañía actualizada con éxito');
            
            // Actualizar la lista de compañías
            const index = this.companies.findIndex(c => c._id === this.currentCompany._id);
            if (index !== -1) {
              this.companies[index] = { ...this.currentCompany };
            }
          } else {
            // Crear nueva compañía
            const response = await axios.post('/api/companies', this.currentCompany);
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
            await axios.delete(`/api/companies/${this.itemToDelete._id}`);
            this.$toast.success('Compañía eliminada con éxito');
            
            // Eliminar de la lista local
            this.companies = this.companies.filter(c => c._id !== this.itemToDelete._id);
          } else if (this.deleteType === 'product') {
            // Eliminar producto
            await axios.delete(`/api/products/${this.itemToDelete._id}`);
            this.$toast.success('Producto eliminado con éxito');
            
            // Eliminar de la lista local de productos
            this.companyProducts = this.companyProducts.filter(p => p._id !== this.itemToDelete._id);
          }
          
          // Cerrar el modal de confirmación
          this.showDeleteModal = false;
        } catch (error) {
          console.error('Error al eliminar:', error);
          this.$toast.error(error.response?.data?.message || `Error al eliminar ${this.deleteType === 'company' ? 'la compañía' : 'el producto'}`);
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
          const response = await axios.get(`/api/products?compania_id=${companyId}`);
          this.companyProducts = response.data;
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
            await axios.put(`/api/products/${this.currentProduct._id}`, this.currentProduct);
            this.$toast.success('Producto actualizado con éxito');
            
            // Actualizar en la lista local
            const index = this.companyProducts.findIndex(p => p._id === this.currentProduct._id);
            if (index !== -1) {
              this.companyProducts[index] = { ...this.currentProduct };
            }
          } else {
            // Crear nuevo producto
            const response = await axios.post('/api/products', this.currentProduct);
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
      }
    }
  };
  </script>