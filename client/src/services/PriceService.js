class PriceService {
  static formatPrice(price) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  }

  static parsePrice(priceString) {
    // Eliminar símbolos de moneda y separadores de miles
    const cleanPrice = priceString.replace(/[^0-9.-]+/g, '');
    return parseFloat(cleanPrice);
  }

  static formatPriceWithDecimals(price) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  }
}

export default PriceService; 