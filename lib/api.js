'use strict';

const request = require('request');
const moment = require('moment');

class API {

    constructor(config) {
        console.log("-->", config);
        this.config = config;
    }

    call(identifier, debug = false, simulateError = false) {

        return new Promise((resolve, reject) => {

            const constants = this.config;

            //build uri from constants and identifier
            const uri = `${constants.protocol}://${constants.url}/${constants.endpoint}?apikey=${constants.key}&id=${identifier}&locale=${constants.locale}`

            if (debug) {

                if (simulateError) {

                    reject();

                } else {
                    //---- DEBUG (FORCE VALID) ----
                    const testDateTime = "2019-01-10T15:44:56.128Z";
                    const deliveryDate = moment(testDateTime);
                    const dateTime = deliveryDate.format('DD-MM-YYYY HH:mm:ss').split(' ');

                    resolve({
                        date: dateTime[0],
                        time: dateTime[1],
                        fromNow: deliveryDate.fromNow()
                    });
                    return;
                    //---- DEBUG (FORCE VALID) ----


                }

            }


            //fetch the uri (call the API)
            request.get(uri, {
                json: true
            }, (error, response, body) => {
                if (error || !response || response.statusCode !== 200) {

                    reject();

                } else {

                    const shipments = body.TrackingInformationResponse.shipments;

                    //test
                    const testDateTime = "2018-12-29T15:44:56.128Z";
                    shipments.push({
                        deliveryDate: testDateTime
                    });

                    if (shipments.length == 0) {

                        reject("no shipments");

                    } else {

                        const deliveryDate = moment(shipments[0].deliveryDate);
                        const dateTime = deliveryDate.format('DD-MM-YYYY HH:mm:ss').split(' ');

                        resolve({
                            date: dateTime[0],
                            time: dateTime[1],
                            fromNow: deliveryDate.fromNow()
                        });

                    }
                }
            });
        })
    }
}

module.exports = API;