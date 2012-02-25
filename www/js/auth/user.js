
/*global define, localStorage, setTimeout, requirejs, navigator */

define(function (require, exports, module) {
    'use strict';

    var authUrl = '/api/auth',
        $ = require('jquery'),
        pub = require('pub'),
        // States are 'fetching', 'available' and 'error'
        browserIdLoadState = 'fetching',
        userKey = module.id,
        userData = localStorage.getItem(userKey) || null,
        user, req, oldOnError;

    function clearData() {
        userData = null;
        localStorage.removeItem(userKey);
    }

    //Stand in function placeholder
    function noop() {}

    function callError(msg, type, errback) {
        var err = new Error(msg);
        err.type = type;
        setTimeout(function () {
            errback(err);
            pub(userKey + '/error', err);
        }, 10);
    }

    // localStorage value is a JSON string since that is most portable. Convert
    // it to a real object if there is a value.
    if (userData) {
        userData = JSON.parse(userData);

        // Confirm the server still thinks the user should be logged in.
        // This call assumes an error means the user is offline, but you
        // may want to implement an error handler in real code.
        $.ajax({
            type: 'POST',
            url: authUrl + '/confirm',
            data: 'serverInfo=' + encodeURIComponent(JSON.stringify(userData.serverInfo)),
            dataType: 'json',
            success: function (data, textStatus, jqXhr) {
                if (data.status === 'expired') {
                    clearData();
                    pub(userKey + '/signedOut');
                }
            }
        });
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
                                if (data.error) {
                                    callError(data.error,
                                              'browserIdError',
                                              errback);
                                } else {
                                    userData = data;
                                    localStorage.setItem(userKey,
                                                     JSON.stringify(userData));
                                    callback(user.get());
                                }
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
            callback = callback || noop;

            // Confirm the server still thinks the user should be logged in.
            // This call assumes an error means the user is offline, but you
            // may want to implement an error handler in real code.
            $.ajax({
                type: 'POST',
                url: authUrl + '/signout',
                data: 'serverInfo=' + encodeURIComponent(JSON.stringify(userData.serverInfo)),
                dataType: 'json',
                complete: function (jqXhr, textStatus) {
                    // Do not care if it succeeded or failed. You may want
                    // to do separate 'success' and 'error' flows. In
                    // particular, if a timeout or server not reachable, it
                    // may indicate offline status, and depending on your
                    // server state, you may want to remember to send the
                    // signout again at a later time when the network is
                    // available.
                    clearData();
                    callback();
                    pub(userKey + '/signedOut');
                }
            });
        }
    };

    return user;
});
