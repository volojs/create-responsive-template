/*global define */

define(function (require) {
    'use strict';
    var $ = require('jquery'),
        dispatch = $({});

    function pub(topic, data) {
        dispatch.trigger(topic, data);
    }

    // Subscribe to a topic. Note that this method returns the function that
    // should be passed to pub.unsub to unsubscribe.
    pub.sub = function (topic, callback) {
        var cb = function (evt, data) {
            callback(data);
        };
        dispatch.bind(topic, cb);
    };

    pub.unsub = function (topic, callback) {
        dispatch.unbind(topic, callback);
    };

    return pub;
});