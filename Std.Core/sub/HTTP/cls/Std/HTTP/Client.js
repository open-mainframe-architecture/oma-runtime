'BaseObject+Role'.subclass(function(I) {
  "use strict";
  // I describe HTTP clients that receive responses when they send out requests.
  I.am({
    Service: true
  });
  I.play({
    get: function(location, headers, binary) {
      return this.$agent.send(I.Method.Get, location, headers, null, binary);
    },
    post: function(location, headers, body, binary) {
      return this.$agent.send(I.Method.Post, location, headers, body, binary);
    },
    send: function(method, location, headers, body, binary) {
      var url = typeof location === 'string' ? I._.URL._.decode(location) : location;
      var request = I.createRequest(method, url, headers, body);
      return this.$agent.sendRequest(request, binary);
    },
    sendRequest: I.burdenSubclass
  });
  I.share({
    Code: {
      Ok: '200'
    },
    Method: {
      Get: 'GET',
      Post: 'POST'
    },
    createHeaders: function(headers) {
      var table = I.createTable();
      for (var headerName in headers) {
        // header names are case-insensitive
        table[headerName.toLowerCase()] = headers[headerName];
      }
      return table;
    },
    createRequest: function(method, url, headers, body) {
      return I._.Request.create(method, url, I.createHeaders(headers), body);
    },
    createResponse: function(code, status, headers, body) {
      return I._.Response.create(code, status, I.createHeaders(headers), body);
    }
  });
  I.nest({
    ResponseEvent: 'Theater.Event'.subclass(function(I) {
      // I describe events that fire when an HTTP response arrives.
      I.have({
        // HTTP request that was sent
        httpRequest: null
      });
      I.know({
        build: function(httpRequest) {
          I.$super.build.call(this);
          this.httpRequest = httpRequest;
        },
        discharge: function() {
          I.$super.discharge.call(this);
          // abort HTTP request when job quits
          this.httpRequest.abort();
        }
      });
    })
  });
})