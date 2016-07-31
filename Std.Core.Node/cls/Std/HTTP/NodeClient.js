//@ An HTTP client requires standard facilities in a Node.js environment.
'Client'.subclass(['Std.Core.HTTP'], I => {
  "use strict";
  /*global require, Buffer*/
  I.am({
    Abstract: false
  });
  I.know({
    createArrival: function(request, expectBinary) {
      return I.Arrival.create(request, expectBinary);
    },
    createReceipt: function(arrival) {
      return I.Receipt.create(arrival);
    }
  });
  I.nest({
    //@ Arrival event in Node.js environment.
    Arrival: 'Client.$._.Arrival'.subclass(I => {
      I.have({
        //@{object} request object in Node.js environment
        nodeRequest: null,
        //@{object} response object in Node.js environment
        nodeResponse: null
      });
      I.know({
        charge: function(parent, blooper) {
          I.$super.charge.call(this, parent, blooper);
          const request = this.request;
          const uri = request.getURI(), user = uri.getUser(), scheme = uri.getScheme();
          const pathElements = ['', ...I.Loop.map(uri.iteratePath(), encodeURIComponent)];
          const parameters = [], headers = {};
          for (let pair of uri.iterateParameters()) {
            parameters.push(`${encodeURIComponent(pair[0])}=${encodeURIComponent(pair[1])}`);
          }
          for (let name of request.iterateHeaderNames()) {
            headers[name] = request.selectHeader(name);
          }
          // convert to options as expected by Node.js API
          const options = {
            hostname: uri.getHost(),
            port: uri.getPort(),
            method: request.getMethod(),
            path: pathElements.join('/') + (parameters.length ? '?' : '') + parameters.join('&'),
            headers: headers
          };
          if (user) {
            const password = uri.getPassword(), separator = password ? ':' : '';
            options.auth = encodeURIComponent(user) + separator + encodeURIComponent(password);
          }
          const nodeRequest = this.nodeRequest = require(scheme).request(options)
            .once('response', this.success.bind(this))
            .once('error', this.error.bind(this, blooper));
          // start sending request
          nodeRequest.end(request.getBody());
        },
        discharge: function() {
          I.$super.discharge.call(this);
          this.nodeRequest.abort();
        },
        isFallible: I.returnTrue,
        //@ Blooper mistake on error.
        //@param blooper {Std.Theater.Blooper} blooper cue
        //@param error {object} error information from Node.js environment
        //@return nothing
        error: function(blooper, error) {
          blooper.mistake(error.message);
        },
        //@ Succeed when response arrives.
        //@param response {object} response object in Node.js environment
        //@return nothing
        success: function(response) {
          if (!this.nodeResponse) {
            this.nodeResponse = response;
            this.fire();
          }
        }
      });
    }),
    //@ Receipt event in Node.js runtime environment.
    Receipt: 'Client.$._.Receipt'.subclass(I => {
      I.have({
        //@{[string|binary]?} textual or binary chunks received so far
        chunks: null
      });
      const Response = I._.Response;
      I.know({
        charge: function(parent, blooper) {
          I.$super.charge.call(this, parent, blooper);
          const chunks = this.chunks = [], nodeResponse = this.arrival.nodeResponse;
          if (!this.arrival.expectBinary) {
            nodeResponse.setEncoding('utf8');
          }
          nodeResponse
            .on('data', chunks.push.bind(chunks))
            .once('end', this.success.bind(this))
            .once('error', this.error.bind(this, blooper));
        },
        discharge: function() {
          I.$super.discharge.call(this);
          this.arrival.nodeRequest.abort();
        },
        isFallible: I.returnTrue,
        //@ Blooper mistake on error.
        //@param blooper {Std.Theater.Blooper} blooper cue
        //@param error {object} error information from Node.js environment
        //@return nothing
        error: function(blooper, error) {
          blooper.mistake(error.message);
        },
        //@ Succeed when all chunks have arrived.
        //@return nothing
        success: function() {
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