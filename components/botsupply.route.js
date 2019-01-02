'use strict';

const config = require("../config/config.json");
const API = require("../lib/api");

function switchState(action) {

  action = action.toLowerCase()

  switch (action) {

    case "restart":
      return "resetState";
    case "my shipments":
      return "getShipments";
    case "save shipment":
      return "setShipment";
    case "lookup shipment":
      return "trackShipment";
    default:
      return false
  }

}

module.exports = {
  metadata: () => ({
    name: 'botsupply.route',
    properties: {
      initialAction: {
        required: true,
        type: 'string'
      },
      resultAction: {
        required: false,
        type: 'string'
      },
      currentTrackingIdentifier: {
        required: false,
        type: 'string'
      },
      savedTrackingIdentifier: {
        required: false,
        type: 'string'
      },

    },
    supportedActions: ["resetState", "getShipments", "setShipment", "trackShipment", "trackingAPIError", "trackingAPISuccess", "trackingAPISuccess_NoSave"]
  }),
  invoke: async (conversation, done) => {
    const {
      initialAction,
      resultAction,
      currentTrackingIdentifier,
      savedTrackingIdentifier
    } = conversation.properties();


    if (savedTrackingIdentifier !== "<not set>") {


      const api = new API(config);
      try {
        let result = await api.call(savedTrackingIdentifier);
        conversation
          .variable('date', result.date)
          .variable('time', result.time)
          .variable('fromNow', result.fromNow)
          .variable('savedTrackingIdentifier', '<not set>')
          .transition('trackingAPISuccess_NoSave');
      } catch (e) {
        conversation
          .variable('savedTrackingIdentifier', '<not set>')
          .transition('trackingAPIError');
      }

      done();


    } else if (currentTrackingIdentifier !== "<not set>") {



      let newAction = switchState(currentTrackingIdentifier);

      if (!newAction) {

        let debug = false;
        let simulateError = false;
        if (currentTrackingIdentifier == "Test Valid") {
          debug = true;
        } else if (currentTrackingIdentifier == "Test Invalid") {
          debug = true;
          simulateError = true;
        }

        const api = new API(config);
        try {
          let result = await api.call(currentTrackingIdentifier, debug, simulateError);
          conversation
            .variable('date', result.date)
            .variable('time', result.time)
            .variable('fromNow', result.fromNow)
            .variable('previousTrackingIdentifier', currentTrackingIdentifier)
            .variable('currentTrackingIdentifier', '<not set>')
            .transition('trackingAPISuccess');
        } catch (e) {
          conversation
            .variable('currentTrackingIdentifier', '<not set>')
            .transition('trackingAPIError');
        }
      } else {
        conversation.transition(newAction);
      }

      done();

    } else {

      let routeAction = resultAction == "<not set>" ? initialAction : resultAction

      let newAction = switchState(routeAction) || "resetState";

      conversation.transition(newAction);
      done();

    }

  }
};