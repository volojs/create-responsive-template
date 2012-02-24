// A simple server that demonstrates how to handle BrowserID assertions.
// Run this server from the project root using volo:
// Runs the dev code:   volo serve
// Runs the built code: volo serve www-built

/*global define, console */

define(function (require) {
    'use strict';

    function createServer(options) {
        var http = require('http'),
            https = require('https'),
            fs = require('fs'),
            path = require('path'),
            url = require('url'),
            queryString = require('querystring'),
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
                                onDone(200, JSON.stringify(body));
                            }
                        }
                    });
                });
                req.setHeader('Content-Type',
                              'application/x-www-form-urlencoded; charset=UTF-8');
                req.setHeader('Content-Length', requestBody.length);
                req.end(requestBody);
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

        function handle(req, res) {
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

        server = http.createServer(handle);
        server.listen(port, host);

        console.log('Using ' + docRoot + ' for: http://' + host + ':' + port);
    }

    return createServer;
});
