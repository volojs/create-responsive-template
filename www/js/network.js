/*global navigator, window */

define(function () {
    'use strict';

    /**
     * Module for returning the network state, and for listening for
     * changes in the network state.
     *
     * Note: Different browsers use different triggers for online vs
     * offline. See the details in:
     *
     * https://developer.mozilla.org/en/DOM/window.navigator.onLine
     * and
     * http://www.html5rocks.com/en/mobile/workingoffthegrid.html
     */
    function network() {
        return navigator.onLine;
    }

    network.on = function (state, func) {
        return window.addEventListener(state, func, false);
    };

    network.remove = function(state, func) {
        return window.removeEventListener(state, func, false);
    };

    return network;
});
