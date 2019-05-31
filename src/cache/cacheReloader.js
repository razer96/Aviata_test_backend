'use strict';
const config = require('../config');
var subscriber;
const cache = require('./index');

/*

    This module is for listening messaging from channel that was created for emiting message event
    when some key is expired.
    If key is expired it means that cache needs to be updated.
    It happend once a day.

*/
module.exports = (publisher) => {
    publisher.send_command('config', ['set','notify-keyspace-events','Ex'], (err, reply) => {
        if(err) throw err;
        subscriber = require('redis').createClient({port: config.redis.port, db: 3});
        const expired_subKey = '__keyevent@'+3+'__:expired'
        subscriber.subscribe(expired_subKey, () => {
            console.log(' [i] Subscribed to "'+expired_subKey+'" event channel : '+reply);
            subscriber.on('message', (chan,msg) => {
                console.log(chan);
                console.log('[expired]',msg);
                let currentDate = new Date();
                let dateAfterMonth = new Date();
                dateAfterMonth.setMonth(dateAfterMonth.getMonth() + 1);
                currentDate = currentDate.toJSON().split("T")[0];
                let dateArr = currentDate.split("-");
                currentDate = dateArr[2]+'/'+dateArr[1]+'/'+dateArr[0];
                dateAfterMonth = dateAfterMonth.toJSON().split("T")[0];
                dateArr = dateAfterMonth.split("-");
                dateAfterMonth = dateArr[2]+'/'+dateArr[1]+'/'+dateArr[0];

                let data = {
                    directionKey: msg,
                    fly_from: msg.split('-')[0],
                    fly_to: msg.split('-')[1],
                    date_from: currentDate,
                    date_to: dateAfterMonth
                }
                //publisher.del(msg);
                cache.createCache(data, publisher);
            });
        });
    });
}

