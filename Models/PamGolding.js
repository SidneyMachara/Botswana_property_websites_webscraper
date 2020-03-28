const axios = require('axios');
const cheerio = require('cheerio');

const { createCSV, shoutOut } = require('../utils/utils');

class PamGolding {

    /*
     IMPORTANT
     - The website has a  json variable containing  property objects (variable is in a script tag)
     - Each property object has ALL the information about the property
     --------------
     read ALL object properties before coding
     ---------------
    */


    /**
     scrape PamGolding website for residential properties
     and write data to csv/PamGolding.csv
     */
    async getRecords() {

        shoutOut('PamGolding');

        // get links
        let paginationPages = [1,2,3,4,5,6];
        let property_array = await this.scrapePaginationPages(paginationPages);
        console.log(property_array.length + " Records");

        // write to CSV
        console.log("writing to CSV");
        await createCSV(property_array, './csv/PamGolding.csv');

    }

    /**
     - get  script tag with property json
     - return property objects
     */
    async scrapePaginationPages(paginationPages) {

        console.log('SCRAPE');
        const pagination = paginationPages;
        let property_array = [];

        for await (const page of pagination) {

            console.log("------- page " + page + "-------------" );

            let url = 'https://www.pamgolding.co.za/property-search/houses-for-sale-gaborone-botswana/33/page'+page;

            await axios.get(url).then( async(response) => {
                // handle success
                let html = response.data;

                if(response.status === 200) {
                    let $ = cheerio.load(html);

                    console.log("*****"+ url);
                    console.log("**************************");

                    let webDataJsonText = $('script')[19].children[0].data;

                    // find variable `objSR` in the text
                     webDataJsonText = webDataJsonText.match(/var objSR = (.*);var objSF/);

                    let propertiesJson = JSON.parse(webDataJsonText[1]);

                    propertiesJson.forEach((property_obj) => {

                       let new_property_obj = {
                            location: property_obj['nvcResultListingLocation'],
                            bedrooms: property_obj['intNumberOfBedrooms'],
                            carports: property_obj['intParkingTotal'],
                            bathrooms: property_obj['intNumberOfBathrooms'],
                            plot_size_square_meters: property_obj['fltErfSize'],
                            type_of_property: 'residential',
                            price: property_obj['intPriceBWP']
                        };
                        console.log(new_property_obj);
                        property_array.push(new_property_obj);

                    });

                }

            })
                .catch( (error) => {});


        }
        console.log('... DONE GETTING PROPERTIES');
        return property_array;
    }


}

module.exports = PamGolding;
