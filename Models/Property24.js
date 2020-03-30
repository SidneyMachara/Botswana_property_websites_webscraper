const axios = require('axios');
const cheerio = require('cheerio');

const {createCSV, shoutOut} = require('../utils/utils');

class Property24 {



    /*
    IMPORTANT
    - The website might refuse to load at for a while.
    - Might be because it detects multiple requests from same IP ( <--- speculation )
    */



    /**
     scrape Property24 website for residential properties
     and write data to csv/Property24.csv
     */
    async getRecords() {

        let delayTime = 2500; //wait 1,5 seconds after every new request
        shoutOut('Property24');

        // get links
        let links = await this.getPropertyLinks();
        console.log(links);

        console.log('SCRAPING PAGES');
        let property_array = [];

        // scrape links (property pages)
        for await (let link of links) {
            let property_obj = await this.scrapePage(link);
            if (Object.keys(property_obj).length) {
                property_array.push(property_obj);
            }
        }

        // write to CSV
        console.log("writing to CSV");
        await createCSV(property_array, './csv/Property24.csv');

    }

    /**
     get propery page links from pagination pages
     */
    async getPropertyLinks() {
        console.log('GETTING LINKS');
        // const pagination = [1];
        // const pagination = [1,2,3,4,5,6,7,8,9,10,11,12,13];
        let property_links = [];

        for await (const page of pagination) {

            console.log("------- page " + page + "-------------");

            let url = 'https://www.property24.co.bw/houses-for-sale?Page=' + page;

            await axios.get(url).then(async (response) => {
                // handle success
                let html = response.data;

                if (response.status === 200) {
                    let $ = cheerio.load(html);

                    console.log("*****" + url);
                    console.log("**************************");

                    $('.resultsControl .propertyTileWrapper .imageWrapper a').each(async (i, el) => {
                        // get all links
                        const property_url = 'https://www.property24.co.bw' + el.attribs.href;
                        console.log("--> " + property_url);
                        await property_links.push(property_url);

                    });
                }

            })
                .catch((error) => {
                });


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

            if (response.status === 200) {
                const property = cheerio.load(response.data);

                    let price = property('.listingWrap .listingprice').text().replace(/[P\n]/ig, '').trim();
                    let location = property('.listingWrap .listingTitle h1')[1].children[0].data;
                    location = location.replace(/(\d Bedroom House for sale in )/i,'');

                    let bedrooms = '';
                    let carports = '';
                    let bathrooms = '';
                    let plot_size = '';
                    let type = 'residential';

                    property('#p24_listingDetails .detailItem').each((i,el) => {

                        let label = el.children[1].children[0].data;
                        let labelValue = el.children[3].children[1].children[0].data;

                        if( label.includes('Bedroom')) {
                            bedrooms = labelValue;
                        } else if(label.includes('Garage')) {
                            carports = labelValue;
                        } else if(label.includes('Bathrooms')) {
                            bathrooms = labelValue;
                        } else if(label.includes('Erf Size')) {
                            plot_size = labelValue;
                        }

                    });


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


        }).catch((err) => {
        });

        console.log(property_obj);
        return property_obj;
    }

}

module.exports = Property24;
