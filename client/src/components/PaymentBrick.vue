<template>
  <div class="payment-brick-overlay">
    <div class="payment-brick-modal">
      <button class="close-btn" @click="$emit('close')">×</button>
      <div class="payment-modal-header">
        <h2>Pagar tu plan</h2>
        <p class="summary">
          Plan: <b>{{ planName }}</b> — <b>{{ formattedAmount }}</b>
        </p>
        <p class="secure-msg"><i class="fas fa-lock"></i> Pago 100% seguro con MercadoPago</p>
      </div>
      <div id="paymentBrick_container"></div>
    </div>
    <div v-if="showCouponModal" class="coupon-modal-overlay">
      <div class="coupon-modal">
        <div class="coupon-modal-icon">
          <i class="fas fa-ticket-alt"></i>
        </div>
        <h3>¡Cupón generado!</h3>
        <p>Recibirás instrucciones en tu correo para completar el pago en Efecty, Baloto u otro punto autorizado.<br>El pago se acreditará cuando completes el proceso.</p>
        <button class="coupon-modal-btn" @click="closeCouponModal">Entendido</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PaymentBrick',
  props: {
    amount: {
      type: Number,
      required: true
    },
    extraPayer: {
      type: Object,
      default: () => ({})
    },
    plan: {
      type: String,
      default: ''
    }
  },
  emits: ['success', 'close'],
  data() {
    return {
      mpInstance: null,
      brickController: null,
      showCouponModal: false
    }
  },
  computed: {
    formattedAmount() {
      return this.amount.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
    },
    planName() {
      if (this.amount === 29900) return 'Mensual';
      if (this.amount === 299900) return 'Anual';
      return 'Sin especificar';
    }
  },
  mounted() {
    this.loadMercadoPagoScript();
  },
  methods: {
    closeCouponModal() {
      this.showCouponModal = false;
      this.$emit('success');
    },
    loadMercadoPagoScript() {
      if (window.MercadoPago) {
        this.initializeBrick();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://sdk.mercadopago.com/js/v2';
      script.onload = this.initializeBrick;
      document.body.appendChild(script);
    },
    async initializeBrick() {
      const publicKey = process.env.VUE_APP_MP_PUBLIC_KEY || process.env.MP_PUBLIC_KEY || 'TEST-00000000-0000-0000-0000-000000000000';
      console.log('Public Key:', publicKey);
      if (typeof publicKey !== 'string' || !publicKey.trim() || publicKey === 'undefined') {
        console.error('Public Key must be a non-empty string. Received:', publicKey);
        return;
      }
      this.mpInstance = new window.MercadoPago(publicKey, {
        locale: 'es-CO'
      });

      const bricksBuilder = this.mpInstance.bricks();
      if (this.brickController) {
        this.brickController.unmount();
      }
      this.brickController = await bricksBuilder.create('payment', 'paymentBrick_container', {
        initialization: {
          amount: Math.round(this.amount),
          payer: {
            ...this.extraPayer
          }
        },
        customization: {
          paymentMethods: {
            creditCard: 'all',
            debitCard: 'all',
            bankTransfer: 'all',
            ticket: 'all',
            wallet_purchase: 'all'
          },
          visual: {
            style: {
              theme: 'default'
            }
          }
        },
        callbacks: {
          onSubmit: async (formData) => {
            console.log('Payment Brick formData:', formData);
            try {
              const pureData = formData.formData || formData;
              console.log('Pure data to backend:', pureData);
              const response = await fetch(`${process.env.VUE_APP_API_URL || 'http://localhost:5000/api'}/payments/create`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  ...pureData,
                  amount: this.amount
                })
              });

              const result = await response.json();
              const paymentMethod = result.payment?.payment_method_id || result.payment_method_id || pureData.payment_method_id;
              if (result.status === 'approved') {
                this.$emit('success');
              } else if (
                result.status === 'pending' &&
                ['efecty', 'baloto', 'gana'].includes(paymentMethod)
              ) {
                // Mostrar modal solo si el método de pago es efectivo
                this.showCouponModal = true;
              } else if (
                result.status === 'pending' &&
                paymentMethod === 'pse'
              ) {
                alert('Pago procesado con éxito!.');
                this.$emit('success');
              } else {
                alert(`El pago fue procesado con estado: ${result.status_detail}`);
              }
              return result;
            } catch (error) {
              console.error('Error al enviar el formulario de pago:', error);
              alert('Ocurrió un error al procesar el pago.');
            }
          },
          onError: (error) => {
            console.error('Error en Payment Brick:', error);
            alert('Ocurrió un error en el componente de pago.');
          },
          onReady: () => {
            // Opcional: puedes poner un loader aquí si quieres
            // console.log('Brick listo');
          }
        }
      });
    }
  },
  beforeUnmount() {
    if (this.brickController) {
      this.brickController.unmount();
    }
  }
}
</script>

<style scoped>
.payment-brick-overlay {
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
}
.payment-brick-modal {
  background: white;
  padding: 1.5rem 1.5rem 2rem 1.5rem;
  border-radius: 16px;
  width: 100%;
  max-width: 480px;
  position: relative;
  max-height:90vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(115, 97, 76, 0.10), 0 1.5px 6px rgba(64, 18, 2, 0.06);
}
.close-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  border: none;
  background: transparent;
  font-size: 1.5rem;
  cursor: pointer;
  color: #73614C;
  transition: color 0.2s;
}
.close-btn:hover {
  color: #401202;
}
.payment-modal-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1.2rem;
}
.payment-modal-header h2 {
  font-size: 1.3rem;
  color: #73614C;
  font-weight: 700;
  margin: 0.2rem 0 0.5rem 0;
}
.payment-modal-header .summary {
  color: #333;
  font-size: 1.08rem;
  margin-bottom: 0.2rem;
}
.payment-modal-header .secure-msg {
  color: #4CAF50;
  font-size: 0.98rem;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.payment-modal-header .secure-msg i {
  font-size: 1.1rem;
}

/* Modal visual para cupón generado */
.coupon-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}
.coupon-modal {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(115, 97, 76, 0.13), 0 1.5px 6px rgba(64, 18, 2, 0.09);
  padding: 2.2rem 2rem 1.5rem 2rem;
  max-width: 350px;
  width: 90vw;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.coupon-modal-icon {
  font-size: 2.5rem;
  color: #73614C;
  margin-bottom: 0.7rem;
}
.coupon-modal h3 {
  color: #401202;
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.7rem;
}
.coupon-modal p {
  color: #333;
  font-size: 1.05rem;
  margin-bottom: 1.2rem;
}
.coupon-modal-btn {
  background: linear-gradient(90deg, #73614C 0%, #401202 100%);
  color: #fff;
  font-weight: 600;
  font-size: 1.05rem;
  border-radius: 8px;
  padding: 0.7rem 2.2rem;
  border: none;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s, transform 0.2s;
}
.coupon-modal-btn:hover {
  background: linear-gradient(90deg, #401202 0%, #73614C 100%);
  box-shadow: 0 4px 16px rgba(115, 97, 76, 0.18);
  transform: translateY(-2px) scale(1.03);
}
@media (max-width: 600px) {
  .payment-brick-modal {
    max-width: 95%;
    padding: 1rem 0.5rem 1.5rem 0.5rem;
  }
}
</style> 