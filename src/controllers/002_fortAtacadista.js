const cheerio = require('cheerio')
const request = require('request');

const insertValuePrice = require('../services/insertOnDatabase.service')


module.exports = {
   async updateFortAtacadista() {

      request('https://www.deliveryfort.com.br/', function (err, res, body) {
         if (err) {
            console.log(err, "error occured while hitting URL");
         } else {
            let $ = cheerio.load(body);
            let validPages = []
            // $('body > header > div.header__menu--content > div > div > nav > ul').each(function (index) {
            $('div.header-main-menu-drop-block--split').each(function (index) {
               const page = $(this).find('a').attr('href');

               if (page !== undefined) {
                  validPages.push(`https://www.deliveryfort.com.br${page}`)
               }


            })
            let index = 0
            validPages.push('https://www.deliveryfort.com.br/ofertas')
            const pages = [...new Set(validPages)]


            while (index < pages.length) {
               console.log(pages[index])
               request(pages[index], function (err, res, body) {

                  if (err) {
                     console.log(err, "error occured while hitting URL for specific page: ", pages[index]);
                  } else {
                     let $ = cheerio.load(body);
                     $('.n32colunas').each(async function () {
                        console.log('asd')

                        const image = $(this).find('div.shelf-item__image > a > img').attr('src');
                        const name = $(this).find('.shelf-item__info > h3 > a').attr('title');
                        const price = $(this).find('.shelf-item__info > div > div.shelf-item__price > div > span').text();

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

                        item.marketId = 2


                        // console.log(item)
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