//@ The default typespace is a service.
'Typespace'.subclass(I => {
  "use strict";
  I.am({
    Service: true
  });
})