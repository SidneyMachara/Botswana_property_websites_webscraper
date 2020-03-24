const axios = require('axios');
const cheerio = require('cheerio');

const { createCSV } = require('../utils/utils');

class Apex {

    shoutOut() {
      console.log('*********************************');
      console.log('*              APEX             *');
      console.log('*********************************');
    }

    async getRecords() {

      this.shoutOut();

      var pagination = [1,2,3,4,5,6,7,8];
      var property_arry = [];

      for(var i in pagination) {

        var page = pagination[i];
        let url = 'https://www.apexproperties.co.bw/results/residential/for-sale/?p='+page+'&advanced_search=1';

        await axios.get(url).then((response) => {
          // handle success
          console.log('-------- '+ page +' --------');
          console.log("Start");

          var html = response.data;

          if(response.status == 200) {
             var $ = cheerio.load(html);

              $('.property-list-item').each((i, el) => {
                var property = cheerio.load(el);

                var price =  property('.property-price-heading').html().replace("P",'');
                var location =  property('.property-marketing-heading').html().replace(/((\d Bedroom House For Sale in )|(\d Bedroom Apartment For Sale in )|(\d Bedroom Guest House For Sale in )|(\d Bedroom Apartment Block For Sale in ))/i,'');
                var bedrooms =  property('.icon-beds').text();
                var carports =  property('.icon-garages').text();
                var bathrooms =  property('.icon-baths').text();
                var plot_size =  property('.property-list-land-size > .value').text().slice(0,-2);
                var type =  property('.property-price-heading').html();

                let property_obj = {
                  location: location,
                  bedrooms: bedrooms,
                  carports: carports,
                  bathrooms: bathrooms,
                  plot_size_square_meters: plot_size,
                  type_of_property: 'residential',
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

     };

     // do the CSV
     console.log("almost done");
     createCSV(property_arry,'./csv/apexproperties.csv');

  }

}

module.exports = Apex;