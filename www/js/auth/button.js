

define(function (require) {
    'use strict';

    var $ = require('jquery'),
        user = require('./user');

    // Dependencies that do not return a module value.
    require('bootstrap/dropdown');

    // Updates the state of the user button.
    function updateState(dom, stateDataId) {
        var userData = user.get(),
            msgDom = dom.find('.btn-auth-msg'),
            text, state;

        if (stateDataId) {
            text = dom.data(stateDataId);
            state = stateDataId;
        } else if (userData) {
            text = userData.email;
            state = 'signedIn';
        } else {
            // Signed out.
            text = dom.data('auth-signin');
            state = 'signedOut';
        }

        msgDom.text(text);
        dom.data('authState', state);
    }

    // Determines if the button is in the "signed out" state.
    function isSignedOutButtonState(dom) {
        return dom.data('authState') === 'signedOut';
    }

    // Set up any browser ID buttons on startup, and wire up click handler.
    $(function () {
        $('.btn-auth')
        .on('click.auth', function (evt) {
            var node = evt.target,
                href = evt.target.href,
                // Make sure to have the top level node for the button.
                dom = $(node).parents('.btn-auth');

            href = href && href.split('#')[1];

            if (href && href === 'signOut') {
                evt.preventDefault();

                // Change button to show "signing out".
                updateState(dom, 'auth-signingout');

                user.signOut(function () {
                   updateState(dom);
                });
            } else if (isSignedOutButtonState(dom)) {
                evt.preventDefault();
                evt.stopPropagation();

                // Button is in signed out state, Sign in.
                user.signIn(function () {
                    updateState(dom);
                }, function (error) {
                    $(document).trigger('auth/error', error);
                });
            }
        })
        .each(function () {
            updateState($(this));
        });
    });
});
