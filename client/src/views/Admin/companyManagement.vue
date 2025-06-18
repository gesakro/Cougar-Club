<script>
import axios from 'axios';
import AuthService from '../../services/authService.js';
import AppNavbar from '@/components/layout/AppNavbar.vue';
import AppFooter from '@/components/layout/AppFooter.vue';
import { useToast } from 'vue-toastification';

// API base URL - mejor práctica para mantenimiento
const API_URL = 'http://localhost:5000/api';

export default {
  name: 'CompanyManagement',
  components: {
    AppNavbar,
    AppFooter
  },
  
  setup() {
    const toast = useToast();
    return { toast };
  },
  
  data() {
    return {
      // Datos principales
      companies: [],
      loading: true,
      searchQuery: '',
      
      // Modelos de objetos iniciales - centralizados para reutilización
      initialCompany: {
        nombre: '',
        email: '',
        plan: 'Mensual',
        imagenBanner: '',
        imagenPerfil: '',
        productos: []
      },
      
      initialProduct: {
        nombre: '',
        precio: 0,
        stock: 0,
        descripcion: '',
        categoria: '',
        imagen: '',
        compania_id: null,
        marca_id: null
      },
      
      initialBrand: {
        nombre: '',
        compania: null
      },
      
      // Modal de compañía
      showCompanyModal: false,
      isEditMode: false,
      currentCompany: null,
      companyImageFiles: {
        imagenBanner: null,
        imagenPerfil: null
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
      currentProduct: null,
      productImageFile: null,
      
      // Modal de marca
      showBrandModal: false,
      isEditModeBrand: false,
      currentBrand: null,
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
      if (!this.searchQuery) return this.companies;
      
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
      return this.hasPermission('Administrador') || 
             (this.hasPermission('Gerente') && this.selectedCompanyId === this.currentUserCompanyId);
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
        day: '2-digit', month: '2-digit', year: 'numeric'
      }).format(date);
    },
    
    formatPrice(price) {
      return parseFloat(price).toFixed(2);
    },
    
    hasPermission(role) {
      if (Array.isArray(role)) return role.includes(this.userRole);
      return this.userRole === role;
    },
    
    canEditCompany(companyId) {
      return this.hasPermission('Administrador') || 
             (this.hasPermission('Gerente') && companyId === this.currentUserCompanyId);
    },

    // Métodos de gestión de imágenes
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
    
    // Método centralizado para manejo de errores
    handleError(error, defaultMessage) {
      console.error(defaultMessage, error);
      const errorMessage = error.response?.data?.message || defaultMessage;
      this.toast.error(errorMessage);
    },
    
    // Métodos para compañías
    async fetchCompanies() {
      this.loading = true;
      try {
        const response = await axios.get(`${API_URL}/companies`);
        this.companies = response.data;
      } catch (error) {
        this.handleError(error, 'Error al cargar compañías');
      } finally {
        this.loading = false;
      }
    },
    
    openCompanyModal(company = null) {
      this.isEditMode = !!company;
      this.currentCompany = company ? { ...company } : { ...this.initialCompany };
      
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
        
        let response;
        if (this.isEditMode) {
          // Actualizar compañía existente
          response = await axios.put(`${API_URL}/companies/${this.currentCompany._id}`, this.currentCompany);
          this.toast.success('Compañía actualizada con éxito');
          
          // Actualizar en la lista local
          const index = this.companies.findIndex(c => c._id === this.currentCompany._id);
          if (index !== -1) {
            this.companies[index] = { ...response.data };
          }
        } else {
          // Crear nueva compañía
          response = await axios.post(`${API_URL}/companies`, this.currentCompany);
          this.toast.success('Compañía creada con éxito');
          
          // Añadir a la lista local
          this.companies.push(response.data);
        }
        
        this.closeCompanyModal();
      } catch (error) {
        this.handleError(error, 'Error al guardar la compañía');
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
        // Cargar productos y marcas en paralelo para mejorar rendimiento
        const [productsResponse, brandsResponse] = await Promise.all([
          axios.get(`${API_URL}/products?compania_id=${companyId}`),
          axios.get(`${API_URL}/brands?compania=${companyId}`)
        ]);
        
        this.companyProducts = productsResponse.data;
        this.companyBrands = brandsResponse.data;
        
        this.showProductsModal = true;
      } catch (error) {
        this.handleError(error, 'Error al cargar datos de la compañía');
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
      this.isEditModeProduct = !!product;
      this.currentProduct = product ? 
        { ...product } : 
        { ...this.initialProduct, compania_id: this.selectedCompanyId };
      
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
        // Asegurar asociación con la compañía correcta
        this.currentProduct.compania_id = this.selectedCompanyId;
        
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
        
        let response;
        if (this.isEditModeProduct) {
          // Actualizar producto existente
          response = await axios.put(`${API_URL}/products/${this.currentProduct._id}`, this.currentProduct);
          this.toast.success('Producto actualizado con éxito');
          
          // Actualizar en la lista local
          const index = this.companyProducts.findIndex(p => p._id === this.currentProduct._id);
          if (index !== -1) {
            this.companyProducts[index] = { ...response.data };
          }
        } else {
          // Crear nuevo producto
          response = await axios.post(`${API_URL}/products`, this.currentProduct);
          this.toast.success('Producto creado con éxito');
          
          // Añadir a la lista local
          this.companyProducts.push(response.data);
        }
        
        this.closeProductModal();
      } catch (error) {
        this.handleError(error, 'Error al guardar el producto');
      }
    },
    
    // Métodos para marcas
    openBrandModal(brand = null) {
      this.isEditModeBrand = !!brand;
      this.currentBrand = brand ? 
        { ...brand } : 
        { ...this.initialBrand, compania: this.selectedCompanyId };
        
      this.showBrandModal = true;
    },
    
    closeBrandModal() {
      this.showBrandModal = false;
    },
    
    async saveBrand() {
      try {
        // Asegurar asociación con la compañía correcta
        this.currentBrand.compania = this.selectedCompanyId;
        
        let response;
        if (this.isEditModeBrand) {
          // Actualizar marca existente
          response = await axios.put(`${API_URL}/brands/${this.currentBrand._id}`, this.currentBrand);
          this.toast.success('Marca actualizada con éxito');
          
          // Actualizar en la lista local
          const index = this.companyBrands.findIndex(b => b._id === this.currentBrand._id);
          if (index !== -1) {
            this.companyBrands[index] = { ...response.data };
          }
        } else {
          // Crear nueva marca
          response = await axios.post(`${API_URL}/brands`, this.currentBrand);
          this.toast.success('Marca creada con éxito');
          
          // Añadir a la lista local
          this.companyBrands.push(response.data);
        }
        
        this.closeBrandModal();
      } catch (error) {
        this.handleError(error, 'Error al guardar la marca');
      }
    },
    
    // Métodos para modal de confirmación
    confirmDelete(item, type) {
      this.deleteType = type;
      this.itemToDelete = item;
      this.showDeleteModal = true;
    },
    
    async executeDelete() {
      try {
        // Usar un objeto para mapear tipos a endpoints y mensajes
        const deleteOptions = {
          company: {
            endpoint: `${API_URL}/companies/${this.itemToDelete._id}`,
            successMessage: 'Compañía eliminada con éxito',
            updateList: () => {
              this.companies = this.companies.filter(c => c._id !== this.itemToDelete._id);
            }
          },
          product: {
            endpoint: `${API_URL}/products/${this.itemToDelete._id}`,
            successMessage: 'Producto eliminado con éxito',
            updateList: () => {
              this.companyProducts = this.companyProducts.filter(p => p._id !== this.itemToDelete._id);
            }
          },
          brand: {
            endpoint: `${API_URL}/brands/${this.itemToDelete._id}`,
            successMessage: 'Marca eliminada con éxito',
            updateList: () => {
              this.companyBrands = this.companyBrands.filter(b => b._id !== this.itemToDelete._id);
            }
          }
        };
        
        const options = deleteOptions[this.deleteType];
        
        if (options) {
          await axios.delete(options.endpoint);
          this.toast.success(options.successMessage);
          options.updateList();
        }
        
        this.showDeleteModal = false;
      } catch (error) {
        const itemTypeMap = {
          company: 'la compañía',
          product: 'el producto',
          brand: 'la marca'
        };
        
        this.handleError(error, `Error al eliminar ${itemTypeMap[this.deleteType] || 'el elemento'}`);
      }
    }
  }
};
</script>

<template>
  <div class="company-management">
    <!-- Barra de navegación -->
    <AppNavbar />
    
    <div class="container mx-auto py-8 px-4">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Gestión de Compañías</h1>
        <!-- Botón para crear nueva compañía solo visible para administradores -->
        <button 
          v-if="hasPermission('Administrador')" 
          @click="openCompanyModal()" 
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Nueva Compañía
        </button>
      </div>
      
      <!-- Barra de búsqueda -->
      <div class="mb-6">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Buscar compañías..." 
          class="w-full px-4 py-2 border rounded"
        />
      </div>
      
      <!-- Tabla de compañías -->
      <div class="bg-white shadow rounded-lg overflow-hidden">
        <div v-if="loading" class="p-4 text-center">
          <p>Cargando compañías...</p>
        </div>
        
        <div v-else-if="filteredCompanies.length === 0" class="p-4 text-center">
          <p>No se encontraron compañías</p>
        </div>
        
        <table v-else class="min-w-full">
          <thead class="bg-gray-100">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Logo</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Creación</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="company in filteredCompanies" :key="company._id">
              <td class="px-6 py-4 whitespace-nowrap">
                <img 
                  :src="company.imagenPerfil || '/img/default-company.png'" 
                  class="h-10 w-10 rounded-full object-cover"
                  alt="Logo de compañía"
                />
              </td>
              <td class="px-6 py-4 whitespace-nowrap">{{ company.nombre }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ company.email }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ company.plan }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ formatDate(company.createdAt) }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex space-x-2">
                  <!-- Ver productos -->
                  <button 
                    @click="viewProducts(company._id)" 
                    class="text-indigo-600 hover:text-indigo-900 bg-indigo-100 hover:bg-indigo-200 px-2 py-1 rounded"
                    title="Ver productos"
                  >
                    Productos
                  </button>
                  
                  <!-- Editar compañía -->
                  <button 
                    v-if="canEditCompany(company._id)" 
                    @click="openCompanyModal(company)" 
                    class="text-green-600 hover:text-green-900 bg-green-100 hover:bg-green-200 px-2 py-1 rounded"
                    title="Editar compañía"
                  >
                    Editar
                  </button>
                  
                  <!-- Eliminar compañía (solo administradores) -->
                  <button 
                    v-if="hasPermission('Administrador')" 
                    @click="confirmDelete(company, 'company')" 
                    class="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-2 py-1 rounded"
                    title="Eliminar compañía"
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Footer -->
    <AppFooter />
    
    <!-- MODALES -->
    
    <!-- Modal para crear/editar compañía -->
    <div v-if="showCompanyModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-2xl overflow-hidden">
        <div class="bg-gray-100 px-6 py-4 border-b flex justify-between items-center">
          <h2 class="text-xl font-semibold">{{ isEditMode ? 'Editar' : 'Nueva' }} Compañía</h2>
          <button @click="closeCompanyModal" class="text-gray-500 hover:text-gray-700">&times;</button>
        </div>
        
        <div class="p-6">
          <form @submit.prevent="saveCompany">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input 
                  type="text" 
                  v-model="currentCompany.nombre" 
                  required
                  class="w-full px-3 py-2 border rounded-md"
                />
              </div>
              
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  v-model="currentCompany.email" 
                  required
                  class="w-full px-3 py-2 border rounded-md"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Plan</label>
                <select 
                  v-model="currentCompany.plan" 
                  class="w-full px-3 py-2 border rounded-md"
                >
                  <option v-for="option in planOptions" :key="option" :value="option">
                    {{ option }}
                  </option>
                </select>
              </div>
              
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Imagen Banner</label>
                <div class="flex items-center space-x-4">
                  <input 
                    type="file" 
                    @change="e => handleImageChange(e, 'company', 'imagenBanner')" 
                    accept="image/*"
                    class="flex-1"
                  />
                  <img 
                    v-if="currentCompany.imagenBanner" 
                    :src="currentCompany.imagenBanner" 
                    class="h-12 w-24 object-cover rounded"
                    alt="Vista previa banner"
                  />
                </div>
              </div>
              
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Imagen Perfil</label>
                <div class="flex items-center space-x-4">
                  <input 
                    type="file" 
                    @change="e => handleImageChange(e, 'company', 'imagenPerfil')" 
                    accept="image/*"
                    class="flex-1"
                  />
                  <img 
                    v-if="currentCompany.imagenPerfil" 
                    :src="currentCompany.imagenPerfil" 
                    class="h-12 w-12 object-cover rounded-full"
                    alt="Vista previa perfil"
                  />
                </div>
              </div>
            </div>
            
            <div class="mt-6 flex justify-end space-x-3">
              <button 
                type="button" 
                @click="closeCompanyModal" 
                class="px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {{ isEditMode ? 'Actualizar' : 'Crear' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    
    <!-- Modal de productos de compañía -->
    <div v-if="showProductsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-5xl overflow-hidden">
        <div class="bg-gray-100 px-6 py-4 border-b flex justify-between items-center">
          <h2 class="text-xl font-semibold">Productos de {{ selectedCompanyName }}</h2>
          <button @click="closeProductsModal" class="text-gray-500 hover:text-gray-700">&times;</button>
        </div>
        
        <div class="p-6">
          <!-- Acciones de productos -->
          <div class="flex justify-between items-center mb-6">
            <div class="flex space-x-3">
              <button 
                v-if="canManageProducts" 
                @click="openProductModal()" 
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Nuevo Producto
              </button>
              
              <button 
                v-if="canManageProducts" 
                @click="openBrandModal()" 
                class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
              >
                Nueva Marca
              </button>
            </div>
          </div>
          
          <!-- Tabla de productos -->
          <div class="bg-white shadow rounded-lg overflow-hidden mb-8">
            <div v-if="loadingProducts" class="p-4 text-center">
              <p>Cargando productos...</p>
            </div>
            
            <div v-else-if="companyProducts.length === 0" class="p-4 text-center">
              <p>Esta compañía no tiene productos registrados</p>
            </div>
            
            <table v-else class="min-w-full">
              <thead class="bg-gray-100">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Imagen</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marca</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="product in companyProducts" :key="product._id">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <img 
                      :src="product.imagen || '/img/default-product.png'" 
                      class="h-12 w-12 object-cover rounded"
                      alt="Imagen del producto"
                    />
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">{{ product.nombre }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">${{ formatPrice(product.precio) }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">{{ product.stock }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">{{ product.categoria }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    {{ companyBrands.find(b => b._id === product.marca_id)?.nombre || 'N/D' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex space-x-2">
                      <!-- Editar producto -->
                      <button 
                        v-if="canManageProducts" 
                        @click="openProductModal(product)" 
                        class="text-green-600 hover:text-green-900 bg-green-100 hover:bg-green-200 px-2 py-1 rounded"
                        title="Editar producto"
                      >
                        Editar
                      </button>
                      
                      <!-- Eliminar producto -->
                      <button 
                        v-if="canManageProducts" 
                        @click="confirmDelete(product, 'product')" 
                        class="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-2 py-1 rounded"
                        title="Eliminar producto"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Sección de marcas -->
          <h3 class="text-lg font-semibold mb-4">Marcas de la compañía</h3>
          <div class="bg-white shadow rounded-lg overflow-hidden">
            <div v-if="loadingProducts" class="p-4 text-center">
              <p>Cargando marcas...</p>
            </div>
            
            <div v-else-if="companyBrands.length === 0" class="p-4 text-center">
              <p>Esta compañía no tiene marcas registradas</p>
            </div>
            
            <table v-else class="min-w-full">
              <thead class="bg-gray-100">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Productos</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="brand in companyBrands" :key="brand._id">
                  <td class="px-6 py-4 whitespace-nowrap">{{ brand.nombre }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    {{ companyProducts.filter(p => p.marca_id === brand._id).length }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex space-x-2">
                      <!-- Editar marca -->
                      <button 
                        v-if="canManageProducts" 
                        @click="openBrandModal(brand)" 
                        class="text-green-600 hover:text-green-900 bg-green-100 hover:bg-green-200 px-2 py-1 rounded"
                        title="Editar marca"
                      >
                        Editar
                      </button>
                      
                      <!-- Eliminar marca -->
                      <button 
                        v-if="canManageProducts && !companyProducts.some(p => p.marca_id === brand._id)" 
                        @click="confirmDelete(brand, 'brand')" 
                        class="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-2 py-1 rounded"
                        title="Eliminar marca"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal para crear/editar producto -->
    <div v-if="showProductModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-2xl overflow-hidden">
        <div class="bg-gray-100 px-6 py-4 border-b flex justify-between items-center">
          <h2 class="text-xl font-semibold">{{ isEditModeProduct ? 'Editar' : 'Nuevo' }} Producto</h2>
          <button @click="closeProductModal" class="text-gray-500 hover:text-gray-700">&times;</button>
        </div>
        
        <div class="p-6">
          <form @submit.prevent="saveProduct">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input 
                  type="text" 
                  v-model="currentProduct.nombre" 
                  required
                  class="w-full px-3 py-2 border rounded-md"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                <input 
                  type="number" 
                  v-model="currentProduct.precio" 
                  min="0" 
                  step="0.01" 
                  required
                  class="w-full px-3 py-2 border rounded-md"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                <input 
                  type="number" 
                  v-model="currentProduct.stock" 
                  min="0" 
                  required
                  class="w-full px-3 py-2 border rounded-md"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <input 
                  type="text" 
                  v-model="currentProduct.categoria" 
                  required
                  class="w-full px-3 py-2 border rounded-md"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Marca</label>
                <select 
                  v-model="currentProduct.marca_id" 
                  class="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Seleccionar marca</option>
                  <option 
                    v-for="brand in companyBrands" 
                    :key="brand._id" 
                    :value="brand._id"
                  >
                    {{ brand.nombre }}
                  </option>
                </select>
              </div>
              
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea 
                  v-model="currentProduct.descripcion" 
                  rows="4"
                  class="w-full px-3 py-2 border rounded-md"
                ></textarea>
              </div>
              
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Imagen</label>
                <div class="flex items-center space-x-4">
                  <input 
                    type="file" 
                    @change="e => handleImageChange(e, 'product', 'imagen')" 
                    accept="image/*"
                    class="flex-1"
                  />
                  <img 
                    v-if="currentProduct.imagen" 
                    :src="currentProduct.imagen" 
                    class="h-12 w-12 object-cover rounded"
                    alt="Vista previa producto"
                  />
                </div>
              </div>
            </div>
            
            <div class="mt-6 flex justify-end space-x-3">
              <button 
                type="button" 
                @click="closeProductModal" 
                class="px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {{ isEditModeProduct ? 'Actualizar' : 'Crear' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    
    <!-- Modal para crear/editar marca -->
    <div v-if="showBrandModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden">
        <div class="bg-gray-100 px-6 py-4 border-b flex justify-between items-center">
          <h2 class="text-xl font-semibold">{{ isEditModeBrand ? 'Editar' : 'Nueva' }} Marca</h2>
          <button @click="closeBrandModal" class="text-gray-500 hover:text-gray-700">&times;</button>
        </div>
        
        <div class="p-6">
          <form @submit.prevent="saveBrand">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input 
                type="text" 
                v-model="currentBrand.nombre" 
                required
                class="w-full px-3 py-2 border rounded-md"
              />
            </div>
            
            <div class="mt-6 flex justify-end space-x-3">
              <button 
                type="button" 
                @click="closeBrandModal" 
                class="px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {{ isEditModeBrand ? 'Actualizar' : 'Crear' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    
    <!-- Modal de confirmación de eliminación -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden">
        <div class="bg-gray-100 px-6 py-4 border-b flex justify-between items-center">
          <h2 class="text-xl font-semibold">Confirmar eliminación</h2>
          <button @click="showDeleteModal = false" class="text-gray-500 hover:text-gray-700">&times;</button>
        </div>
        
        <div class="p-6">
          <p class="mb-6">
            ¿Está seguro que desea eliminar 
            <span v-if="deleteType === 'company'">la compañía "{{ itemToDelete.nombre }}"</span>
            <span v-else-if="deleteType === 'product'">el producto "{{ itemToDelete.nombre }}"</span>
            <span v-else-if="deleteType === 'brand'">la marca "{{ itemToDelete.nombre }}"</span>
            ? Esta acción no se puede deshacer.
          </p>
          
          <div class="flex justify-end space-x-3">
            <button 
              @click="showDeleteModal = false" 
              class="px-4 py-2 border rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button 
              @click="executeDelete" 
              class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<!-- CSS para el Sistema de Gestión de Compañías con tema café/beige -->
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
  --color-success: #5B8A72;       /* Verde para acciones positivas */
  --color-purple: #7D6B91;        /* Color alternativo para marcas */
  --font-family: 'Poppins', 'Segoe UI', sans-serif;
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.1);
  --border-radius: 6px;
  --transition: all 0.3s ease;
}

/* Reset de estilos y base */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-family);
  background-color: var(--color-gray-light);
  color: var(--color-text);
  line-height: 1.6;
}

/* Contenedor principal */
.company-management {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Navbar */
.navbar {
  background-color: var(--color-primary-dark);
  color: var(--color-white);
  padding: 1rem 0;
  box-shadow: var(--shadow-md);
}

/* Container */
.container {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Títulos y textos */
h1 {
  color: var(--color-primary-dark);
  font-weight: 600;
}

h2 {
  color: var(--color-primary);
}

/* Botones */
button {
  font-family: var(--font-family);
  border: none;
  cursor: pointer;
  transition: var(--transition);
  font-weight: 500;
  border-radius: var(--border-radius);
}

.bg-blue-600 {
  background-color: var(--color-primary);
  color: var(--color-white);
}

.bg-blue-600:hover, .hover\:bg-blue-700:hover {
  background-color: var(--color-primary-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.bg-red-600, .text-red-600 {
  background-color: var(--color-danger);
  color: var(--color-white);
}

.bg-red-600:hover, .hover\:bg-red-700:hover {
  background-color: #8B351E;
}

.bg-red-100 {
  background-color: #FFE5E0;
}

.hover\:bg-red-200:hover {
  background-color: #FFCCC5;
}

.text-red-600 {
  color: var(--color-danger);
  background-color: transparent;
}

.hover\:text-red-900:hover {
  color: #6A2E1A;
}

.bg-green-100 {
  background-color: #E6F4EA;
}

.hover\:bg-green-200:hover {
  background-color: #CEEADE;
}

.text-green-600 {
  color: var(--color-success);
  background-color: transparent;
}

.hover\:text-green-900:hover {
  color: #3D5C4C;
}

.bg-purple-600 {
  background-color: var(--color-purple);
  color: var(--color-white);
}

.hover\:bg-purple-700:hover {
  background-color: #5D4D6D;
}

.bg-indigo-100 {
  background-color: #E6E9F7;
}

.hover\:bg-indigo-200:hover {
  background-color: #C7CEF0;
}

.text-indigo-600 {
  color: var(--color-primary-light);
  background-color: transparent;
}

.hover\:text-indigo-900:hover {
  color: var(--color-primary-dark);
}

.px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}

.py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.py-8 {
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.px-6 {
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

.py-3 {
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
}

.py-4 {
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.px-2 {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

.py-1 {
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
}

.px-3 {
  padding-left: 0.75rem;
  padding-right: 0.75rem;
}

/* Barra de búsqueda */
input[type="text"], input[type="email"], input[type="number"], textarea, select {
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

.mb-6 {
  margin-bottom: 1.5rem;
}

.mb-1 {
  margin-bottom: 0.25rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.mt-6 {
  margin-top: 1.5rem;
}

/* Tablas */
.bg-white {
  background-color: var(--color-white);
}

.shadow {
  box-shadow: var(--shadow-md);
}

.rounded-lg {
  border-radius: var(--border-radius);
}

.overflow-hidden {
  overflow: hidden;
}

.min-w-full {
  min-width: 100%;
}

.bg-gray-100 {
  background-color: var(--color-accent-light);
}

.text-left {
  text-align: left;
}

.text-xs {
  font-size: 0.75rem;
}

.font-medium {
  font-weight: 500;
}

.text-gray-500 {
  color: var(--color-gray-dark);
}

.uppercase {
  text-transform: uppercase;
}

.tracking-wider {
  letter-spacing: 0.05em;
}

.divide-y {
  border-top-width: 1px;
  border-bottom-width: 1px;
}

.divide-gray-200 {
  border-color: var(--color-gray);
}

.whitespace-nowrap {
  white-space: nowrap;
}

.h-10 {
  height: 2.5rem;
}

.w-10 {
  width: 2.5rem;
}

.rounded-full {
  border-radius: 9999px;
}

.object-cover {
  object-fit: cover;
}

.h-12 {
  height: 3rem;
}

.w-12 {
  width: 3rem;
}

.w-24 {
  width: 6rem;
}

.rounded {
  border-radius: var(--border-radius);
}

.flex {
  display: flex;
}

.space-x-2 > * + * {
  margin-left: 0.5rem;
}

.space-x-3 > * + * {
  margin-left: 0.75rem;
}

.space-x-4 > * + * {
  margin-left: 1rem;
}

.justify-between {
  justify-content: space-between;
}

.justify-end {
  justify-content: flex-end;
}

.items-center {
  align-items: center;
}

.text-center {
  text-align: center;
}

.text-2xl {
  font-size: 1.5rem;
}

.font-bold {
  font-weight: 700;
}

.text-xl {
  font-size: 1.25rem;
}

.font-semibold {
  font-weight: 600;
}

.text-lg {
  font-size: 1.125rem;
}

.text-sm {
  font-size: 0.875rem;
}

.flex-1 {
  flex: 1 1 0%;
}

.border {
  border-width: 1px;
}

.border-b {
  border-bottom-width: 1px;
}

.grid {
  display: grid;
}

.grid-cols-1 {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

.gap-4 {
  gap: 1rem;
}

/* Modales */
.fixed.inset-0 {
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

.bg-white.p-6 {
  background-color: var(--color-white);
  border-radius: var(--border-radius);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
  padding: 1.5rem;
  animation: modalFadeIn 0.3s;
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

.text-lg.font-semibold.mb-4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-primary-dark);
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--color-gray);
  padding-bottom: 0.75rem;
}

/* Formularios */
.block.text-gray-700.mb-2 {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.9rem;
  color: var(--color-primary-dark);
}

.w-full.px-3.py-2.border.border-gray-300.rounded {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-gray);
  border-radius: var(--border-radius);
  font-family: var(--font-family);
  font-size: 0.9rem;
  color: var(--color-text);
  transition: var(--transition);
  background-color: var(--color-white);
  margin-bottom: 1rem;
}

.w-full.px-3.py-2.border.border-gray-300.rounded:focus {
  outline: none;
  border-color: var(--color-primary-light);
  box-shadow: 0 0 0 3px rgba(166, 124, 82, 0.2);
}

/* Media queries */
@media (min-width: 768px) {
  .md\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  
  .md\:col-span-2 {
    grid-column: span 2 / span 2;
  }
}

/* Footer */
.footer {
  margin-top: auto;
  background-color: var(--color-primary-dark);
  color: var(--color-accent-light);
  padding: 1.5rem 0;
}


</style>