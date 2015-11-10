'Std.HTTP.Client'.subclass(function(I) {
  "use strict";
  /*global require, Buffer*/
  // I describe HTTP clients that rely on standard Node.js facilities.
  I.am({
    Abstract: false
  });
  I.know({
    // derive encoded options that http.request or https.request expects
    encodeOptions: function(request) {
      var url = request.getURL(), elements = [''], parameters = [], headers = {};
      url.enumeratePathElements(function(element) {
        elements.push(encodeURIComponent(element));
      });
      url.enumerateParameters(function(parameterValue, parameterName) {
        var pair = encodeURIComponent(parameterName) + '=' + encodeURIComponent(parameterValue);
        parameters.push(pair);
      });
      request.enumerateHeaders(function(headerValue, headerName) {
        headers[headerName] = headerValue;
      });
      var options = {
        hostname: url.getHost(),
        port: url.getPort(),
        method: request.getMethod(),
        path: elements.join('/') + (parameters.length ? '?' : '') + parameters.join('&'),
        headers: headers
      };
      var user = url.getUser();
      if (user) {
        var password = url.getPassword(), separator = password ? ':' : '';
        options.auth = encodeURIComponent(user) + separator + encodeURIComponent(password); 
      }
      return options;
    }
  });
  I.play({
    sendRequest: function(request, binary) {
      var agent = this.$agent, errorStatus, nodeRequest, arrival, nodeResponse;
      // put request on the wire after this scene completes
      (function() {
        nodeRequest.end(I.opaqueBytes(request.getBody()));
      }).play();
      // sending the request or receiving the response might fail
      var failure = I.When.spark().yields(function() {
        return I._.Std._.Failure.create(agent, errorStatus);
      });
      function requestFailed(error) {
        errorStatus = error.message;
        failure.fire();
      }
      // create HTTP or HTTPS request
      nodeRequest = require(request.getURL().getScheme()).request(this.encodeOptions(request))
      .once('response', function(response) {
        nodeResponse = response;
        arrival.fire(); 
      })
      .once('error', requestFailed);
      // process arrival of HTTP response
      arrival = I.ResponseEvent.create(nodeRequest).yields(function() {
        var chunks = [];
        var success = I.When.spark().yields(agent.receiveResponse(nodeResponse, chunks, binary));
        // process chunks of response data as they arrive
        if (!binary) {
          nodeResponse.setEncoding('utf8');
        }
        nodeResponse
        .on('data', function(chunk) { chunks.push(chunk); })
        .once('error', requestFailed)
        .once('end', success.fire.bind(success));
        // wait for all chunks to arrive
        return I.When.one([success, failure]);
      });
      // wait for response to arrive
      return I.When.one([arrival, failure]);
    },
    // create HTTP response when all chunks has been received
    receiveResponse: function(nodeResponse, chunks, binary) {
      var code = nodeResponse.statusCode, status = nodeResponse.statusMessage;
      var body = binary ? new Uint8Array(Buffer.concat(chunks)).buffer : chunks.join('');
      return I.createResponse(code, status, nodeResponse.headers, body);
    }
  });
})