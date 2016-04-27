//@ An HTTP client requires standard facilities in a Node.js environment.
'Client'.subclass(['Std.Core.HTTP'], I => {
  "use strict";
  /*global require, Buffer*/
  const Response = I._.Response;
  I.am({
    Abstract: false
  });
  I.nest({
    //@ Arrival event in Node.js environment.
    Arrival: 'Client._.Arrival'.subclass(I => {
      I.have({
        //@{Any} request object in Node.js environment
        nodeRequest: null,
        //@{Any} response object in Node.js environment
        nodeResponse: null
      });
      I.know({
        charge: function(parent, blooper) {
          I.$super.charge.call(this, parent, blooper);
          const request = this.request;
          const url = request.getURL(), user = url.getUser(), scheme = url.getScheme();
          const pathElements = ['', ...I.Loop.collect(url.walkPath(), encodeURIComponent)];
          const parameters = [], headers = {};
          url.enumerateParameters((value, name) => {
            parameters.push(`${encodeURIComponent(name)}=${encodeURIComponent(value)}`);
          });
          request.enumerateHeaders((value, name) => { headers[name] = value; });
          // convert to options as expected by Node.js API
          const options = {
            hostname: url.getHost(),
            port: url.getPort(),
            method: request.getMethod(),
            path: pathElements.join('/') + (parameters.length ? '?' : '') + parameters.join('&'),
            headers: headers
          };
          if (user) {
            const password = url.getPassword(), separator = password ? ':' : '';
            options.auth = encodeURIComponent(user) + separator + encodeURIComponent(password);
          }
          const nodeRequest = this.nodeRequest = require(scheme).request(options)
            .once('response', this.succeed.bind(this))
            .once('error', this.fail.bind(this, blooper));
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
    Receipt: 'Client._.Receipt'.subclass(I => {
      I.have({
        //@{[string|binary]?} textual or binary chunks received so far
        chunks: null
      });
      I.know({
        charge: function(parent, blooper) {
          I.$super.charge.call(this, parent, blooper);
          const chunks = this.chunks = [], nodeResponse = this.arrival.nodeResponse;
          if (!this.arrival.expectBinary) {
            nodeResponse.setEncoding('utf8');
          }
          nodeResponse
            .on('data', chunks.push.bind(chunks))
            .once('end', this.succeed.bind(this))
            .once('error', this.fail.bind(this, blooper));
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
            const arrival = this.arrival, chunks = this.chunks;
            const nodeResponse = arrival.nodeResponse;
            const code = nodeResponse.statusCode, status = nodeResponse.statusMessage;
            const body = arrival.expectBinary ? new Uint8Array(Buffer.concat(chunks)).buffer :
              chunks.join('');
            // assign standard response object with one body
            this.response = Response.create(status, code, nodeResponse.headers, body);
            this.fire();
          }
        }
      });
    })
  });
})