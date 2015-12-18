'Std.HTTP.Client'.subclass(function (I) {
  "use strict";
  /*global require, Buffer*/
  // I describe HTTP clients that rely on standard Node.js facilities.
  I.am({
    Abstract: false
  });
  I.nest({
    Arrival: 'Std.HTTP.Client._.Arrival'.subclass(function (I) {
      I.have({
        nodeRequest: null,
        nodeResponse: null
      });
      I.know({
        charge: function (parent, blooper) {
          I.$super.charge.call(this, parent);
          var request = this.request;
          var url = request.getURL(), user = url.getUser(), scheme = url.getScheme();
          var pathElements = [''], parameters = [], headers = {};
          url.enumeratePathElements(function (element) {
            pathElements.push(encodeURIComponent(element));
          });
          url.enumerateParameters(function (value, name) {
            parameters.push(encodeURIComponent(name) + '=' + encodeURIComponent(value));
          });
          request.enumerateHeaders(function (value, name) {
            headers[name] = value;
          });
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
          nodeRequest.end(I.opaqueBytes(request.getBody()));
        },
        discharge: function () {
          I.$super.discharge.call(this);
          this.nodeRequest.abort();
        },
        isFallible: I.returnTrue,
        fail: function (blooper, error) {
          blooper.fail(this.nodeRequest, error.message);
        },
        succeed: function (response) {
          if (!this.nodeResponse) {
            this.nodeResponse = response;
            this.fire();
          }
        }
      });
    }),
    Receipt: 'Std.HTTP.Client._.Receipt'.subclass(function (I) {
      I.have({
        chunks: null
      });
      I.know({
        charge: function (parent, blooper) {
          I.$super.charge.call(this, parent);
          var chunks = this.chunks = [];
          var nodeResponse = this.arrival.nodeResponse;
          if (!this.arrival.binary) {
            nodeResponse.setEncoding('utf8');
          }
          nodeResponse
            .once('data', chunks.push.bind(chunks))
            .once('end', this.succeed.bind(this))
            .once('error', this.fail.bind(this, blooper))
          ;
        },
        discharge: function () {
          I.$super.discharge.call(this);
          this.arrival.nodeRequest.abort();
        },
        isFallible: I.returnTrue,
        fail: function (blooper, error) {
          blooper.fail(this.arrival.nodeResponse, error.message);
        },
        succeed: function () {
          var arrival = this.arrival, chunks = this.chunks;
          var nodeResponse = arrival.nodeResponse, binary = arrival.binary;
          var code = nodeResponse.statusCode, status = nodeResponse.statusMessage;
          var headers = nodeResponse.headers;
          var body = binary ? new Uint8Array(Buffer.concat(chunks)).buffer : chunks.join('');
          this.response = I._.Std._.HTTP._.Response.create(status, code, headers, body);
          this.fire();
        }
      });
    })
  });
})