// An HTTP client uses XMLHttpRequest objects in web browser and worker environments.
'Std.HTTP.Client'.subclass(['Std.Core.HTTP'], function (I) {
  "use strict";
  /*global XMLHttpRequest*/
  I.am({
    Abstract: false
  });
  I.nest({
    //@ Arrival event in web browser or worker environments.
    Arrival: 'Std.HTTP.Client._.Arrival'.subclass(function (I) {
      I.have({
        //@{Any} XMLHttpRequest object
        xhr: null
      });
      I.know({
        charge: function (parent, blooper) {
          I.$super.charge.call(this, parent);
          var request = this.request, xhr = this.xhr = new XMLHttpRequest();
          // open web request before anything else is possible
          var method = request.getMethod(), url = request.getURL().withoutFragment();
          var user = url.getUser(), password = url.getPassword();
          xhr.open(method, url.withoutCredentials().encode(), true, user, password);
          // binary or textual response data
          xhr.responseType = this.expectBinary ? 'arraybuffer' : 'text';
          // copy headers
          request.enumerateHeaders(function (value, name) {
            xhr.setRequestHeader(name, value);
          });
          // fire this event when response has been loaded
          xhr.addEventListener('load', this.fire.bind(this));
          // fail with blooper if error occurs after charging
          xhr.addEventListener('error', this.fail.bind(this, blooper));
          // transmit request with optional body
          xhr.send(I.opaqueBytes(request.getBody()));
        },
        discharge: function () {
          I.$super.discharge.call(this);
          this.xhr.abort();
        },
        //@return true
        isFallible: I.returnTrue,
        //@ Fail with blooper event.
        //@param blooper {Std.Theater.Blooper} blooper event
        //@return nothing
        fail: function (blooper) {
          // status text might shed some light on the problem
          blooper.fail(this.xhr, this.xhr.statusText);
        }
      });
    }),
    //@ Receipt event in web browser or worker environments.
    Receipt: 'Std.HTTP.Client._.Receipt'.subclass(function (I) {
      I.know({
        //@return this
        charge: function (parent) {
          I.$super.charge.call(this, parent);
          var xhr = this.arrival.xhr, code = xhr.status, status = xhr.statusText;
          var headers = {};
          xhr.getAllResponseHeaders().split('\r\n').forEach(function (header) {
            var colonIndex = header.indexOf(':');
            if (colonIndex > 0) {
              // if duplicate headers are present, only one header value survives in the table
              headers[header.substring(0, colonIndex)] = header.substring(colonIndex + 1);
            }
          });
          this.response = I._.Std._.HTTP._.Response.create(code, status, headers, xhr.response);
          // fire this event immediately, because there is only one response chunk
          return this;
        }
      });
    })
  });
})