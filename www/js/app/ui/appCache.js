/*global window */

// Handles the UI for appCache
define(function (require) {
    'use strict';

    var $ = require('jquery'),
        appCache = require('appCache'),
        dom = {},
        domIds = [
            'appCacheStatus',
            'appCacheEvent',
            'updateAlert',
            'checkUpdate',
            'eventSection',
            'updateButton'
        ];

    // Shows updates to appCache state.
    function updateAppCacheDisplay(eventName, evt) {
        var message;

        dom.appCacheStatus.text(appCache.getStatusName());

        // Make sure the check for update button and event list are visible.
        dom.checkUpdate.show();
        dom.eventSection.show();

        if (eventName) {
            if (eventName === 'updateready') {
                dom.updateAlert.show();
            } else {
                dom.updateAlert.hide();
            }

            message = eventName;
            if (eventName === 'progress' && evt.total) {
                message += ': ' + evt.loaded + ' of ' + evt.total;
            } else if (eventName === 'error') {
                message += ': make sure the manifest file is in the correct ' +
                           'place and .appcache files are served with MIME ' +
                           'type: text/cache-manifest';
            }
            dom.appCacheEvent.prepend('<div>' + message + '</div>');
        }
    }

    // Wait for the DOM to be ready before showing the network state.
    $(function () {
        var i;

        // Hold on to DOM elements used by the appCache UI.
        for (i = 0; i < domIds.length; i++) {
            dom[domIds[i]] = $('#' + domIds[i]);
        }

        // Listen for any of the appCache events.
        appCache.eventNames.forEach(function (name) {
            appCache.on(name, function (evt) {
                updateAppCacheDisplay(name, evt);
            });
        });

        // Wire up appCache buttons.
        dom.updateButton.bind('click', function (evt) {
            appCache.swapCache();
            window.location.reload();
        });
        dom.checkUpdate.bind('click', function (evt) {
            appCache.update();
        });
    });
});
