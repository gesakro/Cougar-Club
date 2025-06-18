<script>
import axios from 'axios';
import AuthService from '../../services/authService.js';
import AppNavbar from '@/components/layout/AppNavbar.vue';
import AppFooter from '@/components/layout/AppFooter.vue';
import PriceService from '@/services/PriceService';
import { useToast } from 'vue-toastification';
import PaymentBrick from '@/components/PaymentBrick.vue';

// API base URL - mejor práctica para mantenimiento
const API_URL = 'http://localhost:5000/api';

export default {
  name: 'CommerceManagement',
  components: {
    AppNavbar,
    AppFooter,
    PaymentBrick
  },
  setup() {
    const toast = useToast();
    return { toast };
  },
  data() {
    return {
      // Datos de la compañía
      company: null,
      loading: true,
      currentUserCompanyId: null,
      
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
      itemToDelete: null,
      
      // Datos para el pago
      showPaymentModal: false,
      planPrices: {
        'Mensual': 29900,
        'Anual': 299900
      },
      originalCompanyData: null,
    };
  },
  
  computed: {
    userRole() {
      return AuthService.getUserRole();
    },
    
    isGerente() {
      return this.userRole === 'Gerente';
    },
    
    hasCompany() {
      return this.company && this.company._id;
    },
    
    hasCompanyAccess() {
      return this.isGerente;
    },
    
    planOptions() {
      return ['Mensual', 'Anual'];
    },
    
    selectedPlanPrice() {
      return this.planPrices[this.currentCompany.plan] || 0;
    }
  },
  
  created() {
    this.verifyAccessAndLoadData();
  },
  
  methods: {
    // Método para mostrar notificaciones de éxito
    showSuccess(message) {
      try {
        if (this.toast) {
          this.toast.success(message);
        } else if (this.$toast) {
          this.$toast.success(message);
        } else {
          console.log('✅ SUCCESS:', message);
        }
      } catch (error) {
        console.log('✅ SUCCESS:', message);
      }
    },

    // Método para mostrar notificaciones de error
    showError(message) {
      try {
        if (this.toast) {
          this.toast.error(message);
        } else if (this.$toast) {
          this.$toast.error(message);
        } else {
          console.error('❌ ERROR:', message);
          alert(message);
        }
      } catch (error) {
        console.error('❌ ERROR:', message);
        alert(message);
      }
    },

    // Verificar acceso y cargar datos del gerente
    async verifyAccessAndLoadData() {
      if (!this.isGerente) {
        // Redirigir a página de acceso denegado o dashboard
        this.$router.push('/dashboard');
        
        this.showError('Acceso denegado. Solo los gerentes pueden acceder a esta página.');
        return;
      }

      // Obtener compañía del gerente actual
      await this.fetchManagerCompany();
    },

    // Obtener la compañía asociada al gerente actual
    async fetchManagerCompany() {
      this.loading = true;
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/companies/manager/company`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.data && response.data.hasCompany) {
          // El gerente tiene una compañía
          this.company = response.data;
          this.currentUserCompanyId = response.data._id;
          
          // Actualizar localStorage con la compañía correcta
          localStorage.setItem('userCompany', response.data._id);
          
          // Cargar productos y marcas
          await this.fetchCompanyProducts();
          await this.fetchCompanyBrands();
        } else {
          // El gerente no tiene compañía
          this.currentUserCompanyId = null;
          this.company = null;
        }
      } catch (error) {
        if (error.response?.status === 404) {
          // No tiene compañía asociada
          this.currentUserCompanyId = null;
          this.company = null;
        } else {
          this.handleError(error, 'Error al verificar la compañía del gerente');
        }
      } finally {
        this.loading = false;
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
      return PriceService.formatPrice(price);
    },
    
    // Método centralizado para manejo de errores
    handleError(error, defaultMessage) {
      console.error(defaultMessage, error);
      
      let errorMessage = defaultMessage;
      
      // Verificación segura paso a paso
      if (error && error.response && error.response.data) {
        errorMessage = error.response.data.message || error.response.data.error || defaultMessage;
      } else if (error && error.message) {
        errorMessage = error.message;
      }
      
      this.showError(errorMessage);
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
      if (!this.currentUserCompanyId) return;
      
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
    
    openCompanyModal(isEdit = false) {
      if (isEdit && this.company) {
        // Guardar snapshot de los datos originales para comparación
        this.originalCompanyData = {
          nombre: this.company.nombre || '',
          email: this.company.email || '',
          plan: this.company.plan || 'Mensual',
          imagenBanner: this.company.imagenBanner || '',
          imagenPerfil: this.company.imagenPerfil || '',
          productos: this.company.productos || []
        };
        // Rellenar los campos del modal con los datos actuales
        this.currentCompany = { ...this.originalCompanyData };
      } else {
        this.currentCompany = {
          nombre: '',
          email: '',
          plan: 'Mensual',
          imagenBanner: '',
          imagenPerfil: '',
          productos: []
        };
        this.originalCompanyData = null;
      }
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
    
    async handlePaymentSuccess() {
      try {
        // 1. Crear la empresa sin imágenes
        const response = await axios.post(`${API_URL}/companies/manager`, {
          ...this.currentCompany,
          imagenBanner: '',
          imagenPerfil: '',
          paymentAmount: this.selectedPlanPrice,
          paymentPlan: this.currentCompany.plan
        });
        const companyId = response.data.company._id;
        let imagenBannerUrl = '';
        let imagenPerfilUrl = '';

        // 2. Subir imágenes si existen
        if (this.companyImageFiles.imagenBanner || this.companyImageFiles.imagenPerfil) {
          const formData = new FormData();
          formData.append('companyId', companyId);
          if (this.companyImageFiles.imagenBanner) {
            formData.append('imagenBanner', this.companyImageFiles.imagenBanner);
          }
          if (this.companyImageFiles.imagenPerfil) {
            formData.append('imagenPerfil', this.companyImageFiles.imagenPerfil);
          }
          const uploadRes = await axios.post(`${API_URL}/companies/upload-images`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          imagenBannerUrl = uploadRes.data.imagenBannerUrl || '';
          imagenPerfilUrl = uploadRes.data.imagenPerfilUrl || '';
        }

        // 3. Actualizar la empresa con las URLs de las imágenes
        const updateRes = await axios.put(`${API_URL}/companies/${companyId}`, {
          ...response.data.company,
          imagenBanner: imagenBannerUrl || response.data.company.imagenBanner,
          imagenPerfil: imagenPerfilUrl || response.data.company.imagenPerfil
        });

          this.showSuccess('Compañía creada con éxito');
          // Actualizar el token y la información de la compañía
          if (response.data.token) {
            localStorage.setItem('token', response.data.token);
          localStorage.setItem('userCompany', companyId);
          }
          // Actualizar en la lista local
        this.company = updateRes.data;
        this.currentUserCompanyId = companyId;
        // Cerrar modales
        this.showPaymentModal = false;
        this.closeCompanyModal();
      } catch (error) {
        console.error('Error al crear la compañía:', error);
        const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Error al crear la compañía';
        this.showError(errorMessage);
      }
    },
    
    async saveCompany() {
      // Si NO hay compañía, esto es el flujo de registro (ya manejado por el pago)
      if (!this.hasCompany) {
        try {
          if (!this.currentCompany.nombre || !this.currentCompany.email) {
            this.showError('Por favor complete todos los campos requeridos');
            return;
          }
          this.showPaymentModal = true;
        } catch (error) {
          console.error('Error al preparar el pago:', error);
          this.showError('Error al preparar el pago');
        }
        return;
      }
      // Si hay compañía, esto es edición
      try {
        // Validar campos requeridos
        if (!this.currentCompany.nombre || !this.currentCompany.email) {
          this.showError('Por favor complete todos los campos requeridos');
          return;
        }
        // Validar que haya cambios respecto a los datos originales
        const original = this.originalCompanyData || {};
        const hasChanges =
          this.currentCompany.nombre !== original.nombre ||
          this.currentCompany.email !== original.email ||
          this.currentCompany.plan !== original.plan ||
          this.companyImageFiles.imagenBanner ||
          this.companyImageFiles.imagenPerfil;
        if (!hasChanges) {
          this.showError('No hay cambios para guardar.');
          return;
        }
        let imagenBannerUrl = this.currentCompany.imagenBanner;
        let imagenPerfilUrl = this.currentCompany.imagenPerfil;
        if (this.companyImageFiles.imagenBanner || this.companyImageFiles.imagenPerfil) {
          const formData = new FormData();
          formData.append('companyId', this.currentUserCompanyId);
          if (this.companyImageFiles.imagenBanner) {
            formData.append('imagenBanner', this.companyImageFiles.imagenBanner);
          }
          if (this.companyImageFiles.imagenPerfil) {
            formData.append('imagenPerfil', this.companyImageFiles.imagenPerfil);
          }
          const uploadRes = await axios.post(`${API_URL}/companies/upload-images`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          imagenBannerUrl = uploadRes.data.imagenBannerUrl || imagenBannerUrl;
          imagenPerfilUrl = uploadRes.data.imagenPerfilUrl || imagenPerfilUrl;
        }
        const updateRes = await axios.put(`${API_URL}/companies/${this.currentUserCompanyId}`, {
          ...this.currentCompany,
          imagenBanner: imagenBannerUrl,
          imagenPerfil: imagenPerfilUrl
        });
        this.showSuccess('Compañía actualizada con éxito');
        this.company = updateRes.data;
        this.closeCompanyModal();
      } catch (error) {
        this.handleError(error, 'Error al guardar la compañía');
      }
    },
    
    handlePaymentClose() {
      this.showPaymentModal = false;
    },
    
    // Métodos para productos
    async fetchCompanyProducts() {
      if (!this.currentUserCompanyId) return;
      
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
        
        // Validar campos requeridos
        if (!this.currentProduct.nombre || !this.currentProduct.precio) {
          this.showError('Por favor complete todos los campos requeridos');
          return;
        }

        // Validar que el precio sea un número positivo
        if (isNaN(this.currentProduct.precio) || this.currentProduct.precio <= 0) {
          this.showError('El precio debe ser un número positivo');
          return;
        }

        // Subir imagen si se ha seleccionado una nueva
        if (this.productImageFile) {
          try {
            const imageUrl = await this.uploadImages('product');
            if (imageUrl && imageUrl.imagenUrl) {
              this.currentProduct.imagen = imageUrl.imagenUrl;
            }
          } catch (error) {
            console.error('Error al subir imagen:', error);
            this.showError('Error al subir la imagen del producto');
            return;
          }
        }
        
        let response;
        if (this.isEditModeProduct) {
          // Actualizar producto existente
          response = await axios.put(`${API_URL}/products/${this.currentProduct._id}`, this.currentProduct);
          this.showSuccess('Producto actualizado con éxito');
          
          // Actualizar en la lista local
          const index = this.companyProducts.findIndex(p => p._id === this.currentProduct._id);
          if (index !== -1) {
            this.companyProducts[index] = { ...response.data };
          }
        } else {
          // Crear nuevo producto
          response = await axios.post(`${API_URL}/products`, this.currentProduct);
          this.showSuccess('Producto creado con éxito');
          
          // Añadir a la lista local
          this.companyProducts.push(response.data);
        }
        
        this.closeProductModal();
      } catch (error) {
        console.error('Error al guardar el producto:', error);
        
        // Manejo seguro de errores
        let errorMessage = 'Error al guardar el producto';
        
        // Verificar si el error tiene una respuesta del servidor
        if (error && error.response && error.response.data) {
          errorMessage = error.response.data.error || error.response.data.message || errorMessage;
        } else if (error && error.message) {
          errorMessage = error.message;
        }
        
        this.showError(errorMessage);
      }
    },
    
    confirmDeleteProduct(product) {
      this.deleteType = 'product';
      this.itemToDelete = product;
      this.showDeleteModal = true;
    },
    
    // Métodos para marcas
    async fetchCompanyBrands() {
      if (!this.currentUserCompanyId) return;
      
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
        // Validar campos requeridos
        if (!this.currentBrand.nombre) {
          this.showError('Por favor ingrese el nombre de la marca');
          return;
        }

        // Asegurar que la marca esté asociada a la compañía correcta
        if (!this.currentUserCompanyId) {
          this.showError('No se ha encontrado la compañía asociada');
          return;
        }

        this.currentBrand.compania = this.currentUserCompanyId;
        
        let response;
        if (this.isEditModeBrand) {
          // Actualizar marca existente
          response = await axios.put(`${API_URL}/brands/${this.currentBrand._id}`, this.currentBrand);
          this.showSuccess('Marca actualizada con éxito');
          
          // Actualizar en la lista local
          const index = this.companyBrands.findIndex(b => b._id === this.currentBrand._id);
          if (index !== -1) {
            this.companyBrands[index] = { ...response.data };
          }
        } else {
          // Crear nueva marca
          response = await axios.post(`${API_URL}/brands`, this.currentBrand);
          this.showSuccess('Marca creada con éxito');
          
          // Añadir a la lista local
          this.companyBrands.push(response.data);
        }
        
        this.closeBrandModal();
      } catch (error) {
        console.error('Error al guardar la marca:', error);
        
        // Manejo seguro de errores
        let errorMessage = 'Error al guardar la marca';
        
        // Verificar si el error tiene una respuesta del servidor
        if (error && error.response && error.response.data) {
          errorMessage = error.response.data.message || error.response.data.error || errorMessage;
        } else if (error && error.message) {
          errorMessage = error.message;
        }
        
        this.showError(errorMessage);
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

          this.showSuccess('Producto eliminado con éxito');

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

          this.showSuccess('Marca eliminada con éxito');

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
    },
  }
};
</script>

<template>
  <div>
    <AppNavbar />
    
    <div v-if="loading" class="loading-container">
      <i class="fas fa-spinner fa-spin"></i> Cargando información de la compañía...
    </div>
    
    <!-- SOLO muestra el formulario si NO hay compañía -->
    <div v-else-if="!hasCompany" class="container mx-auto py-8 px-4">
      <!-- Formulario de creación de compañía con estilo de admin -->
      <div class="bg-white shadow rounded-lg overflow-hidden">
        <div class="bg-gray-100 px-6 py-4 border-b">
          <h2 class="text-xl font-semibold">Crear Nueva Compañía</h2>
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
              
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Plan</label>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div 
                    v-for="plan in planOptions" 
                    :key="plan"
                    class="plan-option"
                    :class="{ 'selected': currentCompany.plan === plan }"
                    @click="currentCompany.plan = plan"
                  >
                    <div class="plan-header">
                      <h3 class="plan-name">{{ plan }}</h3>
                      <div class="plan-price">
                        {{ formatPrice(planPrices[plan]) }} COP
                        <span v-if="plan === 'Anual'" class="discount-badge">Ahorra 20%</span>
                      </div>
                    </div>
                    <div class="plan-features">
                      <ul>
                        <li v-if="plan === 'Mensual'">
                          <i class="fas fa-check"></i> Pago mensual
                        </li>
                        <li v-if="plan === 'Anual'">
                          <i class="fas fa-check"></i> Pago anual
                        </li>
                        <li>
                          <i class="fas fa-check"></i> Acceso completo a la plataforma
                        </li>
                        <li>
                          <i class="fas fa-check"></i> Soporte prioritario
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
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
                type="submit" 
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Continuar a pago
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <!-- Modal de pago -->
      <PaymentBrick
        v-if="showPaymentModal"
        :amount="selectedPlanPrice"
        :extraPayer="{
          email: currentCompany.email,
          identification: {
            type: 'email'
          }
        }"
        @success="handlePaymentSuccess"
        @close="handlePaymentClose"
      />
    </div>
    
    <!-- SOLO muestra el dashboard si SÍ hay compañía -->
    <div v-else class="commerce-management">
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
                <td>{{ formatPrice(product.precio) }} COP</td>
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
              <label for="product-price">Precio (COP)</label>
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

/* Agregar estilos específicos para el formulario de creación */
.container {
  max-width: 1200px;
  margin: 0 auto;
}

.bg-white {
  background-color: white;
}

.shadow {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.rounded-lg {
  border-radius: 0.5rem;
}

.overflow-hidden {
  overflow: hidden;
}

.bg-gray-100 {
  background-color: #f7fafc;
}

.px-6 {
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

.py-4 {
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.border-b {
  border-bottom-width: 1px;
}

.text-xl {
  font-size: 1.25rem;
}

.font-semibold {
  font-weight: 600;
}

.p-6 {
  padding: 1.5rem;
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

@media (min-width: 768px) {
  .md\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  
  .md\:col-span-2 {
    grid-column: span 2 / span 2;
  }
}

.block {
  display: block;
}

.text-sm {
  font-size: 0.875rem;
}

.font-medium {
  font-weight: 500;
}

.text-gray-700 {
  color: #4a5568;
}

.mb-1 {
  margin-bottom: 0.25rem;
}

.w-full {
  width: 100%;
}

.px-3 {
  padding-left: 0.75rem;
  padding-right: 0.75rem;
}

.py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.border {
  border-width: 1px;
}

.rounded-md {
  border-radius: 0.375rem;
}

.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.space-x-4 > * + * {
  margin-left: 1rem;
}

.flex-1 {
  flex: 1 1 0%;
}

.h-12 {
  height: 3rem;
}

.w-24 {
  width: 6rem;
}

.w-12 {
  width: 3rem;
}

.object-cover {
  object-fit: cover;
}

.rounded {
  border-radius: 0.25rem;
}

.rounded-full {
  border-radius: 9999px;
}

.mt-6 {
  margin-top: 1.5rem;
}

.justify-end {
  justify-content: flex-end;
}

.space-x-3 > * + * {
  margin-left: 0.75rem;
}

.bg-blue-600 {
  background-color: #3182ce;
}

.text-white {
  color: white;
}

.hover\:bg-blue-700:hover {
  background-color: #2b6cb0;
}

.plan-option {
  border: 2px solid #ece7e1;
  border-radius: 12px;
  background: #fff;
  transition: border 0.2s, box-shadow 0.2s, transform 0.2s;
  box-shadow: 0 2px 8px rgba(115, 97, 76, 0.04);
  cursor: pointer;
  margin-bottom: 0.5rem;
}

.plan-option:hover {
  border-color: #73614C;
  transform: translateY(-2px) scale(1.01);
}

.plan-option.selected {
  border-color: #73614C;
  background: linear-gradient(90deg, #f9f6f2 60%, #f5e9d7 100%);
  box-shadow: 0 4px 16px rgba(115, 97, 76, 0.10);
  transform: translateY(-2px) scale(1.01);
}

.plan-header {
  margin-bottom: 1rem;
}

.plan-name {
  color: #401202;
  font-size: 1.2rem;
  font-weight: 700;
}

.plan-price {
  color: #73614C;
  font-size: 1.1rem;
  font-weight: 600;
}

.discount-badge {
  background: linear-gradient(90deg, #4CAF50 60%, #7be495 100%);
  color: #fff;
  border-radius: 6px;
  padding: 0.2rem 0.7rem;
  font-size: 0.9rem;
  margin-left: 0.7rem;
  font-weight: 600;
}

.plan-features {
  margin-top: 1rem;
}

.plan-features ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.plan-features li {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  color: var(--text-color);
}

.plan-features i {
  color: #4CAF50;
  margin-right: 0.5rem;
}

/* Contenedor principal del formulario de creación */
.container .bg-white.shadow.rounded-lg.overflow-hidden {
  background: linear-gradient(135deg, #f5f7fa 0%, #f9f6f2 100%);
  border-radius: 18px;
  box-shadow: 0 8px 32px rgba(115, 97, 76, 0.10), 0 1.5px 6px rgba(64, 18, 2, 0.06);
  border: 1.5px solid #ece7e1;
  overflow: visible;
}

/* Encabezado del formulario */
.container .bg-gray-100.px-6.py-4.border-b {
  background: linear-gradient(90deg, #73614C 0%, #401202 100%);
  color: #fff;
  border-bottom: none;
  border-radius: 18px 18px 0 0;
  box-shadow: 0 2px 8px rgba(115, 97, 76, 0.08);
}

.container .text-xl.font-semibold {
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: 0.5px;
}

/* Cuerpo del formulario */
.container .p-6 {
  padding: 2.5rem 2rem 2rem 2rem;
  background-color: #e6e3e3;
}s

/* Inputs y labels */
.container label {
  color: #73614C;
  font-weight: 600;
  margin-bottom: 0.3rem;
  letter-spacing: 0.1px;
}

.container input[type="text"],
.container input[type="email"] {
  border: 1.5px solid #e1e5ea;
  border-radius: 10px;
  padding: 0.9rem 1.1rem;
  font-size: 1.08rem;
  background: #fff;
  transition: border 0.2s, box-shadow 0.2s;
  box-shadow: 0 1px 4px rgba(115, 97, 76, 0.04);
}

.container input[type="text"]:focus,
.container input[type="email"]:focus {
  border-color: #73614C;
  outline: none;
  box-shadow: 0 0 0 2px rgba(115, 97, 76, 0.10);
}

/* Planes */
.container .plan-option {
  border: 2px solid #ece7e1;
  border-radius: 12px;
  background: #fff;
  transition: border 0.2s, box-shadow 0.2s, transform 0.2s;
  box-shadow: 0 2px 8px rgba(115, 97, 76, 0.04);
  cursor: pointer;
  margin-bottom: 0.5rem;
}
.container .plan-option.selected {
  border-color: #73614C;
  background: linear-gradient(90deg, #f9f6f2 60%, #f5e9d7 100%);
  box-shadow: 0 4px 16px rgba(115, 97, 76, 0.10);
  transform: translateY(-2px) scale(1.01);
}
.container .plan-header .plan-name {
  color: #401202;
  font-size: 1.2rem;
  font-weight: 700;
}
.container .plan-header .plan-price {
  color: #73614C;
  font-size: 1.1rem;
  font-weight: 600;
}
.container .discount-badge {
  background: linear-gradient(90deg, #4CAF50 60%, #7be495 100%);
  color: #fff;
  border-radius: 6px;
  padding: 0.2rem 0.7rem;
  font-size: 0.9rem;
  margin-left: 0.7rem;
  font-weight: 600;
}

/* Imagenes */
.container .flex.items-center.space-x-4 {
  background: #f9f6f2;
  border-radius: 10px;
  padding: 0.7rem 1rem;
  margin-bottom: 0.5rem;
}
.container input[type="file"] {
  background: transparent;
  border: none;
  color: #73614C;
}
.container img.h-12.w-24.object-cover.rounded,
.container img.h-12.w-12.object-cover.rounded-full {
  border: 2px solid #ece7e1;
  box-shadow: 0 1px 4px rgba(115, 97, 76, 0.08);
}

/* Botón principal */
.container .mt-6.flex.justify-end.space-x-3 button[type="submit"] {
  background: linear-gradient(90deg, #73614C 0%, #401202 100%);
  color: #fff;
  font-weight: 700;
  font-size: 1.1rem;
  border-radius: 10px;
  padding: 0.9rem 2.2rem;
  box-shadow: 0 2px 8px rgba(115, 97, 76, 0.10);
  border: none;
  transition: background 0.2s, box-shadow 0.2s, transform 0.2s;
  letter-spacing: 0.5px;
}
.container .mt-6.flex.justify-end.space-x-3 button[type="submit"]:hover {
  background: linear-gradient(90deg, #401202 0%, #73614C 100%);
  box-shadow: 0 4px 16px rgba(115, 97, 76, 0.18);
  transform: translateY(-2px) scale(1.03);
}

/* Responsive mejoras */
@media (max-width: 768px) {
  .container .p-6 {
    padding: 1.2rem 0.5rem 1.2rem 0.5rem;
  }
  .container .bg-white.shadow.rounded-lg.overflow-hidden {
    border-radius: 12px;
  }
  .container .bg-gray-100.px-6.py-4.border-b {
    border-radius: 12px 12px 0 0;
  }
}
</style>