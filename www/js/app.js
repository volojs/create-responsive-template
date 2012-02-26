// Main app file.

// To load a submodule for the app, place it in an app/ directory that is a
// sibling to this file.

// For any third party dependencies, like jQuery,
// place them in the same directory as this file.
// This avoids having to do module path configuration.

/*global window */

define(function (require) {
    'use strict';

    var $ = require('jquery'),
        pub = require('pub');

    // Dependencies that do not have an export of their own, just attach
    // to other objects, like jQuery.
    require('bootstrap/alert');
    require('bootstrap/modal');
    require('bootstrap/transition');

    // Load up the app's UI controllers. This example does not need to
    // hold on to any exported value for these controllers.
    require('auth/button');
    require('app/ui/network');
    require('app/ui/appCache');

    $(function () {
        // Wire up pub/sub listeners for events that should be displayed
        // globally.
        pub.sub('auth/user/error', function (error) {
            $('#authErrorDetails').text(error.message);
            $('#authError').show();
        });
    });
});
