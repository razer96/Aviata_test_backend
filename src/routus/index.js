'use strict';
const router = require('express').Router();
const redisClient = require('../redis/client');
const directions = require('../static/directions.json').directions;
const {bookingAPI} = require('../services/axios');

router.get('/', (req, res, next) => {
    var getMulti = redisClient.multi();  
    /*
        Create multi for set of events
    */
    directions.forEach((direction) => {
        var directionKey = direction.from+'-'+direction.to;
        getMulti.get(directionKey);
    });
    /*
        Execute all commands atomically
    */
    getMulti.exec((err, results) => {
        if(err) next(err);
        var data = [];
        /*
            Exec function returns array of results of each command that has been added in multi
        */
        results.forEach((cache) => {
            let decoded = JSON.parse(cache);
            data.push(
                {
                    directionKey: decoded.directionKey, 
                    direction: decoded.direction, 
                    minMonthPrice: decoded.minMonthPrice.price
                }
            );
        })
        res.render('directions', {directions: data});
    })
    
});

router.get('/directions/:key', (req, res, next) => {
    /*
        Get data by the key from Redis
    */
    redisClient.get(req.params.key, (err, reply) => {
        if(err) next(err);
        let decoded = JSON.parse(reply);
        res.render('direction', {direction: {directionKey: decoded.directionKey, direction: decoded.direction, listOfMinPrices: decoded.listOfTickets}})
    })
});

router.get('/tickets', (req, res, next) => {
    var date = req.query.date;
    var directionKey = req.query.directionKey;
    if(!date&&!directionKey){
        next();
    }else{
        /*
            Get data by the key from Redis
        */
        redisClient.get(directionKey, (err, reply) => {
            if(err) next(err);
            let decoded = JSON.parse(reply);
            res.render('tickets', {direction: {directionKey: decoded.directionKey, direction: decoded.direction, listOfTickets: decoded.listOfTickets[date].tickets}})
        });
    }
});
router.get('/booking', async (req, res, next) => {
    var booking_token = req.query.booking_token;
    if(!booking_token){
        next();
    }else{
        try{
            var global_data;
            var returned_object = {};
            /*
                Sending request while flights_checked files is not true
            */
            while(true){
                const {data} = await bookingAPI.get('/check_flights', {
                    params: {
                        "booking_token": booking_token,
                        "pnum": 1,
                        "bnum": 1
                    }
                });
                if(data.flights_checked) {global_data = data; break;}
            }
            returned_object.ticket_valid = global_data.flights_invalide ? false : true;
            if(global_data.price_change){
                returned_object.price_changed = true
            }
            res.status(200).json(returned_object);
        }catch(err){
            throw err;
        }
        
    }
});
module.exports = router;