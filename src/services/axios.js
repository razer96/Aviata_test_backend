'use strict';
// Axios is a module for asynchronous http requests;
const axios = require('axios');
const config = require('../config');

// Create axios instance for flights API
const flightsAPI = axios.create({
    baseURL: 'https://api.skypicker.com',
    headers: {'Content-Type': 'application/json'}
});
// Create axios instance for booking API
const bookingAPI = axios.create({
    baseURL: 'https://booking-api.skypicker.com/api/v0.1',
    headers: {'Content-Type': 'application/json'}
});

module.exports = {
    flightsAPI,
    bookingAPI
}