This web project has the following setup:

* www/ - the web assets for the project
    * index.html - the entry point into the app.
    * js/ - the directory to hold scripts.
        * app.js - the top-level app script used by index.html. It loads all
        other scripts.
        * app/ - the directory to store app-specific scripts. Any third
        party scripts should go in the js/ directory.
* tools/ - the build tools to optimize the project. Also contains the less
files used by Twitter Bootstrap.

By default, the package comes with the .css files already generated from the
.less files. If you edit the tools/less files again, you can regenerate the
CSS files by running the following command from this directory:

    volo.js less

To optimize the project for deployment, run:

    tools/build.sh

This will create an optimized version of the project in a **www-built**
directory. The js/app.js file will be optimized to include all of its
dependencies.

For more information on the optimizer:
http://requirejs.org/docs/optimization.html

For more information on using requirejs:
http://requirejs.org/docs/api.html
