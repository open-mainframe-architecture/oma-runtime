// An HTTP client uses XMLHttpRequest objects in web browser and worker environments.
'Client'.subclass(['Std.Core.HTTP'], I => {
  "use strict";
  /*global XMLHttpRequest*/
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
    //@ Arrival event in web browser or worker environments.
    Arrival: 'Client.$._.Arrival'.subclass(I => {
      I.have({
        //@{object} XMLHttpRequest object
        xhr: null
      });
      I.know({
        charge: function(parent, blooper) {
          I.$super.charge.call(this, parent, blooper);
          const request = this.request, xhr = this.xhr = new XMLHttpRequest();
          // open web request before anything else is possible
          const method = request.getMethod(), uri = request.getURI().withoutFragment();
          const user = uri.getUser(), password = uri.getPassword();
          xhr.open(method, uri.withoutCredentials().encode(), true, user, password);
          // binary or textual response data
          xhr.responseType = this.expectBinary ? 'arraybuffer' : 'text';
          // copy headers
          for (let name of request.iterateHeaderNames()) {
            xhr.setRequestHeader(name, request.selectHeader(name));
          }
          // fire this event when response has been loaded
          xhr.addEventListener('load', this.fire.bind(this));
          // fail with blooper if error occurs after charging
          xhr.addEventListener('error', this.error.bind(this, blooper));
          // transmit request with optional body
          xhr.send(request.getBody());
        },
        discharge: function() {
          I.$super.discharge.call(this);
          this.xhr.abort();
        },
        isFallible: I.returnTrue,
        //@ Blooper mistake.
        //@param blooper {Std.Theater.Blooper} blooper cue
        //@return nothing
        error: function(blooper) {
          // status text might shed some light on the problem
          blooper.mistake(this.xhr.statusText);
        }
      });
    }),
    //@ Receipt event in web browser or worker environments.
    Receipt: 'Client.$._.Receipt'.subclass(I => {
      const Response = I._.Response;
      I.know({
        charge: function(parent) {
          I.$super.charge.call(this, parent);
          const xhr = this.arrival.xhr, headers = {};
          for (let header of xhr.getAllResponseHeaders().split('\r\n')) {
            const colonIndex = header.indexOf(':');
            if (colonIndex > 0) {
              // if duplicate headers are present, only one header value survives in the table
              const name = header.substring(0, colonIndex).trim();
              headers[name] = header.substring(colonIndex + 1).trim();
            }
          }
          this.response = Response.create(xhr.statusText, xhr.status, headers, xhr.response);
          // fire this event immediately, because there is only one response chunk
          return this;
        }
      });
    })
  });
})