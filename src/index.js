const rp = require('request-promise')
const cheerio = require('cheerio')
const request = require('request');
const fs = require('fs');
const db = require('./database/connections')


const superMarkets = {
   bistekPromo: {
      url: 'https://www.bistek.com.br/',
      productDetails: {
         tag: 'div.product-item-info',
         image: 'a > span > span > img',
         name: 'div.product-item-details > strong > a',
         price: 'div.product-item-details > div.price-box > span > span > .price',
         priceSpecial: '.special-price > span > span > .price',
         priceClub: '.price-clube-bistek'
      }
   },
   angeloni: {
      url: 'https://www.bistek.com.br/',
      productDetails: {
         tag: 'div.product-item-info',
         image: 'a > span > span > img',
         name: 'div.product-item-details > strong > a',
         price: 'div.product-item-details > div.price-box > span > span > .price',
         priceSpecial: '.special-price > span > span > .price',
         priceClub: '.price-clube-bistek'
      }
   }
}

async function insertValuePrice({ name, image, price, priceClub = 0 }) {
   await db`
     insert into tb_prices
       (name, image, price, priceClub)
     values
       (${name}, ${image}, ${price}, ${priceClub})
   `
}

function formatPrice(price) {
   const newPrice = price.trim()
   return Number(newPrice.slice(newPrice.length - 5, newPrice.length).replace(',', '.'))
}

request(superMarkets.bistekPromo.url, function (err, res, body) {
   if (err) {
      console.log(err, "error occured while hitting URL");
   } else {
      let $ = cheerio.load(body);
      let validPages = []
      $('ul.navigation__inner-list').each(function (index) {
         const page = $(this).find('li.navigation__inner-item > a.navigation__inner-link').attr('href');
         if (page !== '#')
            validPages.push(page)
      })
      let index = 0
      const pages = [...new Set(validPages)]

      while (index < pages.length) {
         console.log(`${pages[index]}?product_list_limit=all`, "PROCESS STARTED.")
         request(`${pages[index]}?product_list_limit=all`, function (err, res, body) {
            if (err) {
               console.log(err, "error occured while hitting URL for specific page: ", pages[index]);
            } else {
               let $ = cheerio.load(body);

               $(superMarkets.bistekPromo.productDetails.tag).each(function (index) {
                  const image = $(this).find(superMarkets.bistekPromo.productDetails.image).attr('src');
                  const name = $(this).find(superMarkets.bistekPromo.productDetails.name).text();
                  const price = $(this).find(superMarkets.bistekPromo.productDetails.price).text();
                  const item = {
                     image,
                     name: name.trim(),
                     price: formatPrice(price),
                  }

                  if (price === 0) {
                     const priceSpecial = $(this).find(superMarkets.bistekPromo.productDetails.priceSpecial).text();
                     const priceClub = $(this).find(superMarkets.bistekPromo.productDetails.priceClub).text();
                     delete item.price
                     item.price = formatPrice(priceSpecial)
                     item.priceClub = formatPrice(priceClub)

                  }

                  insertValuePrice(item)
               });
            }
         })

         console.log(`${pages[index]}?product_list_limit=all`, "PROCESS FINISHED.")
         index++
      }
      console.log('PROCESS FINISHED...')
   }
});