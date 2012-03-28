// Manages the UI for showing the networks state.

/*global window */

define(function (require) {
    'use strict';

    var $ = require('jquery'),
        network = require('network');

    // Return a function that can be called to do the DOM binding given a
    // jQuery DOM object to use as the parent container.
    return function uiNetwork(parentDom) {

        // Use the body element if no parentDom provided
        parentDom = parentDom || $('body');

        var networkDom = parentDom.find('.networkStatus');

        // Handles update to the DOM that shows the network state.
        function updateNetworkDisplay(on) {
            networkDom.text(on ? 'on' : 'off');
            networkDom.toggleClass('label-success', on);
            networkDom.toggleClass('label-important', !on);
        }

        // Display the current network state.
        updateNetworkDisplay(network());

        // Listen for changes in the network.
        network.on('online', function () {
            updateNetworkDisplay(true);
        });
        network.on('offline', function () {
            updateNetworkDisplay(false);
        });
    };
});