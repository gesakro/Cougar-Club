<template>
  <div class="payment-brick-overlay">
    <div class="payment-brick-modal">
      <button class="close-btn" @click="$emit('close')">×</button>
      <div id="paymentBrick_container"></div>
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
    }
  },
  emits: ['success', 'close'],
  data() {
    return {
      mpInstance: null,
      brickController: null
    }
  },
  mounted() {
    this.loadMercadoPagoScript();
  },
  methods: {
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
            bankTransfer: 'all'
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
              if (
                result.status === 'approved' ||
                (result.status === 'pending' && result.status_detail === 'pending_waiting_transfer')
              ) {
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
  padding: 1.5rem;
  border-radius: 8px;
  width: 100%;
  max-width: 480px;
  position: relative;
  max-height:90vh;
  overflow-y: auto;
}
.close-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  border: none;
  background: transparent;
  font-size: 1.25rem;
  cursor: pointer;
}

@media (max-width: 600px) {
  .payment-brick-modal {
    max-width: 95%;
    padding: 1rem;
  }
}
</style> 