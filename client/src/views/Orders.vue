<template>
  <div class="orders-history-view">
    <AppNavbar />

    <main class="history-container">
      <div class="breadcrumb">
        <button @click="goBack" class="breadcrumb-link">
          <i class="fas fa-arrow-left"></i> Volver
        </button>
        <h1 class="page-title">Mis Compras</h1>
      </div>

      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
      </div>

      <div v-else-if="error" class="error-message">
        <div class="placeholder-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <h3>Error al cargar el historial</h3>
        <p>{{ error }}</p>
        <button @click="fetchPurchases" class="return-btn">Intentar nuevamente</button>
      </div>

      <div v-else>
        <div v-if="purchases.length === 0" class="empty-state">
          <div class="empty-icon">
            <i class="fas fa-shopping-bag"></i>
          </div>
          <h3>No hay compras registradas</h3>
          <p>Aún no has realizado ninguna compra en nuestra tienda.</p>
          <router-link to="/comercios" class="shop-btn">Ir a comprar</router-link>
        </div>

        <div v-else class="orders-list">
          <div v-for="purchase in purchases" :key="purchase._id" class="order-card">
            <!-- Botón de eliminación discreto -->
            <button 
              @click="confirmDeletePurchase(purchase._id)" 
              class="delete-btn"
              title="Eliminar del historial"
              :disabled="deletingPurchase === purchase._id"
            >
              <i class="fas fa-times"></i>
            </button>

            <div class="order-header">
              <div class="order-meta">
                <span class="order-number">Orden #{{ purchase._id.slice(-6).toUpperCase() }}</span>
                <span class="order-date">{{ formatDate(purchase.fecha) }}</span>
              </div>
              <div class="order-status" :class="getStatusClass(purchase.estado)">
                {{ formatStatus(purchase.estado) }}
              </div>
            </div>

            <div class="order-body">
              <!-- IZQUIERDA: Listado de productos -->
              <div class="order-products">
                <h4>Productos comprados</h4>
                <ul class="products-list">
                  <li
                    v-for="(item, idx) in (purchase.productos || [])"
                    :key="idx"
                    class="product-entry"
                  >
                    <img
                      :src="getProductImage(item)"
                      :alt="item.producto_id?.nombre || 'Producto'"
                      class="thumb"
                      @error="handleImageError"
                    />
                    <div class="info">
                      <strong>{{ item.producto_id?.nombre || 'Producto no disponible' }}</strong>
                      <span>Cantidad: {{ item.cantidad }}</span>
                      <span>{{ formatPrice(item.precioUnitario) }} c/u</span>
                    </div>
                  </li>
                </ul>
              </div>

              <!-- DERECHA: Resumen de pedido -->
              <div class="order-summary">
                <h4>Resumen del pedido</h4>
                <div class="summary-row">
                  <span>Subtotal:</span>
                  <span>{{ formatPrice(calculateSubtotal(purchase)) }}</span>
                </div>
                <div class="summary-row">
                  <span>Envío:</span>
                  <span>{{ formatPrice(purchase.envio || 0) }}</span>
                </div>
                <div class="summary-row total">
                  <span>Total:</span>
                  <span>{{ formatPrice(purchase.totalCompra || purchase.total || 0) }}</span>
                </div>
                <button @click="viewOrderDetails(purchase._id)" class="detail-btn">
                  Ver detalles
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal de confirmación para eliminar -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="cancelDelete">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Confirmar eliminación</h3>
          <button @click="cancelDelete" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>¿Estás seguro de que deseas eliminar esta compra del historial?</p>
          <p class="warning-text">Esta acción no se puede deshacer.</p>
        </div>
        <div class="modal-footer">
          <button @click="cancelDelete" class="cancel-btn">Cancelar</button>
          <button @click="deletePurchase" class="confirm-delete-btn" :disabled="deletingPurchase">
            <span v-if="deletingPurchase">Eliminando...</span>
            <span v-else>Eliminar</span>
          </button>
        </div>
      </div>
    </div>

    <AppFooter />
  </div>
</template>

<script>
import AppNavbar from '@/components/layout/AppNavbar.vue';
import AppFooter from '@/components/layout/AppFooter.vue';
import api from '@/api/api';
import PriceService from '@/services/PriceService';

export default {
  name: 'OrdersHistory',
  components: { AppNavbar, AppFooter },
  data() {
    return { 
      purchases: [], 
      loading: true, 
      error: null,
      showDeleteModal: false,
      purchaseToDelete: null,
      deletingPurchase: null
    };
  },
  methods: {
    goBack() {
      window.history.length > 1 ? this.$router.back() : this.$router.push('/');
    },
    
    async fetchPurchases() {
      this.loading = true; 
      this.error = null;
      
      const userId = localStorage.getItem('userId');
      if (!userId) {
        this.error = 'No se pudo identificar al usuario. Por favor, inicia sesión.';
        this.loading = false;
        return;
      }
      
      try {
        const response = await api.get(`/api/purchases/user/${userId}`, {
          params: {
            populate: 'productos.producto_id'
          }
        });
        this.purchases = response.data;
        console.log('Purchases data:', this.purchases);
      } catch (error) {
        console.error('Error fetching purchases:', error);
        this.error = 'Error al cargar tu historial de compras';
      } finally {
        this.loading = false;
      }
    },

    confirmDeletePurchase(purchaseId) {
      this.purchaseToDelete = purchaseId;
      this.showDeleteModal = true;
    },

    cancelDelete() {
      this.showDeleteModal = false;
      this.purchaseToDelete = null;
    },

    async deletePurchase() {
      if (!this.purchaseToDelete) return;
      
      this.deletingPurchase = this.purchaseToDelete;
      
      try {
        await api.delete(`/api/purchases/${this.purchaseToDelete}`);
        
        // Remover la compra del array local
        this.purchases = this.purchases.filter(p => p._id !== this.purchaseToDelete);
        
        // Cerrar modal
        this.showDeleteModal = false;
        this.purchaseToDelete = null;
        
        // Mostrar mensaje de éxito (opcional)
        this.$toast?.success('Compra eliminada del historial');
        
      } catch (error) {
        console.error('Error deleting purchase:', error);
        this.error = 'Error al eliminar la compra del historial';
        
        // Mostrar mensaje de error (opcional)
        this.$toast?.error('No se pudo eliminar la compra');
      } finally {
        this.deletingPurchase = null;
      }
    },
    
    getProductImage(item) {
      if (!item.producto_id || !item.producto_id.imagen) {
        return '/img/placeholder-product.png';
      }
      
      const imagePath = item.producto_id.imagen;
      
      if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
        return imagePath;
      }
      
      if (imagePath.startsWith('/img/') || imagePath.startsWith('/images/')) {
        return imagePath;
      }
      
      const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:5000';
      
      if (imagePath.startsWith('uploads/')) {
        return `${apiUrl.replace('/api', '')}/${imagePath}`;
      }
      
      return `${apiUrl.replace('/api', '')}/uploads/${imagePath}`;
    },
    
    handleImageError(event) {
      console.warn('Error loading image:', event.target.src);
      event.target.src = '/img/placeholder-product.png';
      event.target.onerror = null;
    },
    
    formatDate(dt) { 
      if (!dt) return 'Fecha no disponible';
      return new Date(dt).toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      }); 
    },
    
    formatPrice(p) { 
      return PriceService.formatPrice(p || 0);
    },
    
    formatStatus(s) { 
      const statusMap = {
        pendiente: 'Pendiente',
        completado: 'Completado',
        cancelado: 'Cancelado',
        enviado: 'Enviado',
        entregado: 'Entregado'
      }; 
      return statusMap[s] || s; 
    },
    
    getStatusClass(s) {
      return {
        pending: s === 'pendiente',
        completed: ['completado', 'entregado'].includes(s),
        cancelled: s === 'cancelado',
        shipped: s === 'enviado'
      };
    },
    
    calculateSubtotal(purchase) { 
      return (purchase.productos || []).reduce((sum, item) => {
        return sum + (item.precioUnitario || 0) * (item.cantidad || 0);
      }, 0); 
    },
    
    viewOrderDetails(id) { 
      this.$router.push(`/orders/${id}`); 
    }
  },
  
  created() { 
    this.fetchPurchases(); 
  }
};
</script>
//.----------
<style scoped>


.delete-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: transparent;
  border: none;
  color: #999;
  font-size: 18px;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  opacity: 0.6;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 450px;
  width: 100%;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  animation: modalFadeIn 0.2s ease;
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
  padding: 20px 20px 0;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
}

.modal-header h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
}

.modal-close {
  background: none;
  border: none;
  font-size: 20px;
  color: #999;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  background: #f5f5f5;
  color: #333;
}

.modal-body {
  padding: 0 20px;
  margin-bottom: 20px;
}

.modal-body p {
  margin: 0 0 10px;
  color: #666;
  line-height: 1.5;
}

.warning-text {
  color: #e74c3c;
  font-size: 14px;
  font-weight: 500;
}

.modal-footer {
  display: flex;
  gap: 10px;
  padding: 0 20px 20px;
  justify-content: flex-end;
}

.cancel-btn,
.confirm-delete-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.cancel-btn {
  background: #f8f9fa;
  color: #6c757d;
  border: 1px solid #dee2e6;
}

.cancel-btn:hover {
  background: #e9ecef;
}

.confirm-delete-btn {
  background: #e74c3c;
  color: white;
}

.confirm-delete-btn:hover:not(:disabled) {
  background: #c0392b;
}

.confirm-delete-btn:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

.delete-btn:hover {
  background: #f5f5f5;
  color: #e74c3c;
  opacity: 1;
  transform: scale(1.1);
}

.delete-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}


.order-card {
  position: relative;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}


.orders-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.order-card {
  background: #f9f9f9;
  padding: 1rem;
  border-radius: 8px;
}
.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.order-body {
  display: grid;
  grid-template-columns: 3fr 1fr;
  gap: 1rem;
}
.order-products {
  background: #fff;
  padding: 1rem;
  border-radius: 8px;
}
.products-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.product-entry {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}
.thumb {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}
.info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.25rem;
}
.order-summary {
  background: #fff;
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-start;
}
.summary-row {
  display: flex;
  justify-content: space-between;
  width: 100%;
}
.summary-row.total {
  font-weight: bold;
  border-top: 1px solid #e0e0e0;
  padding-top: 0.5rem;
}

.orders-history-view {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8f9fa;
}

.history-container {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem 1rem;
  flex: 1;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.breadcrumb-link {
  display: inline-flex;
  align-items: center;
  color: #666;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.breadcrumb-link:hover {
  color: #b38b6d;
}

.breadcrumb-link i {
  margin-right: 0.5rem;
}

.page-title {
  font-size: 2rem;
  color: #333;
  margin: 0;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(179, 139, 109, 0.3);
  border-radius: 50%;
  border-top-color: #b38b6d;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-message {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.placeholder-icon {
  margin: 0 auto 1.5rem;
  width: 80px;
  height: 80px;
  color: #b38b6d;
  opacity: 0.7;
  font-size: 3rem;
}

.return-btn {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  background-color: #b38b6d;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.3s;
  border: none;
  cursor: pointer;
}

.return-btn:hover {
  background-color: #9a735a;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.empty-icon {
  font-size: 3rem;
  color: #b38b6d;
  opacity: 0.7;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #666;
  margin-bottom: 1.5rem;
}

.shop-btn {
  display: inline-block;
  padding: 0.75rem 2rem;
  background-color: #b38b6d;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 600;
  transition: background-color 0.3s;
}

.shop-btn:hover {
  background-color: #9a735a;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.order-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  overflow: hidden;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid #eee;
}

.order-meta {
  display: flex;
  flex-direction: column;
}

.order-number {
  font-weight: 600;
  color: #333;
}

.order-date {
  font-size: 0.85rem;
  color: #666;
}

.order-status {
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 600;
}

.order-status.pending {
  background-color: #fff3cd;
  color: #856404;
}

.order-status.completed {
  background-color: #d4edda;
  color: #155724;
}

.order-status.cancelled {
  background-color: #f8d7da;
  color: #721c24;
}

.order-status.shipped {
  background-color: #cce5ff;
  color: #004085;
}

.order-body {
  padding: 1.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
}

.order-products {
  flex: 1;
  min-width: 300px;
}

.product-item {
  display: flex;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #f1f1f1;
}

.product-item:last-child {
  border-bottom: none;
}

.product-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}

.product-info {
  flex: 1;
}

.product-name {
  font-size: 1rem;
  margin: 0 0 0.5rem;
  color: #333;
}

.product-quantity {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.product-price {
  font-weight: 600;
  color: #b38b6d;
}

.more-items {
  padding: 1rem 0;
  color: #666;
  font-size: 0.9rem;
}

.order-summary {
  width: 250px;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
}

.summary-row.total {
  font-weight: 600;
  font-size: 1rem;
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid #ddd;
}

.order-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #eee;
}

.detail-btn {
  padding: 0.5rem 1.25rem;
  background-color: #f1f1f1;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.detail-btn:hover {
  background-color: #e1e1e1;
}

.return-btn {
  padding: 0.5rem 1.25rem;
  background-color: #b38b6d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.return-btn:hover {
  background-color: #9a735a;
}

@media (max-width: 768px) {
  .order-body {
    flex-direction: column;
    gap: 1rem;
  }

  .delete-btn {
    top: 5px;
    right: 5px;
    width: 28px;
    height: 28px;
    font-size: 16px;
  }
  
  .modal-overlay {
    padding: 10px;
  }
  
  .modal-content {
    max-width: 100%;
  }
  
  .modal-footer {
    flex-direction: column;
  }
  
  .cancel-btn,
  .confirm-delete-btn {
    width: 100%;
  }
  
  .order-summary {
    width: 100%;
  }
  
  .order-footer {
    justify-content: center;
  }
}
</style>