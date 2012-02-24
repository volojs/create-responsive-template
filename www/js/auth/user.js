
/*global define, localStorage, setTimeout, requirejs, navigator */

define(function (require, exports, module) {
    'use strict';

    var authUrl = '/api/auth',
        $ = require('jquery'),
        // States are 'fetching', 'available' and 'error'
        browserIdLoadState = 'fetching',
        userKey = module.id,
        userData = localStorage.getItem(userKey) || null,
        user, req, oldOnError;

    // localStorage value is a JSON string since that is most portable. Convert
    // it to a real object if there is a value.
    if (userData) {
        userData = JSON.parse(userData);
    }

    // Load up the browserid code, but do this not as a module dependency,
    // but as an additional, dynamic call, so that if it fails, then, the
    // app still works. It is possible for the script load to fail for
    // instance if the user is offline. If requirejs is being used, use
    // a new context so that an error in there will not affect the main
    // module context. If another AMD loader, then just use callback require.
    if (typeof requirejs === 'function') {
        req = requirejs.config({
            context: 'browserId'
        });

        oldOnError = requirejs.onError;
        requirejs.onError = function (err) {
            if (err.requireType === 'timeout' &&
                err.requireModules.indexOf('browserId') !== -1) {
                browserIdLoadState = 'error';
            }
            return oldOnError(err);
        };
    } else {
        req = require;
    }

    // Start the browserid script fetch
    req(['https://browserid.org/include.js'], function () {
        browserIdLoadState = 'available';
    });

    //Stand in function placeholder
    function noop() {}

    function callError(msg, type, errback) {
        var err = new Error(msg);
        err.type = type;
        setTimeout(function () {
            errback(err);
        }, 10);
    }

    user = {
        get: function () {
            return userData;
        },

        signIn: function (callback, errback) {
            errback = errback || noop;

            if (navigator.id && navigator.id.get) {
                navigator.id.get(function (assertion) {
                    if (assertion) {
                        $.ajax({
                            type: 'POST',
                            url: authUrl,
                            data: 'assertion=' + encodeURIComponent(assertion),
                            dataType: 'json',
                            success: function (data, textStatus, jqXhr) {
                                userData = data;
                                localStorage.setItem(userKey,
                                                     JSON.stringify(userData));
                                callback(user.get());
                            },
                            error: function(jqXhr, textStatus, errorThrown) {
                                callError(textStatus,
                                          'browserIdAssertionFailed',
                                          errback);
                            }
                        });
                    } else {
                        callError('BrowserId unknown error',
                              'browserIdUnknown',
                              errback);
                    }
                });
            } else {
                setTimeout(function () {
                    callError('BrowserId unavailable',
                              'browserIdUnavailable',
                              errback);
                }, 10);
            }
        },

        signOut: function (callback, errback) {
            userData = null;
            localStorage.removeItem(userKey);
            setTimeout(callback, 10);
        }
    };

    return user;
});
