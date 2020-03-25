const axios = require('axios');
const cheerio = require('cheerio');

const { createCSV, shoutOut } = require('../utils/utils');

class Seef {

  /**
    scrape seef website for residential properties
    and write data to csv/seef.csv
  */
    async getRecords() {

      shoutOut('SEEF');

      // get links
      let links = await this.getPropertyLinks();
      console.log(links);

      console.log('SCRAPING PAGES');
      var property_arry = [];

      // scrape links (property pages)
      for await ( var link of links) {
        if( link.includes('/residential-property/') ) {
          var property_obj = await this.scrapePage(link);
          if(Object.keys(property_obj).length) {
            property_arry.push(property_obj);
          }
        }
      }

     // write to CSV
     console.log("writing to CSV");
     createCSV(property_arry,'./csv/seef.csv');

  }

  /**
    get propery page links from pagination pages
  */
  async getPropertyLinks() {
    console.log('GETTING LINKS');
    const pagination = [1,2,3,4,5,6,7,8,9,10,11];
    const property_links = [];

     for await (const page of pagination) {

      console.log("------- page " + page + "-------------" );

      let url = 'https://www.seeff.co.bw/residential-property-forsale?page='+page;

      await axios.get(url).then( async(response) => {
        // handle success
        var html = response.data;

        if(response.status == 200) {
           var $ = cheerio.load(html);

          console.log("*****"+ url);
          console.log("**************************");

           $('#block-system-main .views-row .list-propertbox-link a').each(async (i, el) => {
              // get all links
              const property_url = 'https://www.seeff.co.bw' + el.attribs.href;
              console.log("--> " + property_url);
              await property_links.push(property_url);

            });
        }

     })
     .catch( (error) => {});


   }
   console.log('... DONE GETTING LINKS');
   return property_links;
  }


  /**
    scrape property page
  */
  async scrapePage(pageUrl) {
    let property_obj = {};

    await axios.get(pageUrl).then((response) => {

      if(response.status == 200) {
        const property = cheerio.load(response.data);

        let item_type = property('.field-name-field-type .field-item a').text();

        if(item_type.includes('House')) {
          var price =  property('#price_blue_content .field-item').text().replace("BWP",'');

          var location  = property('.field-name-field-town-in-botswana .lineage-item-level-1 a').text();
          if(location == '') {
            location  = property('.field-name-field-town-in-botswana .lineage-item-level-0 a').text();
          }

          var bedrooms =  property('#bedroom .field-item').text();
          var carports =  property('#bathroom .field-item').text();
          var bathrooms =  property('#bathroom .field-item').text();
          var plot_size =  property('.field-name-field-plot-size4 .field-item').text().replace("m2",'');
          var type =  'residential';

          property_obj = {
            location: location,
            bedrooms: bedrooms,
            carports: carports,
            bathrooms: bathrooms,
            plot_size_square_meters: plot_size,
            type_of_property: type,
            price: price
          };
        }
      }


    }).catch((err) => {});

    console.log(property_obj);
    return property_obj;
  }

}

module.exports = Seef;
