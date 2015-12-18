'Std.HTTP.Client'.subclass(function (I) {
  "use strict";
  /*global XMLHttpRequest*/
  // I describe HTTP clients that rely on XMLHttpRequest objects in browsers and web workers.
  I.am({
    Abstract: false
  });
  I.nest({
    Arrival: 'Std.HTTP.Client._.Arrival'.subclass(function (I) {
      I.have({
        // XMLHttpRequest object
        xhr: null
      });
      I.know({
        // transmit XMLHttpRequest to charge response arrival
        charge: function (parent, blooper) {
          I.$super.charge.call(this, parent);
          var request = this.request, xhr = this.xhr = new XMLHttpRequest();
          // open web request before anything else is possible
          var method = request.getMethod(), url = request.getURL().withoutFragment();
          var user = url.getUser(), password = url.getPassword();
          xhr.open(method, url.withoutCredentials().encode(), true, user, password);
          // binary or textual response data
          xhr.responseType = this.binary ? 'arraybuffer' : 'text';
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
        isFallible: I.returnTrue,
        fail: function (blooper) {
          blooper.fail(this.xhr, this.xhr.statusText);
        }
      });
    }),
    Receipt: 'Std.HTTP.Client._.Receipt'.subclass(function (I) {
      I.know({
        // create HTTP response object from XMLHttpRequest object
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