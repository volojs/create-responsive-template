# volo-appcache

A [volo](https://github.com/volojs/volo) command for generating an appcache
manifest.

## Installation

Install this command via npm into a project's local node_modules directory:

    npm install volo-appcache

Then, in the volofile for the project, create a volo command name that
does a require() for this command, and pass it the following allowed options:

```javascript
//in the volofile
module.exports = {
    //Existing build command, not required to use volo-appcache
    build: function () {},

    //Creates a local project command called appcache
    appcache: require('volo-appcache')({
        //Optional array of volofile commands to run before executing
        //this command
        depends: ['build'],

        //The directory to use for the manifest
        //The manifest.appcache will be written
        //inside this directory. Default value is
        //shown:
        dir: 'www-built',

        //The path to the HTML file to modify to add the
        //`manifest` attribute. Path is assumed to be inside
        //the `dir` option mentioned above. Default value
        //is shown:
        htmlPath: 'index.html',

        //The path to the template file to use for the manifest
        //It defaults to the 'manifest.template' file in this
        //directory. Be aware, the volo-appcache command assumes
        //there are some tokens in the file that can be replaced
        //with the file listing and the digest stamp. See
        //manifest.template for an example.
        manifestTemplate: ''
    })
}
```

## Overriding the basic manifest template

The `manifestTemplate` option mentioned above allows you to override the
[basic template](https://github.com/volojs/volo-appcache/blob/master/manifest.template)
used for the manifest. This can be useful if you want to specify  extra URLs to
cache, or specify fallbacks for some URLs. Here is an example of a template
that specifies two other URLs to cache and specifies a fallback for
`/submit.php`:

```text
CACHE MANIFEST
# {stamp}

CACHE:
http://cdnjs.cloudflare.com/ajax/libs/jquery/1.8.2/jquery.min.js
http://cdnjs.cloudflare.com/ajax/libs/json2/20110223/json2.js
{files}

# catch-all for anything else
NETWORK:
*
http://*
https://*

FALLBACK:
/submit.php offline.html
```

## Usage

While in the project directory, just type:

    volo appcache

To generate the manifest.appcache in the directory specified above. It will
use a digest of all the file contents to stamp the manifest.appcache for
changes, and it will modify the htmlPath file listed above to include the
`manifest` attribute on the html tag.

## License

MIT and new BSD.
