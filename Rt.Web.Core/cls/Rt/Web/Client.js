'Std.HTTP.Client'.subclass(function(I) {
  "use strict";
  /*global XMLHttpRequest*/
  // I describe HTTP clients that rely on XMLHttpRequest objects in browsers and web workers.
  I.am({
    Abstract: false
  });
  I.play({
    sendRequest: function(request, binary) {
      var webRequest = new XMLHttpRequest();
      // try sending web request after events are charged and listeners are installed
      (function() {
        try {
          webRequest.send(I.opaqueBytes(request.getBody()));
        } catch (exception) {
          requestFailed();
        }
      }).play();
      var agent = this.$agent;
      // control how this send job continues when success or failure is fired
      var success = I.ResponseEvent.create(webRequest).yields(agent.receiveResponse(webRequest));
      var failure = I.When.spark().yields(function() {
        return I._.Std._.Failure.create(agent, webRequest.status, webRequest.statusText);
      });
      // clean up after success, failure or abortion
      function releaseRequest() {
        webRequest.removeEventListener('load', responseLoaded);
        webRequest.removeEventListener('error', requestFailed);
        webRequest.removeEventListener('abort', releaseRequest);
      }
      // listeners fire success and failure events which are blocking the job of this scene
      function responseLoaded() { releaseRequest(); success.fire(); }
      function requestFailed() { releaseRequest(); failure.fire(); }
      // open request before anything else is possible
      var method = request.getMethod(), url = request.getURL().withoutFragment();
      var user = url.getUser(), password = url.getPassword();
      webRequest.open(method, url.withoutCredentials().encode(), true, user, password);
      // binary or textual response data
      webRequest.responseType = binary ? 'arraybuffer' : 'text';
      // install listeners for load, error and abort events which are triggered by web request
      webRequest.addEventListener('load', responseLoaded);
      webRequest.addEventListener('error', requestFailed);
      webRequest.addEventListener('abort', releaseRequest);
      // copy headers
      request.enumerateHeaders(function(headerValue, headerName) {
        webRequest.setRequestHeader(headerName, headerValue);
      });
      // charge failure and success event and wait for one of them to fire
      return I.When.one([success, failure]);
    },
    // create HTTP response when all data has been received
    receiveResponse: function(webRequest) {
      var headers = {}, code = webRequest.status, status = webRequest.statusText;
      webRequest.getAllResponseHeaders().split('\r\n').forEach(function(header) {
        var colonIndex = header.indexOf(':');
        if (colonIndex > 0) {
          // if duplicate headers are present, only one header value survives in the table
          headers[header.substring(0, colonIndex)] = header.substring(colonIndex + 1).trim();
        }
      });
      return I.createResponse(code, status, headers, webRequest.response);
    }
  });
})