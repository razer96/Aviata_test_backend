'use strict';
const {flightsAPI} = require('../services/axios');
const dataHandler = require('../services/dataHandler');
module.exports = {
    createCache: async (params, redisClient) => {
        try{
            /*
                Sending asyncronous request using Axios library.
            */
            const {data} = await flightsAPI.get('/flights', {
                params: {
                    "fly_from": params.fly_from,
                    "fly_to": params.fly_to,
                    "date_from": params.date_from,
                    "date_to": params.date_to,
                    "curr": 'KZT',
                    "locale": 'ru'
                }
            });
            var listOfMinPrices = dataHandler.monthPricesList(data.data);
            listOfMinPrices.directionKey = params.directionKey;
            /*
                Set interval of time to a month
            */
            var currentDate = new Date();
            var todayEnd = new Date().setHours(23, 59, 59, 999);
            /*
                Setting cache. The key is a directory in the 'ALA-MOW' format.
                The value is the handaled object from the dataHandler.monthPricesList function
            */
            redisClient.setex(params.directionKey, parseInt((todayEnd - currentDate)/1000), JSON.stringify(listOfMinPrices), (err, reply) => {
                if(err) throw err;
                console.log(reply);
            });
        }catch(err){
            console.log(err);
        }
    }
}