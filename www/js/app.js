// Main app file.

// To load an app-specific module, place it in an app/ directory that is a
// sibling to this file. See app/uiNetworks.js and app/uiAppCache.js for
// examples.

// For any third party dependencies, like jQuery, place them in the same
// directory as this file. This avoids having to do module path configuration,
// and keeps the third party libraries out of your app/ directory.

/*global window */

define(function (require) {
    'use strict';

    var $ = require('jquery');

    // Dependencies that do not have an export of their own, just attach
    // to other objects, like jQuery. These are just used in the example
    // bootstrap modal, not directly in the UI for the network and appCache
    // displays.
    require('bootstrap/modal');
    require('bootstrap/transition');

    // Wait for the DOM to be ready before showing the network and appCache
    // state.
    $(function () {
        // Enable the UI bindings for the network and appCache displays
        require('app/uiNetwork')();
        require('app/uiAppCache')();
    });
});
