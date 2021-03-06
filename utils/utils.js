module.exports = {

 createCSV: async (records,save_to_path) => {
    let createCsvWriter = require('csv-writer').createObjectCsvWriter;

    let csvWriter =  createCsvWriter({
        path: save_to_path,
        header: [
            {id: 'location', title: 'location'},
            {id: 'bedrooms', title: 'bedrooms'},
            {id: 'carports', title: 'carports'},
            {id: 'bathrooms', title: 'bathrooms'},
            {id: 'plot_size_square_meters', title: 'plot_size_square_meters'},
            {id: 'type_of_property', title: 'type_of_property'},
            {id: 'price', title: 'price'}
        ]
    });


    await csvWriter.writeRecords(records)       // returns a promise
        .then(() => {
            console.log('...Done');
        });
  },

  shoutOut: (who) => {
    console.log('*********************************');
    console.log('*            ' + who);
    console.log('*********************************');
  }

};
