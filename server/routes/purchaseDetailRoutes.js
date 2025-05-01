const express = require('express');
const router = express.Router();
const purchaseDetailController = require('../controllers/purchaseDetailController');

// Crear detalle de compra
router.post('/', purchaseDetailController.createPurchaseDetail);

// Obtener detalles por ID de compra (ejemplo: /api/purchase-details/purchase/ID_COMPRA)
router.get('/purchase/:purchaseId', purchaseDetailController.getPurchaseDetailsByPurchase);

// Actualizar detalle de compra
router.put('/:id', purchaseDetailController.updatePurchaseDetail);

// Eliminar detalle de compra
router.delete('/:id', purchaseDetailController.deletePurchaseDetail);

module.exports = router;
