'use strict';

/*
     Connection to Redis database
*/
const config = require('../config');
const redis = require('redis');


const client = redis.createClient({port: config.redis.port, db: 3});
client.on('connect', () => {
     console.log("Connected to Redis");
});

module.exports = client;
