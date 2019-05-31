'use strict';

module.exports = {
    monthPricesList: (data) => {
        /* 
            data in response is sorted by the price, 
            so i can get the very first ticket as the cheapest for the whole month
        */
        const minInMonth = {
            date: new Date(data[0].dTimeUTC*1000),
            price: data[0].price,
            booking_token: data[0].booking_token
        }
        const direction = {
            fly_from: data[0].cityFrom,
            fly_to: data[0].cityTo
        }
        /*
            For loop below groups all tikets by the date, excluding exact time( only day/month/year )
        */
        var datePriceList = {};
        for(var i = 0; i<data.length; i++){
            let date = new Date(data[i].dTimeUTC*1000).toJSON().split("T")[0].replace(/\-/g,'/');
            datePriceList[date] = datePriceList[date]||[];
            datePriceList[date].push({price: data[i].price, booking_token: data[i].booking_token, date: new Date(data[i].dTimeUTC*1000)});
        };
        /*
            For loop below looks for the minimum price on a specific date
        */
        
        for(var key in datePriceList){
            let copy = datePriceList[key];
            datePriceList[key] = {}
            datePriceList[key].minInMonth = copy.reduce((prev, curr) => {
                return prev.price < curr.price ? prev : curr;
            });
            datePriceList[key].tickets = copy;
        }
        /*
            ForEach below sorts the array of dates, returned by Object.keys().
        */
        var orderedList = {};
        Object.keys(datePriceList).sort().forEach((key) => {
            orderedList[key] = datePriceList[key];
        });
        return {
            direction: direction,
            minMonthPrice: minInMonth,
            listOfTickets: orderedList
        }
    }
}