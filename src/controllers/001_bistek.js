const cheerio = require('cheerio')
const request = require('request');

const insertValuePrice = require('../services/insertOnDatabase.service')


module.exports = {
   async updateBistek() {

      request('https://www.bistek.com.br/', function (err, res, body) {
         if (err) {
            console.log(err, "error occured while hitting URL");
         } else {
            let $ = cheerio.load(body);
            let validPages = []
            $('ul.navigation__inner-list').each(function (index) {
               const page = $(this).find('a.navigation__inner-link').attr('href');
               if (page !== '#') {
                  validPages.push(`${page}?product_list_limit=all`)
               }

            })
            let index = 0
            const pages = [...new Set(validPages)]

            while (index < pages.length) {
               request(pages[index], function (err, res, body) {
                  if (err) {
                     console.log(err, "error occured while hitting URL for specific page: ", pages[index]);
                  } else {
                     let $ = cheerio.load(body);

                     $('div.product-item-info').each(async function () {
                        const image = $(this).find('a > span > span > img').attr('src');
                        const name = $(this).find('div.product-item-details > strong > a').text();
                        const price = $(this).find('div.product-item-details > div.price-box > span > span > .price').text();
                        const item = {
                           image,
                           name: name.trim(),
                           price,
                        }

                        if (price === '') {
                           const finalPrice = $(this).find('span[data-price-type="finalPrice"]').text();
                           const priceClub = $(this).find('.clube-bistek > .price').text();
                           item.price = finalPrice
                           item.priceClub = priceClub
                        }

                        item.marketId = 1



                        await insertValuePrice(item)
                     });
                  }
               })

               index++
            }
         }
      });
   }
}