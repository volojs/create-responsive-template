/*global window */

// Handles the UI for the network state
define(function (require) {
    'use strict';

    var $ = require('jquery'),
        network = require('network'),
        networkDom;

    // Handles update to the DOM that shows the network state.
    function updateNetworkDisplay(on) {
        networkDom.text(on ? 'on' : 'off');
        networkDom.toggleClass('label-success', on);
        networkDom.toggleClass('label-important', !on);
    }

    // Wait for the DOM to be ready before showing the network state.
    $(function () {
        // Display the current network state.
        networkDom = $('#networkStatus');
        updateNetworkDisplay(network());

        // Listen for changes in the network.
        network.on('online', function () {
            updateNetworkDisplay(true);
        });
        network.on('offline', function () {
            updateNetworkDisplay(false);
        });
    });
});
