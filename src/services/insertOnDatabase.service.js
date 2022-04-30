const db = require('../database/connections')
const fs = require('fs')
const path = require('path')
const formatPrice = require('../utils/formatPrice')
require('dotenv').config()

const date = new Date()

module.exports = async function insertValuePrice({ name, image, price, priceClub = 0, marketId }) {

   if (name === 'Coxinha Da Asa De Frango Nabrasa Perdigão Molho De Mostarda Congelada 800g') {
      console.log({ name, image, price, priceClub, marketId })
   }
   if (name === 'Lombo De Bacalhau Oceani 600g') {
      console.log({ name, image, price, priceClub, marketId })
   }
   if (name === 'Filezinho Frango Nat 1kg Sassami Iqf') {
      console.log({ name, image, price, priceClub, marketId })
   }

   if (price !== 0) {
      const [item] = await db`select * from tb_prices where name = ${name}`
      if (!item) {
         await db`insert into tb_prices (name, image, price, priceclub, id_supermarket) values (${name}, ${image}, ${formatPrice(price)}, ${formatPrice(priceClub)}, ${marketId})`
      } else {
         await db`update tb_prices set price = ${formatPrice(price)}, priceclub = ${formatPrice(priceClub)} where name = ${name}`
      }
   } else {
      if (process.env.SAVELOG === true) {
         fs.writeFile(path.resolve(__dirname, '..', '..', 'log', 'log.txt'), `${date}: ERROR-GET-PRODUCT: ${name} \n`, { flag: 'a+' }, err => {
            fs.writeFileSync(path.resolve(__dirname, '..', '..', 'log', 'systemlog.txt'), `${date}: ERROR-WRITE-LOG: ${name} \n`, { flag: 'a+' }, err => { });
         });
      }

   }
}