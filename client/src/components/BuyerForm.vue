<template>
  <div class="overlay">
    <div class="modal">
      <button class="close" @click="$emit('close')">×</button>
      <div class="modal-header">
        <h3>Datos del comprador</h3>
        <p>Complete sus datos para continuar con la compra</p>
      </div>
      <form @submit.prevent="submit" class="buyer-form">
        <div class="form-group">
          <label>Nombre completo</label>
          <div class="input-with-icon">
            <i class="fas fa-user"></i>
            <input 
              v-model="form.name" 
              :required="!form.name"
              placeholder="Ingrese su nombre completo"
            />
          </div>
        </div>
        
        <div class="form-group">
          <label>Dirección</label>
          <div class="input-with-icon">
            <i class="fas fa-home"></i>
            <input 
              v-model="form.address" 
              :required="!form.address"
              placeholder="Ingrese su dirección"
            />
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Ciudad</label>
            <div class="input-with-icon">
              <i class="fas fa-city"></i>
              <input 
                v-model="form.city" 
                required
                placeholder="Ciudad"
              />
            </div>
          </div>
          
          <div class="form-group">
            <label>Código postal</label>
            <div class="input-with-icon">
              <i class="fas fa-map-pin"></i>
              <input 
                v-model="form.zip" 
                required
                placeholder="Código postal"
              />
            </div>
          </div>
        </div>
        
        <div class="form-group">
          <label>Teléfono</label>
          <div class="input-with-icon">
            <i class="fas fa-phone"></i>
            <input 
              v-model="form.phone" 
              :required="!form.phone"
              placeholder="Número de teléfono"
            />
          </div>
        </div>
        
        <div class="form-group">
          <label>Correo electrónico</label>
          <div class="input-with-icon">
            <i class="fas fa-envelope"></i>
            <input 
              type="email" 
              v-model="form.email" 
              :required="!form.email"
              placeholder="correo@ejemplo.com"
            />
          </div>
        </div>
        
        <button class="continue-btn" :disabled="isLoading">
          <i class="fas fa-credit-card" v-if="!isLoading"></i>
          <i class="fas fa-spinner fa-spin" v-else></i>
          {{ isLoading ? 'Cargando...' : 'Continuar a pago' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import apiClient from '@/services/axiosConfig';

export default {
  name: 'BuyerForm',
  data() {
    return {
      form: {
        name: '',
        address: '',
        city: '',
        zip: '',
        phone: '',
        email: ''
      },
      isLoading: true
    }
  },
  async created() {
    try {
      // Obtener datos del perfil del usuario
      const response = await apiClient.get('/users/profile');
      const userProfile = response.data;

      // Rellenar el formulario con los datos del perfil
      this.form = {
        name: userProfile.nombre || '',
        address: userProfile.direccion || '',
        city: '', // No se toma del perfil
        zip: '', // No se toma del perfil
        phone: userProfile.telefono || '',
        email: userProfile.email || ''
      };
    } catch (error) {
      console.error('Error al cargar datos del perfil:', error);
    } finally {
      this.isLoading = false;
    }
  },
  methods: {
    submit() {
      this.$emit('continue', { ...this.form, entity_type: 'individual' })
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');

:root {
  --primary-color: #73614C;
  --secondary-color: #401202;
  --accent-color: #ff6b6b;
  --background-color: #f3e8d5;
  --card-background: #ffffff;
  --text-color: #333333;
  --text-light: #777777;
  --border-color: #e1e5ea;
  --shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
  --transition: all 0.3s ease;
}

* {
  box-sizing: border-box;
}

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  backdrop-filter: blur(5px);
  font-family: 'Poppins', sans-serif;
}

.modal {
  background: var(--card-background);
  border-radius: 12px;
  width: 95%;
  max-width: 600px;
  max-height: 90vh;
  overflow: auto;
  position: relative;
  box-shadow: var(--shadow);
  margin: 1rem;
}

.close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  border: none;
  background: transparent;
  font-size: 1.5rem;
  color: var(--text-light);
  cursor: pointer;
  transition: var(--transition);
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  z-index: 10;
}

.close:hover {
  background: var(--border-color);
  color: var(--text-color);
}

.modal-header {
  text-align: center;
  padding: 2.5rem 2.5rem 1rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  font-size: 2rem;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.modal-header p {
  color: var(--text-light);
  font-size: 0.95rem;
}

.buyer-form {
  padding: 2rem 2.5rem 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: var(--text-color);
  font-size: 0.95rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.input-with-icon i {
  position: absolute;
  left: 1rem;
  color: var(--text-light);
  z-index: 1;
}

.input-with-icon input {
  width: 100%;
  padding: 0.8rem 1rem 0.8rem 2.5rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  transition: var(--transition);
  background: var(--card-background);
  color: var(--text-color);
  font-family: 'Poppins', sans-serif;
}

.input-with-icon input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(115, 97, 76, 0.2);
}

.input-with-icon input::placeholder {
  color: var(--text-light);
}

.continue-btn {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-family: 'Poppins', sans-serif;
}

.continue-btn:hover:not(:disabled) {
  background: var(--secondary-color);
  box-shadow: 0 4px 12px rgba(115, 97, 76, 0.3);
}

.continue-btn:disabled {
  background: #cccccc;
  cursor: not-allowed;
  box-shadow: none;
}

.continue-btn i {
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .modal {
    width: 98%;
    margin: 0.5rem;
  }
  
  .modal-header {
    padding: 2rem 1.5rem 1rem;
  }
  
  .modal-header h3 {
    font-size: 1.6rem;
  }
  
  .buyer-form {
    padding: 1.5rem;
    gap: 1.2rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 1.2rem;
  }
  
  .input-with-icon input {
    padding: 0.7rem 0.9rem 0.7rem 2.3rem;
  }
  
  .close {
    top: 0.8rem;
    right: 0.8rem;
    width: 32px;
    height: 32px;
    font-size: 1.3rem;
  }
}

@media (max-width: 480px) {
  .modal-header h3 {
    font-size: 1.4rem;
  }
  
  .modal-header p {
    font-size: 0.9rem;
  }
  
  .buyer-form {
    padding: 1rem;
    gap: 1rem;
  }
}
</style>