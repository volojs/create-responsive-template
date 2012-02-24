// Main app file.

// To load a submodule for the app, place it in an app/ directory that is a
// sibling to this file.

// For any third party dependencies, like jQuery,
// place them in the same directory as this file.
// This avoids having to do module path configuration.

/*global window */

// Define the app module.
define(function (require) {
    'use strict';

    var $ = require('jquery'),
        appCache = require('appCache'),
        network = require('network'),
        networkDom, appCacheStatusDom, appCacheEventDom, updateAlertDom,
        checkUpdateDom, eventSectionDom;

    // Dependencies that do not have an export of their own, just attach
    // to other objects, like jQuery.
    require('bootstrap/alert');
    require('bootstrap/modal');
    require('bootstrap/transition');
    require('auth/button');

    // Handles update to the DOM that shows the network state.
    function updateNetworkDisplay(on) {
        networkDom.text(on ? 'on' : 'off');
        networkDom.toggleClass('label-success', on);
        networkDom.toggleClass('label-important', !on);
    }

    // Shows updates to appCache state.
    function updateAppCacheDisplay(eventName, evt) {
        var message;

        appCacheStatusDom.text(appCache.getStatusName());

        // Make sure the check for update button and event list are visible.
        checkUpdateDom.show();
        eventSectionDom.show();

        if (eventName) {
            if (eventName === 'updateready') {
                updateAlertDom.show();
            } else {
                updateAlertDom.hide();
            }

            message = eventName;
            if (eventName === 'progress' && evt.total) {
                message += ': ' + evt.loaded + ' of ' + evt.total;
            } else if (eventName === 'error') {
                message += ': make sure the manifest file is in the correct ' +
                           'place and .appcache files are served with MIME ' +
                           'type: text/cache-manifest';
            }
            appCacheEventDom.prepend('<div>' + message + '</div>');
        }
    }

    // Wait for the DOM to be ready before showing the network state.
    $(function () {
        var docDom = $(document);

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

        // Display current appCache state.
        appCacheStatusDom = $('#appCacheStatus');
        appCacheEventDom = $('#appCacheEvent');
        updateAlertDom = $('#updateAlert');
        checkUpdateDom = $('#checkUpdate');
        eventSectionDom = $('#eventSection');

        // Listen for any of the appCache events.
        appCache.eventNames.forEach(function (name) {
            appCache.on(name, function (evt) {
                updateAppCacheDisplay(name, evt);
            });
        });

        // Wire up appCache buttons.
        $('#updateButton').bind('click', function (evt) {
            appCache.swapCache();
            window.location.reload();
        });
        $('#checkUpdate').bind('click', function (evt) {
            appCache.update();
        });

        // Wire up pub/sub listeners
        docDom.bind('auth/error', function (evt, error) {
            $('#authErrorDetails').text(error.message);
            $('#authError').show();
        });
    });
});
