'use strict';
/*
    App, config imported
*/
const app = require('./src/app');
const config = require('./src/config');
const port = config.port;

// Starting the server on the port from config

app.listen(port, () => console.log("Server is listening port: ", port));
