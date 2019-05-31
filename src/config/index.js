'use strict';
//CONFIG FILE

require('dotenv').config();
module.exports = {
    port: process.env.port||3000,
    redis: {
        host: '127.0.0.1',
        port: 6379
    }
}