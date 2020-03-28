const axios = require('axios');
const cheerio = require('cheerio');

const { createCSV, shoutOut } = require('../utils/utils');

class Apex {

  /**
    scrape apexproperties website for residential properties
    and write data to csv/apex.csv
  */
    async getRecords() {

      shoutOut('APEX');

      let pagination = [1,2,3,4,5,6,7,8];
      let property_arry = [];

      for(let i in pagination) {

        let page = pagination[i];
        let url = 'https://www.apexproperties.co.bw/results/residential/for-sale/?p='+page+'&advanced_search=1';

        await axios.get(url).then((response) => {
          // handle success
          console.log('-------- '+ page +' --------');
          console.log("Start");

          let html = response.data;

          if(response.status == 200) {
             let $ = cheerio.load(html);

              $('.property-list-item').each((i, el) => {
                let property = cheerio.load(el);

                let price =  property('.property-price-heading').html().replace("P",'');
                let location =  property('.property-marketing-heading').html().replace(/((\d Bedroom House For Sale in )|(\d Bedroom Apartment For Sale in )|(\d Bedroom Guest House For Sale in )|(\d Bedroom Apartment Block For Sale in ))/i,'');
                let bedrooms =  property('.icon-beds').text();
                let carports =  property('.icon-garages').text();
                let bathrooms =  property('.icon-baths').text();
                let plot_size =  property('.property-list-land-size > .value').text().slice(0,-2);
                let type =  'residential';

                let property_obj = {
                  location: location,
                  bedrooms: bedrooms,
                  carports: carports,
                  bathrooms: bathrooms,
                  plot_size_square_meters: plot_size,
                  type_of_property: type,
                  price: price
                };
                property_arry.push(property_obj);
                console.log("working.." + location);
              });
          }

       })
       .catch(function (error) {
         // handle error
         console.log(error);
       });

     }

     // do the CSV
     console.log("almost done");
     await createCSV(property_arry, './csv/apexproperties.csv');

  }

}

module.exports = Apex;
