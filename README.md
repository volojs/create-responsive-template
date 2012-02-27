# Responsive+AppCache+Network

It can be challenging to set up a good looking web project whose layout responds
well to different screen resolutions and work well in mobile and offline
environments.

This project template sets up a repsonsive webapp that uses
[Twitter Bootstrap](http://twitter.github.com/bootstrap/) along with
[AppCache](https://developer.mozilla.org/en/Using_Application_Cache) and
[network events](https://developer.mozilla.org/en/DOM/window.navigator.onLine).

It also includes and optional
[BrowserID integration](https://github.com/mozilla/browserid/wiki/How-to-Use-BrowserID-on-Your-Site),
to get you bootstrapped easily into an open, email-focused identity
system that allows psuedonyms.

This makes it easy to set up web apps that are mobile-ready and can
be used as [Mozilla Web Apps](https://developer.mozilla.org/en-US/apps)
or [Chrome Store Apps](https://chrome.google.com/webstore/category/home).

Since the goal of the project is to target more modern browsers with AppCache
support, older browsers like IE 6-9 are not supported.

**Video about the template**: https://vimeo.com/36997211

## Usage

This project uses [volo](https://github.com/volojs/volo) to do the template
setup and for generating the builds and AppCache. It is easy to install and use.
Just be sure to have [Node](http://nodejs.org/) installed first.

For Linux/Unix/OS X:

    > curl https://raw.github.com/volojs/volo/latest/dist/volo > volo
    > chmod +x volo

For Windows, see the [volo instructions](https://github.com/volojs/volo). It is
the same basic idea though, fetch the volo file and start using it.

Then:

    > volo create myproject volojs/create-responsive-template
    > cd myproject
    > ../volo serve

Now you will have a responsive project template set up in the `myproject`
directory. You can do development using the `myproject/www` directory in your
browser, then use the built, AppCache-enabled project in `myproject/www-built`.

The `serve` command starts up a dev server that serves the files in
`myproject/www`, and implements API endpoints for some of the user auth work
that uses BrowserID.

## What Happened

volo grabbed this project template from GitHub, then:

* Fetched Twitter Bootstrap code from GitHub
* Fetched jQuery

It generated the responsive CSS files from Bootstrap's LESS files, and then
converted the Bootstrap JS code to work as AMD modules.

The project uses [RequireJS](http://requirejs.org) so that you can create
modular code that is easy to debug. When `volo appcache` is run, it builds all
the JS into one file. Additionally, it optimizes the CSS files by combining
them into one file. Then it generates the AppCache application manifest.

The AppCache build will load the BrowserID include.js from the network.
If the user is offline, the BrowserID script does not load, but the
user can continue to use the app under their ID, if they signed in before
going offline.

## Suggested Workflow

Do development in the `www` directory. Do modifications and shift+reload in the
browser to see changes. If you need some script dependencies, you can fetch them
with `volo add`. To get the modular versions of Underscore and
Backbone, run these commands in the `myproject` directory:

    volo add amdjs/underscore
    volo add amdjs/backbone

Once you want to test the AppCache-enabled version of the app:

    volo appcache
    volo serve www-built

The `volo appcache` command will do the build optimizations and generate the
appcache manifest, using the SHA1 digest of all the built files as the overall
ID of that version of the app. It also modifies index.html to reference the
manifest.appcache file.

The `volo serve www-built` command will run the dev web server using
`www-built` as the document root, the directory containing the built project.

## Project Layout

This web project has the following setup:

* www/ - the web assets for the project
    * index.html - the entry point into the app.
    * js/ - the directory to hold scripts.
        * app.js - the top-level app script used by index.html. It loads all
        other scripts.
        * app/ - create this directory to store your app-specific scripts. Any
        third party scripts should go in the js/ directory, as siblings to
        app.js.
* tools/ - the build tools to optimize the project, and the dev web server you
can use that also implements an example of the APIs that can be used with
BrowserID. Also contains the LESS files used by Twitter Bootstrap to create
its CSS.

By default, the package comes with the .css files already generated from
Bootstrap's .less files. If you edit the tools/less files again, you can
regenerate the CSS files by running the following command from this directory:

    > volo less

To optimize the project for deployment without generating an appcache manifest,
and without modifying index.html to reference the manifest, run:

    > volo build

## Server API endpoints

The dev server, run via `volo serve`, implements some endpoints for the auth
flow used by the project. These endpoints do not need to be implemented in
a Node-based server. You can implement them in your server system of choice.
The API calls are:

* **/auth**: Handles the BrowserID assertion.
* **/auth/confirm**: Handles confirming that the user's stored info is still
  valid.
* **/auth/signout**: Called by the client code when the user indicates the
desire to sign out of the app.

If you prefer to use different APIs, just modify `www/js/auth/user.js` to use
the APIs you want.

## Links

* [HTML5 Rocks - Working Off the Grid](http://www.html5rocks.com/en/mobile/workingoffthegrid.html)
* [Twitter Bootstrap](http://twitter.github.com/bootstrap/)
* [AppCache](https://developer.mozilla.org/en/Using_Application_Cache)
* [Online detection](https://developer.mozilla.org/en/DOM/window.navigator.onLine)
* [BrowserID](https://browserid.org)
* [RequireJS API](http://requirejs.org/docs/api.html)
* [RequireJS optimizer](http://requirejs.org/docs/optimization.html)
* [volo](https://github.com/volojs/volo)


## Next Steps

* Figure out a way to easily create manifests for the Mozilla Web Apps and
Chrome Store initiatives.
* Work out an IndexedDB shim layer so that a uniform local data storage
mechanism can be used.
* Suggestions from you.

## Feedback

To leave feedback, open an issue in the
[Issues section](https://github.com/volojs/create-responsive-template/issues).
