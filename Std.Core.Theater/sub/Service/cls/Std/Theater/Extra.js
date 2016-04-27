//@ An extra performs code on stage.
'BaseObject+Role'.subclass(I => {
  "use strict";
  I.am({
    Abstract: false,
    Service: true
  });
})