<template>
  <div class="admin-panel-wrapper">
    <AppNavbar />
    <div class="admin-panel">
      <h1 class="text-2xl font-bold mb-6">Panel de Administración</h1>
      
      <!-- Tabs para navegar entre secciones -->
      <div class="mb-6">
        <div class="border-b border-gray-200">
          <nav class="flex -mb-px">
            <button 
              @click="currentTab = 'managers'" 
              :class="['py-2 px-4 font-medium', currentTab === 'managers' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700']">
              Gerentes
            </button>
            <button 
              @click="currentTab = 'users'" 
              :class="['py-2 px-4 font-medium', currentTab === 'users' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700']">
              Usuarios
            </button>
          </nav>
        </div>
      </div>
      
      <!-- Alerta para mostrar mensajes -->
      <div v-if="alertMessage" :class="['mb-4 p-4 rounded', 
        alertType === 'success' ? 'bg-green-100 text-green-700' : 
        alertType === 'error' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700']">
        {{ alertMessage }}
      </div>
      
      <!-- Sección de Gerentes -->
      <div v-if="currentTab === 'managers'">
        <div class="flex justify-between mb-4">
          <h2 class="text-xl font-semibold">Gestión de Gerentes</h2>
          <button @click="openManagerForm()" class="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded transition-transform hover:scale-105">
            Agregar Gerente
          </button>
        </div>
        
        <!-- Tabla de gerentes -->
        <div class="overflow-x-auto">
          <table class="min-w-full bg-white border border-gray-200">
            <thead>
              <tr>
                <th class="py-2 px-4 border-b text-left">Email</th>
                <th class="py-2 px-4 border-b text-left">Nombre</th>
                <th class="py-2 px-4 border-b text-left">Compañía</th>
                <th class="py-2 px-4 border-b text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="manager in managers" :key="manager._id" class="hover:bg-gray-50">
                <td class="py-2 px-4 border-b">{{ manager.email }}</td>
                <td class="py-2 px-4 border-b">{{ manager.perfil?.nombre || 'Sin nombre' }}</td>
                <td class="py-2 px-4 border-b">{{ getCompanyName(manager.compania_id) }}</td>
                <td class="py-2 px-4 border-b">
                  <button @click="openManagerForm(manager)" class="text-blue-500 hover:text-blue-700 mr-2">
                    Editar
                  </button>
                  <button @click="confirmDelete('manager', manager._id)" class="text-red-500 hover:text-red-700">
                    Eliminar
                  </button>
                </td>
              </tr>
              <tr v-if="managers.length === 0">
                <td colspan="4" class="py-4 text-center text-gray-500">No hay gerentes registrados</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Modal para agregar/editar gerente -->
        <div v-if="showManagerModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <h3 class="text-lg font-semibold mb-4">{{ isEditing ? 'Editar' : 'Agregar' }} Gerente</h3>
            <form @submit.prevent="saveManager">
              <div class="mb-4">
                <label class="block text-gray-700 mb-2">Email</label>
                <input 
                  v-model="formData.email" 
                  type="email" 
                  class="w-full px-3 py-2 border border-gray-300 rounded"
                  required
                >
              </div>
              <div class="mb-4" v-if="!isEditing">
                <label class="block text-gray-700 mb-2">Contraseña</label>
                <input 
                  v-model="formData.password" 
                  type="password" 
                  class="w-full px-3 py-2 border border-gray-300 rounded"
                  :required="!isEditing"
                >
              </div>
              <div class="mb-4">
                <label class="block text-gray-700 mb-2">Nombre</label>
                <input 
                  v-model="formData.perfil.nombre" 
                  type="text" 
                  class="w-full px-3 py-2 border border-gray-300 rounded"
                >
              </div>
              <div class="mb-4">
                <label class="block text-gray-700 mb-2">Compañía</label>
                <select 
                  v-model="formData.compania_id" 
                  class="w-full px-3 py-2 border border-gray-300 rounded"
                  required
                >
                  <option value="" disabled>Seleccione una compañía</option>
                  <option v-for="company in companies" :key="company._id" :value="company._id">
                    {{ company.nombre }}
                  </option>
                </select>
              </div>
              <div class="flex justify-end">
                <button 
                  type="button" 
                  @click="showManagerModal = false" 
                  class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded mr-2"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <!-- Sección de Usuarios -->
      <div v-if="currentTab === 'users'">
        <div class="flex justify-between mb-4">
          <h2 class="text-xl font-semibold">Gestión de Usuarios</h2>
          <button @click="openUserForm()" class="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded transition-transform hover:scale-105">
            Agregar Usuario
          </button>
        </div>
        
        <!-- Filtros para usuarios -->
        <div class="mb-4 flex space-x-4">
          <div class="flex-1">
            <label class="block text-gray-700 mb-2">Filtrar por compañía</label>
            <select 
              v-model="userFilters.compania_id" 
              class="w-full px-3 py-2 border border-gray-300 rounded"
              @change="filterUsers"
            >
              <option value="">Todas las compañías</option>
              <option v-for="company in companies" :key="company._id" :value="company._id">
                {{ company.nombre }}
              </option>
            </select>
          </div>
          <div class="flex-1">
            <label class="block text-gray-700 mb-2">Filtrar por rol</label>
            <select 
              v-model="userFilters.rol" 
              class="w-full px-3 py-2 border border-gray-300 rounded"
              @change="filterUsers"
            >
              <option value="">Todos los roles</option>
              <option value="Administrador">Administrador</option>
              <option value="Gerente">Gerente</option>
              <option value="Usuario">Usuario</option>
            </select>
          </div>
        </div>
        
        <!-- Tabla de usuarios -->
        <div class="overflow-x-auto">
          <table class="min-w-full bg-white border border-gray-200">
            <thead>
              <tr>
                <th class="py-2 px-4 border-b text-left">Email</th>
                <th class="py-2 px-4 border-b text-left">Nombre</th>
                <th class="py-2 px-4 border-b text-left">Rol</th>
                <th class="py-2 px-4 border-b text-left">Compañía</th>
                <th class="py-2 px-4 border-b text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in filteredUsers" :key="user._id" class="hover:bg-gray-50">
                <td class="py-2 px-4 border-b">{{ user.email }}</td>
                <td class="py-2 px-4 border-b">{{ user.perfil?.nombre || 'Sin nombre' }}</td>
                <td class="py-2 px-4 border-b">{{ user.rol }}</td>
                <td class="py-2 px-4 border-b">{{ getCompanyName(user.compania_id) }}</td>
                <td class="py-2 px-4 border-b">
                  <button @click="openUserForm(user)" class="text-blue-500 hover:text-blue-700 mr-2">
                    Editar
                  </button>
                  <button @click="confirmDelete('user', user._id)" class="text-red-500 hover:text-red-700">
                    Eliminar
                  </button>
                </td>
              </tr>
              <tr v-if="filteredUsers.length === 0">
                <td colspan="5" class="py-4 text-center text-gray-500">No hay usuarios que coincidan con los filtros</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Modal para agregar/editar usuario -->
        <div v-if="showUserModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <h3 class="text-lg font-semibold mb-4">{{ isEditing ? 'Editar' : 'Agregar' }} Usuario</h3>
            <form @submit.prevent="saveUser">
              <div class="mb-4">
                <label class="block text-gray-700 mb-2">Email</label>
                <input 
                  v-model="formData.email" 
                  type="email" 
                  class="w-full px-3 py-2 border border-gray-300 rounded"
                  required
                >
              </div>
              <div class="mb-4" v-if="!isEditing">
                <label class="block text-gray-700 mb-2">Contraseña</label>
                <input 
                  v-model="formData.password" 
                  type="password" 
                  class="w-full px-3 py-2 border border-gray-300 rounded"
                  :required="!isEditing"
                >
              </div>
              <div class="mb-4">
                <label class="block text-gray-700 mb-2">Nombre</label>
                <input 
                  v-model="formData.perfil.nombre" 
                  type="text" 
                  class="w-full px-3 py-2 border border-gray-300 rounded"
                >
              </div>
              <div class="mb-4">
                <label class="block text-gray-700 mb-2">Rol</label>
                <select 
                  v-model="formData.rol" 
                  class="w-full px-3 py-2 border border-gray-300 rounded"
                  required
                  @change="handleRolChange"
                >
                  <option value="Administrador">Administrador</option>
                  <option value="Gerente">Gerente</option>
                  <option value="Usuario">Usuario</option>
                </select>
              </div>
              <div class="mb-4" v-if="formData.rol === 'Gerente'">
                <label class="block text-gray-700 mb-2">Compañía</label>
                <select 
                  v-model="formData.compania_id" 
                  class="w-full px-3 py-2 border border-gray-300 rounded"
                  required
                >
                  <option value="" disabled>Seleccione una compañía</option>
                  <option v-for="company in companies" :key="company._id" :value="company._id">
                    {{ company.nombre }}
                  </option>
                </select>
              </div>
              <div class="flex justify-end">
                <button 
                  type="button" 
                  @click="showUserModal = false" 
                  class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded mr-2"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <!-- Modal de confirmación para eliminar -->
      <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
          <h3 class="text-lg font-semibold mb-4">Confirmar eliminación</h3>
          <p class="mb-6">¿Estás seguro de que deseas eliminar este {{ deleteType }}? Esta acción no se puede deshacer.</p>
          <div class="flex justify-end">
            <button 
              type="button" 
              @click="showDeleteModal = false" 
              class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded mr-2"
            >
              Cancelar
            </button>
            <button 
              @click="deleteItem()" 
              class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
    <AppFooter />
  </div>
</template>

<script>
import api from '@/api/api';
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
      currentTab: 'managers',
      companies: [],
      managers: [],
      users: [],
      filteredUsers: [],
      userFilters: {
        compania_id: '',
        rol: ''
      },
      
      // Formularios
      formData: {
        nombre: '',
        direccion: '',
        telefono: '',
        email: '',
        password: '',
        rol: '',
        compania_id: '',
        perfil: {
          nombre: ''
        }
      },
      
      // Control de modales
      showCompanyModal: false,
      showManagerModal: false,
      showUserModal: false,
      showDeleteModal: false,
      
      // Control de edición
      isEditing: false,
      currentItemId: null,
      deleteType: '', // 'company', 'manager', o 'user'
      itemToDeleteId: null,
      
      // Alertas
      alertMessage: '',
      alertType: 'info' // 'success', 'error', 'info'
    };
  },
  
  created() {
    this.fetchData();
  },
  
  methods: {
    // Obtener datos iniciales
    async fetchData() {
      try {
        // Obtener compañías
        const companyResponse = await api.get('/api/companies');
        this.companies = companyResponse.data;
        
        // Obtener usuarios (incluidos los gerentes)
        const userResponse = await api.get('/api/users');
        this.users = userResponse.data;
        
        // Filtrar gerentes
        this.managers = this.users.filter(user => user.rol === 'Gerente');
        
        // Inicializar usuarios filtrados
        this.filteredUsers = [...this.users];
      } catch (error) {
        this.showAlert('Error al cargar los datos: ' + error.message, 'error');
      }
    },
    
    // Filtrar usuarios
    filterUsers() {
      this.filteredUsers = this.users.filter(user => {
        // Filtrar por compañía si se seleccionó una
        const companyMatch = !this.userFilters.compania_id || 
                            user.compania_id === this.userFilters.compania_id;
        
        // Filtrar por rol si se seleccionó uno
        const roleMatch = !this.userFilters.rol || user.rol === this.userFilters.rol;
        
        return companyMatch && roleMatch;
      });
    },
    userRole() {
      return AuthService.getUserRole();
    },
    // Manejar cambio de rol en el formulario
    handleRolChange() {
      // Si cambia de Gerente a otro rol, limpiar compania_id
      if (this.formData.rol !== 'Gerente') {
        this.formData.compania_id = '';
      }
    },
    
    // Obtener nombre de compañía a partir de su ID
    getCompanyName(companyId) {
      if (!companyId) return 'N/A';
      const company = this.companies.find(company => company._id === companyId);
      return company ? company.nombre : 'Desconocida';
    },
    
    // Mostrar alerta
    showAlert(message, type = 'info') {
      this.alertMessage = message;
      this.alertType = type;
      
      // Ocultar alerta después de 5 segundos
      setTimeout(() => {
        this.alertMessage = '';
      }, 5000);
    },
    
    // === GERENTES ===
    openManagerForm(manager = null) {
      this.resetForm();
      
      // Asignar rol de gerente
      this.formData.rol = 'Gerente';
      
      if (manager) {
        // Modo edición
        this.isEditing = true;
        this.currentItemId = manager._id;
        this.formData.email = manager.email;
        this.formData.compania_id = manager.compania_id;
        this.formData.perfil.nombre = manager.perfil?.nombre || '';
      } else {
        // Modo creación
        this.isEditing = false;
      }
      
      this.showManagerModal = true;
    },
    
    async saveManager() {
      try {
        const userData = {
          email: this.formData.email,
          rol: 'Gerente',
          compania_id: this.formData.compania_id,
          perfil: {
            nombre: this.formData.perfil.nombre
          }
        };
        
        // Añadir contraseña solo si está creando un nuevo gerente o se cambió explícitamente
        if (!this.isEditing || this.formData.password) {
          userData.password = this.formData.password;
        }
        
        if (this.isEditing) {
          // Editar gerente existente
          await api.put(`/api/users/${this.currentItemId}`, userData);
          this.showAlert('Gerente actualizado con éxito', 'success');
        } else {
          // Crear nuevo gerente
          await api.post('/api/users', userData);
          this.showAlert('Gerente creado con éxito', 'success');
        }
        
        // Cerrar modal y actualizar datos
        this.showManagerModal = false;
        this.fetchData();
      } catch (error) {
        this.showAlert('Error: ' + error.response?.data?.message || error.message, 'error');
      }
    },
    
    // === USUARIOS ===
    openUserForm(user = null) {
      this.resetForm();
      
      if (user) {
        // Modo edición
        this.isEditing = true;
        this.currentItemId = user._id;
        this.formData.email = user.email;
        this.formData.rol = user.rol;
        this.formData.compania_id = user.compania_id || '';
        this.formData.perfil.nombre = user.perfil?.nombre || '';
      } else {
        // Modo creación
        this.isEditing = false;
        this.formData.rol = 'Usuario'; // Default rol
      }
      
      this.showUserModal = true;
    },
    
    async saveUser() {
      try {
        const userData = {
          email: this.formData.email,
          rol: this.formData.rol,
          perfil: {
            nombre: this.formData.perfil.nombre
          }
        };
        
        // Añadir compañía solo para gerentes
        if (this.formData.rol === 'Gerente') {
          userData.compania_id = this.formData.compania_id;
        }
        
        // Añadir contraseña solo si está creando un nuevo usuario o se cambió explícitamente
        if (!this.isEditing || this.formData.password) {
          userData.password = this.formData.password;
        }
        
        if (this.isEditing) {
          // Editar usuario existente
          await api.put(`/api/users/${this.currentItemId}`, userData);
          this.showAlert('Usuario actualizado con éxito', 'success');
        } else {
          // Crear nuevo usuario
          await api.post('/api/users', userData);
          this.showAlert('Usuario creado con éxito', 'success');
        }
        
        // Cerrar modal y actualizar datos
        this.showUserModal = false;
        this.fetchData();
      } catch (error) {
        this.showAlert('Error: ' + error.response?.data?.message || error.message, 'error');
      }
    },
    
    // === ELIMINACIÓN ===
    confirmDelete(type, id) {
      this.deleteType = type;
      this.itemToDeleteId = id;
      this.showDeleteModal = true;
    },
    
    async deleteItem() {
      try {
        let endpoint;
        let successMessage;
        
        switch (this.deleteType) {
          case 'company':
            endpoint = `/api/companies/${this.itemToDeleteId}`;
            successMessage = 'Compañía eliminada con éxito';
            break;
          case 'manager':
          case 'user':
            endpoint = `/api/users/${this.itemToDeleteId}`;
            successMessage = this.deleteType === 'manager' ? 'Gerente eliminado con éxito' : 'Usuario eliminado con éxito';
            break;
          default:
            throw new Error('Tipo de elemento desconocido');
        }
        
        await api.delete(endpoint);
        this.showAlert(successMessage, 'success');
        
        // Cerrar modal y actualizar datos
        this.showDeleteModal = false;
        this.fetchData();
      } catch (error) {
        this.showAlert('Error: ' + error.response?.data?.message || error.message, 'error');
      }
    },
    
    // Resetear formulario
    resetForm() {
      this.formData = {
        nombre: '',
        direccion: '',
        telefono: '',
        email: '',
        password: '',
        rol: '',
        compania_id: '',
        perfil: {
          nombre: ''
        }
      };
      this.currentItemId = null;
      this.isEditing = false;
    }
  }
}
</script>

<style>
/* UserManagement.css */

:root {
  --color-primary: #8B5A2B;       /* Café principal */
  --color-primary-light: #A67C52; /* Café más claro */
  --color-primary-dark: #6A4419;  /* Café oscuro */
  --color-accent: #D2B48C;        /* Beige tostado */
  --color-accent-light: #F5EBD8;  /* Beige claro */
  --color-danger: #AF4425;        /* Rojo terroso */
  --color-success: #4D7C0F;       /* Verde oliva para success */
  --color-info: #0369A1;          /* Azul para información */
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
.admin-panel-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.admin-panel {
  flex: 1 0 auto;
  max-width: 1280px;
  margin: 1.5rem auto;
  padding: 0 1rem;
}

/* Encabezado de página */
.admin-panel h1 {
  color: var(--color-primary-dark);
  font-weight: 600;
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
}

/* Tabs para navegación */
.border-b {
  border-bottom: 2px solid var(--color-accent);
}

nav.flex {
  display: flex;
  gap: 0.5rem;
}

button.py-2 {
  padding: 0.6rem 1.2rem;
  font-weight: 500;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: var(--transition);
  margin-bottom: -2px;
}

.border-b-2.border-blue-500 {
  border-bottom: 2px solid var(--color-primary);
  color: var(--color-primary);
}

.text-gray-500 {
  color: var(--color-gray-dark);
}

.text-gray-500:hover {
  color: var(--color-primary-light);
}

/* Alertas */
.mb-4.p-4.rounded {
  padding: 1rem;
  border-radius: var(--border-radius);
  margin-bottom: 1rem;
}

.bg-green-100.text-green-700 {
  background-color: rgba(77, 124, 15, 0.1);
  color: var(--color-success);
}

.bg-red-100.text-red-700 {
  background-color: rgba(175, 68, 37, 0.1);
  color: var(--color-danger);
}

.bg-blue-100.text-blue-700 {
  background-color: rgba(3, 105, 161, 0.1);
  color: var(--color-info);
}

/* Encabezados de sección */
.text-xl.font-semibold {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-primary-dark);
}

/* Botones */
.bg-primary {
  background-color: var(--color-primary);
}

.hover\:bg-primary-dark:hover {
  background-color: var(--color-primary-dark);
}

.transition-transform {
  transition: transform 0.3s ease;
}

.hover\:scale-105:hover {
  transform: scale(1.05);
}

.bg-gray-300 {
  background-color: var(--color-gray);
  color: var(--color-text);
  padding: 0.6rem 1.2rem;
  border-radius: var(--border-radius);
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: var(--transition);
  border: none;
}

.hover\:bg-gray-400:hover {
  background-color: var(--color-gray-dark);
  color: var(--color-white);
}

.bg-red-500 {
  background-color: var(--color-danger);
  color: var(--color-white);
  padding: 0.6rem 1.2rem;
  border-radius: var(--border-radius);
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: var(--transition);
  border: none;
}

.hover\:bg-red-600:hover {
  background-color: #8B351E;
}

/* Flex containers */
.flex {
  display: flex;
}

.flex-1 {
  flex: 1;
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

.space-x-4 > * + * {
  margin-left: 1rem;
}

/* Tablas */
.overflow-x-auto {
  overflow-x: auto;
}

.min-w-full {
  min-width: 100%;
}

table.bg-white {
  width: 100%;
  border-collapse: collapse;
  background-color: var(--color-white);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

th.py-2 {
  text-align: left;
  padding: 1rem;
  font-weight: 600;
  background-color: var(--color-accent);
  color: var(--color-text);
  position: sticky;
  top: 0;
}

td.py-2 {
  padding: 0.8rem 1rem;
  border-bottom: 1px solid var(--color-gray);
  vertical-align: middle;
}

tr.hover\:bg-gray-50:hover {
  background-color: var(--color-accent-light);
}

/* Enlaces en tabla */
.text-blue-500 {
  color: var(--color-primary);
  text-decoration: none;
  cursor: pointer;
  margin-right: 0.5rem;
}

.hover\:text-blue-700:hover {
  color: var(--color-primary-dark);
}

.text-red-500 {
  color: var(--color-danger);
  text-decoration: none;
  cursor: pointer;
}

.hover\:text-red-700:hover {
  color: #8B351E;
}

/* Mensaje sin datos */
.py-4.text-center.text-gray-500 {
  padding: 2rem 0;
  color: var(--color-gray-dark);
  font-style: italic;
  text-align: center;
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

/* Filtros para usuarios */
.mb-4.flex.space-x-4 {
  margin-bottom: 1.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

/* Márgines y paddings */
.mb-6 {
  margin-bottom: 1.5rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.mr-2 {
  margin-right: 0.5rem;
}

/* Navbar y Footer */
.navbar {
  background-color: var(--color-primary);
  color: var(--color-white);
  padding: 1rem;
  box-shadow: var(--shadow-sm);
}

.navbar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 auto;
  max-width: 1280px;
}

.navbar-brand {
  font-weight: 700;
  font-size: 1.4rem;
  color: var(--color-white);
  text-decoration: none;
}

.navbar-menu {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.navbar-link {
  color: var(--color-accent-light);
  text-decoration: none;
  font-weight: 500;
  transition: var(--transition);
}

.navbar-link:hover, .navbar-link.active {
  color: var(--color-white);
}

.footer {
  background-color: var(--color-primary-dark);
  color: var(--color-accent-light);
  padding: 1.5rem;
  text-align: center;
  margin-top: 2rem;
}

.footer-content {
  max-width: 1280px;
  margin: 0 auto;
}

.footer-text {
  font-size: 0.9rem;
}

/* Responsividad */
@media (max-width: 768px) {
  .admin-panel h1 {
    font-size: 1.5rem;
  }
  
  .mb-4.flex.space-x-4 {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .flex-1 {
    width: 100%;
  }
  
  table {
    font-size: 0.8rem;
  }
  
  th.py-2, td.py-2 {
    padding: 0.75rem 0.5rem;
  }
  
  button {
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
  }
  
  nav.flex {
    overflow-x: auto;
    width: 100%;
    padding-bottom: 0.5rem;
  }
}

@media (max-width: 480px) {
  .admin-panel {
    padding: 0 0.5rem;
    margin: 1rem auto;
  }
  
  .bg-white.p-6 {
    padding: 1rem;
  }
  
  .justify-between {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .justify-end {
    justify-content: center;
    width: 100%;
  }
  
  button {
    width: 100%;
  }
}
</style>