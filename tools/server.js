/**
 * A simple server that demonstrates how to handle BrowserID assertions.
 * Run this server from the project root using volo:
 *
 * Runs the dev code: server.js docRoot=../www
 * Runs the built code: volo serve docRoot=../www-built
 *
 * Valid options are:
 *
 * docRoot= the directory to use as the document root. By default it uses the
 * current working directory.
 *
 * host=127.0.0.1 the host to use in the connection. By default it uses
 * 127.0.0.1 so it is only visible to the computer running the server, but
 * if you use 0.0.0.0 it may be visible to more servers on your network.
 *
 * port=8360 the port to use
 *
 * verifierUrl=https://browserid.org/verify the BrowserID verifier endpoint.
 */

/*jslint node: true */
/*global define, console */
'use strict';

//Command line args are of the form name=value
function makeOptions() {
    var args = process.argv.slice(2),
        options = {};
    args.forEach(function (arg) {
        var index = arg.indexOf('=');
        options[arg.substring(0, index)] = arg.substring(index + 1);
    });

    return options;
}

var http = require('http'),
    https = require('https'),
    fs = require('fs'),
    path = require('path'),
    url = require('url'),
    queryString = require('querystring'),
    options = makeOptions(),
    docRoot = path.resolve(options.docRoot),
    host = options.host || '127.0.0.1',
    port = options.port || 8360,
    verifierUrl = options.verifierUrl || 'https://browserid.org/verify',
    server, apiHandlers, mimeTypes, utf8Types;

mimeTypes = {
    'appcache': 'text/cache-manifest',
    'css': 'text/css',
    'gif': 'image/gif',
    'html': 'text/html',
    'jpg': 'image/jpeg',
    'js': 'application/javascript',
    'json': 'application/json',
    'png': 'image/png',
    'txt': 'text/plain',
    'xml': 'application/xml'
};

utf8Types = {
    'appcache': true,
    'css': true,
    'html': true,
    'js': true,
    'json': true,
    'xml': true
};

// API handlers get passed a data object that has name/value pairs
// that come from the GET/POST data, and onDone expects to receive
// an HTTP status code and a JSON string response.
apiHandlers = {

    // Handles auth requests by asking BrowserID to verify the
    // assertion in the auth request.
    'auth': function (data, onDone) {
        var requestBody = queryString.stringify({
                assertion: data.assertion,
                audience: 'http://' + host + ':' + port
            }),
            hasError = false,
            options, req;

        options = url.parse(verifierUrl);
        options.method = 'POST';

        req = https.request(options, function (res) {
            var body = '';

            res.setEncoding('utf8');

            res.on('data', function (chunk) {
                body += chunk;
            });

            res.on('error', function (err) {
                hasError = true;
                onDone(500, JSON.stringify({
                    error: err.toString()
                }));
            });

            res.on('end', function () {
                if (!hasError) {
                    body = JSON.parse(body);
                    if (body.status !== 'okay') {
                        onDone(200, JSON.stringify({
                            error: body.reason || 'unknown'
                        }));
                    } else {
                        // Strip out the status since it is not needed
                        delete body.status;

                        // Add in a "server ID" that is used to tie
                        // the API calls from the client back to
                        // a server state.
                        body.serverInfo = {
                            // Just a made up value for illustration
                            // Purposes. Change this for a real server.
                            id: "SERVERID",
                            expires: (new Date()).getTime() +
                                        // 14 days
                                        (14 * 24 * 60 * 60 * 1000)

                        };
                        onDone(200, JSON.stringify(body));
                    }
                }
            });
        });
        req.setHeader('Content-Type',
                      'application/x-www-form-urlencoded; charset=UTF-8');
        req.setHeader('Content-Length', requestBody.length);
        req.end(requestBody);
    },

    // Client sends this on load, to confirm the auth info is still
    // valid. This is just a simple placeholder. A real confirm would
    // probably be more involved, and possibly send back the current
    // server state for the user.
    'auth/confirm': function (data, onDone) {
        var serverInfo = JSON.parse(data.serverInfo);

        if (serverInfo.expires < (new Date()).getTime()) {
            onDone(200, JSON.stringify({
                status: 'expired'
            }));
        } else {
            onDone(200, JSON.stringify({
                status: 'ok'
            }));
        }
    },

    // When user clicks sign out in the browser, this API is called.
    // Just a stub, since this server does not store anything for the
    // user, just demonstrates that BrowserID assertion work.
    'auth/signout': function (data, onDone) {
        var serverInfo = JSON.parse(data.serverInfo);

        onDone(200, JSON.stringify({
            status: 'ok'
        }));
    }
};

function sendError(res, code, message) {
    res.writeHead(code);
    res.end((message || '').toString());
}


function callApiHandler(handler, data, res) {
    handler(data, function (code, response) {
        res.writeHead(code, {
            'Content-Type': mimeTypes.json + '; charset=utf-8',
            'Content-Length': response.length
        });
        res.end(response);
    });
}

function handleApi(req, res) {
    var apiName = req.url.replace(/^\/api\//, ''),
        handler = apiHandlers[apiName],
        body = '',
        data;

    if (!handler) {
        sendError(res, 500, 'Invalid API endpoint: ' + req.url);
    } else if (req.method === 'GET') {
        data = url.parse(req.url, true).query;
        callApiHandler(handler, data, res);
    } else if (req.method === 'PUT' || req.method === 'POST') {
        // Only allow UTF-8 in the request, assume they are
        // only form url encoded values.
        req.setEncoding('utf8');
        req.on('data', function (d) {
            body += d;
        });
        req.on('end', function () {
            data = queryString.parse(body);
            callApiHandler(handler, data, res);
        });
    }
}

function handleRequest(req, res) {
    var urlPath, stream, ext, stat, mimeType;

    if (req.url.indexOf('/api') === 0) {
        // An API call
        handleApi(req, res);
    } else if (req.method === 'GET') {
        // A static file to serve. Only handle GETs
        urlPath = req.url;
        urlPath = path.normalize(urlPath);
        // Trim off leading slash now.
        urlPath = urlPath.substring(1);

        // Do not allow paths outside of docRoot
        if (urlPath.indexOf('.') === 0) {
            sendError(res, 500, 'invalid path: ' + urlPath);
            return;
        }

        urlPath = path.resolve(docRoot, urlPath);

        if (!urlPath || !path.existsSync(urlPath)) {
            sendError(res, 404);
            return;
        }

        stat = fs.statSync(urlPath);

        // Look for an index.html if this is a directory.
        if (stat.isDirectory()) {
            urlPath = path.join(urlPath, 'index.html');
            if (!path.existsSync(urlPath)) {
                sendError(res, 404);
                return;
            }
            stat = fs.statSync(urlPath);
        }

        // Grab the file extension, and since extname returns
        // the dot in the value, strip off the dot. Then get mime
        // type.
        ext = path.extname(urlPath).substring(1);
        mimeType = mimeTypes[ext] || 'text/plain';

        // Set up headers. Do not send any caching headers, because
        // this is for dev, so want fresh sends each request.
        res.setHeader('Content-Type', mimeType +
                      (utf8Types[ext] ? '; charset=utf-8' : ''));
        res.setHeader('Content-Length', stat.size);

        // Start streaming back the contents.
        stream = fs.createReadStream(urlPath);
        stream.pipe(res);
    } else {
        sendError(res, 500);
    }
}

server = http.createServer(handleRequest);
server.listen(port, host);

console.log('Using ' + docRoot + ' for: http://' + host + ':' + port +
            '\nUse CTRL+C to kill the server.');
