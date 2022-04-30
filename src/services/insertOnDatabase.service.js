const db = require('../database/connections')
const fs = require('fs')
const path = require('path')
const formatPrice = require('../utils/formatPrice')
require('dotenv').config()

const date = new Date()

module.exports = async function insertValuePrice({ name, image, price, betterPrice = 0, marketId }) {

   if (name === 'Creme de Leite Tirol Tetra Pak 200g') {
      console.log({ name, image, price, betterPrice, marketId })
   }
   if (name === 'Coxa da Asa de Frango Lar 1kg') {
      console.log({ name, image, price, betterPrice, marketId })
   }



   // if (price !== 0) {
   //    const [item] = await db`select * from tb_prices where name = ${name}`
   //    if (!item) {
   //       await db`insert into tb_prices (name, image, price, betterprice, id_supermarket) values (${name}, ${image}, ${formatPrice(price)}, ${formatPrice(betterPrice)}, ${marketId})`
   //    } else {
   //       await db`update tb_prices set price = ${formatPrice(price)}, betterprice = ${formatPrice(betterPrice)} where name = ${name}`
   //    }
   // } else {
   //    if (process.env.SAVELOG === true) {
   //       fs.writeFile(path.resolve(__dirname, '..', '..', 'log', 'log.txt'), `${date}: ERROR-GET-PRODUCT: ${name} \n`, { flag: 'a+' }, err => {
   //          fs.writeFileSync(path.resolve(__dirname, '..', '..', 'log', 'systemlog.txt'), `${date}: ERROR-WRITE-LOG: ${name} \n`, { flag: 'a+' }, err => { });
   //       });
   //    }

   // }
}