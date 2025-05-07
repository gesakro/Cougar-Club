<template>
  <div class="upload-container" v-if="isAuthorized">
    <div class="upload-card">
      <h3 class="upload-title">Subir Imagen</h3>
      <div class="upload-area">
        <label for="file-upload" class="custom-file-upload">
          <i class="fas fa-cloud-upload-alt"></i>
          Seleccionar archivo
        </label>
        <input id="file-upload" type="file" @change="uploadImage" accept="image/*" />
      </div>
      <div v-if="uploading" class="upload-progress">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
        </div>
        <p>Subiendo imagen: {{ uploadProgress }}%</p>
      </div>
      <div v-if="imageUrl" class="upload-preview">
        <p>Imagen subida correctamente</p>
        <img :src="imageUrl" alt="Vista previa" class="preview-image" />
        <div class="preview-actions">
          <a :href="imageUrl" target="_blank" class="view-btn">
            <i class="fas fa-external-link-alt"></i> Ver imagen
          </a>
          <button @click="resetUpload" class="reset-btn">
            <i class="fas fa-redo"></i> Subir otra
          </button>
        </div>
      </div>
      <div v-if="errorMessage" class="upload-error">
        <i class="fas fa-exclamation-circle"></i>
        <p>{{ errorMessage }}</p>
      </div>
    </div>
  </div>
  <div v-else class="unauthorized-message">
    <i class="fas fa-lock"></i>
    <h3>Acceso restringido</h3>
    <p>No tienes permisos para subir imágenes. Esta funcionalidad está disponible solo para Administradores y Gerentes.</p>
  </div>
</template>

<script>
import { ref as storageRef,  uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../config.js"; // ajusta la ruta si es necesario
import { ref, computed, onMounted } from 'vue';

export default {
  setup() {
    const imageUrl = ref(null);
    const uploading = ref(false);
    const errorMessage = ref('');
    const userRole = ref('');
    const uploadProgress = ref(0);
    
    // Computed property para verificar si el usuario está autorizado
    const isAuthorized = computed(() => {
      return userRole.value === 'Administrador' || userRole.value === 'Gerente';
    });
    
    // Obtener el rol del usuario del localStorage al montar el componente
    onMounted(() => {
      userRole.value = localStorage.getItem('userRole') || '';
      console.log('Rol del usuario:', userRole.value);
    });
    
    const uploadImage = async (e) => {
      // Verificar autorización nuevamente por seguridad
      if (!isAuthorized.value) {
        errorMessage.value = 'No tienes permisos para realizar esta acción';
        return;
      }
      
      const file = e.target.files[0];
      if (!file) return;
      
      // Validar que sea una imagen
      if (!file.type.includes('image/')) {
        errorMessage.value = 'Por favor, selecciona un archivo de imagen válido';
        return;
      }
      
      // Validar tamaño del archivo (10MB max)
      const maxSize = 10 * 1024 * 1024; // 10MB en bytes
      if (file.size > maxSize) {
        errorMessage.value = 'La imagen excede el tamaño máximo permitido (10MB)';
        return;
      }
      
      errorMessage.value = '';
      uploading.value = true;
      uploadProgress.value = 0;
      
      try {
        // Crear una referencia única con timestamp
        const timestamp = new Date().getTime();
        const fileRef = storageRef(storage, `imagenes/${timestamp}_${file.name.replace(/\s+/g, '_')}`);
        
        // Usar uploadBytesResumable para seguimiento del progreso
        const uploadTask = uploadBytesResumable(fileRef, file);
        
        // Monitorear progreso de la carga
        uploadTask.on('state_changed', 
          (snapshot) => {
            const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            uploadProgress.value = progress;
          },
          (error) => {
            console.error("Error al subir imagen:", error);
            errorMessage.value = 'Error al subir la imagen. Por favor, intenta de nuevo.';
            uploading.value = false;
          },
          async () => {
            // Carga completada exitosamente
            try {
              imageUrl.value = await getDownloadURL(uploadTask.snapshot.ref);
              uploading.value = false;
            } catch (urlError) {
              console.error("Error al obtener URL:", urlError);
              errorMessage.value = 'Error al obtener la URL de la imagen.';
              uploading.value = false;
            }
          }
        );
      } catch (error) {
        console.error("Error general:", error);
        errorMessage.value = 'Error inesperado. Por favor, intenta de nuevo.';
        uploading.value = false;
      }
    };
    
    const resetUpload = () => {
      imageUrl.value = null;
      errorMessage.value = '';
      uploadProgress.value = 0;
      // Limpiar el input file
      const fileInput = document.getElementById('file-upload');
      if (fileInput) {
        fileInput.value = '';
      }
    };
    
    return {
      imageUrl,
      uploading,
      errorMessage,
      uploadProgress,
      isAuthorized,
      uploadImage,
      resetUpload
    };
  }
};
</script>

<style scoped>
:root {
  --primary-color: #73614C;
  --secondary-color: #401202;
  --accent-color: #ff6b6b;
  --background-color: #f3e6d5;
  --card-background: #ffffff;
  --text-color: #333333;
  --text-light: #777777;
  --border-color: #e1e5ea;
  --shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
  --transition: all 0.3s ease;
}

.upload-container {
  max-width: 600px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.upload-card {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
  padding: 2rem;
  overflow: hidden;
}

.upload-title {
  color: #73614C;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  text-align: center;
  position: relative;
  padding-bottom: 0.8rem;
}

.upload-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background-color: #73614C;
}

.upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1.5rem;
}

input[type="file"] {
  display: none;
}

.custom-file-upload {
  background: linear-gradient(135deg, #73614C, #401202);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.custom-file-upload:hover {
  background: #401202;
  box-shadow: 0 4px 12px rgba(64, 18, 2, 0.3);
}

.custom-file-upload i {
  font-size: 1.2rem;
}

.upload-progress {
  margin: 1.5rem 0;
  text-align: center;
}

.progress-bar {
  height: 8px;
  background-color: #e1e5ea;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background-color: #73614C;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.upload-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

.preview-image {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  border: 1px solid #e1e5ea;
}

.preview-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.view-btn, .reset-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1.2rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.view-btn {
  background-color: #73614C;
  color: white;
  text-decoration: none;
}

.view-btn:hover {
  background-color: #401202;
}

.reset-btn {
  background-color: #f3e8d5;
  color: #333333;
  border: 1px solid #e1e5ea;
}

.reset-btn:hover {
  background-color: #e1e5ea;
}

.upload-error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #ffebee;
  color: #e53935;
  padding: 0.8rem;
  border-radius: 8px;
  margin-top: 1rem;
}

.upload-error i {
  font-size: 1.2rem;
}

.unauthorized-message {
  text-align: center;
  padding: 3rem 1rem;
  background-color: #f3e8d5;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
  max-width: 600px;
  margin: 2rem auto;
}

.unauthorized-message i {
  font-size: 3rem;
  color: #401202;
  margin-bottom: 1rem;
}

.unauthorized-message h3 {
  color: #401202;
  font-size: 1.8rem;
  margin-bottom: 1rem;
}

.unauthorized-message p {
  color: #73614C;
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .upload-card {
    padding: 1.5rem;
  }
  
  .preview-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .view-btn, .reset-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>