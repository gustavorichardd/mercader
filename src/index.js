const rp = require('request-promise')
const cheerio = require('cheerio')
const request = require('request');
const fs = require('fs');
const db = require('./database/connections')


const superMarkets = [
   {
      id: 1,
      url: 'https://www.bistek.com.br/',
      sections: 'a.navigation__inner-link',
      productDetails: {
         tag: 'div.product-item-info',
         image: 'a > span > span > img',
         name: 'div.product-item-details > strong > a',
         price: 'div.product-item-details > div.price-box > span > span > .price',
         priceSpecial: '.special-price > span > span > .price',
         priceClub: '.price-clube-bistek'
      }
   },
   {
      id: 2,
      url: 'https://www.deliveryfort.com.br/',
      sections: 'li.navigation__inner-item > a.navigation__inner-link',
      productDetails: {
         tag: 'div.product-item-info',
         image: 'a > span > span > img',
         name: 'div.product-item-details > strong > a',
         price: 'div.product-item-details > div.price-box > span > span > .price',
         priceSpecial: '.special-price > span > span > .price',
         priceClub: '.price-clube-bistek'
      }
   }
]

async function insertValuePrice({ name, image, price, priceClub = 0, marketId }) {
   console.log({ name, image, price, priceClub, marketId })
   await db`
     insert into tb_prices
       (name, image, price, priceclub, id_supermarket)
     values
       (${name}, ${image}, ${price}, ${priceClub}, ${marketId})
   `

   return null;
}

function formatPrice(price) {
   const newPrice = price.trim()
   return Number(newPrice.slice(newPrice.length - 5, newPrice.length).replace(',', '.'))
}

for (const market of superMarkets) {
   request(market.url, function (err, res, body) {
      if (err) {
         console.log(err, "error occured while hitting URL");
      } else {
         let $ = cheerio.load(body);
         let validPages = []
         $('ul.navigation__inner-list').each(function (index) {
            const page = $(this).find(market.sections).attr('href');
            if (page !== '#') {
               validPages.push(`${page}?product_list_limit=all`)
            }

         })
         let index = 0
         const pages = [...new Set(validPages)]

         while (index < pages.length) {
            console.log(pages[index], "PROCESS STARTED.")
            request(pages[index], function (err, res, body) {
               if (err) {
                  console.log(err, "error occured while hitting URL for specific page: ", pages[index]);
               } else {
                  let $ = cheerio.load(body);

                  $(market.productDetails.tag).each(async function () {
                     const image = $(this).find(market.productDetails.image).attr('src');
                     const name = $(this).find(market.productDetails.name).text();
                     const price = $(this).find(market.productDetails.price).text();
                     const item = {
                        image,
                        name: name.trim(),
                        price: formatPrice(price),
                     }

                     if (price === 0) {
                        const priceSpecial = $(this).find(market.productDetails.priceSpecial).text();
                        const priceClub = $(this).find(market.productDetails.priceClub).text();
                        console.log(priceClub)
                        // delete item.price
                        // item.price = formatPrice(priceSpecial)
                        item.priceClub = formatPrice(priceClub)
                     }

                     item.marketId = market.id

                     await insertValuePrice(item)
                  });
               }
            })

            console.log(pages[index], "PROCESS FINISHED.")
            index++
         }
         console.log('PROCESS FINISHED...')
      }
   });
}