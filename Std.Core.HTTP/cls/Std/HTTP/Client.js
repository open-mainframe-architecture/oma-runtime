//@ An HTTP client receives responses when it sends out requests.
'BaseObject+Role'.subclass(['Std.Core.Theater'], function(I) {
  "use strict";
  I.am({
    Service: true
  });
  I.know({
    //@ Create arrival event of response.
    //@param request {Std.HTTP.Request} HTTP request
    //@param expectBinary {boolean?} true if binary response is expected
    //@return {Std.HTTP.Client._.Arrival} new event
    createArrival: function(request, expectBinary) {
      return this.$_.Arrival.create(request, expectBinary || false);
    },
    //@ Create receipt event of response body.
    //@param arrival {Std.HTTP.Client._.Arrival} arrival event of response
    //@return {Std.HTTP.Client._.Receipt} new event
    createReceipt: function(arrival) {
      return this.$_.Receipt.create(arrival);
    }
  });
  I.play({
    //@ Send HTTP GET request.
    //@param location {string|Std.HTTP.URL} URL of request
    //@param headers {Object|Std.Table?} container for header names and values
    //@param expectBinary {boolean?} true if binary response is expected
    //@promise {Std.HTTP.Response} HTTP response with textual or binary body
    get: function(location, headers, expectBinary) {
      return this.$agent.send('GET', location, headers, null, expectBinary);
    },
    //@ Send HTTP POST request.
    //@param location {string|Std.HTTP.URL} URL of request
    //@param headers {Object|Std.Table?} container for header names and values
    //@param body {string|binary} body data to post
    //@param expectBinary {boolean?} true if binary response is expected
    //@promise {Std.HTTP.Response} HTTP response with textual or binary body
    post: function(location, headers, body, expectBinary) {
      return this.$agent.send('POST', location, headers, body, expectBinary);
    },
    //@ Send HTTP request.
    //@param method {string} HTTP method, e.g. GET, POST, PUT, etc.
    //@param location {string|Std.HTTP.URL} URL of request
    //@param headers {Object|Std.Table?} container for header names and values
    //@param body {string|binary} body data to post
    //@param expectBinary {boolean?} true if binary response is expected
    //@promise {Std.HTTP.Response} HTTP response with textual or binary body
    send: function(method, location, headers, body, expectBinary) {
      var url = typeof location === 'string' ? I._.URL._.decode(location) : location;
      var request = I._.Request.create(method, url, headers, body);
      // create arrival event for binary or textual response
      return this.createArrival(request, expectBinary).triggers(function(arrival) {
        // receive chunks when first chunk of response arrives
        return this.createReceipt(arrival).triggers(function(receipt) {
          // return response with all chunks
          return receipt.response;
        });
      });
    }
  });
  I.nest({
    //@ Arrival event fires when first chunk of HTTP response arrives.
    Arrival: 'Event'.subclass(function(I) {
      I.have({
        //@{Std.HTTP.Request} HTTP request object that was sent
        request: null,
        //@{boolean} true if response with binary body is expected, otherwise false
        expectBinary: null
      });
      I.know({
        //@param request {Std.HTTP.Request} HTTP request
        //@param expectBinary {boolean} true for binary body, otherwise false for textual body
        build: function(request, expectBinary) {
          I.$super.build.call(this);
          this.request = request;
          this.expectBinary = expectBinary;
        }
      });
    }),
    //@ Receipt event fires when all chunks of an HTTP response have been received.
    Receipt: 'Event'.subclass(function(I) {
      I.have({
        //@{Std.HTTP.Client._.Arrival} arrival event that triggered this receipt
        arrival: null,
        //@{Std.HTTP.Response} HTTP response object
        response: null
      });
      I.know({
        //@param arrival {Std.HTTP.Client._.Arrival} arrival event
        build: function(arrival) {
          I.$super.build.call(this);
          this.arrival = arrival;
        }
      });
    })
  });
})