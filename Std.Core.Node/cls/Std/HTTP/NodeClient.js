//@ An HTTP client requires standard facilities in a Node.js environment.
'Client'.subclass(['Std.Core.HTTP'], function(I) {
  "use strict";
  /*global require, Buffer*/
  I.am({
    Abstract: false
  });
  I.nest({
    //@ Arrival event in Node.js environment.
    Arrival: 'Client._.Arrival'.subclass(function(I) {
      I.have({
        //@{Any} request object in Node.js environment
        nodeRequest: null,
        //@{Any} response object in Node.js environment
        nodeResponse: null
      });
      I.know({
        charge: function(parent, blooper) {
          I.$super.charge.call(this, parent, blooper);
          var request = this.request;
          var url = request.getURL(), user = url.getUser(), scheme = url.getScheme();
          var pathElements = [''], parameters = [], headers = {};
          url.enumeratePathElements(function(element) {
            pathElements.push(encodeURIComponent(element));
          });
          url.enumerateParameters(function(value, name) {
            parameters.push(encodeURIComponent(name) + '=' + encodeURIComponent(value));
          });
          request.enumerateHeaders(function(value, name) {
            headers[name] = value;
          });
          // convert to options as expected by Node.js API
          var options = {
            hostname: url.getHost(),
            port: url.getPort(),
            method: request.getMethod(),
            path: pathElements.join('/') + (parameters.length ? '?' : '') + parameters.join('&'),
            headers: headers
          };
          if (user) {
            var password = url.getPassword(), separator = password ? ':' : '';
            options.auth = encodeURIComponent(user) + separator + encodeURIComponent(password);
          }
          var nodeRequest = this.nodeRequest = require(scheme).request(options)
            .once('response', this.succeed.bind(this))
            .once('error', this.fail.bind(this, blooper))
            ;
          // start sending request
          nodeRequest.end(I.opaqueBytes(request.getBody()));
        },
        discharge: function() {
          I.$super.discharge.call(this);
          this.nodeRequest.abort();
        },
        //@return true
        isFallible: I.returnTrue,
        //@ Fail with blooper event.
        //@param blooper {Std.Theater.Blooper} blooper event
        //@param error {Any} error information from Node.js environment
        //@return nothing
        fail: function(blooper, error) {
          blooper.fail(this.nodeRequest, error.message);
        },
        //@ Succeed when response arrives.
        //@param response {Any} response object in Node.js environment
        //@return nothing
        succeed: function(response) {
          if (!this.nodeResponse) {
            this.nodeResponse = response;
            this.fire();
          }
        }
      });
    }),
    //@ Receipt event in Node.js runtime environment.
    Receipt: 'Client._.Receipt'.subclass(function(I) {
      I.have({
        //@{[string|binary]?} textual or binary chunks received so far
        chunks: null
      });
      I.know({
        charge: function(parent, blooper) {
          I.$super.charge.call(this, parent, blooper);
          var chunks = this.chunks = [];
          var nodeResponse = this.arrival.nodeResponse;
          if (!this.arrival.expectBinary) {
            nodeResponse.setEncoding('utf8');
          }
          nodeResponse
            .on('data', chunks.push.bind(chunks))
            .once('end', this.succeed.bind(this))
            .once('error', this.fail.bind(this, blooper))
            ;
        },
        discharge: function() {
          I.$super.discharge.call(this);
          this.arrival.nodeRequest.abort();
        },
        //@return true
        isFallible: I.returnTrue,
        //@ Fail with blooper event.
        //@param blooper {Std.Theater.Blooper} blooper event
        //@param error {Any} error information from Node.js environment
        //@return nothing
        fail: function(blooper, error) {
          blooper.fail(this.arrival.nodeResponse, error.message);
        },
        //@ Succeed when all chunks have arrived.
        //@return nothing
        succeed: function() {
          if (!this.response) {
            var arrival = this.arrival, chunks = this.chunks;
            var nodeResponse = arrival.nodeResponse, expectBinary = arrival.expectBinary;
            var code = nodeResponse.statusCode, status = nodeResponse.statusMessage;
            var headers = nodeResponse.headers;
            var body;
            if (expectBinary) {
              body = new Uint8Array(Buffer.concat(chunks)).buffer;
            } else {
              body = chunks.join('');
            }
            // assign standard response object with one body
            this.response = I._.Response.create(status, code, headers, body);
            this.fire();
          }
        }
      });
    })
  });
})