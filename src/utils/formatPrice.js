module.exports = function formatPrice(price) {
   if (typeof price !== 'string') {
      return 0
   }

   const newPrice = price.trim().replace('.', '')

   return Number(newPrice.replace('R$', '').replace(',', '.'))
}