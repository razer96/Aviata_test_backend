'use strict';
/*
    All needed dependencies
*/
const express = require('express');
const app = express();
const redisClient = require('./redis/client');
const directions = require('./static/directions.json').directions;
const path = require('path');
const cache = require('./cache');
const routes = require('./routus');

/*
    List of directions has been saved as a json file.
    Iterating list of directions and checking, if data by the direction as a key already exists in the Redis
*/
directions.forEach(direction => {
    var directionStr = direction.from+'-'+direction.to;
    
    redisClient.exists(directionStr, (err, reply) => {
        if(err) throw err;
        if(reply===0){
            let currentDate = new Date();
            let dateAfterMonth = new Date();
            dateAfterMonth.setMonth(dateAfterMonth.getMonth() + 1);
            currentDate = currentDate.toJSON().split("T")[0];
            let dateArr = currentDate.split("-");
            currentDate = dateArr[2]+'/'+dateArr[1]+'/'+dateArr[0];
            dateAfterMonth = dateAfterMonth.toJSON().split("T")[0];
            dateArr = dateAfterMonth.split("-");
            dateAfterMonth = dateArr[2]+'/'+dateArr[1]+'/'+dateArr[0];

            let params = {
                directionKey: directionStr,
                fly_from: direction.from,
                fly_to: direction.to,
                date_from: currentDate,
                date_to: dateAfterMonth
            }

            cache.createCache(params, redisClient);
        }else{
            // console.log(directionStr+" key already exist");
        }
    });
});

// Set templete engine as  EJS and views folder as the main views folder
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Public folder set
app.use(express.static('public'));


app.use('/', routes);

// 404 error handler
app.use((req, res, next) => {
    res.status(404).sendFile(process.cwd()+'/src/views/404.html');
});

// Starting to listen for expiring events.
require('./cache/cacheReloader')(redisClient);


module.exports = app;