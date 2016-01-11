'BaseObject+Role'.subclass(['Std.Core.Theater'], function (I) {
  "use strict";
  // I describe an HTTP client that receives responses when it sends out requests.
  I.am({
    Service: true
  });
  I.know({
    createArrival: function (request, binary) {
      return this.$_.Arrival.create(request, binary || false);
    },
    createReceipt: function (arrival) {
      return this.$_.Receipt.create(arrival);
    }
  });
  I.play({
    get: function (location, headers, binary) {
      return this.$agent.send(I._.Constants._.Method.Get, location, headers, null, binary);
    },
    post: function (location, headers, body, binary) {
      return this.$agent.send(I._.Constants._.Method.Post, location, headers, body, binary);
    },
    // receive response chunks after arrival of first chunk
    receive: function (arrival) {
      return this.createReceipt(arrival).triggers(function (receipt) {
        // return HTTP response with all chunks
        return receipt.response;
      });
    },
    // send HTTP request
    send: function (method, location, headers, body, binary) {
      var url = typeof location === 'string' ? I._.URL._.decode(location) : location;
      var request = I._.Request.create(method, url, headers, body);
      // create arrival event for binary or textual response
      var arrival = this.createArrival(request, binary);
      // receive chunks when response arrives
      return arrival.triggers(this.$agent.receive(arrival));
    }
  });
  I.nest({
    Arrival: 'Event'.subclass(function (I) {
      // I describe an event that fires when the first chunk of an HTTP response arrives.
      I.have({
        // HTTP request object that was sent
        request: null,
        // true if response with binary body is expected, otherwise false
        binary: null
      });
      I.know({
        build: function (request, binary) {
          I.$super.build.call(this);
          this.request = request;
          this.binary = binary;
        }
      });
    }),
    Receipt: 'Event'.subclass(function (I) {
      // I describe an event that fires when all chunks of an HTTP response have been received.
      I.have({
        // arrival event that triggered this receipt
        arrival: null,
        // HTTP response object
        response: null
      });
      I.know({
        build: function (arrival) {
          I.$super.build.call(this);
          this.arrival = arrival;
        }
      });
    })
  });
})