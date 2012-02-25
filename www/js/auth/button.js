

define(function (require) {
    'use strict';

    var $ = require('jquery'),
        pub = require('pub'),
        user = require('./user'),
        containerDom;

    // Dependencies that do not return a module value.
    require('bootstrap/dropdown');

    // Updates the state of the user button.
    function updateState(dom, stateDataId) {
        var userData = user.get(),
            msgDom = dom.find('.auth-msg'),
            caretDom = dom.find('.caret'),
            text, state;

        if (stateDataId) {
            text = dom.data(stateDataId);
            state = stateDataId;
            caretDom.hide();
        } else if (userData) {
            text = userData.email;
            state = 'signedIn';
            caretDom.show();
        } else {
            // Signed out.
            text = dom.data('auth-signin');
            state = 'signedOut';
            caretDom.hide();
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
        containerDom =  $('.auth-container');

        containerDom.on('click.auth', function (evt) {
            var node = evt.target,
                href = evt.target.href,
                // Make sure to have the top level node for the button.
                dom = $(node).parents('.auth-container');

            href = href && href.split('#')[1];

            if (href && href === 'signOut') {
                evt.preventDefault();

                // Change button to show "signing out".
                updateState(dom, 'auth-signingout');

                // The state will be updated by listening to the
                // signedOut topic below.
                user.signOut();
            } else if (isSignedOutButtonState(dom)) {
                evt.preventDefault();
                evt.stopPropagation();

                // Button is in signed out state, Sign in.
                user.signIn(function () {
                    updateState(dom);
                });
            }
        });

        updateState(containerDom);

        // Listen for 'auth/user/signedOut' which indicates the user is no
        // longer available.
        pub.sub('auth/user/signedOut', function () {
            updateState(containerDom);
        });
    });
});
